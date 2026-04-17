import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Calendar, DollarSign, ArrowRight, Car, Receipt, AlertCircle, XCircle, Clock, RefreshCw, ShieldCheck } from "lucide-react";
import { getMyRentals, cancelRental, getCancellationPreview } from "../api/rental.service";
import toast from "react-hot-toast";
import ConfirmModal from "../../../shared/components/modals/ConfirmModal";

const font = "'Poppins', 'Inter', sans-serif";

const STATUS = {
  confirmed:        { color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",  label: "Confirmée",       icon: <Calendar size={13} /> },
  ongoing:          { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)",  label: "En cours",        icon: <Car size={13} /> },
  completed:        { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)", label: "Terminée",        icon: <Receipt size={13} /> },
  cancelled:        { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", label: "Annulée",         icon: <XCircle size={13} /> },
  awaiting_payment: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  label: "Paiement requis", icon: <AlertCircle size={13} /> },
};

const injectStyles = () => {
  if (document.getElementById('rentals-lux-styles')) return;
  const s = document.createElement('style');
  s.id = 'rentals-lux-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap');
    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer { 0%{background-position:-800px 0}100%{background-position:800px 0} }
    @keyframes pulse-ring { 0%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:0.7} 100%{transform:scale(1);opacity:1} }
    @keyframes countdown-tick { 0%{transform:scale(1)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

    .rental-card {
      background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 22px;
      padding: 28px 32px;
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, border-color 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .rental-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,99,235,0.25);
      border-color: rgba(37,99,235,0.3);
    }
    .rental-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    }

    .btn-action {
      padding: 12px 22px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      font-family: ${font};
      cursor: pointer;
      transition: all 0.25s ease;
      display: flex;
      align-items: center;
      gap: 7px;
      white-space: nowrap;
      width: 100%;
      justify-content: center;
    }
    .btn-action:hover { transform: translateY(-2px); }

    .refund-badge-green {
      background: rgba(16,185,129,0.1);
      border: 1px solid rgba(16,185,129,0.25);
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .refund-badge-amber {
      background: rgba(251,191,36,0.08);
      border: 1px solid rgba(251,191,36,0.2);
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .timer-bar {
      height: 4px;
      border-radius: 100px;
      background: rgba(255,255,255,0.07);
      overflow: hidden;
      margin-top: 6px;
    }
    .timer-bar-fill {
      height: 100%;
      border-radius: 100px;
      transition: width 1s linear;
    }

    .cancel-preview-modal {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(8px);
      padding: 20px;
    }
    .cancel-preview-box {
      background: linear-gradient(145deg, #0d1117, #0a0f1e);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 36px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 40px 100px rgba(0,0,0,0.7);
      animation: fadeUp 0.35s ease;
    }

    .sk { background: linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 75%); background-size: 800px 100%; animation: shimmer 1.5s infinite linear; }
  `;
  document.head.appendChild(s);
};

// ─── Countdown Timer Component ────────────────────────────────────────────────
function CountdownTimer({ createdAt, totalWindow = 24 }) {
  const getRemaining = useCallback(() => {
    const created = new Date(createdAt);
    const deadline = new Date(created.getTime() + totalWindow * 60 * 60 * 1000);
    const diff = deadline - new Date();
    return Math.max(0, diff);
  }, [createdAt, totalWindow]);

  const [ms, setMs] = useState(getRemaining);

  useEffect(() => {
    const interval = setInterval(() => setMs(getRemaining()), 1000);
    return () => clearInterval(interval);
  }, [getRemaining]);

  if (ms <= 0) return null;

  const hours   = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const pct     = (ms / (totalWindow * 3600000)) * 100;

  const isUrgent = hours < 2;
  const color = isUrgent ? "#f87171" : (hours < 6 ? "#fbbf24" : "#10b981");

  return (
    <div style={{
      background: isUrgent ? "rgba(248,113,113,0.08)" : "rgba(16,185,129,0.08)",
      border: `1px solid ${isUrgent ? "rgba(248,113,113,0.2)" : "rgba(16,185,129,0.2)"}`,
      borderRadius: 12,
      padding: "10px 14px",
      marginTop: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Clock size={13} color={color} />
          <span style={{ fontSize: 11, fontWeight: 700, color: color, fontFamily: font, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Remboursement 100% - Fenêtre active
          </span>
        </div>
        <span style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 14,
          fontWeight: 900,
          color,
          animation: isUrgent ? "countdown-tick 1s infinite" : "none",
          display: "inline-block",
        }}>
          {String(hours).padStart(2,"0")}:{String(minutes).padStart(2,"0")}:{String(seconds).padStart(2,"0")}
        </span>
      </div>
      <div className="timer-bar">
        <div className="timer-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
      </div>
    </div>
  );
}

// ─── Cancel Preview Modal ─────────────────────────────────────────────────────
function CancelPreviewModal({ preview, onConfirm, onClose, loading }) {
  const isFullRefund = preview?.refundPercentage === 100;
  const isPaid = preview?.hasPaid;

  return (
    <div className="cancel-preview-modal" onClick={onClose}>
      <div className="cancel-preview-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <XCircle size={24} color="#f87171" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#f1f5f9", fontFamily: font }}>
              Annuler la réservation
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b", fontFamily: font }}>
              {preview?.brand} {preview?.model}
            </p>
          </div>
        </div>

        {/* Refund info */}
        {isPaid ? (
          <div style={{
            background: isFullRefund ? "rgba(16,185,129,0.08)" : "rgba(251,191,36,0.08)",
            border: `1px solid ${isFullRefund ? "rgba(16,185,129,0.25)" : "rgba(251,191,36,0.25)"}`,
            borderRadius: 16, padding: "20px",
            marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <ShieldCheck size={20} color={isFullRefund ? "#10b981" : "#fbbf24"} />
              <span style={{ fontWeight: 800, fontSize: 15, color: isFullRefund ? "#10b981" : "#fbbf24", fontFamily: font }}>
                {isFullRefund ? "Remboursement intégral" : "Remboursement partiel (50%)"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#94a3b8", fontFamily: font }}>Montant payé</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", fontFamily: font }}>{preview.totalPaid} TND</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#94a3b8", fontFamily: font }}>Remboursement ({preview.refundPercentage}%)</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: isFullRefund ? "#10b981" : "#fbbf24", fontFamily: font }}>
                +{preview.refundAmount} TND
              </span>
            </div>
            {!isFullRefund && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#94a3b8", fontFamily: font }}>Frais d'annulation</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#f87171", fontFamily: font }}>
                  -{(preview.totalPaid - preview.refundAmount).toFixed(2)} TND
                </span>
              </div>
            )}

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.6, fontFamily: font }}>
                {isFullRefund
                  ? "✅ Vous annulez dans les 24h suivant votre réservation. Remboursement intégral garanti."
                  : "⚠️ La fenêtre de 24h est expirée. Conformément à notre politique, 50% du montant sera remboursé."}
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: "16px 20px", marginBottom: 20,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", fontFamily: font }}>
              Aucun paiement n'a été effectué — aucun remboursement requis.
            </p>
          </div>
        )}

        {/* Warning */}
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 24px", fontFamily: font, lineHeight: 1.6 }}>
          Cette action est <strong style={{ color: "#f87171" }}>irréversible</strong>. Voulez-vous confirmer l'annulation ?
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontFamily: font,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}
          >
            Retour
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: "13px", borderRadius: 12, border: "none",
              background: loading ? "rgba(248,113,113,0.3)" : "linear-gradient(135deg,#dc2626,#f87171)",
              color: "#fff", fontFamily: font, fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Annulation...</> : "Confirmer l'annulation"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyRentalsPage() {
  const [rentals, setRentals]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [cancelModal, setCancelModal] = useState(null); // { rentalId, preview }
  const [cancelLoading, setCancelLoading] = useState(false);
  const navigate = useNavigate();

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const r = await getMyRentals();
      setRentals(
        r.data
          .filter(rental => rental.status !== 'pending')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { injectStyles(); fetchRentals(); }, []);

  // Open cancel modal — first fetch preview
  const handleCancelClick = async (rental) => {
    try {
      const res = await getCancellationPreview(rental.id);
      const preview = res.data;
      if (!preview.canCancel) {
        toast.error(`Annulation impossible : seulement ${preview.hoursUntilStart}h avant le départ. Contactez l'agence.`);
        return;
      }
      setCancelModal({ rentalId: rental.id, preview });
    } catch (e) {
      toast.error(e.response?.data?.message || "Impossible de charger les informations d'annulation.");
    }
  };

  const handleConfirmCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await cancelRental(cancelModal.rentalId);
      const data = res.data;

      if (data.refundAmount > 0) {
        toast.success(
          `Réservation annulée — Remboursement de ${data.refundAmount} TND (${data.refundPercentage}%) en cours.`,
          { duration: 5000 }
        );
      } else {
        toast.success("Réservation annulée avec succès.");
      }
      setCancelModal(null);
      fetchRentals();
    } catch (e) {
      toast.error(e.response?.data?.message || "Impossible d'annuler.");
    }
    setCancelLoading(false);
  };

  const fmt  = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  const days = (s, e) => Math.ceil((new Date(e) - new Date(s)) / 86400000);

  return (
    <div style={{ minHeight: "100vh", background: "#03060f", fontFamily: font, color: "#f1f5f9", paddingTop: 64 }}>

      {/* ── Page Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #060b1a 0%, #0a0f28 60%, #0d0a20 100%)",
        padding: "60px 40px",
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
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
            <Key size={30} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#a78bfa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, fontFamily: font }}>
              Espace client
            </div>
            <h1 style={{ color: "#f1f5f9", fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 900, margin: 0, letterSpacing: "-0.03em", fontFamily: font }}>
              Mes Réservations
            </h1>
            <p style={{ color: "#64748b", fontSize: 15, margin: "6px 0 0", fontFamily: font }}>
              Suivez et gérez vos locations passées et à venir
            </p>
          </div>
        </div>
      </div>

      {/* ── Policy Banner ── */}
      <div style={{ maxWidth: 1000, margin: "24px auto 0", padding: "0 40px" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))",
          border: "1px solid rgba(37,99,235,0.2)",
          borderRadius: 16, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
        }}>
          <ShieldCheck size={20} color="#60a5fa" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", fontFamily: font }}>Politique d'annulation :</span>
            <span style={{ fontSize: 13, color: "#64748b", fontFamily: font }}>
              {" "}Annulation dans les <strong style={{ color: "#10b981" }}>24h</strong> après réservation → <strong style={{ color: "#10b981" }}>100% remboursé</strong>.
              Après 24h → <strong style={{ color: "#fbbf24" }}>50% remboursé</strong>.
              Moins de 48h avant le départ → <strong style={{ color: "#f87171" }}>non annulable</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 40px 80px", position: "relative" }}>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 22, padding: "28px 32px" }}>
                <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div className="sk" style={{ height: 22, width: "30%", borderRadius: 100, marginBottom: 14 }} />
                    <div className="sk" style={{ height: 30, width: "55%", borderRadius: 8, marginBottom: 20 }} />
                    <div style={{ display: "flex", gap: 16 }}>
                      <div className="sk" style={{ height: 16, width: 100, borderRadius: 6 }} />
                      <div className="sk" style={{ height: 16, width: 100, borderRadius: 6 }} />
                      <div className="sk" style={{ height: 16, width: 80, borderRadius: 6 }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 180 }}>
                    <div className="sk" style={{ height: 44, borderRadius: 12 }} />
                    <div className="sk" style={{ height: 44, borderRadius: 12 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && rentals.length === 0 && (
          <div style={{
            background: "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24, padding: "80px 40px", textAlign: "center",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Car size={32} color="#334155" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: "0 0 8px", fontFamily: font }}>
              Aucune réservation
            </h3>
            <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 32px", fontFamily: font }}>
              Vous n'avez pas encore de réservation. Explorez notre flotte premium.
            </p>
            <button
              onClick={() => navigate("/cars")}
              style={{
                background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                color: "#fff", border: "none",
                padding: "14px 32px", borderRadius: 14,
                fontSize: 15, fontWeight: 700, fontFamily: font,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 9,
                boxShadow: "0 8px 24px rgba(37,99,235,0.35)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(37,99,235,0.48)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.35)"; }}
            >
              Parcourir les véhicules <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Rental cards */}
        {!loading && rentals.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {rentals.map((rental, i) => {
              const cfg = STATUS[rental.status] || STATUS.confirmed;
              const d   = days(rental.start_date, rental.end_date);
              const createdAt = new Date(rental.created_at);
              const hoursSinceBooking = (new Date() - createdAt) / (1000 * 60 * 60);
              const isIn24hWindow = hoursSinceBooking <= 24;

              return (
                <div
                  key={rental.id}
                  className="rental-card"
                  style={{ animation: "fadeUp 0.55s both", animationDelay: `${i * 0.08}s` }}
                >
                  {/* ── Left: Info ── */}
                  <div style={{ flex: 1, minWidth: 280 }}>

                    {/* Status + ID */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: cfg.bg, color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                        fontSize: 12, fontWeight: 700, padding: "5px 13px",
                        borderRadius: 100, fontFamily: font,
                      }}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span style={{ color: "#334155", fontSize: 12, fontWeight: 600, fontFamily: font }}>
                        #{String(rental.id).padStart(5, "0")}
                      </span>
                    </div>

                    {/* Car name */}
                    <h3 style={{
                      fontSize: 22, fontWeight: 900, margin: "0 0 18px",
                      color: "#f1f5f9", letterSpacing: "-0.02em", fontFamily: font,
                    }}>
                      {rental.brand}{" "}
                      <span style={{ fontWeight: 500, color: "#64748b" }}>{rental.model}</span>
                    </h3>

                    {/* Details row */}
                    <div style={{
                      display: "flex", gap: 24, flexWrap: "wrap",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      padding: "16px 20px", borderRadius: 14,
                    }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: font }}>Départ</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", fontFamily: font }}>{fmt(rental.start_date)}</div>
                      </div>
                      <div style={{ width: 1, background: "rgba(255,255,255,0.07)", alignSelf: "stretch" }} />
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: font }}>Retour</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", fontFamily: font }}>{fmt(rental.end_date)}</div>
                      </div>
                      <div style={{ width: 1, background: "rgba(255,255,255,0.07)", alignSelf: "stretch" }} />
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: font }}>Durée</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", fontFamily: font }}>{d} jour{d > 1 ? "s" : ""}</div>
                      </div>
                      <div style={{ width: 1, background: "rgba(255,255,255,0.07)", alignSelf: "stretch" }} />
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: font }}>Total</div>
                        <div style={{ fontSize: 16, fontWeight: 900, fontFamily: font, background: "linear-gradient(135deg,#2563EB,#7C3AED)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          {rental.total_price} TND
                        </div>
                      </div>
                    </div>

                    {/* 24h countdown timer - only for confirmed rentals in window */}
                    {rental.status === "confirmed" && isIn24hWindow && (
                      <CountdownTimer createdAt={rental.created_at} />
                    )}

                    {/* Refund status badge (if cancelled with refund) */}
                    {rental.status === "cancelled" && rental.refund_amount > 0 && (
                      <div style={{
                        marginTop: 12,
                        background: "rgba(251,191,36,0.08)",
                        border: "1px solid rgba(251,191,36,0.2)",
                        borderRadius: 12, padding: "10px 14px",
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <RefreshCw size={14} color="#fbbf24" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", fontFamily: font }}>
                          Remboursement de {rental.refund_amount} TND ({rental.refund_percentage}%) en cours
                        </span>
                      </div>
                    )}

                    {/* Security: Deposit & Penalties */}
                    {(Number(rental.deposit_amount) > 0 || Number(rental.penalty_amount) > 0) && (
                      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                        {Number(rental.deposit_amount) > 0 && (
                          <div style={{
                            background: "rgba(16,185,129,0.05)",
                            border: "1px dashed rgba(16,185,129,0.25)",
                            borderRadius: 12, padding: "12px 16px",
                            display: "flex", alignItems: "center", gap: 12,
                          }}>
                            <div style={{ background: "rgba(16,185,129,0.1)", padding: 6, borderRadius: 8 }}>
                              <ShieldCheck size={18} color="#10b981" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981", fontFamily: font }}>
                                Caution Garantie : {rental.deposit_amount} TND
                              </div>
                              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, fontFamily: font }}>
                                {rental.deposit_status === 'returned' || rental.deposit_status === 'refunded' ? "✅ Cette caution vous a été restituée complètement." : "🔒 Bloquée temporairement. Sera restituée à la fin de la location sous réserve d'inspection."}
                              </div>
                            </div>
                          </div>
                        )}

                        {Number(rental.penalty_amount) > 0 && (
                          <div style={{
                            background: "rgba(245,158,11,0.05)",
                            border: "1px dashed rgba(245,158,11,0.25)",
                            borderRadius: 12, padding: "12px 16px",
                            display: "flex", alignItems: "center", gap: 12,
                          }}>
                            <div style={{ background: "rgba(245,158,11,0.1)", padding: 6, borderRadius: 8 }}>
                              <AlertCircle size={18} color="#f59e0b" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", fontFamily: font }}>
                                Frais Additionnels / Pénalité : {rental.penalty_amount} TND
                              </div>
                              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, fontFamily: font }}>
                                <strong style={{color:"#cbd5e1"}}>Motif :</strong> {rental.penalty_reason || "Ajustement suite à l'état des lieux."}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Right: Actions ── */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 190 }}>

                    {rental.status === "awaiting_payment" && (
                      <button
                        className="btn-action"
                        onClick={() => navigate(`/payment/${rental.id}`)}
                        style={{
                          background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                          color: "#0f172a", border: "none",
                          boxShadow: "0 6px 20px rgba(245,158,11,0.35)",
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 32px rgba(245,158,11,0.5)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(245,158,11,0.35)"}
                      >
                        <DollarSign size={15} /> Payer maintenant
                      </button>
                    )}

                    {rental.status === "confirmed" && (
                      <button
                        className="btn-action"
                        onClick={() => handleCancelClick(rental)}
                        style={{
                          background: "rgba(248,113,113,0.1)",
                          color: "#f87171",
                          border: "1px solid rgba(248,113,113,0.3)",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                      >
                        <XCircle size={15} /> Annuler
                        {isIn24hWindow && (
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: "2px 7px",
                            borderRadius: 100, background: "rgba(16,185,129,0.2)",
                            color: "#10b981", marginLeft: 4,
                          }}>100%</span>
                        )}
                      </button>
                    )}

                    {rental.status === "completed" && (
                      <button
                        className="btn-action"
                        onClick={() => navigate("/facture")}
                        style={{
                          background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                          color: "#fff", border: "none",
                          boxShadow: "0 6px 20px rgba(37,99,235,0.3)",
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 32px rgba(37,99,235,0.45)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.3)"}
                      >
                        <Receipt size={15} /> Voir la facture
                      </button>
                    )}

                    {(rental.status === "ongoing" || rental.status === "cancelled") && (
                      <button
                        className="btn-action"
                        onClick={() => navigate(`/cars/${rental.car_id}`)}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          color: "rgba(255,255,255,0.75)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                      >
                        <Car size={15} /> Voir le véhicule
                      </button>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Cancel Preview Modal ── */}
      {cancelModal && (
        <CancelPreviewModal
          preview={cancelModal.preview}
          loading={cancelLoading}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelModal(null)}
        />
      )}
    </div>
  );
}
