// Shell de la app: barra de navegación + contenido (<Outlet/>) + footer.
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200",
          isActive
            ? "bg-brand-50 text-brand-700"
            : "text-stone-500 hover:bg-stone-100 hover:text-stone-900",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="Retoño, inicio">
            <Logo />
          </Link>

          <div className="hidden items-center gap-1 sm:flex">
            <NavItem to="/">Catálogo</NavItem>
            <NavItem to="/batch">Mi batch</NavItem>
            <NavItem to="/wishlist">Wishlist</NavItem>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden max-w-[14rem] truncate text-sm text-stone-400 md:inline">
                  {user?.email}
                </span>
                <button type="button" onClick={handleLogout} className="btn-ghost">
                  Salir
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary px-4 py-1.5">
                Entrar
              </Link>
            )}
          </div>
        </nav>

        {/* Nav móvil */}
        <div className="flex items-center justify-center gap-1 border-t border-stone-200/60 px-4 py-1.5 sm:hidden">
          <NavItem to="/">Catálogo</NavItem>
          <NavItem to="/batch">Mi batch</NavItem>
          <NavItem to="/wishlist">Wishlist</NavItem>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-stone-400 sm:flex-row sm:px-6">
          <Logo className="opacity-70" />
          <p>Renta circular de ropa infantil. Úsala, devuélvela, repite.</p>
        </div>
      </footer>
    </div>
  );
}
