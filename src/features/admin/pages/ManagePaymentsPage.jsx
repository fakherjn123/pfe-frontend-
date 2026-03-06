import { useEffect, useState } from "react";
import api from "../../../config/api.config";
import { Link } from "react-router-dom";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

export default function ManagePaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/payments");
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const confirmCash = async (id) => {
    if (!window.confirm("Confirm receiving this cash payment? This will generate the invoice and send a confirmation email to the client.")) return;
    setProcessingId(id);
    try {
      await api.put(`/payments/confirm-cash/${id}`);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || "Error confirming payment");
    } finally {
      setProcessingId(null);
    }
  };

  // Stats
  const totalReceived = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <div style={{ padding: "40px", fontFamily: sans, background: "#fdfdfd", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: "#000", letterSpacing: "-0.02em" }}>
              Payments & Invoices
            </h1>
            <p style={{ margin: 0, color: "#888", fontSize: 14 }}>
              Manage client payments and confirm cash transactions.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
          <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 16, padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ color: "#aaa", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>TOTAL REVENUE (PAID)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#000" }}>{totalReceived.toLocaleString()} <span style={{ fontSize: 14, color: "#888", fontWeight: 500 }}>TND</span></div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 16, padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ color: "#aaa", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>PENDING CASH</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#000" }}>{totalPending.toLocaleString()} <span style={{ fontSize: 14, color: "#888", fontWeight: 500 }}>TND</span></div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 16, padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ color: "#aaa", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>TOTAL TRANSACTIONS</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#000" }}>{payments.length}</div>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.02)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #ebebeb" }}>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Client</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Car</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amount</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Method</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: 14 }}>Loading payments...</td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: 14 }}>No payments found.</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: "16px 24px", fontSize: 13, color: "#666", fontWeight: 500 }}>#{String(p.id).padStart(4, '0')}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#000" }}>{p.email}</div>
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: 13, color: "#444" }}>{p.brand} {p.model}</td>
                      <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 700, color: "#000" }}>{p.amount} <span style={{ fontSize: 11, color: "#aaa", fontWeight: 500 }}>TND</span></td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{
                          background: p.method === "card" ? "#eff6ff" : "#fdf4ff",
                          color: p.method === "card" ? "#3b82f6" : "#d946ef",
                          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                          display: "inline-flex", alignItems: "center", gap: 4
                        }}>
                          {p.method === "card" ? "💳 Card" : "💵 Cash"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{
                          background: p.status === "paid" ? "#f0fdf4" : "#fffbeb",
                          color: p.status === "paid" ? "#16a34a" : "#d97706",
                          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600
                        }}>
                          {p.status === "paid" ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        {p.status === "pending" && p.method === "cash" && (
                          <button
                            onClick={() => confirmCash(p.id)}
                            disabled={processingId === p.id}
                            style={{
                              background: "#000", color: "#fff", border: "none",
                              padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                              cursor: processingId === p.id ? "not-allowed" : "pointer",
                              transition: "opacity 0.2s",
                              opacity: processingId === p.id ? 0.7 : 1
                            }}
                          >
                            {processingId === p.id ? "Processing..." : "Confirm Cash"}
                          </button>
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
    </div>
  );
}