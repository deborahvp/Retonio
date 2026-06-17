// Pantalla 3 — Login. Pega a /api/auth/login vía AuthContext; guarda el token
// y redirige a donde el usuario quería ir (o al catálogo).
import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth, SESSION_EXPIRED_KEY } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";
import Field from "../components/Field";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ¿Llegamos aquí porque la sesión expiró? (lo marca el AuthContext)
  const [expired] = useState(() => {
    const flag = sessionStorage.getItem(SESSION_EXPIRED_KEY);
    if (flag) sessionStorage.removeItem(SESSION_EXPIRED_KEY);
    return Boolean(flag);
  });

  // Si ya hay sesión, no tiene sentido ver el login.
  if (isAuthenticated) return <Navigate to={from} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Entrar"
      subtitle="Accede a tu batch y tu wishlist."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Crear cuenta
          </Link>
        </>
      }
    >
      {expired && (
        <p
          role="status"
          className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700"
        >
          Tu sesión expiró. Inicia sesión de nuevo.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field
          id="email"
          label="Correo"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
        />
        <Field
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary mt-1 w-full">
          {submitting ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </AuthShell>
  );
}
