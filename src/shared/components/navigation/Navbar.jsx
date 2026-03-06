import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../features/auth/context/AuthContext";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Fleet", icon: "🚗" },
    ...(user && user.role !== "admin"
      ? [
        { to: "/rentals", label: "My Rentals", icon: "📋" },
        { to: "/facture", label: "Invoices", icon: "📄" },
      ]
      : []),
    ...(user?.role === "admin"
      ? [
        { to: "/dashboard", label: "Dashboard", icon: "📊" },
        { to: "/admin/cars", label: "Cars", icon: "🏎️" },
        { to: "/admin/clients", label: "Clients", icon: "👥" },
        { to: "/admin/payments", label: "Payments", icon: "💳" },
        { to: "/admin/rentals", label: "Rentals", icon: "📋" },
        { to: "/admin/factures", label: "Invoices", icon: "💰" },
        { to: "/admin/services", label: "Maintenance", icon: "🔧" },
        { to: "/admin/reviews", label: "Reviews", icon: "⭐" },
      ]
      : []),
  ];

  return (
    <>
      {/* Inject styles */}
      <style>{`
        @keyframes navSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nav-link-item {
          position: relative;
          transition: all 0.2s ease;
        }
        .nav-link-item::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2px;
          background: #000;
          transition: all 0.2s ease;
          transform: translateX(-50%);
          border-radius: 1px;
        }
        .nav-link-item.active::after,
        .nav-link-item:hover::after {
          width: 60%;
        }
        .nav-btn {
          transition: all 0.2s ease;
        }
        .nav-btn:hover {
          transform: translateY(-1px);
        }
      `}</style>

      {/* Invisible spacer to prevent content overlap caused by fixed Navbar */}
      <div style={{ height: scrolled ? 60 : 70, transition: "height 0.3s ease", width: "100%", flexShrink: 0 }} />

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled
          ? "rgba(255, 255, 255, 0.85)"
          : "#fff",
        backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid #f0f0f0",
        fontFamily: sans,
        transition: "all 0.3s ease",
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.04)" : "none",
        animation: "navSlideDown 0.4s ease",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "0 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: scrolled ? 60 : 70,
          transition: "height 0.3s ease",
        }}>
          {/* Logo */}
          <Link to="/" style={{
            textDecoration: "none", display: "flex", alignItems: "center", gap: 10,
            transition: 'transform 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#000', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 900, letterSpacing: '-0.03em' }}>B</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 17, fontWeight: 900, color: "#000", letterSpacing: "-0.03em" }}>BMZ</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#bbb", letterSpacing: "0.14em" }}>LOCATION</span>
            </div>
          </Link>

          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link-item${isActive(to) ? ' active' : ''}`}
                style={{
                  color: isActive(to) ? "#000" : "#888",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: isActive(to) ? 700 : 500,
                  padding: "8px 14px",
                  borderRadius: 8,
                }}
                onMouseEnter={e => {
                  if (!isActive(to)) e.target.style.color = "#000";
                  setHoveredLink(to);
                }}
                onMouseLeave={e => {
                  if (!isActive(to)) e.target.style.color = "#888";
                  setHoveredLink(null);
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
                <div style={{
                  textAlign: "right", marginRight: 6,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#f5f5f5', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#000', fontWeight: 700, fontSize: 12,
                    border: '1px solid #eee',
                  }}>
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#000", display: "block", lineHeight: 1.2 }}>
                      {user.email?.split("@")[0]}
                    </span>
                    {user.role === "admin" && (
                      <span style={{
                        fontSize: 9, fontWeight: 800, color: "#fff",
                        background: '#000', padding: '1px 6px', borderRadius: 3,
                        letterSpacing: '0.06em',
                      }}>ADMIN</span>
                    )}
                  </div>
                </div>
                <button className="nav-btn" onClick={handleLogout} style={{
                  background: "transparent", border: "1px solid #eee",
                  color: "#888", padding: "7px 16px", fontSize: 12,
                  borderRadius: 10, cursor: "pointer", fontWeight: 700,
                  fontFamily: sans,
                }}
                  onMouseEnter={e => { e.target.style.borderColor = "#000"; e.target.style.color = "#000"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#eee"; e.target.style.color = "#888"; }}
                >Log out</button>
              </>
            ) : (
              <>
                <Link className="nav-btn" to="/login" style={{
                  color: "#666", textDecoration: "none", fontSize: 13,
                  fontWeight: 600, padding: "8px 16px",
                }}
                  onMouseEnter={e => e.target.style.color = '#000'}
                  onMouseLeave={e => e.target.style.color = '#666'}
                >Sign in</Link>
                <Link className="nav-btn" to="/register" style={{
                  color: "#fff", textDecoration: "none", fontSize: 13,
                  fontWeight: 700, padding: "10px 24px",
                  background: "#000", borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; e.target.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.target.style.transform = 'none'; }}
                >Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}