import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRentals, cancelRental } from "../api/rental.service";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

const STATUS = {
  confirmed:        { color: "#0ea5e9", bg: "#f0f9ff", label: "Confirmed" },
  ongoing:          { color: "#22c55e", bg: "#f0fdf4", label: "Ongoing" },
  completed:        { color: "#aaa",    bg: "#fafafa", label: "Completed" },
  cancelled:        { color: "#f87171", bg: "#fff5f5", label: "Cancelled" },
  awaiting_payment: { color: "#f59e0b", bg: "#fffbeb", label: "Payment required" },
};

export default function MyRentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetch = async () => {
    setLoading(true);
    try { const r = await getMyRentals(); setRentals(r.data); }
    catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    try { await cancelRental(id); fetch(); }
    catch (e) { alert(e.response?.data?.message || "Cannot cancel."); }
  };

  const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const days = (s, e) => Math.ceil((new Date(e) - new Date(s)) / 86400000);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: sans, paddingTop: 64 }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #ebebeb", padding: "36px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ color: "#0a0a0a", fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            My Rentals
          </h1>
          <p style={{ color: "#bbb", fontSize: 13, margin: "6px 0 0" }}>
            {rentals.length} booking{rentals.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 40px 80px" }}>
        {loading ? (
          <div style={{ color: "#ccc", padding: "60px 0", textAlign: "center", fontSize: 13 }}>Loading...</div>
        ) : rentals.length === 0 ? (
          <div style={{
            background: "#fff", border: "1px solid #ebebeb", borderRadius: 12,
            padding: "60px", textAlign: "center",
          }}>
            <p style={{ color: "#ccc", fontSize: 14, margin: "0 0 16px" }}>No bookings yet.</p>
            <a href="/" style={{ color: "#0a0a0a", fontSize: 13, fontWeight: 600 }}>Browse fleet →</a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rentals.map(rental => {
              const cfg = STATUS[rental.status] || STATUS.confirmed;
              const d = days(rental.start_date, rental.end_date);
              return (
                <div key={rental.id} style={{
                  background: "#fff", border: "1px solid #ebebeb", borderRadius: 12,
                  padding: "24px", display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", gap: 20, flexWrap: "wrap",
                }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{
                        background: cfg.bg, color: cfg.color,
                        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                      }}>{cfg.label}</span>
                      <span style={{ color: "#ddd", fontSize: 12 }}>#{String(rental.id).padStart(4, "0")}</span>
                    </div>
                    <h3 style={{ color: "#0a0a0a", fontSize: 18, fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
                      {rental.brand} {rental.model}
                    </h3>
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      {[
                        { label: "From", value: fmt(rental.start_date) },
                        { label: "To", value: fmt(rental.end_date) },
                        { label: "Duration", value: `${d} day${d !== 1 ? "s" : ""}` },
                        { label: "Total", value: `${rental.total_price} TND` },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ color: "#bbb", fontSize: 11, fontWeight: 500, marginBottom: 2 }}>{label}</div>
                          <div style={{ color: "#0a0a0a", fontSize: 13, fontWeight: 600 }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {rental.status === "awaiting_payment" && (
                      <button onClick={() => navigate(`/payment/${rental.id}`)} style={{
                        background: "#0a0a0a", color: "#fff", border: "none",
                        padding: "9px 18px", fontSize: 13, fontFamily: sans,
                        fontWeight: 600, borderRadius: 8, cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}>Pay now →</button>
                    )}
                    {rental.status === "confirmed" && (
                      <button onClick={() => handleCancel(rental.id)} style={{
                        background: "#fff", color: "#f87171",
                        border: "1px solid #fecaca", padding: "8px 16px",
                        fontSize: 12, fontFamily: sans, fontWeight: 500,
                        borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap",
                      }}>Cancel</button>
                    )}
                    {rental.status === "completed" && (
                      <a href="/facture" style={{
                        color: "#666", fontSize: 12, fontWeight: 500,
                        textDecoration: "none",
                      }}>View invoice →</a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}