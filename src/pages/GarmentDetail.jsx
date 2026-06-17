// Pantalla 2 — Detalle de prenda: imagen, datos, estado actual + historial,
// y acciones (agregar al batch / wishlist) cuando hay sesión.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import { categoryLabel } from "../lib/categories";
import { statusInfo } from "../lib/garmentStatus";
import { formatPrice, formatDateTime } from "../lib/format";

export default function GarmentDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [garment, setGarment] = useState(null);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // El detalle y el historial son independientes: en paralelo.
        const [g, s] = await Promise.all([
          api.getGarment(id),
          api.getGarmentStates(id),
        ]);
        if (cancelled) return;
        setGarment(g);
        setStates(Array.isArray(s) ? s : []);
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
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="py-16 text-center">
        <p className="text-4xl" aria-hidden="true">
          {notFound ? "🔍" : "⚠️"}
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-stone-900">
          {notFound ? "Prenda no encontrada" : "No se pudo cargar la prenda"}
        </h1>
        {!notFound && <p className="mt-1 text-stone-500">{error.message}</p>}
        <Link to="/" className="btn-primary mt-6">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const meta = [
    ["Talla", garment.size],
    ["Categoría", categoryLabel(garment.category)],
    ["Color", garment.color],
    ["Condición", garment.condition],
    ["Marca", garment.brand],
  ].filter(([, v]) => v);

  return (
    <article>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-800"
      >
        <span aria-hidden="true">←</span> Catálogo
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        {/* Imagen */}
        <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-stone-100">
          <div className="aspect-[4/5]">
            {garment.image_url ? (
              <img
                src={garment.image_url}
                alt={garment.title}
                className="size-full object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-6xl text-stone-300">
                <span aria-hidden="true">🧷</span>
              </div>
            )}
          </div>
        </div>

        {/* Datos + acciones */}
        <div>
          <StatusBadge status={garment.status} />
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-stone-900">
            {garment.title}
          </h1>
          <p className="mt-3 font-display text-3xl font-semibold text-brand-700">
            {formatPrice(garment.rental_price)}
            <span className="ml-1 font-sans text-base font-normal text-stone-400">
              / batch
            </span>
          </p>

          {garment.description && (
            <p className="mt-5 leading-relaxed text-stone-600">
              {garment.description}
            </p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 sm:grid-cols-3">
            {meta.map(([k, v]) => (
              <div key={k} className="bg-white p-3">
                <dt className="text-xs uppercase tracking-wide text-stone-400">
                  {k}
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-stone-800">{v}</dd>
              </div>
            ))}
          </dl>

          <Actions garment={garment} isAuthenticated={isAuthenticated} />
        </div>
      </div>

      {/* Historial de estados */}
      <StateTimeline states={states} />
    </article>
  );
}

// ─── Acciones (batch / wishlist) ────────────────────────────────────────
function Actions({ garment, isAuthenticated }) {
  const [feedback, setFeedback] = useState(null); // {type:'ok'|'err', msg}
  const [busy, setBusy] = useState(null); // 'cart' | 'wish' | null

  if (!isAuthenticated) {
    return (
      <div className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Inicia sesión
        </Link>{" "}
        para agregar esta prenda a tu batch o a tu wishlist.
      </div>
    );
  }

  async function run(kind, fn, okMsg) {
    setBusy(kind);
    setFeedback(null);
    try {
      await fn();
      setFeedback({ type: "ok", msg: okMsg });
    } catch (err) {
      setFeedback({ type: "err", msg: err.message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-7">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            run(
              "cart",
              () => api.addToCart({ garment_id: garment.id }),
              "Agregada a tu batch.",
            )
          }
          className="btn-primary px-6"
        >
          {busy === "cart" ? "Agregando…" : "Agregar al batch"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            run(
              "wish",
              () => api.addToWishlist(garment.id),
              "Guardada en tu wishlist.",
            )
          }
          className="btn-secondary px-6"
        >
          {busy === "wish" ? "Guardando…" : "♡ Wishlist"}
        </button>
      </div>

      {feedback && (
        <p
          role="status"
          className={`mt-3 text-sm font-medium ${
            feedback.type === "ok" ? "text-brand-700" : "text-red-600"
          }`}
        >
          {feedback.msg}
        </p>
      )}
    </div>
  );
}

// ─── Historial de estados (timeline) ────────────────────────────────────
function StateTimeline({ states }) {
  if (states.length === 0) return null;

  // Más reciente primero para leer el estado actual arriba.
  const ordered = [...states].reverse();

  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-semibold text-stone-900">
        Historial de estados
      </h2>
      <ol className="mt-4 space-y-0">
        {ordered.map((s, i) => (
          <li key={s.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* línea vertical */}
            {i !== ordered.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-[5px] top-4 h-full w-px bg-stone-200"
              />
            )}
            <span
              aria-hidden="true"
              className="relative mt-1 size-2.5 shrink-0 rounded-full bg-brand-500 ring-4 ring-brand-50"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-stone-800">
                  {statusInfo(s.state).label}
                </span>
                <span className="text-xs text-stone-400">
                  {formatDateTime(s.changed_at)}
                </span>
              </div>
              {s.note && (
                <p className="mt-0.5 text-sm text-stone-500">{s.note}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ─── Skeleton de carga ──────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-24 rounded bg-stone-200" />
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="aspect-[4/5] rounded-3xl bg-stone-200" />
        <div className="space-y-4">
          <div className="h-6 w-24 rounded-full bg-stone-200" />
          <div className="h-9 w-3/4 rounded bg-stone-200" />
          <div className="h-7 w-32 rounded bg-stone-200" />
          <div className="h-20 w-full rounded bg-stone-200" />
          <div className="h-24 w-full rounded-2xl bg-stone-200" />
        </div>
      </div>
    </div>
  );
}
