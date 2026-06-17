// Card centrado para login/registro: título, subtítulo y contenido.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto max-w-sm py-6 sm:py-10">
      <div className="card p-7 shadow-sm sm:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-stone-900">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-stone-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && (
        <p className="mt-5 text-center text-sm text-stone-500">{footer}</p>
      )}
    </div>
  );
}
