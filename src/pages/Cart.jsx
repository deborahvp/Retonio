// Pantalla 4 — Mi batch (carrito). Lista las prendas del batch, permite quitar
// y devolver el batch (las prendas pasan a in_cleaning vía POST /api/cart/return).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import GarmentRow from "../components/GarmentRow";
import { formatPrice } from "../lib/format";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [removing, setRemoving] = useState(null); // garment_id en proceso
  const [confirming, setConfirming] = useState(false);
  const [returning, setReturning] = useState(false);
  const [notice, setNotice] = useState(null); // {type, msg}

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getCart();
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
    setRemoving(garmentId);
    setNotice(null);
    try {
      await api.removeFromCart(garmentId);
      setItems((prev) => prev.filter((it) => it.garment_id !== garmentId));
    } catch (err) {
      setNotice({ type: "err", msg: err.message });
    } finally {
      setRemoving(null);
    }
  }

  async function handleReturn() {
    setReturning(true);
    setNotice(null);
    try {
      const res = await api.returnBatch();
      setItems([]);
      setConfirming(false);
      setNotice({
        type: "ok",
        msg: `${res.devueltas} prenda(s) enviadas a limpieza. ¡Gracias por devolver!`,
      });
    } catch (err) {
      setNotice({ type: "err", msg: err.message });
    } finally {
      setReturning(false);
    }
  }

  const total = items.reduce(
    (sum, it) => sum + (it.garments?.rental_price || 0),
    0,
  );

  return (
    <section>
      <h1 className="font-display text-4xl font-semibold tracking-tight text-stone-900">
        Mi batch
      </h1>
      <p className="mt-2 text-stone-500">
        Las prendas que tienes en este ciclo. Al devolver, pasan a limpieza.
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
            No se pudo cargar tu batch: {error.message}
          </p>
        ) : items.length === 0 ? (
          <EmptyBatch />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
            <ul className="space-y-3">
              {items.map((it) => (
                <GarmentRow key={it.garment_id} garment={it.garments}>
                  <button
                    type="button"
                    disabled={removing === it.garment_id}
                    onClick={() => handleRemove(it.garment_id)}
                    className="rounded-full px-3 py-1.5 text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-red-600 disabled:opacity-50"
                  >
                    {removing === it.garment_id ? "Quitando…" : "Quitar"}
                  </button>
                </GarmentRow>
              ))}
            </ul>

            {/* Resumen */}
            <aside className="card p-5 lg:sticky lg:top-24">
              <h2 className="font-display text-lg font-semibold text-stone-900">
                Resumen
              </h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-stone-500">Prendas</dt>
                  <dd className="font-medium text-stone-800">{items.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-500">Total por batch</dt>
                  <dd className="font-semibold text-brand-700">
                    {formatPrice(total)}
                  </dd>
                </div>
              </dl>

              {confirming ? (
                <div className="mt-5">
                  <p className="text-sm text-stone-600">
                    ¿Devolver todo el batch? Las prendas pasarán a limpieza.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={returning}
                      onClick={handleReturn}
                      className="btn-primary flex-1"
                    >
                      {returning ? "Devolviendo…" : "Sí, devolver"}
                    </button>
                    <button
                      type="button"
                      disabled={returning}
                      onClick={() => setConfirming(false)}
                      className="btn-ghost"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="btn-primary mt-5 w-full"
                >
                  Devolver batch
                </button>
              )}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyBatch() {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white/50 py-20 text-center">
      <p className="text-4xl" aria-hidden="true">
        👕
      </p>
      <h2 className="mt-4 font-display text-xl font-semibold text-stone-800">
        Tu batch está vacío
      </h2>
      <p className="mt-1.5 text-stone-500">
        Agrega prendas desde el catálogo para armar tu ciclo.
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
