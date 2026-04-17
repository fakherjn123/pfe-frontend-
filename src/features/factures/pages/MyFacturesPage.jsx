import { useEffect, useState } from "react";
import { getMyFactures, downloadFacture } from "../api/facture.service";
import { Receipt, Download, FileText, ArrowRight, Calendar, Car } from "lucide-react";

const font = "'Poppins', 'Inter', sans-serif";
const fmt = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

/* ─── Inject styles ───────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById('my-factures-styles')) return;
  const s = document.createElement('style');
  s.id = 'my-factures-styles';
  s.textContent = `
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(24px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes shimmer { 0%{background-position:-800px 0}100%{background-position:800px 0} }

    .facture-card {
      background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 22px;
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, border-color 0.3s ease;
    }
    .facture-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,99,235,0.25);
      border-color: rgba(37,99,235,0.3);
    }
    .sk { background: linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 75%); background-size: 800px 100%; animation: shimmer 1.5s infinite linear; }
  `;
  document.head.appendChild(s);
};

export default function MyFacturesPage() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    injectStyles();
    getMyFactures().then(r => { 
        setFactures(r.data.factures.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))); 
        setLoading(false); 
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#03060f", fontFamily: font, color: "#f1f5f9", paddingTop: 64 }}>
      {/* ── Header ────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #060b1a 0%, #0a0f28 60%, #0d0a20 100%)",
        padding: "60px 40px", position: "relative", overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Orbs */}
        <div style={{ position: "absolute", width: 360, height: 360, top: "-80px", right: "-60px", background: "radial-gradient(circle,rgba(37,99,235,.18),transparent 65%)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 280, height: 280, bottom: "-60px", left: "-40px", background: "radial-gradient(circle,rgba(124,58,237,.15),transparent 65%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
        {/* Top accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(37,99,235,.5),rgba(124,58,237,.5),transparent)" }} />
        
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 68, height: 68, flexShrink: 0,
            background: "linear-gradient(135deg,#2563EB,#7C3AED)",
            borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 28px rgba(37,99,235,0.4)",
          }}>
            <Receipt size={30} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#a78bfa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, fontFamily: font }}>
              Espace client
            </div>
            <h1 style={{ color: "#f1f5f9", fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 900, margin: 0, letterSpacing: "-0.03em", fontFamily: font }}>
              Mes Factures
            </h1>
            <p style={{ color: "#64748b", fontSize: 15, margin: "6px 0 0", fontFamily: font }}>
              Consultez et téléchargez l'historique de vos paiements
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 40px 80px", position: "relative" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 22, padding: "28px 32px" }}>
                <div className="sk" style={{ height: 22, width: "30%", borderRadius: 100, marginBottom: 14 }} />
                <div className="sk" style={{ height: 30, width: "55%", borderRadius: 8, marginBottom: 20 }} />
                <div className="sk" style={{ height: 16, width: "100%", borderRadius: 6, marginBottom: 8 }} />
                <div className="sk" style={{ height: 16, width: "80%", borderRadius: 6, marginBottom: 20 }} />
                <div className="sk" style={{ height: 44, borderRadius: 12 }} />
              </div>
            ))}
          </div>
        ) : factures.length === 0 ? (
          <div style={{
            background: "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24, padding: "80px 40px", textAlign: "center",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <FileText size={32} color="#334155" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: "0 0 8px", fontFamily: font }}>
              Aucune facture
            </h3>
            <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 32px", fontFamily: font }}>
              Vous n'avez pas encore de factures disponibles. Elles apparaîtront ici une fois vos réservations terminées.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {factures.map((f, i) => (
              <div key={f.id} className="facture-card" style={{ animation: "fadeUp 0.55s both", animationDelay: `${i * 0.08}s` }}>
                {/* Facture Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Facture</div>
                      <div style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 800, fontFamily: font }}>#{String(f.id).padStart(5, "0")}</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>
                    {fmt(f.created_at)}
                  </div>
                </div>

                {/* Info Véhicule & Dates */}
                <div style={{ flex: 1, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: "#f1f5f9", fontSize: 18, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.01em" }}>
                    <Car size={18} color="#64748b" />
                    {f.brand} <span style={{ fontWeight: 500, color: '#94a3b8' }}>{f.model}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>
                    <Calendar size={16} color="#475569" />
                    {fmt(f.start_date)} <ArrowRight size={12} color="#475569" /> {fmt(f.end_date)}
                  </div>
                </div>

                {/* Total & Action */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <span style={{ color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL Payé</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: "#10b981", fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em" }}>
                        {f.total}
                      </span>
                      <span style={{ color: "#10b981", fontSize: 14, fontWeight: 600, marginLeft: 4 }}>TND</span>
                    </div>
                  </div>

                  <button onClick={() => downloadFacture(f.id)} style={{
                    width: "100%", background: "linear-gradient(135deg,#2563EB,#7C3AED)", color: "#fff",
                    border: "none", padding: "14px", fontSize: 14,
                    fontFamily: font, fontWeight: 700, borderRadius: 12, cursor: "pointer",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: "all 0.2s", boxShadow: '0 6px 20px rgba(37,99,235,0.3)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(37,99,235,0.45)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.3)"; }}
                  >
                    <Download size={18} /> Télécharger le PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
