import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../features/auth/context/AuthContext";
import api from "../../../config/api.config";
import NotificationBell from "../notifications/NotificationBell";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BLUE = "#2563EB";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [points, setPoints] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Pages where Navbar is transparent/dark (hero bg)
  const isHeroPage = location.pathname === "/";

  useEffect(() => {
    if (user && user.role !== "admin") {
      api.get("/users/me")
        .then((res) => setPoints(res.data.points || 0))
        .catch(() => {});
    } else {
      setPoints(null);
    }
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate("/login"); };

  const isActive = (path) => location.pathname === path;

  const publicLinks = [
    { to: "/", label: "Accueil" },
    { to: "/cars", label: "Catalogue" },
    { to: "/contact", label: "Contact" },
  ];

  const clientLinks = [
    { to: "/rentals", label: "Mes Réservations" },
    { to: "/facture", label: "Factures" },
    { to: "/profile", label: "Mon Profil" },
  ];

  const adminLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/admin/cars", label: "Véhicules" },
    { to: "/admin/clients", label: "Clients" },
    { to: "/admin/payments", label: "Paiements" },
    { to: "/admin/rentals", label: "Locations" },
    { to: "/admin/factures", label: "Factures" },
    { to: "/admin/services", label: "Maintenance" },
    { to: "/admin/contacts", label: "Messages" },
    { to: "/admin/reviews", label: "Avis" },
    { to: "/admin/hero", label: "Hero" },
    { to: "/admin/promos", label: "Promos" },
    { to: "/admin/ai-dashboard", label: "Smart Pricing" },
  ];

  const navLinks = user?.role === "admin"
    ? adminLinks
    : user
    ? [...publicLinks, ...clientLinks]
    : publicLinks;

  // ── Colors depending on page & scroll ──────────────────
  const navBg = isHeroPage
    ? scrolled ? "rgba(15,23,42,0.92)" : "transparent"
    : "#ffffff";
  const navBorder = isHeroPage
    ? scrolled ? "1px solid rgba(255,255,255,0.08)" : "none"
    : "1px solid #E5E7EB";
  const linkColor = isHeroPage ? "rgba(255,255,255,0.85)" : "#374151";
  const linkActiveColor = isHeroPage ? "#ffffff" : "#111827";
  const logoTextColor = isHeroPage ? "#ffffff" : "#111827";

  return (
    <>
      <style>{`
        @keyframes navDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .bmz-nav-link { transition: color 0.18s ease; position: relative; }
        .bmz-nav-link::after {
          content:''; position:absolute; bottom:-4px; left:0; width:0; height:2px;
          background:${BLUE}; border-radius:1px; transition:width 0.2s ease;
        }
        .bmz-nav-link.active::after, .bmz-nav-link:hover::after { width:100%; }
        .bmz-btn-primary {
          background:${BLUE}; color:#fff; border:none; padding:9px 20px;
          font-size:14px; font-weight:600; font-family:${sans}; border-radius:8px;
          cursor:pointer; transition:background 0.2s, transform 0.15s;
        }
        .bmz-btn-primary:hover { background:#1d4ed8; transform:translateY(-1px); }
        .bmz-btn-ghost {
          background:transparent; color:${isHeroPage ? '#fff' : '#374151'};
          border:1px solid ${isHeroPage ? 'rgba(255,255,255,0.3)' : '#D1D5DB'};
          padding:9px 20px; font-size:14px; font-weight:600; font-family:${sans};
          border-radius:8px; cursor:pointer; transition:all 0.2s;
        }
        .bmz-btn-ghost:hover { border-color:${BLUE}; color:${BLUE}; }
      `}</style>

      {/* Spacer — only when nav is not overlaying hero */}
      {!isHeroPage && (
        <div style={{ height: 64, width: "100%", flexShrink: 0 }} />
      )}

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: navBg, borderBottom: navBorder,
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        fontFamily: sans, transition: "all 0.3s ease",
        animation: "navDown 0.35s ease",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "0 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 64,
        }}>

          {/* ── Logo ── */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: BLUE, display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                <rect x="9" y="11" width="14" height="10" rx="2"/>
                <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              </svg>
            </div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, color: logoTextColor, letterSpacing: "-0.03em", lineHeight: 1 }}>
                BMZ
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: isHeroPage ? "rgba(255,255,255,0.5)" : "#9CA3AF", letterSpacing: "0.12em", marginLeft: 6 }}>
                LOCATION
              </span>
            </div>
          </Link>

          {/* ── Nav Links (desktop) ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`bmz-nav-link${isActive(to) ? " active" : ""}`}
                style={{
                  color: isActive(to) ? linkActiveColor : linkColor,
                  textDecoration: "none", fontSize: 14,
                  fontWeight: isActive(to) ? 600 : 400,
                  padding: "8px 12px", borderRadius: 6,
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Auth Area ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user ? (
              <>
                {points !== null && user.role !== "admin" && (
                  <Link to="/profile" style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)",
                    borderRadius: 20, padding: "5px 12px", textDecoration: "none",
                  }}>
                    <span style={{ fontSize: 13 }}>⭐</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: BLUE }}>{points} pts</span>
                  </Link>
                )}
                <NotificationBell />
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: BLUE, display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13,
                }}>
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} className="bmz-btn-ghost">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{
                  color: linkColor, textDecoration: "none", fontSize: 14,
                  fontWeight: 500, padding: "9px 16px",
                }}>
                  Connexion
                </Link>
                <Link to="/register">
                  <button className="bmz-btn-primary">Créer un compte</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}