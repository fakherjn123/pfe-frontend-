import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const BLUE = "#2563EB";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const fill = (email, password) => setForm({ email, password });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await login(form); navigate("/"); }
    catch (err) { setError(err.response?.status === 401 ? "Email ou mot de passe incorrect" : "Erreur serveur"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", fontFamily: sans,
      display: "flex", background: "#F9FAFB",
    }}>
      {/* Left — brand panel */}
      <div style={{
        flex: 1, background: "#0F172A",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "64px 56px",
      }} className="login-brand-panel">
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, marginBottom: 56 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>BMZ Location</span>
        </Link>

        <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", fontWeight: 900, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          La mobilité premium,<br />accessible à tous.
        </h2>
        <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, margin: "0 0 48px", maxWidth: 380 }}>
          Rejoignez des centaines de clients satisfaits. Réservez en 3 minutes, recevez votre véhicule à domicile.
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: 32 }}>
          {[{ v: "500+", l: "Clients" }, { v: "98%", l: "Satisfaction" }, { v: "5★", l: "Note" }].map(({ v, l }) => (
            <div key={l}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{v}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form panel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "64px 48px", maxWidth: 560, margin: "0 auto",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Connexion
          </h1>
          <p style={{ color: "#6B7280", fontSize: 14, margin: "0 0 32px" }}>Accédez à votre espace BMZ Location</p>

          {/* Demo accounts */}
          <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            {[
              { label: "👤 Administrateur", email: "admin@bmz.com", password: "admin123" },
              { label: "🚗 Client", email: "client@test.com", password: "client123" },
            ].map(({ label, email, password }) => (
              <button key={email} onClick={() => fill(email, password)} style={{
                flex: 1, background: "#F9FAFB", border: "1px solid #E5E7EB",
                borderRadius: 8, padding: "10px 12px", fontSize: 12, fontWeight: 600,
                color: "#374151", cursor: "pointer", fontFamily: sans,
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.color = BLUE; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Adresse email
              </label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="vous@exemple.com"
                style={{
                  width: "100%", padding: "11px 14px", fontSize: 14,
                  border: "1px solid #E5E7EB", borderRadius: 8, outline: "none",
                  fontFamily: sans, boxSizing: "border-box", background: "#fff",
                  color: "#111827", transition: "border 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e => e.target.style.borderColor = "#E5E7EB"}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  style={{
                    width: "100%", padding: "11px 40px 11px 14px", fontSize: 14,
                    border: "1px solid #E5E7EB", borderRadius: 8, outline: "none",
                    fontFamily: sans, boxSizing: "border-box", background: "#fff",
                    color: "#111827", transition: "border 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = BLUE}
                  onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#9CA3AF",
                  fontSize: 15, padding: 0,
                }}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8,
                color: "#DC2626", fontSize: 13, padding: "10px 14px", marginBottom: 16,
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", background: BLUE, color: "#fff", border: "none",
              padding: "12px", fontSize: 15, fontFamily: sans, fontWeight: 700,
              borderRadius: 8, cursor: "pointer", marginBottom: 12,
              opacity: loading ? 0.7 : 1, transition: "background 0.2s",
            }}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <button type="button"
              onClick={() => window.location.href = "http://localhost:3000/api/auth/google"}
              style={{
                width: "100%", background: "#fff", color: "#374151",
                border: "1px solid #E5E7EB", padding: "11px", fontSize: 14,
                fontFamily: sans, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                transition: "border 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 18, height: 18 }} />
              Continuer avec Google
            </button>
          </form>

          <p style={{ color: "#6B7280", fontSize: 13, textAlign: "center", marginTop: 24 }}>
            Pas encore de compte ?{" "}
            <Link to="/register" style={{ color: BLUE, fontWeight: 600, textDecoration: "none" }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .login-brand-panel { display: none !important; } }
      `}</style>
    </div>
  );
}