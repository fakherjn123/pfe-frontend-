import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Car, Sparkles, Gift, ArrowRight, SlidersHorizontal } from "lucide-react";
import AiRecommendationCard from "../../recommendation/components/AiRecommendationCard";
import api from "../../../config/api.config";
import Footer from "../../../shared/components/layout/Footer";

const font = "'Poppins', 'Outfit', 'Inter', sans-serif";

/* ─── Inject styles ──────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById("bmz-cars-styles")) return;
  const el = document.createElement("style");
  el.id = "bmz-cars-styles";
  el.textContent = `
    @keyframes fadeUp  { from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn  { from{opacity:0}to{opacity:1} }
    @keyframes shimmer { 0%{background-position:-800px 0}100%{background-position:800px 0} }
    @keyframes gradPulse { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }

    .bmz-car { transition:transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .4s ease, border-color .3s ease; }
    .bmz-car:hover { transform:translateY(-14px) scale(1.01); box-shadow:0 36px 80px rgba(0,0,0,.65), 0 0 0 1px rgba(37,99,235,.35) !important; border-color:rgba(37,99,235,.4) !important; }
    .bmz-car:hover .bmz-car-img { transform:scale(1.09); }
    .bmz-car-img { transition:transform .6s cubic-bezier(.34,1.56,.64,1); }

    .bmz-btn-grad {
      background:linear-gradient(135deg,#2563EB,#7C3AED);
      color:#fff; border:none; font-weight:700; cursor:pointer;
      transition:all .3s ease; font-family:${font};
    }
    .bmz-btn-grad:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(37,99,235,.45); }
    .bmz-btn-grad:active { transform:scale(.98); }

    .bmz-filter-pill {
      transition:all .22s ease; cursor:pointer;
      font-family:${font}; font-weight:600;
    }
    .bmz-filter-pill:hover { transform:translateY(-1px); }

    .bmz-price {
      background:linear-gradient(135deg,#2563EB,#7C3AED);
      -webkit-background-clip:text; background-clip:text;
      -webkit-text-fill-color:transparent;
    }

    .bmz-badge {
      display:inline-flex; align-items:center; gap:6px;
      background:linear-gradient(135deg,rgba(37,99,235,.1),rgba(124,58,237,.1));
      border:1px solid rgba(124,58,237,.28);
      color:#a78bfa; font-size:11px; font-weight:800;
      letter-spacing:.1em; text-transform:uppercase;
      padding:5px 16px; border-radius:100px; font-family:${font};
    }

    .sk-dark { background: linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 75%); background-size:800px 100%; animation:shimmer 1.5s infinite linear; border-radius:8px; }
  `;
  document.head.appendChild(el);
};

/* ─── Car Card ───────────────────────────────────────────── */
function CarCard({ car, index, discount = 0 }) {
  const basePrice = Number(car.price_per_day);
  const currentPrice = car.promotion_price ? Number(car.promotion_price) : basePrice;
  const finalPrice = discount > 0 ? Math.round(currentPrice * (1 - discount / 100)) : currentPrice;
  const isDiscounted = discount > 0 || !!car.promotion_price;
  const imgSrc = car.image
    ? "http://localhost:3000" + car.image
    : "https://placehold.co/600x400/F1F5F9/94A3B8?text=Photo";

  return (
    <Link to={"/cars/" + car.id} style={{ textDecoration: "none" }}>
      <div className="bmz-car" style={{
        background: "linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 22, overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        position: "relative",
        animation: "fadeUp 0.5s ease both",
        animationDelay: index * 0.07 + "s",
      }}>
        {/* Image */}
        <div style={{ height: 210, overflow: "hidden", position: "relative" }}>
          <img
            className="bmz-car-img"
            src={imgSrc}
            alt={car.brand + " " + car.model}
            onError={e => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(3,6,15,.1) 0%,rgba(3,6,15,.55) 100%)" }} />
          <div style={{
            position: "absolute", bottom: 12, left: 12,
            display: "flex", alignItems: "center", gap: 5,
            background: car.available ? "rgba(5,150,105,0.88)" : "rgba(220,38,38,0.88)",
            backdropFilter: "blur(8px)",
            color: "#fff", padding: "4px 12px", borderRadius: 100,
            fontSize: 11, fontWeight: 700, fontFamily: font,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", opacity: 0.85 }} />
            {car.available ? "Disponible" : "Indisponible"}
          </div>
          {car.promotion_price && (
            <div style={{
              position: "absolute", top: 12, right: 12,
              background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
              color: "#0f172a", padding: "4px 12px", borderRadius: 100,
              fontSize: 10, fontWeight: 900, fontFamily: font,
              boxShadow: "0 4px 14px rgba(245,158,11,.4)",
            }}>PROMO</div>
          )}
        </div>

        {/* Gradient accent line */}
        <div style={{ height: 2, background: "linear-gradient(90deg,#2563EB,#7C3AED,#EC4899)" }} />

        {/* Content */}
        <div style={{ padding: "18px 22px 22px" }}>
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: font }}>{car.brand}</p>
            <h3 style={{ margin: "3px 0 0", fontSize: 19, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em", fontFamily: font }}>{car.model}</h3>
          </div>

          <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { icon: "💺", label: (car.seats || 5) + " places" },
              { icon: "⚙️", label: car.transmission || "Auto" },
              { icon: "⛽", label: car.fuel_type || "Essence" },
            ].map(({ icon, label }, i) => (
              <span key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.09)",
                borderRadius: 8, padding: "4px 10px",
                fontSize: 11, color: "rgba(255,255,255,.55)", fontWeight: 600, fontFamily: font,
              }}>
                <span style={{ fontSize: 12 }}>{icon}</span>{label}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.07)" }}>
            <div>
              {isDiscounted && (
                <span style={{ fontSize: 12, color: "#64748b", textDecoration: "line-through", marginRight: 6, fontFamily: font }}>
                  {basePrice} DT
                </span>
              )}
              <span className="bmz-price" style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", fontFamily: font }}>
                {finalPrice}
              </span>
              <span style={{ fontSize: 12, color: "#64748b", marginLeft: 4, fontWeight: 500 }}>DT/jour</span>
            </div>
            <button className="bmz-btn-grad" style={{ padding: "9px 18px", borderRadius: 10, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
              Voir <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Skeleton ───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 22, overflow: "hidden" }}>
    <div className="sk-dark" style={{ height: 210 }} />
    <div style={{ padding: "18px 22px 22px" }}>
      <div className="sk-dark" style={{ height: 12, width: "40%", marginBottom: 10 }} />
      <div className="sk-dark" style={{ height: 22, width: "65%", marginBottom: 18 }} />
      <div style={{ display: "flex", gap: 7, marginBottom: 20 }}>
        <div className="sk-dark" style={{ height: 26, width: 72, borderRadius: 100 }} />
        <div className="sk-dark" style={{ height: 26, width: 72, borderRadius: 100 }} />
      </div>
      <div className="sk-dark" style={{ height: 40, borderRadius: 10 }} />
    </div>
  </div>
);

/* ─── Main Page ──────────────────────────────────────────── */
export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ brand: "", maxPrice: "" });
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAiRec, setShowAiRec] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const catalogRef = useRef(null);

  useEffect(() => {
    injectStyles();
    fetchCars();
    if (localStorage.getItem("token")) fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try { const { data } = await api.get("/users/me"); setUserProfile(data); } catch {}
  };

  const fetchCars = async () => {
    setLoading(true);
    try { const { data } = await api.get("/cars", { params: filters }); setCars(data); }
    catch {} finally { setLoading(false); }
  };

  const filteredCars = cars.filter(c => {
    if (activeFilter === "available") return c.available;
    if (activeFilter === "premium") return c.price_per_day >= 200;
    return true;
  });

  const userPoints = userProfile?.points ?? null;

  const FILTER_OPTIONS = [
    { key: "all", label: "Tous" },
    { key: "available", label: "Disponibles" },
    { key: "premium", label: "Premium" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#03060f", fontFamily: font, color: "#f1f5f9" }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#060B1A 0%,#1A0A38 60%,#060D22 100%)",
        padding: "56px 32px 48px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Orbs */}
        <div style={{ position: "absolute", width: 320, height: 320, top: "-80px", right: "-60px", background: "radial-gradient(circle,rgba(124,58,237,0.25),transparent 68%)", borderRadius: "50%", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 260, height: 260, bottom: "-60px", left: "-40px", background: "radial-gradient(circle,rgba(37,99,235,0.2),transparent 68%)", borderRadius: "50%", filter: "blur(60px)" }} />
        {/* Dot grid */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.25, backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className="bmz-badge" style={{ marginBottom: 16, borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)" }}>
            ✦ Notre flotte
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.03em", fontFamily: font }}>
            Tous nos véhicules
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, margin: 0, fontWeight: 400 }}>
            {filteredCars.length} véhicule{filteredCars.length !== 1 ? "s" : ""} dans notre flotte premium
          </p>
        </div>
      </div>

      {/* ── Filters bar ─────────────────────────────────────── */}
      <div style={{ background: "rgba(6,11,26,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <SlidersHorizontal size={16} color="#475569" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginRight: 4, fontFamily: font }}>Filtrer :</span>

          {FILTER_OPTIONS.map(f => (
            <button key={f.key} className="bmz-filter-pill" onClick={() => setActiveFilter(f.key)} style={{
              padding: "8px 18px", borderRadius: 100, fontSize: 13,
              border: activeFilter === f.key ? "none" : "1.5px solid rgba(255,255,255,0.1)",
              background: activeFilter === f.key
                ? "linear-gradient(135deg,#2563EB,#7C3AED)"
                : "rgba(255,255,255,0.04)",
              color: activeFilter === f.key ? "#fff" : "rgba(255,255,255,0.6)",
              boxShadow: activeFilter === f.key ? "0 4px 14px rgba(37,99,235,0.35)" : "none",
            }}>
              {f.label}
            </button>
          ))}

          {/* AI button */}
          <button className="bmz-filter-pill" onClick={() => setShowAiRec(!showAiRec)} style={{
            padding: "8px 18px", borderRadius: 100, fontSize: 13,
            border: showAiRec ? "none" : "1.5px solid rgba(139,92,246,0.3)",
            background: showAiRec
              ? "linear-gradient(135deg,#7C3AED,#EC4899)"
              : "rgba(124,58,237,0.06)",
            color: showAiRec ? "#fff" : "#7C3AED",
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: showAiRec ? "0 4px 14px rgba(124,58,237,0.3)" : "none",
          }}>
            <Sparkles size={13} /> IA Suggest
          </button>
        </div>
      </div>

      {/* ── Catalogue ───────────────────────────────────────── */}
      <section ref={catalogRef} style={{ padding: "40px 32px 100px", maxWidth: 1280, margin: "0 auto", position: "relative" }}>

        {/* AI Recommendation */}
        {showAiRec && (
          <div style={{ marginBottom: 32, animation: "fadeUp 0.4s ease" }}>
            <AiRecommendationCard />
          </div>
        )}

        {/* Loyalty Banner */}
        {userPoints !== null && (
          <div style={{
            background: userPoints >= 100
              ? "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(37,99,235,0.08))"
              : "rgba(255,255,255,0.04)",
            border: userPoints >= 100
              ? "1px solid rgba(124,58,237,0.35)"
              : "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, padding: "24px 32px", marginBottom: 32,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 20, animation: "fadeUp 0.5s ease",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: userPoints >= 100
                  ? "linear-gradient(135deg,#10b981,#059669)"
                  : "linear-gradient(135deg,#f59e0b,#d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}>
                <Gift size={24} color="#fff" />
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, fontFamily: font, color: "#f1f5f9" }}>
                  {userPoints >= 100 ? "Statut VIP Débloqué ! −10% sur tout" : "Programme de Fidélité BMZ"}
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: userPoints >= 100 ? "#94A3B8" : "#64748B" }}>
                  {userPoints >= 100
                    ? "Félicitations ! Vous bénéficiez d'une réduction de 10% sur toutes vos locations."
                    : userPoints + "/100 points — Encore " + (100 - userPoints) + " pour débloquer −10% sur toute la flotte !"}
                </p>
              </div>
            </div>
            {/* Progress bar (only when not VIP) */}
            {userPoints < 100 && (
              <div style={{ minWidth: 160, flex: "0 0 auto" }}>
                <div style={{ background: "#F1F5F9", borderRadius: 100, height: 8, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 100,
                    background: "linear-gradient(90deg,#f59e0b,#d97706)",
                    width: Math.min(userPoints, 100) + "%",
                    transition: "width 0.6s ease",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 5, fontWeight: 600, textAlign: "right" }}>
                  {userPoints}/100 pts
                </div>
              </div>
            )}
          </div>
        )}

        {/* License warning */}
        {userProfile && userProfile.driving_license_status !== "approved" && (
          <div style={{
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: 14, padding: "18px 24px", marginBottom: 24,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16, animation: "fadeIn 0.4s ease",
            backdropFilter: "blur(8px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 22 }}>⚠️</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: "#fbbf24", fontSize: 14, fontFamily: font }}>Permis de conduire requis</p>
                <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", marginTop: 2 }}>Uploadez votre permis sur votre profil pour réserver un véhicule.</p>
              </div>
            </div>
            <Link to="/profile" style={{
              background: "linear-gradient(135deg,#2563EB,#7C3AED)",
              color: "#fff", padding: "10px 20px",
              borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>
              Mon profil →
            </Link>
          </div>
        )}

        {/* Cars grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 28 }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filteredCars.length === 0
              ? (
                <div style={{
                  gridColumn: "1/-1", textAlign: "center", padding: "80px 40px",
                  background: "rgba(255,255,255,0.03)", borderRadius: 22, border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <Car size={48} color="#334155" style={{ margin: "0 auto 16px", display: "block" }} />
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px", fontFamily: font }}>Aucun véhicule trouvé</h3>
                  <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Modifiez vos critères de recherche.</p>
                </div>
              )
              : filteredCars.map((car, i) => (
                <CarCard key={car.id} car={car} index={i} discount={userPoints >= 100 ? 10 : 0} />
              ))
          }
        </div>
      </section>

      <Footer />
    </div>
  );
}
