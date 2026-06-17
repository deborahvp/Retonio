// Campo de formulario etiquetado y accesible (label asociado vía htmlFor/id).
export default function Field({ id, label, hint, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-stone-700">
        {label}
      </label>
      <input id={id} className="input-field" {...inputProps} />
      {hint && <p className="text-xs text-stone-400">{hint}</p>}
    </div>
  );
}
