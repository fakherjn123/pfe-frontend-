import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../features/auth/context/AuthContext";
import api from "../../../config/api.config";
import NotificationBell from "../notifications/NotificationBell";

const font = "'Poppins', 'Outfit', 'Inter', sans-serif";

const BRAND_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
    <rect x="9" y="11" width="14" height="10" rx="2"/>
    <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
  </svg>
);

const CLOSE_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

const MENU_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [points, setPoints] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHeroPage = location.pathname === "/";

  useEffect(() => {
    if (user && user.role !== "admin") {
      api.get("/users/me")
        .then(res => setPoints(res.data.points || 0))
        .catch(() => {});
    } else {
      setPoints(null);
    }
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
    { to: "/rentals", label: "Réservations" },
    { to: "/facture", label: "Factures" },
    { to: "/profile", label: "Profil" },
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
    { to: "/admin/promos", label: "Promos" },
    { to: "/admin/hero", label: "Hero" },
    { to: "/admin/ai-dashboard", label: "AI" },
  ];

  const navLinks = user?.role === "admin"
    ? adminLinks
    : user
    ? [...publicLinks, ...clientLinks]
    : publicLinks;

  /* ── Dynamic nav appearance ── */
  const isTransparent = isHeroPage && !scrolled;
  const navBg = isTransparent
    ? "transparent"
    : "rgba(3, 6, 15, 0.88)";
  const navBorder = isTransparent
    ? "1px solid transparent"
    : "1px solid rgba(255,255,255,0.06)";

  return (
    <>
      <style>{`
        @keyframes navDown { from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes mobileSlide { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }

        .bmz-link {
          position: relative;
          text-decoration: none;
          font-family: ${font};
          font-weight: 500;
          font-size: 14px;
          padding: 7px 12px;
          border-radius: 8px;
          transition: color 0.2s ease, background 0.2s ease;
          white-space: nowrap;
        }
        .bmz-link::after {
          content: '';
          position: absolute;
          bottom: 2px; left: 12px; right: 12px;
          height: 2px;
          background: linear-gradient(90deg, #2563EB, #7C3AED);
          border-radius: 1px;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .bmz-link:hover::after, .bmz-link.active::after { transform: scaleX(1); }
        .bmz-link:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .bmz-link.active { color: #fff; font-weight: 700; }

        .bmz-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
          color: #fff; border: none; font-family: ${font};
          font-size: 14px; font-weight: 700;
          padding: 9px 22px; border-radius: 10px; cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(37,99,235,0.3);
        }
        .bmz-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(37,99,235,0.45);
        }
        .bmz-cta:active { transform: scale(0.98); }

        .bmz-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.75); border: 1px solid rgba(255,255,255,0.12);
          font-family: ${font}; font-size: 14px; font-weight: 600;
          padding: 8px 18px; border-radius: 10px; cursor: pointer;
          text-decoration: none;
          transition: all 0.25s ease;
          backdrop-filter: blur(12px);
        }
        .bmz-ghost:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.22);
          color: #fff;
        }

        .bmz-pts {
          display: flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.08));
          border: 1px solid rgba(245,158,11,0.28);
          border-radius: 100px; padding: 5px 13px;
          text-decoration: none; transition: all 0.22s ease;
        }
        .bmz-pts:hover { background: rgba(245,158,11,0.18); transform: translateY(-1px); }

        .bmz-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #2563EB, #7C3AED);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 800; font-size: 13px;
          font-family: ${font}; flex-shrink: 0;
          box-shadow: 0 2px 12px rgba(37,99,235,0.35);
        }

        .bmz-mobile-overlay {
          position: fixed; inset: 0; z-index: 990;
          background: rgba(3,6,15,0.96);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          animation: mobileSlide 0.3s ease;
        }
        .bmz-mobile-link {
          display: flex; align-items: center;
          font-family: ${font}; font-size: 17px; font-weight: 600;
          color: rgba(255,255,255,0.7); text-decoration: none;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: color 0.2s ease;
        }
        .bmz-mobile-link:hover, .bmz-mobile-link.active { color: #fff; }
        .bmz-mobile-link.active { color: #60a5fa; }
      `}</style>

      {/* Spacer for non-hero pages */}
      {!isHeroPage && <div style={{ height: 64, width: "100%" }} />}

      {/* ── Main Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: navBg,
        borderBottom: navBorder,
        backdropFilter: !isTransparent ? "blur(20px) saturate(180%)" : "none",
        WebkitBackdropFilter: !isTransparent ? "blur(20px) saturate(180%)" : "none",
        fontFamily: font,
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        animation: "navDown 0.4s ease",
        height: 64,
      }}>
        {/* Top accent line (visible when scrolled) */}
        {!isTransparent && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.6), rgba(124,58,237,0.6), transparent)",
          }} />
        )}

        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "0 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "100%",
        }}>

          {/* ── Logo ── */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 11, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08) rotate(-4deg)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) rotate(0)"; }}
            >
              {BRAND_ICON}
            </div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", fontFamily: font, lineHeight: 1 }}>BMZ</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.18em", marginLeft: 7, verticalAlign: "middle" }}>LOCATION</span>
            </div>
          </Link>

          {/* ── Nav links (desktop) ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden" }}>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={"bmz-link" + (isActive(to) ? " active" : "")}
                style={{ color: isActive(to) ? "#fff" : "rgba(255,255,255,0.6)" }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Auth area ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user ? (
              <>
                {points !== null && user.role !== "admin" && (
                  <Link to="/profile" className="bmz-pts">
                    <span style={{ fontSize: 12 }}>⭐</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#fbbf24", fontFamily: font }}>
                      {points} pts
                    </span>
                  </Link>
                )}
                <NotificationBell />
                <div className="bmz-avatar">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} className="bmz-ghost">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{
                  color: "rgba(255,255,255,0.65)", textDecoration: "none",
                  fontSize: 14, fontWeight: 500, padding: "8px 14px", fontFamily: font,
                  transition: "color 0.2s",
                }}
                  onMouseEnter={e => e.target.style.color = "#fff"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.65)"}
                >Connexion</Link>
                <Link to="/register" className="bmz-cta">Créer un compte</Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: "none",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", width: 38, height: 38, borderRadius: 9, cursor: "pointer",
                alignItems: "center", justifyContent: "center",
              }}
              className="bmz-mobile-toggle"
            >
              {mobileOpen ? CLOSE_ICON : MENU_ICON}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="bmz-mobile-overlay" style={{ paddingTop: 80 }}>
          <div style={{ maxWidth: 400, margin: "0 auto", padding: "0 32px" }}>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={"bmz-mobile-link" + (isActive(to) ? " active" : "")}
              >
                {label}
              </Link>
            ))}
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              {user ? (
                <button onClick={handleLogout} className="bmz-cta" style={{ justifyContent: "center" }}>
                  Déconnexion
                </button>
              ) : (
                <>
                  <Link to="/login" className="bmz-ghost" style={{ justifyContent: "center" }}>Connexion</Link>
                  <Link to="/register" className="bmz-cta" style={{ justifyContent: "center" }}>Créer un compte</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .bmz-link { display: none !important; }
          .bmz-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}
