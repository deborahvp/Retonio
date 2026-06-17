// ─── AuthContext ────────────────────────────────────────────────────────
// Estado de sesión global: usuario actual, token (vía tokenStore) y las
// acciones login / register / logout. El token y el usuario se persisten en
// localStorage para sobrevivir recargas.

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { api, tokenStore, setOnUnauthorized } from "../lib/api";

const USER_KEY = "retono_user";
export const SESSION_EXPIRED_KEY = "retono_session_expired";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Hidratamos el usuario desde localStorage en el primer render.
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    tokenStore.set(data.access_token);
    if (data.refresh_token) tokenStore.setRefresh(data.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // El registro NO inicia sesión (el backend solo crea el usuario).
  // Devuelve el user creado; la pantalla decide redirigir a login.
  const register = useCallback(
    (email, password, displayName) =>
      api.register({ email, password, display_name: displayName }),
    [],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // Cuando una petición autenticada recibe 401 (token expirado/ inválido),
  // cerramos sesión y dejamos una marca para avisar en la pantalla de login.
  // ProtectedRoute redirige solo al quedar sin usuario.
  useEffect(() => {
    setOnUnauthorized(() => {
      sessionStorage.setItem(SESSION_EXPIRED_KEY, "1");
      logout();
    });
    return () => setOnUnauthorized(null);
  }, [logout]);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
