import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPayment } from "../api/payment.service";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

export default function PaymentPage() {
  const { rentalId } = useParams();
  const navigate = useNavigate();
  const [method, setMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handlePay = async () => {
    if (!rentalId) return alert("Invalid rental.");
    setProcessing(true);
    try {
      await createPayment({ rental_id: parseInt(rentalId), method });
      setDone(true);
      setTimeout(() => navigate("/rentals"), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed.");
    }
    setProcessing(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#fafafa", fontFamily: sans,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px", paddingTop: 100,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {done ? (
          <div style={{
            background: "#fff", border: "1px solid #bbf7d0", borderRadius: 16,
            padding: "52px", textAlign: "center",
            boxShadow: "0 4px 24px rgba(34,197,94,0.08)",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: 24, color: "#22c55e",
            }}>✓</div>
            <h2 style={{ color: "#0a0a0a", fontSize: 20, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
              Payment confirmed
            </h2>
            <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Redirecting to your rentals...</p>
          </div>
        ) : (
          <div style={{
            background: "#fff", border: "1px solid #ebebeb", borderRadius: 16,
            padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
          }}>
            <h1 style={{ color: "#0a0a0a", fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Complete payment
            </h1>
            <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 28px" }}>
              Booking <span style={{ color: "#666", fontWeight: 600 }}>#{String(rentalId).padStart(5, "0")}</span>
            </p>

            {/* Method */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: "#666", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 10 }}>Payment method</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { value: "card", icon: "💳", label: "Card" },
                  { value: "cash", icon: "💵", label: "Cash" },
                ].map(m => (
                  <button key={m.value} onClick={() => setMethod(m.value)} style={{
                    padding: "14px", background: method === m.value ? "#0a0a0a" : "#fafafa",
                    color: method === m.value ? "#fff" : "#666",
                    border: `1px solid ${method === m.value ? "#0a0a0a" : "#e8e8e8"}`,
                    borderRadius: 9, fontSize: 13, fontFamily: sans,
                    fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <span>{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>
            </div>

            {method === "cash" && (
              <div style={{
                background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8,
                padding: "12px 14px", marginBottom: 20, color: "#92400e", fontSize: 12,
              }}>
                Pay in person at pickup. Your booking will be reserved.
              </div>
            )}

            <button onClick={handlePay} disabled={processing} style={{
              width: "100%", background: "#0a0a0a", color: "#fff", border: "none",
              padding: "13px", fontSize: 14, fontFamily: sans, fontWeight: 700,
              borderRadius: 9, cursor: "pointer", letterSpacing: "-0.01em",
              opacity: processing ? 0.7 : 1,
            }}>
              {processing ? "Processing..." : method === "card" ? "Pay now" : "Confirm booking"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}