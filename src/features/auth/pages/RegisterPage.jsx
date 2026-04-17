import { useState } from "react";
import { registerService } from "../api/auth.service";
import { useNavigate, Link } from "react-router-dom";

const font = "'Poppins', 'Inter', 'Helvetica Neue', sans-serif";

const BRAND_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
    <rect x="9" y="11" width="14" height="10" rx="2"/>
    <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const BENEFITS = [
  { icon: "🚗", text: "Accès à toute notre flotte premium (Mercedes, Porsche, Tesla…)" },
  { icon: "⭐", text: "Gagnez des points à chaque location et débloquez des réductions" },
  { icon: "🚚", text: "Livraison gratuite à domicile à Sousse et ses environs" },
  { icon: "🛡️", text: "Tous les véhicules assurés et entretenus aux plus hauts standards" },
  { icon: "💬", text: "Support client disponible 24h/24 et 7j/7" },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", birth_date: "" });
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
    { key: "name",     label: "Nom complet",     type: "text",     placeholder: "Jean Dupont" },
    { key: "email",    label: "Adresse email",   type: "email",    placeholder: "vous@exemple.com" },
    { key: "phone",    label: "Numéro téléphone",type: "tel",      placeholder: "ex: 20 123 456" },
    { key: "birth_date",label: "Date de naissance",type: "date",   placeholder: "" },
    { key: "password", label: "Mot de passe",    type: "password", placeholder: "8 caractères minimum" },
  ];

  return (
    <>
      <style>{`
        @keyframes orbFloat { 0%,100%{transform:translate(0,0)}45%{transform:translate(25px,-20px)}80%{transform:translate(-15px,12px)} }
        @keyframes gradPulse { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }

        .reg-input {
          width: 100%; background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 12px; color: #f1f5f9;
          font-family: ${font}; font-size: 14px;
          padding: 13px 16px; outline: none;
          transition: all .25s ease; box-sizing: border-box;
        }
        .reg-input::placeholder { color: rgba(100,116,139,.65); }
        .reg-input:focus {
          border-color: rgba(37,99,235,.65);
          background: rgba(37,99,235,.07);
          box-shadow: 0 0 0 3px rgba(37,99,235,.13);
        }
        .reg-submit {
          width: 100%;
          background: linear-gradient(135deg,#2563EB 0%,#7C3AED 100%);
          color: #fff; border: none; font-family: ${font};
          font-size: 15px; font-weight: 700; padding: 14px;
          border-radius: 12px; cursor: pointer;
          transition: all .3s ease;
          box-shadow: 0 8px 24px rgba(37,99,235,.35);
        }
        .reg-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(37,99,235,.48); }
        .reg-submit:disabled { opacity: .6; cursor: not-allowed; }

        .reg-google {
          width: 100%; background: rgba(255,255,255,.05);
          color: rgba(255,255,255,.8); border: 1px solid rgba(255,255,255,.1);
          font-family: ${font}; font-size: 14px; font-weight: 600;
          padding: 13px; border-radius: 12px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all .25s ease; backdrop-filter: blur(10px);
        }
        .reg-google:hover { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.22); }

        .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; animation: orbFloat var(--dur,9s) ease-in-out infinite; }

        @media (max-width: 768px) { .reg-brand { display: none !important; } .reg-mobile-logo { display: flex !important; } }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", fontFamily: font, background: "#03060f" }}>

        {/* ── Left brand panel ── */}
        <div className="reg-brand" style={{
          flex: 1, position: "relative", overflow: "hidden",
          background: "linear-gradient(160deg,#060b1a 0%,#0a0f28 60%,#0d0a20 100%)",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "64px 56px",
        }}>
          {/* Orbs */}
          <div className="orb" style={{ width: 460, height: 460, top: "-80px", right: "-100px", background: "radial-gradient(circle,rgba(37,99,235,.2),transparent 65%)", "--dur": "13s" }} />
          <div className="orb" style={{ width: 300, height: 300, bottom: "30px", left: "-50px", background: "radial-gradient(circle,rgba(124,58,237,.17),transparent 65%)", "--dur": "10s" }} />

          {/* Top line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(37,99,235,.5),rgba(124,58,237,.5),transparent)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, marginBottom: 56 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(135deg,#2563EB,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(37,99,235,.4)" }}>
                {BRAND_ICON}
              </div>
              <span style={{ fontSize: 21, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", fontFamily: font }}>BMZ Location</span>
            </Link>

            {/* Headline */}
            <h2 style={{ fontSize: "clamp(1.9rem,2.8vw,2.4rem)", fontWeight: 900, color: "#fff", margin: "0 0 14px", letterSpacing: "-0.04em", lineHeight: 1.1, fontFamily: font }}>
              Rejoignez la<br />
              <span style={{ background: "linear-gradient(135deg,#60a5fa,#a78bfa,#e879f9)", backgroundSize: "200%", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", animation: "gradPulse 5s ease infinite" }}>
                communauté BMZ
              </span>
            </h2>
            <p style={{ color: "#475569", fontSize: 15, margin: "0 0 40px", lineHeight: 1.7, maxWidth: 360 }}>
              Créez votre compte gratuitement et accédez à notre flotte premium dès aujourd'hui.
            </p>

            {/* Benefits */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {BENEFITS.map(({ icon, text }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>
                    {icon}
                  </div>
                  <p style={{ color: "#475569", fontSize: 13, margin: 0, lineHeight: 1.6, paddingTop: 8 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "64px 48px",
          background: "rgba(6,11,26,0.9)",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ width: "100%", maxWidth: 420 }}>

            {/* Mobile logo */}
            <Link to="/" className="reg-mobile-logo" style={{ textDecoration: "none", display: "none", alignItems: "center", gap: 10, marginBottom: 40 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2563EB,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {BRAND_ICON}
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: font }}>BMZ Location</span>
            </Link>

            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.03em", fontFamily: font }}>
              Créer un compte
            </h1>
            <p style={{ color: "#475569", fontSize: 14, margin: "0 0 32px", fontFamily: font }}>
              Rejoignez BMZ Location — gratuit et sans engagement
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {FIELDS.map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 7, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: font }}>
                    {label}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="reg-input"
                      type={type === "password" && showPassword ? "text" : type}
                      required value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={type === "password" ? { paddingRight: 46 } : {}}
                    />
                    {type === "password" && (
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "#475569", padding: 0, display: "flex",
                      }}>
                        <EyeIcon open={showPassword} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 10, color: "#f87171", fontSize: 13, padding: "11px 14px", fontFamily: font,
                }}>{error}</div>
              )}

              <button type="submit" className="reg-submit" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? "Création en cours..." : "Créer mon compte →"}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                <span style={{ color: "#334155", fontSize: 12, fontWeight: 600, fontFamily: font }}>ou</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              </div>

              <button type="button" className="reg-google"
                onClick={() => window.location.href = "http://localhost:3000/api/auth/google"}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 18, height: 18 }} />
                Continuer avec Google
              </button>
            </form>

            <p style={{ color: "#334155", fontSize: 13, textAlign: "center", marginTop: 28, fontFamily: font }}>
              Déjà un compte ?{" "}
              <Link to="/login" style={{ color: "#60a5fa", fontWeight: 700, textDecoration: "none" }}>
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
