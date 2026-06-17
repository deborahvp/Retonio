// ─── Cliente API de Retoño ─────────────────────────────────────────────
// Único punto por el que el frontend habla con el backend Express.
// El frontend NUNCA llama directo a Supabase: todo pasa por ${BASE}/api/...
//
// VITE_API_URL controla la base:
//   · producción (Vercel):  '/api'                      (mismo dominio)
//   · desarrollo local:     'http://localhost:3000/api'
// Si no está definida, asumimos '/api' (caso producción).

const BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:3000/api" : "/api");

// ─── Token (persistido en localStorage) ────────────────────────────────
const TOKEN_KEY = "retono_token";
const REFRESH_KEY = "retono_refresh";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setRefresh: (token) => localStorage.setItem(REFRESH_KEY, token),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─── Error tipado ───────────────────────────────────────────────────────
// Lleva el status HTTP y el mensaje que mande el backend ({ error: "..." }),
// para que las pantallas puedan mostrar el error real al usuario.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ─── Sesión: refresh + manejo de expiración ─────────────────────────────
// El AuthContext registra aquí qué hacer cuando la sesión muere de verdad
// (ni el refresh la pudo salvar): cerrar sesión y mandar a login.
let onUnauthorized = null;
export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}

// Single-flight: si varias peticiones reciben 401 a la vez, comparten un solo
// intento de refresh en vez de disparar muchos.
let refreshPromise = null;

async function doRefresh() {
  const refresh_token = tokenStore.getRefresh();
  if (!refresh_token) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    if (!data?.access_token) return false;
    tokenStore.set(data.access_token);
    if (data.refresh_token) tokenStore.setRefresh(data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

function tryRefresh() {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ─── Núcleo: una sola función request ───────────────────────────────────
async function request(path, { method = "GET", body } = {}, retried = false) {
  const headers = {};

  // Adjunta el Bearer token si hay sesión.
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  // FormData (uploads) viaja tal cual; el navegador pone el Content-Type con
  // el boundary correcto. JSON se serializa a mano.
  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload });
  } catch {
    // fetch solo lanza ante fallos de red (servidor caído, sin internet, CORS).
    throw new ApiError("No se pudo conectar con el servidor", 0);
  }

  // 204 No Content (DELETE, etc.) no trae cuerpo.
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // 401 con token = access token expirado. Intentamos refrescar UNA vez y
    // reintentar la petición; si el refresh falla, la sesión murió de verdad.
    // (Un 401 sin token es un login fallido y lo maneja la pantalla.)
    const isRefreshCall = path === "/auth/refresh";
    if (res.status === 401 && token && !retried && !isRefreshCall) {
      const refreshed = await tryRefresh();
      if (refreshed) return request(path, { method, body }, true);
      if (onUnauthorized) onUnauthorized();
    }
    throw new ApiError(data?.error || `Error ${res.status}`, res.status);
  }
  return data;
}

// ─── Verbos genéricos ───────────────────────────────────────────────────
export const http = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
};

// ─── Endpoints del contrato (mapeo 1:1 con backend/src/routes) ──────────
// No asumen columnas de `garments`: solo rutas, params y cuerpos.
export const api = {
  // Auth
  register: ({ email, password, display_name }) =>
    http.post("/auth/register", { email, password, display_name }),
  login: ({ email, password }) => http.post("/auth/login", { email, password }),

  // Catálogo / prendas
  getGarments: (filters = {}) => {
    // Solo añade los filtros con valor (category, size, status).
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v),
    ).toString();
    return http.get(`/garments${qs ? `?${qs}` : ""}`);
  },
  getGarment: (id) => http.get(`/garments/${id}`),
  getGarmentStates: (id) => http.get(`/garments/${id}/states`),
  updateGarmentStatus: (id, status, note) =>
    http.patch(`/garments/${id}/status`, { status, note }),

  // Carrito / batch
  getCart: () => http.get("/cart"),
  addToCart: ({ garment_id, start_date, end_date }) =>
    http.post("/cart", { garment_id, start_date, end_date }),
  removeFromCart: (garmentId) => http.del(`/cart/${garmentId}`),
  returnBatch: () => http.post("/cart/return"),

  // Wishlist
  getWishlist: () => http.get("/wishlist"),
  addToWishlist: (garmentId) => http.post("/wishlist", { garment_id: garmentId }),
  removeFromWishlist: (garmentId) => http.del(`/wishlist/${garmentId}`),

  // Upload (multipart: campo "file")
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return http.post("/upload", fd);
  },

  // Salud
  health: () => http.get("/health"),
};
