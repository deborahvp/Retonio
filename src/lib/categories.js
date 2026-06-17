// ─── Categorías ─────────────────────────────────────────────────────────
// Igual que los estados: el VALOR (inglés) es el que viaja a la API; aquí
// solo se le asocia etiqueta en español para la UI.

export const CATEGORY_LABELS = {
  tops: "Superiores",
  bottoms: "Inferiores",
  dresses: "Vestidos",
  outerwear: "Abrigos",
  shoes: "Calzado",
  accessories: "Accesorios",
};

export const CATEGORY_VALUES = Object.keys(CATEGORY_LABELS);

export function categoryLabel(value) {
  return CATEGORY_LABELS[value] || value || "—";
}
