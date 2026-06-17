// 404 — ruta inexistente.
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
        Error 404
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-stone-900">
        Página no encontrada
      </h1>
      <Link to="/" className="btn-primary mt-6">
        Volver al catálogo
      </Link>
    </section>
  );
}
