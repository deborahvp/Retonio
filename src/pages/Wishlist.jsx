// Pantalla 5 — Wishlist. Lista de deseos: quitar o agregar al batch.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import GarmentRow from "../components/GarmentRow";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null); // `${garment_id}:${action}`
  const [notice, setNotice] = useState(null); // {type, msg}

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getWishlist();
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
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
  }, []);

  async function handleRemove(garmentId) {
    setBusy(`${garmentId}:rm`);
    setNotice(null);
    try {
      await api.removeFromWishlist(garmentId);
      setItems((prev) => prev.filter((it) => it.garment_id !== garmentId));
    } catch (err) {
      setNotice({ type: "err", msg: err.message });
    } finally {
      setBusy(null);
    }
  }

  async function handleAddToBatch(garmentId, title) {
    setBusy(`${garmentId}:add`);
    setNotice(null);
    try {
      await api.addToCart({ garment_id: garmentId });
      setNotice({ type: "ok", msg: `"${title}" agregada a tu batch.` });
    } catch (err) {
      setNotice({ type: "err", msg: err.message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section>
      <h1 className="font-display text-4xl font-semibold tracking-tight text-stone-900">
        Wishlist
      </h1>
      <p className="mt-2 text-stone-500">
        Las prendas que te gustaría rentar más adelante.
      </p>

      {notice && (
        <p
          role="status"
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
            notice.type === "ok"
              ? "bg-brand-50 text-brand-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {notice.msg}
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <RowSkeletons />
        ) : error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50/60 p-6 text-center text-stone-600">
            No se pudo cargar tu wishlist: {error.message}
          </p>
        ) : items.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <ul className="space-y-3">
            {items.map((it) => (
              <GarmentRow key={it.garment_id} garment={it.garments}>
                <button
                  type="button"
                  disabled={busy === `${it.garment_id}:add`}
                  onClick={() =>
                    handleAddToBatch(it.garment_id, it.garments?.title)
                  }
                  className="btn-primary px-3.5 py-1.5"
                >
                  {busy === `${it.garment_id}:add` ? "Agregando…" : "+ Batch"}
                </button>
                <button
                  type="button"
                  disabled={busy === `${it.garment_id}:rm`}
                  onClick={() => handleRemove(it.garment_id)}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-red-600 disabled:opacity-50"
                >
                  {busy === `${it.garment_id}:rm` ? "Quitando…" : "Quitar"}
                </button>
              </GarmentRow>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function EmptyWishlist() {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white/50 py-20 text-center">
      <p className="text-4xl" aria-hidden="true">
        ♡
      </p>
      <h2 className="mt-4 font-display text-xl font-semibold text-stone-800">
        Tu wishlist está vacía
      </h2>
      <p className="mt-1.5 text-stone-500">
        Guarda prendas desde el catálogo o su detalle para verlas aquí.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Ir al catálogo
      </Link>
    </div>
  );
}

function RowSkeletons() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="flex animate-pulse items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-3"
        >
          <div className="size-20 shrink-0 rounded-xl bg-stone-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-stone-200" />
            <div className="h-3 w-1/2 rounded bg-stone-200" />
            <div className="h-4 w-16 rounded bg-stone-200" />
          </div>
        </li>
      ))}
    </ul>
  );
}
