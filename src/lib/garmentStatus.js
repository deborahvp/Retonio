// ─── Estados de prenda ──────────────────────────────────────────────────
// Los VALORES son los del backend (inglés) y NO se cambian: son los que se
// mandan a la API. Aquí solo se les asocia etiqueta en español y color para
// la UI. Las clases son de Tailwind (badge: fondo + texto + borde).

export const GARMENT_STATUS = {
  available: {
    label: "Disponible",
    badge: "bg-brand-50 text-brand-700 ring-brand-600/20",
  },
  reserved: {
    label: "Reservada",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  rented: {
    label: "Rentada",
    badge: "bg-sky-50 text-sky-700 ring-sky-600/20",
  },
  in_cleaning: {
    label: "En limpieza",
    badge: "bg-violet-50 text-violet-700 ring-violet-600/20",
  },
  retired: {
    label: "Retirada",
    badge: "bg-stone-100 text-stone-500 ring-stone-400/20",
  },
};

// Valores válidos en el orden lógico del ciclo (para selects y filtros).
export const STATUS_VALUES = Object.keys(GARMENT_STATUS);

// Helper seguro: si llega un estado desconocido, no rompe la UI.
export function statusInfo(status) {
  return (
    GARMENT_STATUS[status] || {
      label: status || "—",
      badge: "bg-stone-100 text-stone-500 ring-stone-400/20",
    }
  );
}
