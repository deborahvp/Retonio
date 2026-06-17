// Envuelve rutas que requieren sesión (carrito, wishlist). Si no hay usuario,
// redirige a /login recordando a dónde quería ir (para volver tras entrar).
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
