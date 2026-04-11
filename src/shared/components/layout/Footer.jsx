import { Link } from "react-router-dom";

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const BLUE = "#2563EB";

// SVG Icons for social media
const FacebookIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer style={{
      background: "#0F172A", fontFamily: sans, color: "#fff",
      paddingTop: 64, paddingBottom: 32,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>

        {/* ── 4-column grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "48px 32px",
          paddingBottom: 48,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>

          {/* Col 1 — Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: BLUE, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                  <rect x="9" y="11" width="14" height="10" rx="2"/>
                  <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                </svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>BMZ Location</span>
            </div>
            <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px", maxWidth: 240 }}>
              Location de voitures premium à Sousse. Qualité, fiabilité et service exceptionnel depuis 2019.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {[FacebookIcon, InstagramIcon, TwitterIcon].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#94A3B8", textDecoration: "none",
                  transition: "background 0.2s, color 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#94A3B8"; }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Navigation */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 20px" }}>
              Navigation
            </h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { to: "/", label: "Accueil" },
                { to: "/cars", label: "Catalogue" },
                { to: "/rentals", label: "Mes Réservations" },
                { to: "/profile", label: "Mon Profil" },
                { to: "/contact", label: "Contact" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} style={{
                    color: "#94A3B8", textDecoration: "none", fontSize: 14,
                    transition: "color 0.15s",
                  }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "#94A3B8"}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Catégories */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 20px" }}>
              Catégories
            </h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Voitures de Luxe", "SUV", "Sportives", "Électriques", "Berlines", "Minivans"].map((cat) => (
                <li key={cat}>
                  <Link to="/cars" style={{
                    color: "#94A3B8", textDecoration: "none", fontSize: 14,
                    transition: "color 0.15s",
                  }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "#94A3B8"}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 20px" }}>
              Contact
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                {
                  icon: (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  ),
                  text: "Avenue Hédi Chaker, Sahloul 4, Sousse 4054, Tunisie",
                },
                {
                  icon: (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.7 19.79 19.79 0 0 1 1.63 5.11 2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 18l.19-1.08z"/>
                    </svg>
                  ),
                  text: "+216 29 015 948",
                  href: "tel:+21629015948",
                },
                {
                  icon: (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  ),
                  text: "contact@bmz-location.tn",
                  href: "mailto:contact@bmz-location.tn",
                },
              ].map(({ icon, text, href }, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: BLUE, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                  {href ? (
                    <a href={href} style={{ color: "#94A3B8", fontSize: 14, textDecoration: "none", lineHeight: 1.5 }}
                      onMouseEnter={e => e.target.style.color = "#fff"}
                      onMouseLeave={e => e.target.style.color = "#94A3B8"}
                    >{text}</a>
                  ) : (
                    <span style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.5 }}>{text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 24, flexWrap: "wrap", gap: 12,
        }}>
          <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>
            © 2026 BMZ Location. Tous droits réservés.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Mentions légales", "Confidentialité", "CGU"].map((item) => (
              <a key={item} href="#" style={{
                color: "#475569", fontSize: 13, textDecoration: "none",
                transition: "color 0.15s",
              }}
                onMouseEnter={e => e.target.style.color = "#94A3B8"}
                onMouseLeave={e => e.target.style.color = "#475569"}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
