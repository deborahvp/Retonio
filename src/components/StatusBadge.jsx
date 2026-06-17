// Etiqueta de estado de prenda: valor inglés del backend → label español + color.
import { statusInfo } from "../lib/garmentStatus";

export default function StatusBadge({ status, className = "" }) {
  const { label, badge } = statusInfo(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badge} ${className}`}
    >
      {label}
    </span>
  );
}
