import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sparkles, Tag, Car, DollarSign, BarChart3, Key, MessageSquare, Calendar, Ban } from "lucide-react";
import api from "../../../config/api.config";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

/* ─── Inject animations ───────────────────────────────────── */
const injectDetailStyles = () => {
  if (document.getElementById('car-detail-styles')) return;
  const s = document.createElement('style');
  s.id = 'car-detail-styles';
  s.textContent = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .detail-section { animation: fadeUp .5s ease both; }
    .detail-section:nth-child(2) { animation-delay: .1s; }
    .detail-section:nth-child(3) { animation-delay: .2s; }
    .detail-hero { animation: fadeIn .4s ease; }
    .review-item { animation: fadeUp .3s ease both; }
    .book-panel { animation: scaleIn .4s ease both; animation-delay: .15s; }
    .spec-item { transition: background .2s, transform .15s; border-radius: 10px; padding: 14px 16px; }
    .spec-item:hover { background: #f8f8f8; transform: translateX(4px); }
    .star-btn { transition: all .15s; cursor: pointer; }
    .star-btn:hover { transform: scale(1.15); }
  `;
  document.head.appendChild(s);
};

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
  const [hoverRating, setHoverRating] = useState(0);
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    injectDetailStyles();
    const carId = id?.toString().split(":")[0];
    api.get(`/cars/${carId}`)
      .then(r => setCar(r.data))
      .catch(console.error);
    api.get(`/reviews/${carId}`)
      .then(r => setReviews(r.data))
      .catch(console.error);
    api.get(`/rentals/dates/${carId}`)
      .then(r => setBookedDates(r.data))
      .catch(console.error);
  }, [id]);

  const days = startDate && endDate
    ? Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000))
    : 0;
  const estimated = car ? (days * car.price_per_day).toFixed(2) : 0;

  const rentCar = async () => {
    if (!startDate || !endDate) return setMessage({ type: "error", text: "Veuillez sélectionner les dates." });
    if (new Date(endDate) <= new Date(startDate)) return setMessage({ type: "error", text: "La date de retour doit être après la date de prise en charge." });
    setSubmitting(true);
    try {
      const res = await api.post("/rentals", { car_id: Number(id), start_date: startDate, end_date: endDate });
      setMessage({ type: "success", text: `Redirection vers le paiement...` });
      setTimeout(() => navigate(`/payment/${res.data.rental.id}`), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (data?.conflicts?.length > 0) {
        const cText = data.conflicts.map(c => `Du ${new Date(c.start).toLocaleDateString("fr-FR")} au ${new Date(c.end).toLocaleDateString("fr-FR")}`).join(", ");
        setMessage({ type: "error", text: `Le véhicule est déjà loué aux dates suivantes : ${cText}` });
      } else {
        setMessage({ type: "error", text: data?.message || "La réservation a échoué." });
      }
    }
    setSubmitting(false);
  };

  const addReview = async () => {
    try {
      await api.post("/reviews", { car_id: id, rating: Number(rating), comment });
      setComment("");
      setRating(7);
      const r = await api.get(`/reviews/${id}`);
      setReviews(r.data);
    } catch (err) {
      alert(err.response?.data?.message || "Review failed");
    }
  };

  if (!car) return (
    <div style={{ minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, paddingTop: 64 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid #eee', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: '#bbb', fontSize: 14 }}>Loading vehicle...</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const labelStyle = { color: "#aaa", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: 6, textTransform: 'uppercase' };
  const inputStyle = {
    width: "100%", background: "#fafafa", border: "1px solid #e8e8e8",
    color: "#0a0a0a", padding: "12px 16px", fontSize: 13,
    fontFamily: sans, borderRadius: 10, outline: "none", boxSizing: "border-box",
    transition: 'border-color .2s, box-shadow .2s',
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: sans, paddingTop: 64 }}>

      {/* ── Hero Header ───────────────────────────────── */}
      <div className="detail-hero" style={{
        background: "#fff", borderBottom: "1px solid #ebebeb",
        padding: "0",
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: 1200, margin: '0 auto' }}>
          {/* Image */}
          <div style={{
            height: 360, background: '#f5f5f5', overflow: 'hidden',
            position: 'relative',
          }}>
            <img
              src={car.image ? `http://localhost:3000${car.image}` : '/placeholder-car.jpg'}
              alt={`${car.brand} ${car.model}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to right, transparent 60%, rgba(255,255,255,0.9) 100%)',
            }} />
          </div>

          {/* Info */}
          <div style={{ padding: '48px 48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <button onClick={() => navigate(-1)} style={{
              background: "none", border: "none", color: "#aaa", fontSize: 12,
              cursor: "pointer", fontFamily: sans, padding: 0, marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 16 }}>←</span> Back to fleet
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: car.available ? "#22c55e" : "#f87171",
              }} />
              <span style={{ color: car.available ? "#22c55e" : "#f87171", fontSize: 12, fontWeight: 600 }}>
                {car.available ? "Available" : "Not available"}
              </span>
              {avgRating && (
                <span style={{ color: '#aaa', fontSize: 12, marginLeft: 8 }}>
                  ★ {avgRating}/10 · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <h1 style={{
              color: "#0a0a0a", fontWeight: 900, fontSize: 42,
              margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1,
            }}>
              {car.brand}
            </h1>
            <p style={{ color: '#bbb', fontSize: 22, fontWeight: 400, margin: '4px 0 0', letterSpacing: '-0.01em' }}>
              {car.model}
            </p>

            <div style={{ marginTop: 28, display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ color: "#0a0a0a", fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em" }}>
                {car.price_per_day}
              </span>
              <span style={{ color: "#bbb", fontSize: 14, fontWeight: 400 }}>TND / day</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Grid ──────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 40px 80px", display: "grid", gridTemplateColumns: "1fr 370px", gap: 24 }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* AI Description */}
          {car.description && (
            <div className="detail-section" style={{
              background: "#fff", border: "1px solid #ebebeb", borderRadius: 14, padding: "28px",
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, #c8a96e, #d4a843, #c8a96e)',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h2 style={{ color: "#0a0a0a", fontSize: 15, fontWeight: 700, margin: 0 }}>Description</h2>
                <span style={{
                  fontSize: 9, fontWeight: 700, background: 'rgba(200,169,110,0.12)',
                  color: '#c8a96e', padding: '2px 8px', borderRadius: 4,
                  letterSpacing: '0.06em',
                }}>AI GENERATED</span>
              </div>
              <p style={{ color: "#555", fontSize: 14, margin: 0, lineHeight: 1.75 }}>
                {car.description}
              </p>
            </div>
          )}

          {/* Specs */}
          <div className="detail-section" style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 14, padding: "28px" }}>
            <h2 style={{ color: "#0a0a0a", fontSize: 15, fontWeight: 700, margin: "0 0 20px" }}>Vehicle details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {[
                { label: "Brand", value: car.brand, icon: <Tag className="w-4 h-4" /> },
                { label: "Model", value: car.model, icon: <Car className="w-4 h-4" /> },
                { label: "Daily rate", value: `${car.price_per_day} TND`, icon: <DollarSign className="w-4 h-4" /> },
                { label: "Status", value: car.available ? "Available" : "Not available", icon: <BarChart3 className="w-4 h-4" /> },
                { label: "Vehicle ID", value: `#${String(car.id).padStart(3, "0")}`, icon: <Key className="w-4 h-4" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="spec-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', color: '#666' }}>{icon}</span>
                    <div>
                      <div style={{ color: "#bbb", fontSize: 11, fontWeight: 500, marginBottom: 3 }}>{label}</div>
                      <div style={{ color: "#0a0a0a", fontSize: 14, fontWeight: 600 }}>{value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="detail-section" style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 14, padding: "28px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: "#0a0a0a", fontSize: 15, fontWeight: 700, margin: 0 }}>
                Reviews {reviews.length > 0 && <span style={{ color: "#bbb", fontWeight: 400 }}>({reviews.length})</span>}
              </h2>
              {avgRating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fafafa', padding: '4px 12px', borderRadius: 20, border: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#f59e0b', fontSize: 14 }}>★</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>{avgRating}</span>
                  <span style={{ color: '#bbb', fontSize: 11 }}>/10</span>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#ccc' }}>
                <div style={{ marginBottom: 8 }}><MessageSquare className="w-8 h-8 mx-auto text-slate-300" /></div>
                <p style={{ fontSize: 13, margin: 0 }}>No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {reviews.map((r, i) => (
                  <div key={r.id} className="review-item" style={{
                    display: "flex", gap: 14, padding: 16,
                    background: "#fafafa", borderRadius: 12, border: '1px solid #f5f5f5',
                    animationDelay: `${i * 0.05}s`,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: `hsl(${(r.name?.charCodeAt(0) || 0) * 37 % 360}, 45%, 50%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0,
                    }}>{r.name?.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ color: "#0a0a0a", fontSize: 13, fontWeight: 700 }}>{r.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <span style={{ color: '#f59e0b', fontSize: 12 }}>★</span>
                          <span style={{ color: "#666", fontSize: 12, fontWeight: 600 }}>{r.rating}/10</span>
                        </div>
                      </div>
                      <p style={{ color: "#666", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add review */}
            <div style={{ paddingTop: 20, borderTop: "1px solid #f0f0f0" }}>
              <h3 style={{ color: "#0a0a0a", fontSize: 13, fontWeight: 700, margin: "0 0 16px" }}>Leave a review</h3>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Rating: {rating}/10</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button key={n} className="star-btn" onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: 'none', border: 'none', padding: 2,
                        color: n <= (hoverRating || rating) ? '#f59e0b' : '#e0e0e0',
                        fontSize: 18, transition: 'color .15s',
                      }}
                    >★</button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Share your experience..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", marginBottom: 12 }}
                onFocus={e => { e.target.style.borderColor = '#0a0a0a'; e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.04)'; }}
                onBlur={e => { e.target.style.borderColor = '#e8e8e8'; e.target.style.boxShadow = 'none'; }}
              />
              <button onClick={addReview} style={{
                background: "#0a0a0a", color: "#fff", border: "none",
                padding: "10px 24px", fontSize: 13, fontFamily: sans,
                fontWeight: 700, borderRadius: 10, cursor: "pointer",
                transition: 'opacity .2s, transform .15s',
              }}
                onMouseEnter={e => { e.target.style.opacity = '0.85'; e.target.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'none'; }}
              >Submit review →</button>
            </div>
          </div>
        </div>

        {/* Right — Booking */}
        <div>
          <div className="book-panel" style={{
            background: "#fff", border: "1px solid #ebebeb", borderRadius: 14,
            padding: "28px", position: "sticky", top: 84,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}>
            <h2 style={{ color: "#0a0a0a", fontSize: 16, fontWeight: 800, margin: "0 0 6px" }}>Book this car</h2>
            <p style={{ color: '#bbb', fontSize: 12, margin: '0 0 20px' }}>Select your dates to reserve</p>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Pick-up date</label>
              <input type="date" value={startDate}
                onChange={e => setStartDate(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0a0a0a'}
                onBlur={e => e.target.style.borderColor = '#e8e8e8'}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Return date</label>
              <input type="date" value={endDate}
                onChange={e => setEndDate(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0a0a0a'}
                onBlur={e => e.target.style.borderColor = '#e8e8e8'}
              />
            </div>

            {days > 0 && (
              <div style={{
                background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 10,
                padding: "16px 18px", marginBottom: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#aaa", fontSize: 12 }}>{days} day{days > 1 ? "s" : ""} × {car.price_per_day} TND</span>
                </div>
                <div style={{ height: 1, background: '#f0f0f0', margin: '0 0 8px' }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#666", fontSize: 13, fontWeight: 600 }}>Estimated total</span>
                  <span style={{ color: "#0a0a0a", fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>
                    {estimated} <span style={{ fontSize: 12, fontWeight: 500, color: '#999' }}>TND</span>
                  </span>
                </div>
              </div>
            )}

            {message && (
              <div style={{
                padding: "10px 14px", marginBottom: 12, borderRadius: 10,
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
                border: "none", padding: "14px", fontSize: 14,
                fontFamily: sans, fontWeight: 800, borderRadius: 12,
                cursor: car.available ? "pointer" : "not-allowed",
                letterSpacing: "-0.01em",
                transition: 'opacity .2s, transform .15s',
                boxShadow: car.available ? '0 4px 16px rgba(0,0,0,0.12)' : 'none',
              }}
              onMouseEnter={e => { if (car.available) { e.target.style.opacity = '0.9'; e.target.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'none'; }}
            >{submitting ? "Processing..." : car.available ? "Book now →" : "Not available"}</button>

            {/* Unavailable Dates List */}
            {bookedDates.length > 0 && (
              <div style={{ marginTop: 28, borderTop: "1px solid #f0f0f0", paddingTop: 20 }}>
                <h3 style={{ color: "#0a0a0a", fontSize: 13, fontWeight: 700, margin: "0 0 12px", display: 'flex', alignItems: 'center', gap: 6 }}>
                  Dates déjà réservées <Calendar className="w-4 h-4 text-slate-500" />
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {bookedDates.map((d, i) => (
                    <div key={i} style={{
                      fontSize: 12, color: "#e11d48", background: "#fff1f2",
                      padding: "6px 10px", borderRadius: 6, fontWeight: 600,
                      display: "flex", alignItems: "center", gap: 6
                    }}>
                      <Ban className="w-4 h-4" />
                      {new Date(d.start).toLocaleDateString("fr-FR")} — {new Date(d.end).toLocaleDateString("fr-FR")}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}