import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../config/api.config.js";
import { Search, Clock, CheckCircle, Truck, Activity, ClipboardCheck } from "lucide-react";
import InspectionModal from "../../../shared/components/modals/InspectionModal";

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const BLUE = "#2563EB";

// ── Status config ─────────────────────────────────────────────
const STATUS_CFG = {
  awaiting_payment: { label: "Paiement requis", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  pending:          { label: "En attente",       color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  confirmed:        { label: "Confirmée",        color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  ongoing:          { label: "En cours",         color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  delivered:        { label: "Livrée",           color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  completed:        { label: "Terminée",         color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
  cancelled:        { label: "Annulée",          color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
};

// Status progression: what's the next status + button label
const NEXT_STATUS = {
  pending:   { next: "confirmed", label: "→ Confirmée" },
  confirmed: { next: "delivered", label: "→ Livrée"   },
  ongoing:   { next: "delivered", label: "→ Livrée"   },
  delivered: { next: "completed", label: "→ Terminée" },
};

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({ icon, count, label, color, bg }) {
  return (
    <div style={{
      flex: 1, background: bg, borderRadius: 16,
      padding: "22px 24px", minWidth: 180,
      border: `1.5px solid ${color}22`,
    }}>
      <div style={{ color, marginBottom: 10, fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color, letterSpacing: "-0.02em", lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color, marginTop: 6, opacity: 0.85 }}>{label}</div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.confirmed;
  return (
    <span style={{
      display: "inline-block", padding: "4px 12px", borderRadius: 20,
      fontSize: 12, fontWeight: 700, letterSpacing: "0.01em",
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────
export default function AllRentalsPage() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [progressingId, setProgressingId] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    api.get("/rentals/all")
      .then(res => setRentals(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Actions ──────────────────────────────────────────────────
  const cancelRental = async (rentalId) => {
    if (!window.confirm("Voulez-vous vraiment annuler cette réservation ?")) return;
    setCancellingId(rentalId);
    try {
      const res = await api.put(`/rentals/admin/cancel/${rentalId}`);
      if (res.data.requiresRefund) {
        alert(`⚠️ Réservation annulée.\nRemboursement manuel de ${res.data.refundAmount} DT requis pour ${res.data.clientName}.`);
      }
      setRentals(prev => prev.map(r => r.id === rentalId ? { ...r, status: "cancelled" } : r));
    } catch (err) {
      alert(err.response?.data?.message || "Erreur.");
    } finally {
      setCancellingId(null);
    }
  };

  const progressStatus = async (rental) => {
    const prog = NEXT_STATUS[rental.status];
    if (!prog) return;
    setProgressingId(rental.id);
    try {
      await api.put(`/rentals/admin/status/${rental.id}`, { status: prog.next });
      setRentals(prev => prev.map(r => r.id === rental.id ? { ...r, status: prog.next } : r));
    } catch {
      // Fallback: try delivery status endpoint
      try {
        await api.put(`/delivery/${rental.id}/delivery-status`, { status: prog.next });
        setRentals(prev => prev.map(r => r.id === rental.id ? { ...r, status: prog.next } : r));
      } catch (err2) {
        alert("Erreur lors de la mise à jour du statut.");
      }
    } finally {
      setProgressingId(null);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────
  const fmt = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtId = (id) => `RNT-${String(id).padStart(3, "0")}`;

  // ── Filtered list ─────────────────────────────────────────────
  const filtered = rentals.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      fmtId(r.id).toLowerCase().includes(q) ||
      (r.user_name || "").toLowerCase().includes(q) ||
      (r.brand || "").toLowerCase().includes(q) ||
      (r.model || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── KPI counts ────────────────────────────────────────────────
  const pending   = rentals.filter(r => r.status === "pending" || r.status === "awaiting_payment").length;
  const confirmed = rentals.filter(r => r.status === "confirmed").length;
  const delivered = rentals.filter(r => r.status === "delivered" || r.status === "ongoing").length;

  const activeCount = rentals.filter(r => !["cancelled", "completed"].includes(r.status)).length;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: sans, padding: "32px" }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Locations Actives
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#6B7280" }}>{activeCount} location{activeCount !== 1 ? "s" : ""} en cours</p>
        </div>
        <button
          onClick={() => navigate("/admin/rentals/history")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: BLUE, color: "#fff", border: "none",
            padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: sans,
          }}
        >
          <Activity size={15} /> Historique Mensuel
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <KpiCard icon={<Clock size={22} />}      count={pending}   label="En attente"  color="#D97706" bg="#FFFBEB" />
        <KpiCard icon={<CheckCircle size={22} />} count={confirmed} label="Confirmées"  color="#2563EB" bg="#EFF6FF" />
        <KpiCard icon={<Truck size={22} />}       count={delivered} label="Livrées"     color="#7C3AED" bg="#F5F3FF" />
      </div>

      {/* ── Search + Filter ── */}
      <div style={{
        display: "flex", gap: 12, marginBottom: 20,
        alignItems: "center", flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={15} style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            color: "#9CA3AF",
          }} />
          <input
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", paddingLeft: 36, paddingRight: 14, height: 38,
              border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13,
              fontFamily: sans, outline: "none", boxSizing: "border-box",
              background: "#fff", color: "#374151",
            }}
            onFocus={e => e.target.style.borderColor = BLUE}
            onBlur={e => e.target.style.borderColor = "#E5E7EB"}
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            height: 38, border: "1px solid #E5E7EB", borderRadius: 8,
            padding: "0 36px 0 12px", fontSize: 13, fontFamily: sans,
            background: "#fff", color: "#374151", cursor: "pointer",
            outline: "none", minWidth: 160,
            appearance: "auto",
          }}
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="awaiting_payment">Paiement requis</option>
          <option value="confirmed">Confirmée</option>
          <option value="ongoing">En cours</option>
          <option value="delivered">Livrée</option>
          <option value="completed">Terminée</option>
          <option value="cancelled">Annulée</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB",
        overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
            Aucune location trouvée.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
                {["Réservation", "Client", "Véhicule", "Dates", "Total", "Statut", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: "left",
                    fontSize: 12, fontWeight: 700, color: "#6B7280",
                    letterSpacing: "0.04em", textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((rental, idx) => {
                const prog = NEXT_STATUS[rental.status];
                const canCancel = !["cancelled", "completed"].includes(rental.status);
                const canInspect = !["cancelled", "awaiting_payment"].includes(rental.status);

                return (
                  <tr key={rental.id} style={{
                    borderBottom: idx < filtered.length - 1 ? "1px solid #F9FAFB" : "none",
                    transition: "background 0.12s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Réservation ID */}
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>
                      {fmtId(rental.id)}
                    </td>

                    {/* Client */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                        {rental.user_name || `Client #${rental.user_id}`}
                      </div>
                      {rental.user_email && (
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{rental.user_email}</div>
                      )}
                    </td>

                    {/* Véhicule */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {rental.car_image ? (
                          <img
                            src={`http://localhost:3000${rental.car_image}`}
                            alt={rental.brand}
                            style={{ width: 40, height: 30, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                            onError={e => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div style={{
                            width: 40, height: 30, borderRadius: 6, background: "#F3F4F6",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 16, flexShrink: 0,
                          }}>🚗</div>
                        )}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                            {rental.brand} {rental.model}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: 12, color: "#374151" }}>
                        {fmt(rental.start_date)} <span style={{ color: "#9CA3AF" }}>→</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#374151" }}>
                        {fmt(rental.end_date)}
                      </div>
                    </td>

                    {/* Total */}
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                        {Number(rental.total_price).toLocaleString("fr-FR")}
                      </div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>DT</div>
                    </td>

                    {/* Statut */}
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={rental.status} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
                        {/* Progress button */}
                        {prog && (
                          <button
                            onClick={() => progressStatus(rental)}
                            disabled={progressingId === rental.id}
                            style={{
                              background: BLUE, color: "#fff", border: "none",
                              padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                              cursor: "pointer", fontFamily: sans, whiteSpace: "nowrap",
                              opacity: progressingId === rental.id ? 0.7 : 1,
                            }}
                          >
                            {progressingId === rental.id ? "..." : prog.label}
                          </button>
                        )}

                        {/* Inspection button */}
                        {canInspect && (
                          <button
                            onClick={() => setSelectedRental(rental)}
                            title="État des lieux"
                            style={{
                              background: "#F5F3FF", color: "#7C3AED", border: "1px solid #DDD6FE",
                              padding: "6px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                              cursor: "pointer", fontFamily: sans, display: "flex", alignItems: "center", gap: 4,
                            }}
                          >
                            <ClipboardCheck size={13} />
                          </button>
                        )}

                        {/* Cancel button */}
                        {canCancel && (
                          <button
                            onClick={() => cancelRental(rental.id)}
                            disabled={cancellingId === rental.id}
                            style={{
                              background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA",
                              padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                              cursor: "pointer", fontFamily: sans, whiteSpace: "nowrap",
                              opacity: cancellingId === rental.id ? 0.7 : 1,
                            }}
                          >
                            {cancellingId === rental.id ? "..." : "Annuler"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Inspection Modal ── */}
      {selectedRental && (
        <InspectionModal
          rental={selectedRental}
          isAdmin={true}
          onClose={() => setSelectedRental(null)}
        />
      )}
    </div>
  );
}
