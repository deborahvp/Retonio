// Fila horizontal de una prenda (para batch y wishlist): miniatura + datos +
// slot de acciones. La miniatura y el título enlazan al detalle.
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { categoryLabel } from "../lib/categories";
import { formatPrice } from "../lib/format";

export default function GarmentRow({ garment, children }) {
  // Defensivo: si el join no trae la prenda (p. ej. fue retirada), no rompe.
  if (!garment) {
    return (
      <li className="card p-4 text-sm text-stone-400">Prenda no disponible.</li>
    );
  }

  const { id, title, brand, size, category, image_url, rental_price, status } =
    garment;

  return (
    <li className="card flex items-center gap-4 p-3 transition-shadow duration-200 hover:shadow-sm">
      <Link
        to={`/garments/${id}`}
        className="size-20 shrink-0 overflow-hidden rounded-xl bg-stone-100"
      >
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <span className="grid size-full place-items-center text-2xl text-stone-300">
            🧷
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            to={`/garments/${id}`}
            className="truncate font-medium text-stone-900 hover:underline"
          >
            {title}
          </Link>
          <StatusBadge status={status} />
        </div>
        <p className="mt-0.5 truncate text-sm text-stone-500">
          {[brand, size, categoryLabel(category)].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-1 font-semibold text-brand-700">
          {formatPrice(rental_price)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </li>
  );
}
