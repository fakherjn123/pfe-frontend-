import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../features/auth/context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

const sans = "'Poppins', 'Inter', sans-serif";
const BLUE = "#2563EB";

const NAV_ITEMS = [
  { to: "/dashboard",          icon: "📊", label: "Tableau de bord" },
  { to: "/admin/cars",         icon: "🚗", label: "Véhicules" },
  { to: "/admin/rentals",      icon: "🔑", label: "Locations" },
  { to: "/admin/clients",      icon: "👥", label: "Clients" },
  { to: "/admin/payments",     icon: "💳", label: "Paiements" },
  { to: "/admin/factures",     icon: "📄", label: "Factures" },
  { to: "/admin/services",     icon: "🔧", label: "Maintenance" },
  { to: "/admin/contacts",     icon: "✉️",  label: "Messages" },
  { to: "/admin/reviews",      icon: "⭐", label: "Avis clients" },
  { to: "/admin/promos",       icon: "🎟️", label: "Codes promos" },
  { to: "/admin/hero",         icon: "🖼️", label: "Hero Banner" },
  { to: "/admin/ai-dashboard", icon: "🤖", label: "AI Dashboard" },
];

const SIDEBAR_W = 240;

export default function AdminLayout({ children, title, subtitle }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = () => { logout(); navigate("/login"); };

  const sideW = collapsed ? 64 : SIDEBAR_W;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: sans, background: "#f4f7f6" }}>

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside style={{
        width: sideW, flexShrink: 0,
        background: "linear-gradient(180deg, #03060f 0%, #060b1a 100%)",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 200,
        transition: "width 0.25s ease", overflow: "hidden",
        boxShadow: "4px 0 32px rgba(0,0,0,0.5)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? "20px 14px" : "20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          minHeight: 64,
        }}>
          {!collapsed && (
            <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: BLUE,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                  <rect x="9" y="11" width="14" height="10" rx="2"/>
                  <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>BMZ</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>ADMIN</div>
              </div>
            </Link>
          )}
          {collapsed && (
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: BLUE,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                <rect x="9" y="11" width="14" height="10" rx="2"/>
                <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              </svg>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: "rgba(255,255,255,0.06)", border: "none",
            color: "rgba(255,255,255,0.5)", cursor: "pointer",
            width: 28, height: 28, borderRadius: 6, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
            marginLeft: collapsed ? "auto" : 0,
            transition: "background 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav Label */}
        {!collapsed && (
          <div style={{ padding: "16px 20px 8px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Navigation
          </div>
        )}

        {/* Nav Items */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "4px 10px 20px" }}>
          {NAV_ITEMS.map(({ to, icon, label }) => {
            const active = isActive(to);
            return (
              <Link key={to} to={to} title={collapsed ? label : undefined} style={{
                display: "flex", alignItems: "center",
                gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "10px" : "9px 12px",
                borderRadius: 10, marginBottom: 3, textDecoration: "none",
                background: active
                  ? "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.15))"
                  : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.45)",
                transition: "all 0.2s ease",
                border: active ? "1px solid rgba(37,99,235,0.3)" : "1px solid transparent",
                boxShadow: active ? "0 4px 16px rgba(37,99,235,0.15)" : "none",
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; } }}
              >
                <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
                {!collapsed && (
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: sans }}>
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: collapsed ? "12px 10px" : "14px 14px",
          display: "flex", alignItems: "center",
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? "center" : "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: BLUE, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 13,
            }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.email?.split("@")[0]}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Administrateur</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={handleLogout} style={{
              background: "rgba(255,255,255,0.06)", border: "none",
              color: "rgba(255,255,255,0.5)", cursor: "pointer",
              width: 28, height: 28, borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s", flexShrink: 0,
              fontSize: 15,
            }}
              title="Déconnexion"
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            >
              ⏻
            </button>
          )}
        </div>
      </aside>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div style={{ flex: 1, marginLeft: sideW, transition: "margin-left 0.25s ease", minWidth: 0 }}>

        {/* Top Header */}
        <header style={{
          background: "rgba(6,11,26,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 32px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(37,99,235,.3),rgba(124,58,237,.3),transparent)" }} />
          <div>
            {title && (
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.03em", fontFamily: sans }}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p style={{ margin: 0, fontSize: 12, color: "#475569", marginTop: 1, fontFamily: sans }}>{subtitle}</p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <NotificationBell />
            <div style={{
              display: "flex", alignItems: "center", gap: 9,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "6px 12px",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: 12,
                boxShadow: "0 2px 10px rgba(37,99,235,0.3)",
              }}>
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", fontFamily: sans }}>
                {user?.email?.split("@")[0]}
              </span>
              <span style={{
                fontSize: 9, fontWeight: 900, color: "#0f172a",
                background: "linear-gradient(135deg,#60a5fa,#a78bfa)",
                padding: "2px 7px", borderRadius: 5,
                letterSpacing: "0.08em", fontFamily: sans,
              }}>
                ADMIN
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: "0", minHeight: "calc(100vh - 64px)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
