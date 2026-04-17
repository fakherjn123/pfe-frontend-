import { useEffect, useState } from "react";
import api from "../../../config/api.config";
import toast from "react-hot-toast";
import ConfirmModal from "../../../shared/components/modals/ConfirmModal";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

export default function ManagePaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [refundingId, setRefundingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', danger: false, onConfirm: null });

  const openConfirm = (opts) => setConfirmModal({ open: true, ...opts });
  const closeConfirm = () => setConfirmModal(m => ({ ...m, open: false }));

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const [paymentsRes, refundsRes] = await Promise.all([
        api.get("/payments"),
        api.get("/payments/pending-refunds"),
      ]);
      setPayments(paymentsRes.data);
      setPendingRefunds(refundsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const confirmCash = (id) => {
    openConfirm({
      title: 'Confirmer le paiement en espèces',
      message: 'Confirmez-vous la réception de ce paiement en espèces ?',
      confirmText: 'Oui, confirmer',
      danger: false,
      onConfirm: async () => {
        closeConfirm();
        setProcessingId(id);
        try {
          await api.put(`/payments/confirm-cash/${id}`);
          fetchPayments();
          toast.success('Paiement en cash validé avec succès !');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Erreur lors de la confirmation du paiement');
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const rejectCash = (id) => {
    openConfirm({
      title: 'Refuser ce paiement',
      message: 'Êtes-vous sûr de vouloir refuser ce paiement ? La réservation sera annulée.',
      confirmText: 'Oui, refuser',
      danger: true,
      onConfirm: async () => {
        closeConfirm();
        setProcessingId(id);
        try {
          await api.put(`/payments/reject-cash/${id}`);
          fetchPayments();
          toast.success('Paiement refusé et réservation annulée.');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Erreur lors du refus du paiement');
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const processRefund = (id) => {
    openConfirm({
      title: 'Confirmer le remboursement',
      message: 'Confirmez-vous que le remboursement a bien été effectué ?',
      confirmText: 'Oui, remboursé',
      danger: false,
      onConfirm: async () => {
        closeConfirm();
        setRefundingId(id);
        try {
          await api.put(`/payments/refund/${id}`);
          fetchPayments();
          toast.success('Remboursement marqué comme effectué.');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Erreur lors du remboursement');
        } finally {
          setRefundingId(null);
        }
      },
    });
  };

  // Stats
  const totalReceived = payments.filter(p => p.status === 'paid' && !p.refund_status).reduce((acc, p) => acc + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + Number(p.amount), 0);
  const totalPendingRefunds = pendingRefunds.reduce((acc, p) => acc + Number(p.amount), 0);

  const thStyle = { padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" };
  const tdStyle = { padding: "16px 24px" };

  return (
    <div style={{ padding: "40px", fontFamily: sans, background: "#fdfdfd", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px", color: "#000", letterSpacing: "-0.02em" }}>
            Paiements &amp; Remboursements
          </h1>
          <p style={{ margin: 0, color: "#888", fontSize: 14 }}>
            Gérez les paiements clients et les remboursements en attente.
          </p>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
          <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 16, padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ color: "#aaa", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>REVENU TOTAL (PAYÉ)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#000" }}>{totalReceived.toLocaleString()} <span style={{ fontSize: 14, color: "#888", fontWeight: 500 }}>TND</span></div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 16, padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ color: "#aaa", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>ESPÈCES EN ATTENTE</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#000" }}>{totalPending.toLocaleString()} <span style={{ fontSize: 14, color: "#888", fontWeight: 500 }}>TND</span></div>
          </div>
          <div style={{ background: pendingRefunds.length > 0 ? "#fff7ed" : "#fff", border: `1px solid ${pendingRefunds.length > 0 ? "#fed7aa" : "#ebebeb"}`, borderRadius: 16, padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ color: pendingRefunds.length > 0 ? "#c2410c" : "#aaa", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>REMBOURSEMENTS EN ATTENTE {pendingRefunds.length > 0 && `(${pendingRefunds.length})`}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: pendingRefunds.length > 0 ? "#ea580c" : "#000" }}>{totalPendingRefunds.toLocaleString()} <span style={{ fontSize: 14, color: "#888", fontWeight: 500 }}>TND</span></div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 16, padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ color: "#aaa", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>TOTAL TRANSACTIONS</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#000" }}>{payments.length}</div>
          </div>
        </div>

        {/* Pending Refunds Section */}
        {pendingRefunds.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#000" }}>⚠️ Remboursements à traiter</h2>
              <span style={{ background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid #fecaca" }}>
                {pendingRefunds.length} en attente
              </span>
            </div>
            <div style={{ background: "#fff", border: "2px solid #fed7aa", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(234,88,12,0.06)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#fff7ed", borderBottom: "1px solid #fed7aa" }}>
                      <th style={thStyle}>Réf.</th>
                      <th style={thStyle}>Client</th>
                      <th style={thStyle}>Véhicule</th>
                      <th style={thStyle}>Période</th>
                      <th style={thStyle}>Montant</th>
                      <th style={thStyle}>Méthode</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRefunds.map(p => (
                      <tr key={p.id} style={{ borderBottom: "1px solid #fef3c7" }}>
                        <td style={tdStyle}>
                          <span style={{ fontSize: 12, color: "#666", fontFamily: "monospace" }}>#{String(p.id).padStart(4, '0')}</span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>{p.name || p.email}</div>
                          <div style={{ fontSize: 11, color: "#888" }}>{p.email}</div>
                        </td>
                        <td style={{ ...tdStyle, fontSize: 13, color: "#444" }}>{p.brand} {p.model}</td>
                        <td style={{ ...tdStyle, fontSize: 12, color: "#666" }}>
                          {new Date(p.start_date).toLocaleDateString('fr-FR')} → {new Date(p.end_date).toLocaleDateString('fr-FR')}
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: "#ea580c" }}>{p.amount} <span style={{ fontSize: 11, color: "#aaa", fontWeight: 500 }}>TND</span></span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ background: p.method === "card" ? "#eff6ff" : "#fdf4ff", color: p.method === "card" ? "#3b82f6" : "#d946ef", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                            {p.method === "card" ? "💳 Carte" : "💵 Espèces"}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          <button
                            onClick={() => processRefund(p.id)}
                            disabled={refundingId === p.id}
                            style={{
                              background: "#16a34a", color: "#0f172a", border: "none",
                              padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                              cursor: refundingId === p.id ? "not-allowed" : "pointer",
                              opacity: refundingId === p.id ? 0.7 : 1, transition: "opacity 0.2s",
                            }}
                          >
                            {refundingId === p.id ? "Traitement..." : "✓ Marquer remboursé"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* All Payments Table */}
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#000" }}>Tous les paiements</h2>
        </div>
        <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.02)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #ebebeb" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Voiture</th>
                  <th style={thStyle}>Montant</th>
                  <th style={thStyle}>Méthode</th>
                  <th style={thStyle}>Statut</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: 14 }}>Chargement...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: 14 }}>Aucun paiement.</td></tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5" }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...tdStyle, fontSize: 13, color: "#666", fontFamily: "monospace" }}>#{String(p.id).padStart(4, '0')}</td>
                      <td style={tdStyle}><div style={{ fontSize: 14, fontWeight: 600, color: "#000" }}>{p.email}</div></td>
                      <td style={{ ...tdStyle, fontSize: 13, color: "#444" }}>{p.brand} {p.model}</td>
                      <td style={{ ...tdStyle, fontSize: 14, fontWeight: 700, color: "#000" }}>{p.amount} <span style={{ fontSize: 11, color: "#aaa", fontWeight: 500 }}>TND</span></td>
                      <td style={tdStyle}>
                        <span style={{ background: p.method === "card" ? "#eff6ff" : "#fdf4ff", color: p.method === "card" ? "#3b82f6" : "#d946ef", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                          {p.method === "card" ? "💳 Carte" : "💵 Espèces"}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {p.refund_status === 'pending' ? (
                          <span style={{ background: "#fff7ed", color: "#c2410c", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: "1px solid #fed7aa" }}>🔴 Remboursement en attente</span>
                        ) : p.refund_status === 'refunded' ? (
                          <span style={{ background: "#f0fdf4", color: "#15803d", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>↩ Remboursé</span>
                        ) : p.status === 'paid' ? (
                          <span style={{ background: "#f0fdf4", color: "#16a34a", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>✓ Payé</span>
                        ) : (
                          <span style={{ background: "#fffbeb", color: "#d97706", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>⏳ En attente</span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {p.status === "pending" && p.method === "cash" && !p.refund_status && (
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => confirmCash(p.id)}
                              disabled={processingId === p.id}
                              style={{
                                background: "#16a34a", color: "#fff", border: "none",
                                padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                cursor: processingId === p.id ? "not-allowed" : "pointer",
                                opacity: processingId === p.id ? 0.7 : 1,
                                display: "flex", alignItems: "center", gap: 6,
                                boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
                              }}
                            >
                              ✓ {processingId === p.id ? "Traitement..." : "Accepter le Cash"}
                            </button>
                            <button
                              onClick={() => rejectCash(p.id)}
                              disabled={processingId === p.id}
                              style={{
                                background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
                                padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                cursor: processingId === p.id ? "not-allowed" : "pointer",
                                opacity: processingId === p.id ? 0.7 : 1,
                              }}
                            >
                              ✕ Refuser
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        danger={confirmModal.danger}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}