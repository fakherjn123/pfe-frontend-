import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../features/auth/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate("/login"); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-slate-900 text-lg font-extrabold tracking-tight group-hover:text-indigo-600 transition-colors">JNAYEH</span>
          <span className="w-px h-4 bg-slate-300" />
          <span className="text-slate-500 text-xs font-semibold tracking-widest">LOCATION</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { to: "/", label: "Fleet" },

            ...(user
              ? [
                { to: "/rentals", label: "My Rentals" },
                { to: "/facture", label: "Invoices" },
              ]
              : []),

            ...(user?.role === "admin"
              ? [
                { to: "/admin/cars", label: "Manage Cars" },
                { to: "/dashboard", label: "Dashboard" },
                { to: "/admin/factures", label: "All Invoices" },
                { to: "/admin/payments", label: "Payments" },
              ]
              : []),
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(to)
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-slate-500 text-sm font-medium">
                  {user.email?.split("@")[0]}
                </span>
                {user.role === "admin" && (
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wider">
                    ADMIN
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-600 border border-slate-200 px-4 py-2 text-xs font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all focus:ring-4 focus:ring-slate-100"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 text-sm font-medium px-4 py-2 hover:text-slate-900 transition-colors">
                Sign in
              </Link>
              <Link to="/register" className="bg-slate-900 text-white text-sm font-semibold px-4.5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-sm hover:shadow focus:ring-4 focus:ring-slate-200">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}