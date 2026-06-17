// Pantalla 1 — Catálogo (home). Hero editorial + bento/masonry + filtros reales.
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import GarmentCard from "../components/GarmentCard";
import { CATEGORY_VALUES, categoryLabel } from "../lib/categories";
import { STATUS_VALUES, statusInfo } from "../lib/garmentStatus";

// Ritmo bento: los aspect-ratios rotan para que las tarjetas no sean idénticas.
const RATIOS = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-square",
];

const EMPTY_FILTERS = { category: "", size: "", status: "" };

function Select({ label, value, onChange, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-stone-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field min-w-[8.5rem] cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2378716c'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
        }}
      >
        {children}
      </select>
    </label>
  );
}

export default function Catalog() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [garments, setGarments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sizeOptions, setSizeOptions] = useState([]);
  const sizesCaptured = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getGarments(filters);
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setGarments(list);
        if (!sizesCaptured.current) {
          setSizeOptions([...new Set(list.map((g) => g.size).filter(Boolean))]);
          sizesCaptured.current = true;
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const hasFilters = filters.category || filters.size || filters.status;
  const set = (key) => (value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <section>
      {/* Hero */}
      <header className="mx-auto max-w-2xl py-6 text-center sm:py-10">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-600">
          Renta circular
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl">
          Vístelos sin acumular
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-stone-500">
          Ropa infantil de calidad que rentas por batches. La usas, la
          devuelves, eliges otra. Crece con tu peque, no con tu clóset.
        </p>
      </header>

      {/* Barra de filtros */}
      <div className="card mt-4 flex flex-wrap items-end gap-4 p-4 sm:p-5">
        <Select label="Categoría" value={filters.category} onChange={set("category")}>
          <option value="">Todas</option>
          {CATEGORY_VALUES.map((v) => (
            <option key={v} value={v}>
              {categoryLabel(v)}
            </option>
          ))}
        </Select>

        <Select label="Talla" value={filters.size} onChange={set("size")}>
          <option value="">Todas</option>
          {sizeOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>

        <Select label="Estado" value={filters.status} onChange={set("status")}>
          <option value="">Todos</option>
          {STATUS_VALUES.map((v) => (
            <option key={v} value={v}>
              {statusInfo(v).label}
            </option>
          ))}
        </Select>

        <div className="ml-auto flex items-center gap-3">
          {!loading && !error && (
            <span className="text-sm text-stone-400">
              {garments.length} prenda{garments.length === 1 ? "" : "s"}
            </span>
          )}
          {hasFilters && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="btn-ghost"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="mt-8">
        {loading ? (
          <Masonry>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`mb-4 break-inside-avoid animate-pulse rounded-2xl bg-stone-200/70 ${RATIOS[i % RATIOS.length]}`}
              />
            ))}
          </Masonry>
        ) : error ? (
          <ErrorState
            message={error.message}
            onRetry={() => setFilters((f) => ({ ...f }))}
          />
        ) : garments.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={() => setFilters(EMPTY_FILTERS)} />
        ) : (
          <Masonry>
            {garments.map((g, i) => (
              <GarmentCard key={g.id} garment={g} ratio={RATIOS[i % RATIOS.length]} />
            ))}
          </Masonry>
        )}
      </div>
    </section>
  );
}

// Masonry real con columnas CSS: alturas naturales, sin huecos, responsivo.
function Masonry({ children }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {children}
    </div>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white/50 py-20 text-center">
      <p className="text-4xl" aria-hidden="true">
        🧺
      </p>
      <h2 className="mt-4 font-display text-xl font-semibold text-stone-800">
        {hasFilters ? "Nada con esos filtros" : "Aún no hay prendas"}
      </h2>
      <p className="mx-auto mt-1.5 max-w-sm text-stone-500">
        {hasFilters
          ? "Prueba con otra combinación de categoría, talla o estado."
          : "Cuando se carguen prendas al catálogo aparecerán aquí."}
      </p>
      {hasFilters && (
        <button type="button" onClick={onClear} className="btn-primary mt-6">
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50/60 py-20 text-center">
      <p className="text-4xl" aria-hidden="true">
        ⚠️
      </p>
      <h2 className="mt-4 font-display text-xl font-semibold text-stone-800">
        No se pudo cargar el catálogo
      </h2>
      <p className="mx-auto mt-1.5 max-w-sm text-stone-500">{message}</p>
      <button type="button" onClick={onRetry} className="btn-primary mt-6">
        Reintentar
      </button>
    </div>
  );
}
