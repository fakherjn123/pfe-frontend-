import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Calendar, DollarSign, ArrowRight, Car, Receipt, AlertCircle, XCircle, ClipboardCheck } from "lucide-react";
import { getMyRentals, cancelRental } from "../api/rental.service";
import InspectionModal from "../../../shared/components/modals/InspectionModal";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

const STATUS = {
  confirmed: { color: "#059669", bg: "#d1fae5", border: "#34d399", label: "Confirmée", icon: <Calendar size={14} /> },
  ongoing: { color: "#2563eb", bg: "#dbeafe", border: "#60a5fa", label: "En cours", icon: <Car size={14} /> },
  completed: { color: "#475569", bg: "#f1f5f9", border: "#cbd5e1", label: "Terminée", icon: <Receipt size={14} /> },
  cancelled: { color: "#dc2626", bg: "#fee2e2", border: "#f87171", label: "Annulée", icon: <XCircle size={14} /> },
  awaiting_payment: { color: "#d97706", bg: "#fef3c7", border: "#fbbf24", label: "Paiement requis", icon: <AlertCircle size={14} /> },
};

const injectStyles = () => {
  if (document.getElementById('my-rentals-styles')) return;
  const s = document.createElement('style');
  s.id = 'my-rentals-styles';
  s.textContent = `@keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }`;
  document.head.appendChild(s);
};

export default function MyRentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const navigate = useNavigate();

  const fetch = async () => {
    setLoading(true);
    try { 
      const r = await getMyRentals(); 
      setRentals(r.data.filter(rental => rental.status !== 'pending').sort((a,b) => new Date(b.created_at) - new Date(a.created_at))); 
    }
    catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { injectStyles(); fetch(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;
    try {
      const res = await cancelRental(id);
      alert(res.data?.message || "Réservation annulée.");
      fetch();
    }
    catch (e) { alert(e.response?.data?.message || "Impossible d'annuler."); }
  };

  const fmt = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  const days = (s, e) => Math.ceil((new Date(e) - new Date(s)) / 86400000);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: sans, paddingTop: 64 }}>
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "60px 40px", position: "relative" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.05)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}><Key size={32} /></div>
          <div>
            <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>Mes Réservations</h1>
            <p style={{ color: "#94a3b8", fontSize: 16, margin: 0 }}>Suivez et gérez vos locations passées et à venir</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "-32px auto 80px", padding: "0 40px", position: "relative", zIndex: 10 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[1,2,3].map(i => <div key={i} style={{ background: "#fff", borderRadius: 24, height: 160, border: "1px solid #e2e8f0" }} />)}
          </div>
        ) : rentals.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, padding: "80px 40px", textAlign: "center" }}>
            <h3 style={{ fontSize: 24, fontWeight: 800 }}>Aucune réservation</h3>
            <button onClick={() => navigate("/")} style={{ background: "#0f172a", color: "#fff", padding: "16px 32px", borderRadius: 16, marginTop: 24 }}>Parcourir nos véhicules</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {rentals.map((rental, i) => {
              const cfg = STATUS[rental.status] || STATUS.confirmed;
              const d = days(rental.start_date, rental.end_date);
              return (
                <div key={rental.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, padding: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 32, flexWrap: "wrap", animation: 'fadeUp 0.6s both', animationDelay: `${i * 0.08}s` }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20 }}>{cfg.label}</span>
                      <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>#{String(rental.id).padStart(5, "0")}</span>
                    </div>
                    <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>{rental.brand} <span style={{ fontWeight: 500, color: '#64748b' }}>{rental.model}</span></h3>
                    <div style={{ display: "flex", gap: 32, flexWrap: "wrap", background: '#f8fafc', padding: '20px', borderRadius: 16 }}>
                      <div style={{ fontSize: 13 }}><strong>Départ:</strong> {fmt(rental.start_date)}</div>
                      <div style={{ fontSize: 13 }}><strong>Retour:</strong> {fmt(rental.end_date)}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>{rental.total_price} TND</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
                    {rental.status === "awaiting_payment" && (
                      <button onClick={() => navigate(`/payment/${rental.id}`)} style={{ background: "#d97706", color: "#fff", padding: "16px 24px", borderRadius: 16, fontWeight: 800 }}>Payer maintenant</button>
                    )}
                    {rental.status === "confirmed" && (
                      <button onClick={() => handleCancel(rental.id)} style={{ color: "#dc2626", border: "1px solid #fecaca", padding: "12px 24px", borderRadius: 16 }}>Annuler</button>
                    )}
                    {rental.status === "completed" && (
                      <button onClick={() => navigate("/facture")} style={{ background: "#f1f5f9", padding: "16px 24px", borderRadius: 16 }}>Facture</button>
                    )}
                    {(rental.status === "ongoing" || rental.status === "cancelled") && (
                      <button onClick={() => navigate(`/cars/${rental.car_id}`)} style={{ background: "#f1f5f9", padding: "16px 24px", borderRadius: 16 }}>Voir véhicule</button>
                    )}
                    {(rental.status === "confirmed" || rental.status === "ongoing" || rental.status === "completed") && (
                      <button onClick={() => setSelectedRental(rental)} style={{ border: "1px solid #6366f1", color: "#6366f1", padding: "12px 24px", borderRadius: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ClipboardCheck size={16} /> État des lieux
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedRental && <InspectionModal rental={selectedRental} isAdmin={false} onClose={() => setSelectedRental(null)} onRefresh={fetch} />}
    </div>
  );
}