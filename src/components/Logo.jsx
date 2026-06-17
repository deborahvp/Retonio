// Marca Retoño: un brote/hoja en verde + wordmark serif.
export default function Logo({ className = "" }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="size-7 text-brand-600"
        fill="none"
        aria-hidden="true"
      >
        {/* tallo */}
        <path
          d="M12 21V11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* hoja derecha */}
        <path
          d="M12 13c0-3.3 2.7-6 6-6 0 3.3-2.7 6-6 6Z"
          fill="currentColor"
          opacity="0.9"
        />
        {/* hoja izquierda */}
        <path
          d="M12 15c0-2.8-2.2-5-5-5 0 2.8 2.2 5 5 5Z"
          fill="currentColor"
          opacity="0.55"
        />
      </svg>
      <span className="font-display text-xl font-semibold text-stone-900">
        Retoño
      </span>
    </span>
  );
}
