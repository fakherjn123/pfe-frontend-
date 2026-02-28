import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../config/api.config";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(7);
  const [comment, setComment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
  const carId = id?.toString().split(":")[0];

  api.get(`/cars/${carId}`)
    .then(r => setCar(r.data))
    .catch(console.error);

  api.get(`/reviews/${carId}`)   // 🔥 FIXED
    .then(r => setReviews(r.data))
    .catch(console.error);

}, [id]);

  const days = startDate && endDate
    ? Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000))
    : 0;
  const estimated = car ? (days * car.price_per_day).toFixed(2) : 0;

  const rentCar = async () => {
    if (!startDate || !endDate) return setMessage({ type: "error", text: "Please select dates." });
    if (new Date(endDate) <= new Date(startDate)) return setMessage({ type: "error", text: "End date must be after start date." });
    setSubmitting(true);
    try {
      const res = await api.post("/rentals", { car_id: Number(id), start_date: startDate, end_date: endDate });
      setMessage({ type: "success", text: `Booking confirmed — ${res.data.final_total} TND` });
      setTimeout(() => navigate("/rentals"), 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Booking failed." });
    }
    setSubmitting(false);
  };

  const addReview = async () => {
  try {
    await api.post("/reviews", {
      car_id: id,
      rating: Number(rating),
      comment
    });

    setComment("");
    setRating(7);

    const r = await api.get(`/reviews/${id}`);  // 🔥 FIXED
    setReviews(r.data);

  } catch (err) {
    alert(err.response?.data?.message || "Review failed");
  }
};

  if (!car) return (
    <div style={{ minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, color: "#ccc", paddingTop: 64 }}>
      Loading...
    </div>
  );

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const labelStyle = { color: "#aaa", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", display: "block", marginBottom: 6 };
  const inputStyle = {
    width: "100%", background: "#fafafa", border: "1px solid #e8e8e8",
    color: "#0a0a0a", padding: "10px 14px", fontSize: 13,
    fontFamily: sans, borderRadius: 8, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: sans, paddingTop: 64 }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ebebeb", padding: "40px 40px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <button onClick={() => navigate(-1)} style={{
            background: "none", border: "none", color: "#aaa", fontSize: 13,
            cursor: "pointer", fontFamily: sans, padding: 0, marginBottom: 20,
          }}>← Back to fleet</button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: car.available ? "#22c55e" : "#f87171",
                }} />
                <span style={{ color: car.available ? "#22c55e" : "#f87171", fontSize: 12, fontWeight: 500 }}>
                  {car.available ? "Available" : "Not available"}
                </span>
              </div>
              <h1 style={{
                color: "#0a0a0a", fontWeight: 800, fontSize: "clamp(24px, 4vw, 44px)",
                margin: 0, letterSpacing: "-0.03em",
              }}>{car.brand} <span style={{ color: "#ccc", fontWeight: 400 }}>{car.model}</span></h1>
              {avgRating && (
                <p style={{ color: "#aaa", fontSize: 13, margin: "8px 0 0" }}>
                  ★ {avgRating}/10 · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#bbb", fontSize: 12, marginBottom: 4 }}>Daily rate</div>
              <div style={{ color: "#0a0a0a", fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em" }}>
                {car.price_per_day}
                <span style={{ color: "#ccc", fontSize: 14, fontWeight: 400, marginLeft: 6 }}>TND</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Specs */}
          <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, padding: "28px" }}>
            <h2 style={{ color: "#0a0a0a", fontSize: 15, fontWeight: 700, margin: "0 0 20px" }}>Vehicle details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[
                { label: "Brand", value: car.brand },
                { label: "Model", value: car.model },
                { label: "Daily rate", value: `${car.price_per_day} TND` },
                { label: "Status", value: car.available ? "Available" : "Not available" },
                { label: "Vehicle ID", value: `#${String(car.id).padStart(3, "0")}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ color: "#bbb", fontSize: 11, fontWeight: 500, marginBottom: 4 }}>{label}</div>
                  <div style={{ color: "#0a0a0a", fontSize: 14, fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, padding: "28px" }}>
            <h2 style={{ color: "#0a0a0a", fontSize: 15, fontWeight: 700, margin: "0 0 20px" }}>
              Reviews {reviews.length > 0 && <span style={{ color: "#bbb", fontWeight: 400 }}>({reviews.length})</span>}
            </h2>

            {reviews.length === 0 ? (
              <p style={{ color: "#ccc", fontSize: 13 }}>No reviews yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ display: "flex", gap: 14, paddingBottom: 16, borderBottom: "1px solid #f5f5f5" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", background: "#f5f5f5",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#0a0a0a", fontWeight: 700, fontSize: 13, flexShrink: 0,
                    }}>{r.name?.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ color: "#0a0a0a", fontSize: 13, fontWeight: 600 }}>{r.name}</span>
                        <span style={{ color: "#aaa", fontSize: 12 }}>★ {r.rating}/10</span>
                      </div>
                      <p style={{ color: "#666", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add review */}
            <div style={{ paddingTop: 20, borderTop: "1px solid #f0f0f0" }}>
              <h3 style={{ color: "#0a0a0a", fontSize: 13, fontWeight: 600, margin: "0 0 16px" }}>Leave a review</h3>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Rating: {rating}/10</label>
                <input type="range" min="1" max="10" value={rating}
                  onChange={e => setRating(e.target.value)}
                  style={{ width: "100%", accentColor: "#0a0a0a" }} />
              </div>
              <textarea
                placeholder="Share your experience..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", marginBottom: 10 }}
              />
              <button onClick={addReview} style={{
                background: "#0a0a0a", color: "#fff", border: "none",
                padding: "9px 20px", fontSize: 13, fontFamily: sans,
                fontWeight: 600, borderRadius: 8, cursor: "pointer",
              }}>Submit review</button>
            </div>
          </div>
        </div>

        {/* Right — Booking */}
        <div>
          <div style={{
            background: "#fff", border: "1px solid #ebebeb", borderRadius: 12,
            padding: "24px", position: "sticky", top: 84,
          }}>
            <h2 style={{ color: "#0a0a0a", fontSize: 15, fontWeight: 700, margin: "0 0 20px" }}>Book this car</h2>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Pick-up date</label>
              <input type="date" value={startDate}
                onChange={e => setStartDate(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Return date</label>
              <input type="date" value={endDate}
                onChange={e => setEndDate(e.target.value)} style={inputStyle} />
            </div>

            {days > 0 && (
              <div style={{
                background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 8,
                padding: "14px 16px", marginBottom: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#aaa", fontSize: 12 }}>{days} day{days > 1 ? "s" : ""} × {car.price_per_day} TND</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#666", fontSize: 12, fontWeight: 500 }}>Estimated total</span>
                  <span style={{ color: "#0a0a0a", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
                    {estimated} TND
                  </span>
                </div>
              </div>
            )}

            {message && (
              <div style={{
                padding: "10px 14px", marginBottom: 12, borderRadius: 8,
                background: message.type === "success" ? "#f0fdf4" : "#fff5f5",
                border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                color: message.type === "success" ? "#16a34a" : "#dc2626",
                fontSize: 13,
              }}>{message.text}</div>
            )}

            <button
              onClick={rentCar}
              disabled={submitting || !car.available}
              style={{
                width: "100%", background: car.available ? "#0a0a0a" : "#f0f0f0",
                color: car.available ? "#fff" : "#bbb",
                border: "none", padding: "13px", fontSize: 14,
                fontFamily: sans, fontWeight: 700, borderRadius: 9,
                cursor: car.available ? "pointer" : "not-allowed",
                letterSpacing: "-0.01em",
              }}
            >{submitting ? "Processing..." : car.available ? "Book now" : "Not available"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}