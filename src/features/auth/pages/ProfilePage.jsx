import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../config/api.config";
import { AuthContext } from "../../auth/context/AuthContext";
import { User, Shield, Key, AlertCircle, FileText, CheckCircle, Upload } from "lucide-react";

const font = "'Poppins', 'Inter', sans-serif";

const T = {
  bg: "#03060f", white: "rgba(255,255,255,0.03)", black: "rgba(255,255,255,0.05)",
  accent: "#2563EB", accentLight: "#3B82F6", accentBg: "rgba(37,99,235,0.1)",
  accentBorder: "rgba(37,99,235,0.3)", border: "rgba(255,255,255,0.08)",
  muted: "#64748b", mutedLight: "#475569",
  danger: "#f87171", dangerBg: "rgba(248,113,113,0.1)",
  success: "#10b981", successBg: "rgba(16,185,129,0.1)",
  warning: "#fbbf24", warningBg: "rgba(251,191,36,0.1)",
  text: "#f1f5f9", textSub: "#94a3b8",
};

const getTier = (points) => {
  if (points >= 500) return { name: "Platinum", icon: "💎", color: "#c084fc", bg: "rgba(192,132,252,0.1)", border: "rgba(192,132,252,0.3)", next: null, progress: 100 };
  if (points >= 200) return { name: "Gold", icon: "🥇", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)", next: 500, progress: Math.round(((points - 200) / 300) * 100) };
  if (points >= 100) return { name: "Silver", icon: "🥈", color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)", next: 200, progress: Math.round(((points - 100) / 100) * 100) };
  return { name: "Bronze", icon: "🥉", color: "#d97706", bg: "rgba(217,119,6,0.1)", border: "rgba(217,119,6,0.3)", next: 100, progress: Math.round((points / 100) * 100) };
};

const useCountUp = (target, duration = 1000) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return val;
};

const StatCard = ({ label, value, unit = "", icon, delay = 0 }) => (
  <div style={{
    background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    border: `1px solid ${T.border}`, borderRadius: 20,
    padding: "24px 28px", display: "flex", flexDirection: "column", gap: 8,
    animation: "profileFadeUp 0.5s ease both", animationDelay: `${delay}s`,
    transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, border-color 0.3s ease",
  }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(37,99,235,0.2)"; e.currentTarget.style.borderColor = "rgba(37,99,235,0.3)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = T.border; }}
  >
    <div style={{ fontSize: 24 }}>{icon}</div>
    <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
    <div style={{ color: T.text, fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em" }}>
      {value}<span style={{ fontSize: 14, fontWeight: 600, color: T.muted, marginLeft: 6 }}>{unit}</span>
    </div>
  </div>
);

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [licenseMessage, setLicenseMessage] = useState({ text: "", type: "" });
  const animatedPoints = useCountUp(profile?.points || 0, 1200);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    Promise.all([api.get("/users/me"), api.get("/rentals/my")])
      .then(([profileRes, rentalsRes]) => {
        setProfile(profileRes.data);
        setForm({ name: profileRes.data.name || "", email: profileRes.data.email || "" });
        setRentals(rentalsRes.data || []);
      }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.email) { setError("Nom et email requis"); return; }
    setSaving(true); setError("");
    try {
      const res = await api.put("/users/me", form);
      setProfile((p) => ({ ...p, ...res.data.user }));
      setSaved(true); setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally { setSaving(false); }
  };

  const handleLicenseUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("license", file);
    setUploadingLicense(true);
    setLicenseMessage({ text: "", type: "" });

    try {
      const res = await api.post("/users/upload-license", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setProfile((p) => ({ ...p, driving_license_url: res.data.driving_license_url, driving_license_status: "pending" }));
      setLicenseMessage({ text: res.data.message || "Permis téléchargé avec succès. En attente de vérification.", type: "success" });
      setTimeout(() => setLicenseMessage({ text: "", type: "" }), 5000);
    } catch (err) {
      setLicenseMessage({ text: err.response?.data?.message || "Erreur lors du téléchargement", type: "error" });
    } finally {
      setUploadingLicense(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 64 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${T.border}`, borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ color: T.muted, fontSize: 13, fontFamily: font, fontWeight: 500 }}>Chargement du profil…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  const tier = getTier(profile?.points || 0);
  const totalSpent = rentals.reduce((s, r) => s + Number(r.total_price || 0), 0);
  const completedRentals = rentals.filter((r) => r.status === "completed").length;
  const recentRentals = rentals; // Afficher TOUTES les voitures louées
  const initials = (profile?.name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: font, color: T.text, paddingTop: 64 }}>
      <style>{`
        @keyframes profileFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes progressFill { from { width: 0%; } to { width: ${tier.progress}%; } }
        @keyframes avatarPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.3); } 50% { box-shadow: 0 0 0 12px rgba(124,58,237,0); } }
        .glass-panel {
          background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 24px;
        }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #060b1a 0%, #0a0f28 60%, #0d0a20 100%)",
        padding: "60px 40px", position: "relative", overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Orbs */}
        <div style={{ position: "absolute", width: 360, height: 360, top: "-80px", right: "-60px", background: "radial-gradient(circle,rgba(37,99,235,.18),transparent 65%)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 280, height: 280, bottom: "-60px", left: "-40px", background: "radial-gradient(circle,rgba(124,58,237,.15),transparent 65%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(37,99,235,.5),rgba(124,58,237,.5),transparent)" }} />

        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", gap: 24, position: "relative", zIndex: 1 }}>
          <div style={{
            width: 68, height: 68, flexShrink: 0,
            background: "linear-gradient(135deg,#2563EB,#7C3AED)",
            borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 28px rgba(37,99,235,0.4)",
          }}>
            <User size={30} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#a78bfa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, fontFamily: font }}>
              Espace client
            </div>
            <h1 style={{ color: "#f1f5f9", fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 900, margin: 0, letterSpacing: "-0.03em", fontFamily: font }}>
              Mon Profil
            </h1>
            <p style={{ color: "#64748b", fontSize: 15, margin: "6px 0 0", fontFamily: font }}>
              Gérez vos informations et votre compte fidélité
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 40px 80px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Global Info Banner */}
        <div className="glass-panel" style={{ padding: "40px", position: "relative", overflow: "hidden", animation: "profileFadeUp 0.4s ease both" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.15), transparent)", pointerEvents: "none", filter: "blur(40px)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <div style={{ width: 90, height: 90, borderRadius: 28, flexShrink: 0, background: "linear-gradient(135deg, #2563EB, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 32, fontWeight: 900, animation: "avatarPulse 3s ease-in-out infinite" }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>{profile?.name}</h2>
                <span style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.border}`, fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 100, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>{tier.icon} {tier.name.toUpperCase()}</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>{profile?.email}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4, fontWeight: 600 }}>Client DriveNow Premium · ID #{profile?.id}</div>
            </div>
            <button onClick={() => { logout(); navigate("/login"); }} style={{ background: T.dangerBg, border: `1px solid rgba(248,113,113,0.3)`, color: T.danger, padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.2)"} onMouseLeave={e => e.currentTarget.style.background = T.dangerBg}>
              Déconnexion
            </button>
          </div>
        </div>

        {/* Loyalty & Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          {/* Points card */}
          <div className="glass-panel" style={{ padding: "40px", animation: "profileFadeUp 0.5s ease both 0.1s", position: "relative", overflow: "hidden", border: `1px solid ${tier.border}` }}>
            <div style={{ position: "absolute", top: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${tier.color}15, transparent)`, filter: "blur(60px)", pointerEvents: "none" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24, position: "relative", zIndex: 1 }}>
              <div>
                <div style={{ color: tier.color, fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  {tier.icon} PROGRAMME FIDÉLITÉ
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 64, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>{animatedPoints}</span>
                  <span style={{ color: T.mutedSub, fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>points</span>
                </div>
                {tier.next && <div style={{ color: T.textSub, fontSize: 14, fontWeight: 500 }}><span style={{ fontWeight: 700, color: tier.color }}>{tier.next - (profile?.points || 0)} points</span> requis pour le niveau suivant</div>}
              </div>
              
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 16, padding: "20px 24px", minWidth: 240, border: `1px solid ${T.border}` }}>
                <div style={{ color: T.textSub, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 12, textTransform: "uppercase" }}>Vos Avantages</div>
                {[{ pts: 100, label: "-10% sur location", unlocked: (profile?.points || 0) >= 100 }, { pts: 200, label: "Accès Silver VIP", unlocked: (profile?.points || 0) >= 200 }, { pts: 500, label: "Service Platinum Exclusif", unlocked: (profile?.points || 0) >= 500 }].map(({ pts, label, unlocked }) => (
                  <div key={pts} style={{ display: "flex", alignItems: "center", gap: 10, opacity: unlocked ? 1 : 0.4, marginBottom: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: unlocked ? T.successBg : "rgba(255,255,255,0.05)", border: `1px solid ${unlocked ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: unlocked ? T.success : "#fff" }}>
                      {unlocked ? "✓" : ""}
                    </div>
                    <span style={{ color: unlocked ? "#fff" : T.textSub, fontSize: 14, fontWeight: unlocked ? 600 : 500 }}>{label}</span>
                    {!unlocked && <span style={{ color: T.mutedLight, fontSize: 12, marginLeft: "auto" }}>{pts} pts</span>}
                  </div>
                ))}
              </div>
            </div>
            
            {tier.next && (
              <div style={{ marginTop: 32, position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ color: tier.color, fontSize: 13, fontWeight: 800 }}>{tier.name}</span>
                  <span style={{ color: T.textSub, fontSize: 13, fontWeight: 600 }}>Objectif: {tier.next} pts</span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${tier.color}, ${tier.color}88)`, width: `${tier.progress}%`, animation: "progressFill 1.2s cubic-bezier(0.4,0,0.2,1) both 0.5s", boxShadow: `0 0 10px ${tier.color}88` }} />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            <StatCard label="Locations Réalisées" value={rentals.length} icon="🏎️" delay={0.2} />
            <StatCard label="Total Dépensé" value={totalSpent.toFixed(0)} unit="TND" icon="💳" delay={0.3} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, marginTop: 10 }}>
          

          {/* Edit profile */}
          <div className="glass-panel" style={{ animation: "profileFadeUp 0.5s ease both 0.35s" }}>
            <div style={{ padding: "24px 32px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={18} color="#a78bfa" /></div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Informations personnelles</div>
                  <div style={{ color: T.textSub, fontSize: 13, marginTop: 2 }}>Mettez à jour vos coordonnées</div>
                </div>
              </div>
              {!editing
                ? <button onClick={() => setEditing(true)} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: "#fff", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}>Modifier</button>
                : <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => { setEditing(false); setError(""); setForm({ name: profile?.name || "", email: profile?.email || "" }); }} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.textSub, padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>Annuler</button>
                  <button onClick={handleSave} disabled={saving} style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>{saving ? "Sauvegarde..." : "Enregistrer"}</button>
                </div>
              }
            </div>
            <div style={{ padding: "32px" }}>
              {saved && <div style={{ background: T.successBg, border: `1px solid ${T.success}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: T.success, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><CheckCircle size={18} /> Profil mis à jour avec succès!</div>}
              {error && <div style={{ background: T.dangerBg, border: `1px solid ${T.danger}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: T.danger, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><AlertCircle size={18} /> {error}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {[{ label: "Nom complet", key: "name", type: "text", placeholder: "Votre nom" }, { label: "Adresse email", key: "email", type: "email", placeholder: "votre@email.com" }].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: "block", color: T.textSub, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>{label}</label>
                    {editing
                      ? <input type={type} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", fontSize: 15, color: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.2s" }} onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 1px rgba(124,58,237,0.3)"; }} onBlur={(e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
                      : <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${T.border}`, color: "#fff", fontSize: 15, fontWeight: 500 }}>{profile?.[key] || "—"}</div>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* License Upload Section */}
          <div className="glass-panel" style={{ animation: "profileFadeUp 0.5s ease both 0.4s" }}>
            <div style={{ padding: "24px 32px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}><Shield size={18} color="#10b981" /></div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Vérification Permis</div>
                  <div style={{ color: T.textSub, fontSize: 13, marginTop: 2 }}>{profile?.driving_license_status === "approved" ? "Compte certifié pour la location" : "Document requis pour autoriser vos locations"}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: "32px" }}>
              {licenseMessage.text && <div style={{ background: licenseMessage.type === "success" ? T.successBg : T.dangerBg, border: `1px solid ${licenseMessage.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(248,113,113,0.3)"}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: licenseMessage.type === "success" ? T.success : T.danger, fontSize: 14, fontWeight: 600 }}>{licenseMessage.text}</div>}
              
              {profile?.driving_license_url ? (
                <div style={{ display: "flex", alignItems: "center", gap: 20, background: profile?.driving_license_status === "approved" ? "rgba(16,185,129,0.05)" : profile?.driving_license_status === "rejected" ? "rgba(248,113,113,0.05)" : "rgba(251,191,36,0.05)", border: `1px solid ${profile?.driving_license_status === "approved" ? "rgba(16,185,129,0.2)" : profile?.driving_license_status === "rejected" ? "rgba(248,113,113,0.2)" : "rgba(251,191,36,0.2)"}`, padding: "20px 24px", borderRadius: 16 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: profile?.driving_license_status === "approved" ? T.successBg : profile?.driving_license_status === "rejected" ? T.dangerBg : T.warningBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: profile?.driving_license_status === "approved" ? T.success : profile?.driving_license_status === "rejected" ? T.danger : T.warning }}>
                    {profile?.driving_license_status === "approved" ? <CheckCircle size={24} /> : profile?.driving_license_status === "rejected" ? <AlertCircle size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 4 }}>
                      {profile?.driving_license_status === "approved" ? "Permis validé (Location Autorisée)" : profile?.driving_license_status === "rejected" ? "Permis refusé (Location Bloquée)" : "En cours de vérification"}
                    </div>
                    <div style={{ color: profile?.driving_license_status === "rejected" ? T.danger : T.textSub, fontSize: 14, fontWeight: 500 }}>
                      {profile?.driving_license_status === "approved" ? "Votre permis a été vérifié. Vous pouvez louer un véhicule." : profile?.driving_license_status === "rejected" ? (profile?.driving_license_msg || "Document illisible ou invalide. Veuillez en fournir un nouveau.") : "Votre document est en cours d'examen. Vous ne pouvez pas encore louer de véhicule."}
                    </div>
                  </div>
                  {profile?.driving_license_status !== "approved" && (
                    <label style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: uploadingLicense ? "not-allowed" : "pointer", color: "#fff", opacity: uploadingLicense ? 0.7 : 1, textAlign: "center", flexShrink: 0, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                      {uploadingLicense ? "Chargement..." : "Mettre à jour"}
                      <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={handleLicenseUpload} disabled={uploadingLicense} />
                    </label>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 20, background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.2)", padding: "20px 24px", borderRadius: 16 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: T.warningBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: T.warning }}>
                    <AlertCircle size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 4 }}>Permis manquant (Location Bloquée)</div>
                    <div style={{ color: T.textSub, fontSize: 14, fontWeight: 500 }}>Veuillez uploader votre permis pour valider votre identité et débloquer les locations.</div>
                  </div>
                  <label style={{ background: "linear-gradient(135deg,#fbbf24,#d97706)", color: "#000", border: "none", padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: uploadingLicense ? "not-allowed" : "pointer", opacity: uploadingLicense ? 0.8 : 1, textAlign: "center", flexShrink: 0, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(245,158,11,0.3)" }}>
                    {uploadingLicense ? "Chargement..." : <><Upload size={16} /> Uploader</>}
                    <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={handleLicenseUpload} disabled={uploadingLicense} />
                  </label>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

