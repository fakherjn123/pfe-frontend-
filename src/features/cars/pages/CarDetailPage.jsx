import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sparkles, Tag, Car, DollarSign, BarChart3, Key, MessageSquare, Calendar, Ban, MapPin, Truck, AlertTriangle, Fuel, Settings, Clock } from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import api from "../../../config/api.config.js";
import toast from "react-hot-toast";

const font = "'Poppins', 'Inter', sans-serif";

const T = {
  bg: "#03060f", white: "rgba(255,255,255,0.03)", black: "rgba(255,255,255,0.05)",
  accent: "#2563EB", accentLight: "#3B82F6", accentBg: "rgba(37,99,235,0.1)",
  accentBorder: "rgba(37,99,235,0.3)", border: "rgba(255,255,255,0.08)",
  muted: "#64748b", mutedLight: "#475569",
  danger: "#f87171", dangerBg: "rgba(248,113,113,0.1)",
  success: "#10b981", successBg: "rgba(16,185,129,0.1)",
  warning: "#fbbf24", warningBg: "rgba(251,191,36,0.1)",
  text: "#f1f5f9", textSub: "#94a3b8",
};

/* ─── Inject animations ───────────────────────────────────── */
const injectDetailStyles = () => {
  if (document.getElementById('car-detail-styles')) return;
  const s = document.createElement('style');
  s.id = 'car-detail-styles';
  s.textContent = `
    @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes scaleIn { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .detail-section { animation: slideUp .6s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .detail-section:nth-child(2) { animation-delay: .08s; }
    .detail-section:nth-child(3) { animation-delay: .16s; }
    .detail-hero { animation: fadeIn .5s ease; }
    .review-item { animation: slideUp .4s cubic-bezier(0.16, 1, 0.3, 1) both; transition: transform 0.2s; }
    .review-item:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(0,0,0,0.03); border-color: #eee; }
    .book-panel { animation: scaleIn .5s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: .1s; }
    .spec-item { transition: all .2s; border-radius: 12px; padding: 16px; border: 1px solid transparent; background: rgba(255,255,255,0.02); }
    .spec-item:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); box-shadow: 0 8px 20px rgba(0,0,0,0.2); transform: translateY(-2px); }
    .star-btn { transition: all .2s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; }
    .star-btn:hover { transform: scale(1.2) translateY(-2px); }
    .glass-badge { background: rgba(255,255,255,0.05); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.08); }
    ::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; cursor: pointer; transition: 0.2s; }
    ::-webkit-calendar-picker-indicator:hover { opacity: 1; }
    ::-webkit-calendar-picker-indicator { color: white; }
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
  const [userPoints, setUserPoints] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [adminHistory, setAdminHistory] = useState([]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyBOOflQXcbdbG22UscFvYLhwmx5TfM2sTc",
    libraries: ['places']
  });

  // Delivery states
  const [deliveryRequested, setDeliveryRequested] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [deliveryLat, setDeliveryLat] = useState(null);
  const [deliveryLng, setDeliveryLng] = useState(null);
  const [deliveryProcessing, setDeliveryProcessing] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [returnFee, setReturnFee] = useState(0);
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [deliveryError, setDeliveryError] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 35.8353, lng: 10.5944 }); // Sousse Sahloul
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoValid, setPromoValid] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      api.get("/users/me").then(r => {
        setUserPoints(r.data.points);
        setUserRole(r.data.role);
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (userRole === 'admin' && id) {
      const carId = id?.toString().split(":")[0];
      api.get(`/rentals/car/${carId}`)
        .then(r => setAdminHistory(r.data))
        .catch(console.error);
    }
  }, [userRole, id]);

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
      .then(r => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = (r.data || [])
          .filter(d => new Date(d.end) >= today)
          .sort((a, b) => new Date(a.start) - new Date(b.start));
        setBookedDates(upcoming);
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      setEndDate("");
    }
  }, [startDate]);

  const calculateDelivery = async (addressToUse = deliveryAddress, latToUse = deliveryLat, lngToUse = deliveryLng) => {
    if (!deliveryRequested || (!addressToUse.trim() && !latToUse)) {
      setDeliveryFee(0);
      setReturnFee(0);
      setDeliveryError(null);
      return;
    }
    setDeliveryProcessing(true);
    setDeliveryError(null);
    try {
      const res = await api.post("/delivery/calculate", {
        address: addressToUse,
        lat: latToUse,
        lng: lngToUse
      });
      setDeliveryFee(res.data.delivery_fee);
      setReturnFee(res.data.return_fee);
      setDeliveryDistance(res.data.distance_km);

      // Mettre à jour la carte et l'adresse s'ils proviennent du backend
      if (res.data.lat && res.data.lng) {
        setMarkerPosition({ lat: res.data.lat, lng: res.data.lng });
        setMapCenter({ lat: res.data.lat, lng: res.data.lng });
        setDeliveryLat(res.data.lat);
        setDeliveryLng(res.data.lng);
      }
    } catch (err) {
      setDeliveryError(err.response?.data?.message || "Erreur de calcul de l'adresse.");
      setDeliveryFee(0);
      setReturnFee(0);
    }
    setDeliveryProcessing(false);
  };

  const discount = userPoints >= 100 ? 10 : 0;
  const hasLoyaltyDiscount = discount > 0;
  const basePricePerDay = car ? Number(car.price_per_day) : 0;
  const currentPricePerDay = car?.promotion_price ? Number(car.promotion_price) : basePricePerDay;
  const pricePerDay = hasLoyaltyDiscount ? Math.round(currentPricePerDay * (1 - discount / 100)) : currentPricePerDay;
  const isDiscounted = hasLoyaltyDiscount || !!car?.promotion_price;
  const originalPriceDisplay = basePricePerDay;

  const days = startDate && endDate
    ? Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000))
    : 0;
  
  const estimated = (days * pricePerDay + deliveryFee + returnFee - promoDiscount).toFixed(2);

  const checkPromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    try {
      const res = await api.post("/promos/validate", { code: promoCode });
      setPromoValid(true);
      const promo = res.data.promo;
      let dValue = 0;
      if (promo.discount_type === 'percentage') {
        dValue = (days * pricePerDay) * (Number(promo.discount_value) / 100);
      } else {
        dValue = Number(promo.discount_value);
      }
      setPromoDiscount(dValue);
      setMessage({ type: "success", text: `Code promo "${promo.code}" appliqué : -${dValue.toFixed(2)} TND` });
    } catch (err) {
      setPromoValid(false);
      setPromoDiscount(0);
      setMessage({ type: "error", text: err.response?.data?.message || "Code promo invalide." });
    }
    setValidatingPromo(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const rentCar = async () => {
    if (!startDate || !endDate) return setMessage({ type: "error", text: "Veuillez sélectionner les dates." });
    if (new Date(startDate) < today) return setMessage({ type: "error", text: "La date de prise en charge ne peut pas être dans le passé." });
    if (new Date(endDate) <= new Date(startDate)) return setMessage({ type: "error", text: "La date de retour doit être après la date de prise en charge." });
    if (deliveryRequested && !deliveryTime) return setMessage({ type: "error", text: "Veuillez préciser l'heure de livraison souhaitée." });
    setSubmitting(true);
    try {
      const payload = {
        car_id: Number(id),
        start_date: startDate,
        end_date: endDate
      };
      if (deliveryRequested) {
        payload.delivery_requested = true;
        payload.delivery_address = deliveryAddress;
        payload.delivery_time = deliveryTime;
        if (deliveryLat && deliveryLng) {
          payload.delivery_lat = deliveryLat;
          payload.delivery_lng = deliveryLng;
        }
      }
      if (promoValid && promoCode) {
        payload.promo_code = promoCode;
      }
      if (deliveryRequested && deliveryError) {
        return setMessage({ type: "error", text: "Veuillez corriger l'adresse de livraison avant de réserver." });
      }
      const res = await api.post("/rentals", payload);
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
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout de l'avis.");
    }
  };

  if (!car) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, paddingTop: 64 }}>
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

  const labelStyle = { color: T.textSub, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 8, textTransform: 'uppercase' };
  const inputStyle = {
    width: "100%", background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border}`,
    color: T.text, padding: "14px 16px", fontSize: 14,
    fontFamily: font, borderRadius: 12, outline: "none", boxSizing: "border-box",
    transition: 'all .25s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: font, paddingTop: 64 }}>

      {/* ── Hero Header ───────────────────────────────── */}
      <div className="detail-hero" style={{
        background: "rgba(0,0,0,0.1)", borderBottom: `1px solid ${T.border}`,
        padding: "0", position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative background blur */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Image */}
          <div style={{
            height: 460, background: 'transparent', overflow: 'hidden',
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
            WebkitMaskImage: 'linear-gradient(to right, black 50%, transparent 100%)',
            maskImage: 'linear-gradient(to right, black 50%, transparent 100%)'
          }}>
            <img
              src={car.image ? `http://localhost:3000${car.image}` : '/placeholder-car.jpg'}
              alt={`${car.brand} ${car.model}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
          </div>

          {/* Info */}
          <div style={{ padding: '56px 64px 48px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'transparent' }}>
            <button onClick={() => navigate(-1)} style={{
              background: "none", border: "none", color: T.textSub, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: font, padding: 0, marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }} onMouseEnter={e => e.target.style.color = T.text} onMouseLeave={e => e.target.style.color = T.textSub}>
              <span style={{ fontSize: 16 }}>←</span> Retour à la flotte
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <div className="glass-badge" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 20,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: car.available ? "#10b981" : "#ef4444",
                  boxShadow: `0 0 8px ${car.available ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`
                }} />
                <span style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>
                  {car.available ? "Disponible" : "Indisponible"}
                </span>
              </div>

              {avgRating && (
                <div className="glass-badge" style={{ padding: '6px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#f59e0b', fontSize: 14 }}>★</span>
                  <span style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{avgRating}/10</span>
                  <span style={{ color: T.muted, fontSize: 11, fontWeight: 500, marginLeft: 2 }}>({reviews.length} avis)</span>
                </div>
              )}
            </div>

            <h1 style={{
              color: T.text, fontWeight: 900, fontSize: 52,
              margin: '0 0 4px', letterSpacing: "-0.04em", lineHeight: 1.05,
              textTransform: 'uppercase'
            }}>
              {car.brand}
            </h1>
            <p style={{ color: T.textSub, fontSize: 26, fontWeight: 500, margin: '0', letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
              {car.model}
            </p>

            <div style={{ marginTop: 32, display: 'flex', alignItems: 'baseline', gap: 8 }}>
              {isDiscounted ? (
                <>
                  <span style={{ color: "#ef4444", fontSize: 24, fontWeight: 700, textDecoration: 'line-through', marginRight: 8, opacity: 0.7 }}>
                    {originalPriceDisplay}
                  </span>
                  <span style={{ color: T.text, fontSize: 48, fontWeight: 900, letterSpacing: "-0.04em" }}>
                    {pricePerDay}
                  </span>
                </>
              ) : (
                <span style={{ color: T.text, fontSize: 48, fontWeight: 900, letterSpacing: "-0.04em" }}>
                  {originalPriceDisplay}
                </span>
              )}
              <span style={{ color: T.textSub, fontSize: 15, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>TND / jour</span>
              {hasLoyaltyDiscount && <span style={{ marginLeft: 12, background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>-10% VIP</span>}
              {car.promotion_price && !hasLoyaltyDiscount && <span style={{ marginLeft: 12, background: 'linear-gradient(135deg, #ef4444, #f43f5e)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>PROMO</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Grid ──────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px 100px", display: "grid", gridTemplateColumns: "1fr 400px", gap: 32 }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* AI Description */}
          {car.description && (
            <div className="detail-section" style={{
              background: "rgba(0,0,0,0.1)", border: `1px solid ${T.border}`, borderRadius: 16, padding: "32px",
              position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
                background: 'linear-gradient(180deg, #c8a96e, #d4a843)',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h2 style={{ color: T.text, fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>À propos de ce véhicule</h2>
              </div>
              <p style={{ color: T.textSub, fontSize: 15, margin: 0, lineHeight: 1.8 }}>
                {car.description}
              </p>
            </div>
          )}

          {/* Specs */}
          <div className="detail-section" style={{ background: "rgba(0,0,0,0.1)", border: `1px solid ${T.border}`, borderRadius: 16, padding: "32px", boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <h2 style={{ color: T.text, fontSize: 18, fontWeight: 800, margin: "0 0 24px", letterSpacing: '-0.01em' }}>Spécifications</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { label: "Marque", value: car.brand, icon: <Tag className="w-4 h-4 text-slate-500" /> },
                { label: "Modèle", value: car.model, icon: <Car className="w-4 h-4 text-slate-500" /> },
                { label: "Tarif", value: `${pricePerDay} TND ${isDiscounted ? '(VIP)' : ''}`, icon: <DollarSign className="w-4 h-4 text-slate-500" /> },
                { label: "Disponibilité", value: car.available ? "Disponible" : "Indisponible", icon: <BarChart3 className="w-4 h-4 text-slate-500" /> },
                { label: "Identifiant", value: `#${String(car.id).padStart(3, "0")}`, icon: <Key className="w-4 h-4 text-slate-500" /> },
                { label: "Carburant", value: car.fuel_type || 'Non spécifié', icon: <Fuel className="w-4 h-4 text-slate-500" /> },
                { label: "Boîte", value: car.transmission || 'Non spécifié', icon: <Settings className="w-4 h-4 text-slate-500" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="spec-item">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, background: 'transparent', border: `1px solid ${T.border}`,
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}>{icon}</div>
                    <div>
                      <div style={{ color: T.textSub, fontSize: 11, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                      <div style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>{value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="detail-section" style={{ background: "rgba(0,0,0,0.1)", border: `1px solid ${T.border}`, borderRadius: 16, padding: "32px", boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h2 style={{ color: T.text, fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                Avis Clients {reviews.length > 0 && <span style={{ color: T.textSub, fontWeight: 500 }}>({reviews.length})</span>}
              </h2>
              {avgRating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', padding: '6px 16px', borderRadius: 20, border: `1px solid ${T.border}` }}>
                  <span style={{ color: '#f59e0b', fontSize: 16 }}>★</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{avgRating}</span>
                  <span style={{ color: T.textSub, fontSize: 12, fontWeight: 600 }}>/10</span>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', background: 'transparent', borderRadius: 12, border: '1px dashed #e5e5e5' }}>
                <div style={{ marginBottom: 12 }}><MessageSquare className="w-10 h-10 mx-auto text-slate-300" /></div>
                <p style={{ fontSize: 14, margin: 0, color: T.muted, fontWeight: 500 }}>Aucun avis pour l'instant. Soyez le premier !</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {reviews.map((r, i) => (
                  <div key={r.id} className="review-item" style={{
                    display: "flex", gap: 14, padding: 16,
                    background: T.bg, borderRadius: 12, border: `1px solid ${T.border}`,
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
                        <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{r.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <span style={{ color: '#f59e0b', fontSize: 12 }}>★</span>
                          <span style={{ color: T.muted, fontSize: 12, fontWeight: 600 }}>{r.rating}/10</span>
                        </div>
                      </div>
                      <p style={{ color: T.muted, fontSize: 13, margin: 0, lineHeight: 1.6 }}>{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add review */}
            <div style={{ paddingTop: 28, borderTop: `1px solid ${T.border}`, marginTop: 8 }}>
              <h3 style={{ color: T.text, fontSize: 15, fontWeight: 800, margin: "0 0 20px", letterSpacing: '-0.01em' }}>Laisser un avis</h3>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Note : <strong style={{ color: T.text }}>{rating}</strong> / 10</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button key={n} className="star-btn" onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: 'none', border: 'none', padding: 0,
                        color: n <= (hoverRating || rating) ? '#f59e0b' : '#eaeaea',
                        fontSize: 22, transition: 'color .15s'
                      }}
                    >★</button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Partagez votre expérience avec ce véhicule..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", marginBottom: 16 }}
                onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.01)'; }}
              />
              <button onClick={addReview} style={{
                background: "linear-gradient(135deg,#2563EB,#7C3AED)", color: "#fff", border: "none",
                padding: "12px 28px", fontSize: 14, fontFamily: font,
                fontWeight: 700, borderRadius: 10, cursor: "pointer",
                transition: 'all .25s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
                onMouseEnter={e => { e.target.style.opacity = 0.9; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.target.style.opacity = 1; e.target.style.transform = 'none'; }}
              >Soumettre l'avis →</button>
            </div>
          </div>
        </div>

        {/* Right — Booking */}
        <div>
          <div className="book-panel" style={{
            background: "rgba(0,0,0,0.1)", border: `1px solid ${T.border}`, borderRadius: 16,
            padding: "32px", position: "sticky", top: 100,
            boxShadow: '0 16px 50px rgba(0,0,0,0.5)', border: `1px solid rgba(255,255,255,0.1)`,
          }}>
            <h2 style={{ color: T.text, fontSize: 20, fontWeight: 900, margin: "0 0 6px", letterSpacing: '-0.02em' }}>Réserver ce véhicule</h2>
            <p style={{ color: T.textSub, fontSize: 13, margin: '0 0 24px', fontWeight: 500 }}>Sélectionnez vos dates pour commencer</p>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Date de prise en charge</label>
              <input type="date" value={startDate}
                min={todayStr}
                onChange={e => setStartDate(e.target.value)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.01)'; }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Date de retour</label>
              <input type="date" value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.01)'; }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...labelStyle, textTransform: 'none', marginBottom: 12 }}>
                <input
                  type="checkbox"
                  checked={deliveryRequested}
                  onChange={e => {
                    setDeliveryRequested(e.target.checked);
                    if (!e.target.checked) {
                      setDeliveryFee(0);
                      setReturnFee(0);
                      setDeliveryError(null);
                    }
                  }}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <Truck className="w-4 h-4 text-slate-500" />
                <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>Je souhaite être livré à domicile</span>
              </label>

              {deliveryRequested && (
                <div style={{ animation: 'fadeUp 0.3s ease', paddingLeft: 24, borderLeft: '2px solid #f0f0f0', marginLeft: 8 }}>
                  <label style={labelStyle}>Adresse de livraison</label>
                  <p style={{ fontSize: 12, color: T.muted, marginBottom: 8, marginTop: -2 }}>
                    Entrez votre adresse ou cliquez directement sur la carte ci-dessous.
                  </p>
                  <div style={{ position: 'relative', marginBottom: 16 }}>
                    <MapPin className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: 12, top: 12 }} />
                    <input
                      type="text"
                      placeholder="ex: 123 Rue de la République..."
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      onBlur={() => calculateDelivery()}
                      style={{ ...inputStyle, paddingLeft: 36 }}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Heure de livraison souhaitée
                    </label>
                    <input
                      type="time"
                      value={deliveryTime}
                      onChange={e => setDeliveryTime(e.target.value)}
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.2)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.01)'; }}
                    />
                  </div>

                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '280px', borderRadius: '10px', border: `1px solid ${T.border}` }}
                      center={mapCenter}
                      zoom={11}
                      onClick={(e) => {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        setMarkerPosition({ lat, lng });
                        setMapCenter({ lat, lng });
                        setDeliveryLat(lat);
                        setDeliveryLng(lng);

                        // Reverse Geocoding pour afficher l'adresse en format texte
                        const geocoder = new window.google.maps.Geocoder();
                        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                          if (status === "OK" && results[0]) {
                            const addr = results[0].formatted_address;
                            setDeliveryAddress(addr);
                            calculateDelivery(addr, lat, lng);
                          } else {
                            calculateDelivery(deliveryAddress, lat, lng);
                          }
                        });
                      }}
                    >
                      {markerPosition && <Marker position={markerPosition} />}
                    </GoogleMap>
                  ) : (
                    <div style={{ width: '100%', height: '280px', background: "rgba(255,255,255,0.04)", borderRadius: 10, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textSub, fontSize: 13 }}>
                      Chargement de la carte...
                    </div>
                  )}

                  {deliveryProcessing && <div style={{ fontSize: 11, color: T.muted, marginTop: 12 }}>Calcul des frais en cours...</div>}
                  {deliveryError && <div style={{ fontSize: 11, color: '#f87171', marginTop: 12 }}>{deliveryError}</div>}
                  {!deliveryProcessing && !deliveryError && deliveryFee > 0 && (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: 12, marginTop: 12 }}>
                      <div style={{ fontSize: 12, color: '#6ee7b7', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span>Distance de l'agence : <strong style={{ color: '#34d399' }}>{deliveryDistance.toFixed(1)} km</strong></span>
                        <span>Frais Aller + Retour estimés à : <strong style={{ color: '#34d399' }}>+{(deliveryFee + returnFee).toFixed(2)} TND</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Code Promo */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Code Promo</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="CODE123"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  style={{ ...inputStyle, flex: 1 }}
                  onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.2)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.01)'; }}
                />
                <button
                  type="button"
                  onClick={checkPromo}
                  disabled={validatingPromo || !promoCode}
                  style={{
                    padding: '0 16px',
                    background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: validatingPromo || !promoCode ? 0.5 : 1
                  }}
                >
                  {validatingPromo ? "..." : "Appliquer"}
                </button>
              </div>
            </div>

            {/* Avertissement Caution */}
            <div style={{
              background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12,
              padding: "16px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start"
            }}>
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#fcd34d" }}>Information Caution</h4>
                <p style={{ margin: 0, fontSize: 12, color: "#fbbf24", lineHeight: 1.5 }}>
                  Une empreinte bancaire ou caution en espèces sera demandée. Pensez à charger votre permis sur votre Profil.
                </p>
              </div>
            </div>

            {days > 0 && (
              <div style={{
                background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}`, borderRadius: 12,
                padding: "20px", marginBottom: 20,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: T.textSub, fontSize: 13, fontWeight: 500 }}>{days} jour{days > 1 ? "s" : ""} × {pricePerDay} TND</span>
                  {hasLoyaltyDiscount && <span style={{ color: "#ef4444", fontSize: 12, fontWeight: 800, background: 'rgba(239,68,68,0.15)', padding: '2px 6px', borderRadius: 4 }}>-10% VIP</span>}
                  {car.promotion_price && !hasLoyaltyDiscount && <span style={{ color: "#fff", fontSize: 12, fontWeight: 800, background: '#ef4444', padding: '2px 6px', borderRadius: 4 }}>PROMO</span>}
                </div>
                {deliveryRequested && deliveryFee > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ color: T.textSub, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}><Truck className="w-4 h-4 text-slate-400" /> Livraison</span>
                    <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>+{(deliveryFee + returnFee).toFixed(2)} TND</span>
                  </div>
                )}
                {promoDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ color: "#fca5a5", fontSize: 13, fontWeight: 600 }}>Réduction Code Promo</span>
                    <span style={{ color: "#fca5a5", fontSize: 13, fontWeight: 700 }}>-{promoDiscount.toFixed(2)} TND</span>
                  </div>
                )}
                <div style={{ height: 1, background: '#eaeaea', margin: '16px 0' }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: T.text, fontSize: 14, fontWeight: 800 }}>Total Estimé</span>
                  <span style={{ color: T.text, fontWeight: 900, fontSize: 26, letterSpacing: "-0.04em" }}>
                    {estimated} <span style={{ fontSize: 14, fontWeight: 600, color: T.textSub }}>TND</span>
                  </span>
                </div>
              </div>
            )}

            {message && (
              <div style={{
                padding: "12px 16px", marginBottom: 16, borderRadius: 10,
                background: message.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${message.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: message.type === "success" ? "#34d399" : "#fca5a5",
                fontSize: 14, fontWeight: 500
              }}>{message.text}</div>
            )}

            <button
              onClick={rentCar}
              disabled={submitting || !car.available}
              style={{
                width: "100%", background: car.available ? "linear-gradient(135deg,#2563EB,#7C3AED)" : "rgba(255,255,255,0.05)",
                color: car.available ? "#fff" : "rgba(255,255,255,0.4)",
                border: "none", padding: "16px", fontSize: 16,
                fontFamily: font, fontWeight: 800, borderRadius: 12,
                cursor: car.available ? "pointer" : "not-allowed",
                letterSpacing: "-0.01em",
                transition: 'all .25s',
                boxShadow: car.available ? '0 8px 24px rgba(37,99,235,0.3)' : 'none',
              }}
              onMouseEnter={e => { if (car.available) { e.target.style.opacity = 0.9; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 32px rgba(37,99,235,0.4)'; } }}
              onMouseLeave={e => { if (car.available) { e.target.style.opacity = 1; e.target.style.transform = 'none'; e.target.style.boxShadow = '0 8px 24px rgba(37,99,235,0.3)'; } }}
            >{submitting ? "Traitement..." : car.available ? "Confirmer la Réservation" : "Indisponible"}</button>

            {/* Unavailable Dates List */}
            {bookedDates.length > 0 && (
              <div style={{ marginTop: 32, borderTop: `1px solid ${T.border}`, paddingTop: 24 }}>
                <h3 style={{ color: T.text, fontSize: 14, fontWeight: 800, margin: "0 0 16px", display: 'flex', alignItems: 'center', gap: 6 }}>
                  Dates déjà réservées <Calendar className="w-4 h-4 text-slate-400" />
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {bookedDates.map((d, i) => (
                    <div key={i} style={{
                      fontSize: 13, color: "#fca5a5", background: "rgba(239,68,68,0.1)",
                      padding: "8px 12px", borderRadius: 8, fontWeight: 600,
                      display: "flex", alignItems: "center", gap: 8,
                      border: '1px solid rgba(239,68,68,0.3)'
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

      {userRole === 'admin' && adminHistory.length > 0 && (
        <div style={{ maxWidth: 1280, margin: "48px auto 80px", padding: "0 24px" }} className="detail-section">
          <div style={{ background: "rgba(0,0,0,0.1)", borderRadius: 24, padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                <AlertTriangle size={20} />
              </div>
              Historique des Locations (Vue Admin)
            </h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 800, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 800, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Période</th>
                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 800, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 800, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {adminHistory.map((h, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{h.user_name || 'Client Inconnu'}</div>
                        <div style={{ color: T.textSub, fontSize: 13 }}>{h.user_email}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.muted, fontSize: 13, fontWeight: 500 }}>
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(h.start_date).toLocaleDateString('fr-FR')} - {new Date(h.end_date).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          display: 'inline-block', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                          background: h.status === 'completed' ? 'rgba(16,185,129,0.15)' : h.status === 'cancelled' ? 'rgba(239,68,68,0.15)' : h.status === 'ongoing' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                          color: h.status === 'completed' ? '#34d399' : h.status === 'cancelled' ? '#f87171' : h.status === 'ongoing' ? '#60a5fa' : '#fbbf24'
                        }}>
                          {h.status === 'completed' ? 'Terminé' : h.status === 'cancelled' ? 'Annulé' : h.status === 'ongoing' ? 'En cours' : 'À venir'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>
                          {Number(h.total_price || 0).toLocaleString('fr-FR')} <span style={{ fontSize: 12, color: '#94a3b8' }}>TND</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}