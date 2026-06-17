// Tarjeta de prenda para el catálogo (masonry/bento).
// El alto lo define el aspect-ratio de la imagen (variado por `ratio`), lo que
// da el ritmo bento sin huecos. Toda la tarjeta es un enlace al detalle.
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { categoryLabel } from "../lib/categories";
import { formatPrice } from "../lib/format";

export default function GarmentCard({ garment, ratio = "aspect-[4/5]" }) {
  const { id, title, brand, size, category, image_url, rental_price, status } =
    garment;

  return (
    <Link
      to={`/garments/${id}`}
      className="group mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-stone-200/60 bg-white transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_rgb(0,0,0,0.18)]"
    >
      <div className={`relative ${ratio} overflow-hidden bg-stone-100`}>
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-stone-300">
            <span className="text-4xl" aria-hidden="true">
              🧷
            </span>
          </div>
        )}
        <StatusBadge
          status={status}
          className="absolute left-3 top-3 shadow-sm ring-white/50 backdrop-blur-md"
        />
      </div>

      <div className="p-4">
        <p className="text-[0.7rem] font-medium uppercase tracking-widest text-brand-600">
          {categoryLabel(category)}
        </p>
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          <h3 className="truncate font-medium text-stone-900">{title}</h3>
          <span className="shrink-0 font-display text-lg font-semibold text-stone-900">
            {formatPrice(rental_price)}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-stone-400">
          {[brand, size].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
