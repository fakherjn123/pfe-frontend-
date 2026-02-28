import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../features/auth/context/AuthContext";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate("/login"); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "#ffffff", borderBottom: "1px solid #e8e8e8",
      fontFamily: sans,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#0a0a0a", letterSpacing: "0.06em" }}>JNAYEH</span>
          <span style={{ width: 1, height: 14, background: "#d0d0d0" }} />
          <span style={{ fontSize: 11, fontWeight: 400, color: "#999", letterSpacing: "0.12em" }}>LOCATION</span>
        </Link>

        {/* Links */}
        {/* Links */}
<div style={{ display: "flex", alignItems: "center", gap: 2 }}>
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
          { to: "/admin/cars", label: "Manage Cars" },   // 🔥 الجديد
          { to: "/dashboard", label: "Dashboard" },
          { to: "/admin/factures", label: "All Invoices" },
          { to: "/admin/payments", label: "Payments" }, 
        ]
      : []),
  ].map(({ to, label }) => (
    <Link
      key={to}
      to={to}
      style={{
        color: isActive(to) ? "#0a0a0a" : "#999",
        textDecoration: "none",
        fontSize: 13,
        fontWeight: isActive(to) ? 600 : 400,
        padding: "6px 14px",
        borderRadius: 6,
        background: isActive(to) ? "#f5f5f5" : "transparent",
        transition: "all 0.15s",
      }}
    >
      {label}
    </Link>
  ))}
</div>

        {/* Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user ? (
            <>
              <span style={{
                fontSize: 12, color: "#bbb", fontWeight: 400,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {user.email?.split("@")[0]}
                {user.role === "admin" && (
                  <span style={{
                    background: "#0a0a0a", color: "#fff", fontSize: 9,
                    padding: "2px 7px", borderRadius: 3, fontWeight: 600,
                    letterSpacing: "0.08em",
                  }}>ADMIN</span>
                )}
              </span>
              <button onClick={handleLogout} style={{
                background: "transparent", border: "1px solid #e0e0e0",
                color: "#666", padding: "6px 16px", fontSize: 12,
                fontFamily: sans, borderRadius: 6, cursor: "pointer",
                fontWeight: 500, transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.target.style.borderColor = "#999"; e.target.style.color = "#333"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#e0e0e0"; e.target.style.color = "#666"; }}
              >Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                color: "#666", textDecoration: "none", fontSize: 13,
                fontWeight: 500, padding: "6px 16px",
              }}>Sign in</Link>
              <Link to="/register" style={{
                color: "#fff", textDecoration: "none", fontSize: 13,
                fontWeight: 600, padding: "7px 18px",
                background: "#0a0a0a", borderRadius: 7,
                transition: "background 0.15s",
              }}>Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}