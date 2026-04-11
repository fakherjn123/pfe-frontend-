import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, DollarSign, Car, Sparkles, Gift } from "lucide-react";
import AiRecommendationCard from "../../recommendation/components/AiRecommendationCard";
import api from "../../../config/api.config";
import Footer from "../../../shared/components/layout/Footer";

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const BLUE = "#2563EB";

/* ─── Inject CSS ─────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById("drivenow-styles")) return;
  const s = document.createElement("style");
  s.id = "drivenow-styles";
  s.textContent = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes shimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
    .dn-car-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .dn-car-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.12) !important; }
    .dn-car-card:hover .dn-car-img { transform: scale(1.04); }
    .dn-car-img { transition: transform 0.5s ease; }
    .dn-feat-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
    .dn-feat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.06) !important; }
    .dn-btn-blue { background:${BLUE}; color:#fff; border:none; font-family:${sans}; font-weight:600; cursor:pointer; transition:background 0.2s, transform 0.15s; }
    .dn-btn-blue:hover { background:#1d4ed8; transform:translateY(-1px); }
    .dn-btn-outline { background:transparent; color:#fff; border:2px solid rgba(255,255,255,0.5); font-family:${sans}; font-weight:600; cursor:pointer; transition:all 0.2s; }
    .dn-btn-outline:hover { border-color:#fff; background:rgba(255,255,255,0.08); }
  `;
  document.head.appendChild(s);
};

/* ─── Feature Card ────────────────────────────────────────── */
const FEATURES = [
  { color: "#2563EB", bg: "#EFF6FF", icon: "🛡️", title: "Sécurité Garantie", desc: "Tous nos véhicules sont vérifiés, assurés et maintenus aux plus hauts standards." },
  { color: "#EA580C", bg: "#FFF7ED", icon: "⚡", title: "Réservation Rapide", desc: "Réservez votre véhicule en moins de 3 minutes. Confirmation immédiate." },
  { color: "#9333EA", bg: "#FAF5FF", icon: "🏆", title: "Flotte Premium", desc: "Des marques d'exception — Mercedes, Porsche, Tesla, Range Rover et plus." },
  { color: "#16A34A", bg: "#F0FDF4", icon: "🚚", title: "Livraison à Domicile", desc: "Nous livrons votre véhicule où vous voulez à Sousse et ses environs." },
];

/* ─── Car Card ────────────────────────────────────────────── */
function CarCard({ car, index, discount = 0 }) {
  const basePrice = Number(car.price_per_day);
  const currentPrice = car.promotion_price ? Number(car.promotion_price) : basePrice;
  const finalPrice = discount > 0 ? Math.round(currentPrice * (1 - discount / 100)) : currentPrice;
  const isDiscounted = discount > 0 || !!car.promotion_price;

  return (
    <Link to={`/cars/${car.id}`} style={{ textDecoration: "none" }}>
      <div className="dn-car-card" style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        border: "1px solid #F3F4F6",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        animationDelay: `${index * 0.08}s`, animation: "fadeUp 0.5s ease both",
      }}>
        {/* Image */}
        <div style={{ height: 200, background: "#F9FAFB", overflow: "hidden", position: "relative" }}>
          <img
            className="dn-car-img"
            src={car.image ? `http://localhost:3000${car.image}` : "https://placehold.co/600x400/F3F4F6/9CA3AF?text=Photo"}
            alt={`${car.brand} ${car.model}`}
            onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/F3F4F6/9CA3AF?text=Photo"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Availability pill */}
          <div style={{
            position: "absolute", bottom: 12, left: 12,
            display: "flex", alignItems: "center", gap: 5,
            background: car.available ? "rgba(22,163,74,0.9)" : "rgba(220,38,38,0.9)",
            color: "#fff", padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 700, backdropFilter: "blur(4px)",
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />
            {car.available ? "Disponible" : "Indisponible"}
          </div>
          {car.promotion_price && (
            <div style={{
              position: "absolute", top: 12, right: 12,
              background: "linear-gradient(135deg,#ef4444,#f43f5e)",
              color: "#fff", padding: "4px 12px", borderRadius: 20,
              fontSize: 10, fontWeight: 800,
            }}>PROMO</div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "20px 22px" }}>
          {/* Brand & Model */}
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>
              {car.brand}
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#6B7280" }}>{car.model}</p>
          </div>

          {/* Specs row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            {[
              { icon: "👥", label: `${car.seats || 5}` },
              { icon: "⚙️", label: car.transmission || "Auto" },
              { icon: "⛽", label: car.fuel_type || "Essence" },
            ].map(({ icon, label }, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6B7280" }}>
                <span>{icon}</span>{label}
              </span>
            ))}
          </div>

          {/* Price + Button */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingTop: 16, borderTop: "1px solid #F3F4F6",
          }}>
            <div>
              {isDiscounted && (
                <span style={{ fontSize: 12, color: "#EF4444", textDecoration: "line-through", marginRight: 6 }}>
                  {basePrice} DT
                </span>
              )}
              <span style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
                {finalPrice}
              </span>
              <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 4 }}>DT/jour</span>
            </div>
            <button className="dn-btn-blue" style={{
              padding: "9px 18px", borderRadius: 8, fontSize: 13,
            }}>
              Voir détails
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Skeleton Card ───────────────────────────────────────── */
const SkeletonCard = () => (
  <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #F3F4F6" }}>
    <div style={{ height: 200, background: "linear-gradient(90deg,#F3F4F6 25%,#E9EBED 50%,#F3F4F6 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
    <div style={{ padding: "20px 22px" }}>
      <div style={{ height: 18, width: "50%", background: "#F3F4F6", borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 13, width: "35%", background: "#F3F4F6", borderRadius: 4, marginBottom: 20 }} />
      <div style={{ height: 1, background: "#F9FAFB", marginBottom: 16 }} />
      <div style={{ height: 14, width: "30%", background: "#F3F4F6", borderRadius: 4 }} />
    </div>
  </div>
);

/* ─── Stats Bar Component ──────────────────────────────────── */
const STATS = [
  { value: "500+", label: "Véhicules loués" },
  { value: "98%", label: "Clients satisfaits" },
  { value: "24/7", label: "Support disponible" },
  { value: "5★", label: "Note moyenne" },
];

/* ─── Main Page ───────────────────────────────────────────── */
export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ brand: "", maxPrice: "" });
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAiRec, setShowAiRec] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [heroImages, setHeroImages] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const navigate = useNavigate();
  const catalogRef = useRef(null);

  useEffect(() => {
    injectStyles();
    fetchCars();
    fetchHeroImages();
    if (localStorage.getItem("token")) fetchUserProfile();
  }, []);

  useEffect(() => {
    if (heroImages.length > 1) {
      const t = setInterval(() => setHeroIndex(i => (i + 1) % heroImages.length), 6000);
      return () => clearInterval(t);
    }
  }, [heroImages]);

  const fetchUserProfile = async () => {
    try { const { data } = await api.get("/users/me"); setUserProfile(data); } catch { }
  };
  const fetchHeroImages = async () => {
    try { const { data } = await api.get("/hero"); setHeroImages(data); } catch { }
  };
  const fetchCars = async () => {
    setLoading(true);
    try { const { data } = await api.get("/cars", { params: filters }); setCars(data); }
    catch { }
    finally { setLoading(false); }
  };

  const filteredCars = cars.filter(c => {
    if (activeFilter === "available") return c.available;
    if (activeFilter === "premium") return c.price_per_day >= 200;
    return true;
  });

  const userPoints = userProfile?.points ?? null;
  const featuredCars = cars.filter(c => c.available).slice(0, 3);

  // Hero background
  const heroBg = heroImages.length > 0
    ? `url(http://localhost:3000${heroImages[heroIndex]?.image_url})`
    : "url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920)";

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: sans }}>

      {/* ════════════════════════════════════════════════════
          FULL CATALOGUE SECTION
      ════════════════════════════════════════════════════ */}
      <section ref={catalogRef} id="catalogue" style={{ padding: "96px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2rem)", fontWeight: 900, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Tous nos véhicules
            </h2>
            <span style={{ fontSize: 13, color: "#6B7280" }}>{filteredCars.length} véhicule{filteredCars.length !== 1 ? "s" : ""} disponible{filteredCars.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setShowAiRec(!showAiRec)} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: showAiRec ? "rgba(139,92,246,0.1)" : "#fff",
              border: `1px solid ${showAiRec ? "#8B5CF6" : "#E5E7EB"}`,
              color: showAiRec ? "#8B5CF6" : "#6B7280",
              padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: sans, transition: "all 0.2s",
            }}>
              <Sparkles size={14} /> IA Suggest
            </button>
            {[
              { key: "all", label: "Tous" },
              { key: "available", label: "Disponibles" },
              { key: "premium", label: "Premium" },
            ].map(f => (
              <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: `1px solid ${activeFilter === f.key ? BLUE : "#E5E7EB"}`,
                background: activeFilter === f.key ? BLUE : "#fff",
                color: activeFilter === f.key ? "#fff" : "#6B7280",
                cursor: "pointer", fontFamily: sans, transition: "all 0.2s",
              }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Recommendation */}
        {showAiRec && <div style={{ marginBottom: 32, animation: "fadeUp 0.4s ease" }}><AiRecommendationCard /></div>}

        {/* Loyalty Banner */}
        {userPoints !== null && (
          <div style={{
            background: userPoints >= 100 ? "#0F172A" : "#fff",
            border: `1px solid ${userPoints >= 100 ? "rgba(255,255,255,0.08)" : "#E5E7EB"}`,
            borderRadius: 16, padding: "28px 36px", marginBottom: 32,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 24, animation: "fadeUp 0.5s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: userPoints >= 100 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#f59e0b,#d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Gift size={26} color="#fff" />
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: userPoints >= 100 ? "#fff" : "#111827" }}>
                  {userPoints >= 100 ? "Statut VIP Débloqué ! -10% sur tout" : "Programme de Fidélité BMZ"}
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: userPoints >= 100 ? "#94A3B8" : "#6B7280" }}>
                  {userPoints >= 100
                    ? `Félicitations ! Vous bénéficiez d'une réduction de 10% sur toutes vos locations.`
                    : `${userPoints}/100 points — Encore ${100 - userPoints} pour débloquer -10% sur toute la flotte !`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Driving License Warning */}
        {userProfile && userProfile.driving_license_status !== "approved" && (
          <div style={{
            background: "#FFFBEB", border: "1px solid #FEF08A", borderRadius: 12,
            padding: "20px 24px", marginBottom: 24,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 24 }}>⚠️</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: "#92400E", fontSize: 14 }}>Permis de conduire requis</p>
                <p style={{ margin: 0, fontSize: 13, color: "#A16207", marginTop: 2 }}>Uploadez votre permis sur votre profil pour réserver un véhicule.</p>
              </div>
            </div>
            <Link to="/profile" style={{
              background: "#000", color: "#fff", padding: "10px 20px",
              borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>
              Mon profil →
            </Link>
          </div>
        )}

        {/* Cars Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 24 }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filteredCars.length === 0
              ? (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 40px", background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6" }}>
                  <Car size={48} color="#D1D5DB" style={{ margin: "0 auto 12px", display: "block" }} />
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>Aucun véhicule trouvé</h3>
                  <p style={{ color: "#9CA3AF", fontSize: 14, margin: 0 }}>Modifiez vos critères de recherche.</p>
                </div>
              )
              : filteredCars.map((car, i) => (
                <CarCard key={car.id} car={car} index={i} discount={userPoints >= 100 ? 10 : 0} />
              ))
          }
        </div>
      </section>



      {/* ════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}