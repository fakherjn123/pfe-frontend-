import { useState } from "react";
import { registerService } from "../api/auth.service";
import { useNavigate, Link } from "react-router-dom";

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const BLUE = "#2563EB";

const BenefitItem = ({ icon, text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: "rgba(37,99,235,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 18, flexShrink: 0,
    }}>
      {icon}
    </div>
    <p style={{ color: "#CBD5E1", fontSize: 14, margin: 0, lineHeight: 1.5 }}>{text}</p>
  </div>
);

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try { await registerService(form); navigate("/login"); }
    catch (err) { setError(err.response?.data?.message || "Échec de l'inscription."); }
    setLoading(false);
  };

  const FIELDS = [
    { key: "name", label: "Nom complet", type: "text", placeholder: "Jean Dupont" },
    { key: "email", label: "Adresse email", type: "email", placeholder: "vous@exemple.com" },
    { key: "password", label: "Mot de passe", type: "password", placeholder: "8 caractères minimum" },
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: sans, display: "flex", background: "#F9FAFB" }}>

      {/* Left — brand/benefits panel */}
      <div style={{
        flex: 1, background: "#0F172A",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "64px 56px",
      }} className="reg-brand-panel">
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>BMZ Location</span>
        </Link>

        <h2 style={{ fontSize: "clamp(1.8rem, 2.5vw, 2.4rem)", fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Rejoignez la communauté BMZ
        </h2>
        <p style={{ color: "#64748B", fontSize: 15, margin: "0 0 40px", lineHeight: 1.65 }}>
          Créez votre compte gratuitement et accédez à notre flotte premium.
        </p>

        <BenefitItem icon="🚗" text="Accès à toute notre flotte premium (Mercedes, Porsche, Tesla…)" />
        <BenefitItem icon="⭐" text="Gagnez des points à chaque location et débloquez des réductions" />
        <BenefitItem icon="🚚" text="Livraison à domicile à Sousse et ses environs" />
        <BenefitItem icon="🛡️" text="Tous les véhicules assurés et entretenus aux plus hauts standards" />
        <BenefitItem icon="📱" text="Support client 24h/24 et 7j/7 pour vos déplacements" />
      </div>

      {/* Right — form panel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "64px 48px",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Créer un compte
          </h1>
          <p style={{ color: "#6B7280", fontSize: 14, margin: "0 0 32px" }}>
            Rejoignez BMZ Location dès aujourd'hui — gratuit et sans engagement
          </p>

          <form onSubmit={handleSubmit}>
            {FIELDS.map(({ key, label, type, placeholder }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  {label}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={type === "password" && showPassword ? "text" : type}
                    required value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{
                      width: "100%",
                      padding: type === "password" ? "11px 40px 11px 14px" : "11px 14px",
                      fontSize: 14, border: "1px solid #E5E7EB", borderRadius: 8,
                      outline: "none", fontFamily: sans, boxSizing: "border-box",
                      background: "#fff", color: "#111827", transition: "border 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = BLUE}
                    onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                  />
                  {type === "password" && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "#9CA3AF", fontSize: 15, padding: 0,
                    }}>
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div style={{
                background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8,
                color: "#DC2626", fontSize: 13, padding: "10px 14px", marginBottom: 16,
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", background: BLUE, color: "#fff", border: "none",
              padding: "12px", fontSize: 15, fontFamily: sans, fontWeight: 700,
              borderRadius: 8, cursor: "pointer", marginTop: 4, marginBottom: 12,
              opacity: loading ? 0.7 : 1, transition: "background 0.2s",
            }}>
              {loading ? "Création en cours..." : "Créer mon compte"}
            </button>

            <button type="button"
              onClick={() => window.location.href = "http://localhost:3000/api/auth/google"}
              style={{
                width: "100%", background: "#fff", color: "#374151",
                border: "1px solid #E5E7EB", padding: "11px", fontSize: 14,
                fontFamily: sans, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 18, height: 18 }} />
              Continuer avec Google
            </button>
          </form>

          <p style={{ color: "#6B7280", fontSize: 13, textAlign: "center", marginTop: 24 }}>
            Déjà un compte ?{" "}
            <Link to="/login" style={{ color: BLUE, fontWeight: 600, textDecoration: "none" }}>Se connecter</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .reg-brand-panel { display: none !important; } }
      `}</style>
    </div>
  );
}