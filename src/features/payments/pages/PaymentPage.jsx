import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPayment } from "../api/payment.service";
import api from "../../../config/api.config";
import toast from "react-hot-toast";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

// Format card number: 1234 5678 9012 3456
const formatCardNumber = (val) =>
  val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

// Format expiry: MM/YY
const formatExpiry = (val) => {
  const clean = val.replace(/\D/g, "").slice(0, 4);
  if (clean.length >= 3) return clean.slice(0, 2) + "/" + clean.slice(2);
  return clean;
};

export default function PaymentPage() {
  const { rentalId } = useParams();
  const navigate = useNavigate();
  const [method, setMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [rental, setRental] = useState(null);
  const [rentalError, setRentalError] = useState(null);
  const [loadingRental, setLoadingRental] = useState(true);

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardFocus, setCardFocus] = useState(null);

  // Check rental status before allowing payment
  useEffect(() => {
    if (!rentalId) return;
    api.get(`/rentals/my`)
      .then(res => {
        const found = res.data.find(r => String(r.id) === String(rentalId));
        if (!found) {
          setRentalError("Réservation introuvable.");
        } else if (found.status === "cancelled") {
          setRentalError(`Cette réservation a été annulée (${found.brand || ""} ${found.model || ""}). Le paiement n'est plus possible.`);
        } else if (found.status === "completed") {
          setRentalError("Cette réservation est déjà terminée.");
        } else {
          setRental(found);
        }
      })
      .catch(() => setRentalError("Impossible de vérifier la réservation."))
      .finally(() => setLoadingRental(false));
  }, [rentalId]);

  const handlePay = async () => {
    if (!rentalId) return toast.error("Réservation invalide.");
    // Card validation
    if (method === "card") {
      if (cardNumber.replace(/\s/g, "").length < 16) return toast.error("Numéro de carte invalide.");
      if (!cardName.trim()) return toast.error("Nom du titulaire requis.");
      if (cardExpiry.length < 5) return toast.error("Date d'expiration invalide.");
      if (cardCvv.length < 3) return toast.error("CVV invalide.");
    }
    setProcessing(true);
    try {
      await createPayment({ rental_id: parseInt(rentalId), method });
      setDone(true);
      setTimeout(() => navigate("/rentals"), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du paiement.");
    }
    setProcessing(false);
  };

  const containerStyle = {
    minHeight: "100vh", background: "#fafafa", fontFamily: sans,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 24px", paddingTop: 100,
  };

  if (loadingRental) return (
    <div style={containerStyle}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #eee", borderTopColor: "#000", animation: "spin 0.6s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#bbb", fontSize: 13 }}>Vérification de la réservation...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (rentalError) return (
    <div style={containerStyle}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{
          background: "#fff", border: "1px solid #fecaca", borderRadius: 16,
          padding: "48px 36px", textAlign: "center",
          boxShadow: "0 4px 24px rgba(239,68,68,0.08)",
          borderTop: "4px solid #ef4444",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", background: "#fef2f2",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", fontSize: 24, color: "#ef4444",
          }}>✕</div>
          <h2 style={{ color: "#0a0a0a", fontSize: 20, fontWeight: 800, margin: "0 0 12px" }}>
            Paiement impossible
          </h2>
          <p style={{ color: "#666", fontSize: 13, margin: "0 0 28px", lineHeight: 1.6 }}>
            {rentalError}
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#0a0a0a", color: "#fff", border: "none",
              padding: "12px 28px", fontSize: 13, fontFamily: sans,
              fontWeight: 700, borderRadius: 9, cursor: "pointer",
            }}
          >
            Voir les véhicules disponibles →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
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
            <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 6px" }}>
              Booking <span style={{ color: "#666", fontWeight: 600 }}>#{String(rentalId).padStart(5, "0")}</span>
            </p>
            {rental && (
              <p style={{ color: "#bbb", fontSize: 12, margin: "0 0 28px" }}>
                {rental.brand} {rental.model} · {rental.total_price} DT
              </p>
            )}

            {/* Method selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#666", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 10 }}>Méthode de paiement</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { value: "card", icon: "💳", label: "Carte bancaire" },
                  { value: "cash", icon: "💵", label: "Espèces" },
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

            {/* CARD FORM */}
            {method === "card" && (
              <div>
                {/* Visual card preview */}
                <div style={{
                  background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)",
                  borderRadius: 14, padding: "20px 24px", marginBottom: 20,
                  color: "#fff", position: "relative", overflow: "hidden", minHeight: 130,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                }}>
                  {/* Decorative circles */}
                  <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
                  <div style={{ position: "absolute", bottom: -30, right: 20, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

                  {/* Chip + network */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                    <div style={{ display: "flex", gap: 0 }}>
                      <div style={{ width: 32, height: 24, background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: 4, opacity: 0.9 }} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1, color: "#94a3b8" }}>VISA</span>
                  </div>

                  {/* Card number */}
                  <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: 3, marginBottom: 14, color: cardNumber ? "#fff" : "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>

                  {/* Name + Expiry */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2, letterSpacing: 1 }}>TITULAIRE</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: cardName ? "#fff" : "rgba(255,255,255,0.3)", letterSpacing: 1 }}>
                        {cardName ? cardName.toUpperCase() : "NOM PRÉNOM"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2, letterSpacing: 1 }}>EXPIRE</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: cardExpiry ? "#fff" : "rgba(255,255,255,0.3)" }}>
                        {cardExpiry || "MM/AA"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Card number */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#888", display: "block", marginBottom: 6 }}>NUMÉRO DE CARTE</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                      onFocus={() => setCardFocus("number")}
                      onBlur={() => setCardFocus(null)}
                      style={{
                        width: "100%", padding: "11px 14px", fontFamily: "monospace",
                        fontSize: 15, letterSpacing: 2, border: `1.5px solid ${cardFocus === "number" ? "#0a0a0a" : "#e8e8e8"}`,
                        borderRadius: 9, background: "#fafafa", color: "#0a0a0a",
                        boxSizing: "border-box", outline: "none", transition: "border 0.15s",
                      }}
                    />
                  </div>

                  {/* Cardholder name */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#888", display: "block", marginBottom: 6 }}>NOM DU TITULAIRE</label>
                    <input
                      type="text"
                      placeholder="Prénom Nom"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      onFocus={() => setCardFocus("name")}
                      onBlur={() => setCardFocus(null)}
                      style={{
                        width: "100%", padding: "11px 14px", fontFamily: sans,
                        fontSize: 14, border: `1.5px solid ${cardFocus === "name" ? "#0a0a0a" : "#e8e8e8"}`,
                        borderRadius: 9, background: "#fafafa", color: "#0a0a0a",
                        boxSizing: "border-box", outline: "none", transition: "border 0.15s",
                      }}
                    />
                  </div>

                  {/* Expiry + CVV row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#888", display: "block", marginBottom: 6 }}>DATE D'EXPIRATION</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                        onFocus={() => setCardFocus("expiry")}
                        onBlur={() => setCardFocus(null)}
                        style={{
                          width: "100%", padding: "11px 14px", fontFamily: "monospace",
                          fontSize: 14, letterSpacing: 1, border: `1.5px solid ${cardFocus === "expiry" ? "#0a0a0a" : "#e8e8e8"}`,
                          borderRadius: 9, background: "#fafafa", color: "#0a0a0a",
                          boxSizing: "border-box", outline: "none", transition: "border 0.15s",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#888", display: "block", marginBottom: 6 }}>CVV</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        onFocus={() => setCardFocus("cvv")}
                        onBlur={() => setCardFocus(null)}
                        style={{
                          width: "100%", padding: "11px 14px", fontFamily: "monospace",
                          fontSize: 14, letterSpacing: 2, border: `1.5px solid ${cardFocus === "cvv" ? "#0a0a0a" : "#e8e8e8"}`,
                          borderRadius: 9, background: "#fafafa", color: "#0a0a0a",
                          boxSizing: "border-box", outline: "none", transition: "border 0.15s",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Security badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, color: "#888", fontSize: 11 }}>
                  <span>🔒</span>
                  <span>Paiement sécurisé · Vos données sont chiffrées</span>
                </div>
              </div>
            )}

            {/* CASH INFO */}
            {method === "cash" && (
              <div style={{
                background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10,
                padding: "14px 16px", marginBottom: 4, color: "#92400e", fontSize: 13, lineHeight: 1.6,
              }}>
                💵 Vous réglerez en espèces lors de la prise en charge du véhicule à l'agence.<br />
                <span style={{ fontSize: 11, color: "#b45309" }}>Présentez-vous avec le montant exact, votre permis et votre pièce d'identité.</span>
              </div>
            )}

            {/* Pay button */}
            <button onClick={handlePay} disabled={processing} style={{
              width: "100%", background: "#0a0a0a", color: "#fff", border: "none",
              padding: "14px", fontSize: 14, fontFamily: sans, fontWeight: 700,
              borderRadius: 9, cursor: processing ? "not-allowed" : "pointer",
              letterSpacing: "-0.01em", opacity: processing ? 0.7 : 1,
              marginTop: 20, transition: "opacity 0.15s",
            }}>
              {processing ? "Traitement en cours..." : method === "card" ? `💳 Payer ${rental?.total_price || ""} DT` : "✓ Confirmer la réservation"}
            </button>
          </div>

        )}
      </div>
    </div>
  );
}
