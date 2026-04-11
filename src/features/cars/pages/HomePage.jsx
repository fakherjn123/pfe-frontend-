import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, DollarSign } from "lucide-react";
import api from "../../../config/api.config";
import Footer from "../../../shared/components/layout/Footer";

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const BLUE = "#2563EB";

/* ─── Inject CSS ─────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById("drivenow-styles")) return;
  const s = document.createElement("style");
  s.id = "drivenow-styles";
  s.textContent = [
    "@keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }",
    "@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }",
    "@keyframes shimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }",
    ".dn-car-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }",
    ".dn-car-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.12) !important; }",
    ".dn-car-card:hover .dn-car-img { transform: scale(1.04); }",
    ".dn-car-img { transition: transform 0.5s ease; }",
    ".dn-feat-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }",
    ".dn-feat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.06) !important; }",
    ".dn-btn-blue { background:" + BLUE + "; color:#fff; border:none; font-family:" + sans + "; font-weight:600; cursor:pointer; transition:background 0.2s, transform 0.15s; }",
    ".dn-btn-blue:hover { background:#1d4ed8; transform:translateY(-1px); }",
    ".dn-btn-outline { background:transparent; color:#fff; border:2px solid rgba(255,255,255,0.5); font-family:" + sans + "; font-weight:600; cursor:pointer; transition:all 0.2s; }",
    ".dn-btn-outline:hover { border-color:#fff; background:rgba(255,255,255,0.08); }",
  ].join(" ");
  document.head.appendChild(s);
};

/* ─── Feature Card ────────────────────────────────────────── */
const FEATURES = [
  { color: "#2563EB", bg: "#EFF6FF", icon: "🛡️", title: "Sécurité Garantie", desc: "Tous nos véhicules sont vérifiés, assurés et maintenus aux plus hauts standards." },
  { color: "#EA580C", bg: "#FFF7ED", icon: "⚡", title: "Réservation Rapide", desc: "Réservez votre véhicule en moins de 3 minutes. Confirmation immédiate." },
  { color: "#9333EA", bg: "#FAF5FF", icon: "🏆", title: "Flotte Premium", desc: "Des marques d'exception — Mercedes, Porsche, Tesla, Range Rover et plus." },
  { color: "#16A34A", bg: "#F0FDF4", icon: "🚚", title: "Livraison à Domicile", desc: "Nous livrons votre véhicule où vous voulez à Sousse et ses environs." },
];

const STATS = [
  { value: "500+", label: "Véhicules loués" },
  { value: "98%", label: "Clients satisfaits" },
  { value: "24/7", label: "Support disponible" },
  { value: "5★", label: "Note moyenne" },
];

/* ─── Car Card ────────────────────────────────────────────── */
function CarCard({ car, index }) {
  const basePrice = Number(car.price_per_day);
  const promoPrice = car.promotion_price ? Number(car.promotion_price) : null;
  const imgSrc = car.image ? "http://localhost:3000" + car.image : "https://placehold.co/600x400/F3F4F6/9CA3AF?text=Photo";

  return (
    <Link to={"/cars/" + car.id} style={{ textDecoration: "none" }}>
      <div className="dn-car-card" style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        border: "1px solid #F3F4F6",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        animationDelay: (index * 0.08) + "s",
        animation: "fadeUp 0.5s ease both",
      }}>
        {/* Image */}
        <div style={{ height: 200, background: "#F9FAFB", overflow: "hidden", position: "relative" }}>
          <img
            className="dn-car-img"
            src={imgSrc}
            alt={car.brand + " " + car.model}
            onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/F3F4F6/9CA3AF?text=Photo"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
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
          {promoPrice && (
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
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>
              {car.brand}
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#6B7280" }}>{car.model}</p>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            {[
              { icon: "👥", label: String(car.seats || 5) },
              { icon: "⚙️", label: car.transmission || "Auto" },
              { icon: "⛽", label: car.fuel_type || "Essence" },
            ].map(({ icon, label }, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6B7280" }}>
                <span>{icon}</span>{label}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid #F3F4F6" }}>
            <div>
              {promoPrice && (
                <span style={{ fontSize: 12, color: "#EF4444", textDecoration: "line-through", marginRight: 6 }}>
                  {basePrice} DT
                </span>
              )}
              <span style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
                {promoPrice || basePrice}
              </span>
              <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 4 }}>DT/jour</span>
            </div>
            <button className="dn-btn-blue" style={{ padding: "9px 18px", borderRadius: 8, fontSize: 13 }}>
              Voir détails
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Skeleton ────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #F3F4F6" }}>
    <div style={{ height: 200, background: "linear-gradient(90deg,#F3F4F6 25%,#E9EBED 50%,#F3F4F6 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
    <div style={{ padding: "20px 22px" }}>
      <div style={{ height: 18, width: "50%", background: "#F3F4F6", borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 13, width: "35%", background: "#F3F4F6", borderRadius: 4, marginBottom: 20 }} />
      <div style={{ height: 14, width: "30%", background: "#F3F4F6", borderRadius: 4 }} />
    </div>
  </div>
);

/* ─── Main Page ───────────────────────────────────────────── */
export default function HomePage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroImages, setHeroImages] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [brandSearch, setBrandSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    injectStyles();
    fetchCars();
    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (heroImages.length > 1) {
      const t = setInterval(() => setHeroIndex(i => (i + 1) % heroImages.length), 6000);
      return () => clearInterval(t);
    }
  }, [heroImages]);

  const fetchHeroImages = async () => {
    try { const { data } = await api.get("/hero"); setHeroImages(data); } catch {}
  };

  const fetchCars = async () => {
    setLoading(true);
    try { const { data } = await api.get("/cars"); setCars(data); }
    catch {}
    finally { setLoading(false); }
  };

  const featuredCars = cars.filter(c => c.available).slice(0, 3);

  /* Hero background — no template literal */
  let heroBgImage;
  if (heroImages.length > 0 && heroImages[heroIndex]) {
    heroBgImage = "url(http://localhost:3000" + heroImages[heroIndex].image_url + ")";
  } else {
    heroBgImage = "url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920)";
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: sans }}>

      {/* ══════════ HERO ══════════ */}
      <section style={{
        position: "relative", minHeight: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        backgroundImage: heroBgImage,
        backgroundSize: "cover", backgroundPosition: "center",
        textAlign: "center", overflow: "hidden",
      }}>
        {/* Animated images */}
        {heroImages.map((img, i) => (
          <div key={img.id || i} style={{
            position: "absolute", inset: 0,
            backgroundImage: "url(http://localhost:3000" + img.image_url + ")",
            backgroundSize: "cover", backgroundPosition: "center",
            transition: "opacity 1.5s ease",
            opacity: heroIndex === i ? 1 : 0,
          }} />
        ))}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.60)", zIndex: 1 }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, padding: "0 24px", width: "100%", maxWidth: 900, margin: "0 auto" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 20, animation: "fadeIn 0.8s ease both" }}>
            Location Premium à Sousse
          </p>
          <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 900, color: "#fff", margin: "0 0 24px", letterSpacing: "-0.03em", lineHeight: 1.05, animation: "fadeUp 0.8s ease both 0.1s" }}>
            Conduisez<br />le Meilleur
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 18, maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.65, fontWeight: 400, animation: "fadeUp 0.8s ease both 0.2s" }}>
            Découvrez notre flotte premium et réservez le véhicule idéal pour chaque occasion.
          </p>

          {/* Search glassmorphism box */}
          <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 14, padding: 8, maxWidth: 600, margin: "0 auto 32px", flexWrap: "wrap", animation: "fadeUp 0.8s ease both 0.3s" }}>
            <div style={{ flex: 1, minWidth: 160, position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)" }}>
                <Search size={16} />
              </div>
              <input
                placeholder="Marque ou modèle..."
                value={brandSearch}
                onChange={e => setBrandSearch(e.target.value)}
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, padding: "12px 14px 12px 40px", fontFamily: sans, boxSizing: "border-box" }}
              />
            </div>
            <button onClick={() => navigate("/cars")} className="dn-btn-blue" style={{ padding: "12px 28px", borderRadius: 10, fontSize: 14 }}>
              Rechercher
            </button>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.8s ease both 0.4s" }}>
            <button className="dn-btn-blue" onClick={() => navigate("/cars")} style={{ padding: "14px 32px", borderRadius: 10, fontSize: 15 }}>
              Explorer le catalogue
            </button>
            <button className="dn-btn-outline" onClick={() => navigate("/contact")} style={{ padding: "14px 32px", borderRadius: 10, fontSize: 15 }}>
              Nous contacter
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
          {STATS.map(({ value, label }, i) => (
            <div key={i} style={{ padding: "20px 48px", textAlign: "center", borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none", minWidth: 140 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ WHY US ══════════ */}
      <section style={{ padding: "96px 32px", background: "#F9FAFB" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{ display: "inline-block", background: "rgba(37,99,235,0.08)", color: BLUE, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 20, marginBottom: 16 }}>
              Pourquoi nous choisir
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, color: "#111827", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
              L'excellence à votre service
            </h2>
            <p style={{ color: "#6B7280", fontSize: 16, maxWidth: 520, margin: "0 auto", lineHeight: 1.65 }}>
              Chez BMZ Location, chaque détail compte pour vous offrir une expérience de location inoubliable.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {FEATURES.map(({ bg, icon, title, desc }, i) => (
              <div key={i} className="dn-feat-card" style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", border: "1px solid #F3F4F6", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 20 }}>
                  {icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 10px" }}>{title}</h3>
                <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURED CARS ══════════ */}
      <section style={{ padding: "0 32px 96px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
            <div>
              <span style={{ display: "inline-block", background: "rgba(147,51,234,0.08)", color: "#9333EA", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 20, marginBottom: 12 }}>
                Notre sélection
              </span>
              <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.2rem)", fontWeight: 900, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
                Voitures à la Une
              </h2>
              <p style={{ color: "#6B7280", fontSize: 15, margin: "8px 0 0" }}>Les plus demandées de notre flotte premium</p>
            </div>
            <Link to="/cars" style={{ color: BLUE, textDecoration: "none", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
              Voir tout <span style={{ fontSize: 16 }}>→</span>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {loading
              ? [0, 1, 2].map(i => <SkeletonCard key={i} />)
              : featuredCars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)
            }
          </div>
        </div>
      </section>

      {/* ══════════ CTA DARK ══════════ */}
      <section style={{ background: "linear-gradient(rgba(0,0,0,0.65),rgba(0,0,0,0.65)), url(https://images.unsplash.com/photo-1503371064188-1ad6cd32f83f?auto=format&fit=crop&q=80&w=1920)", backgroundSize: "cover", backgroundPosition: "center", padding: "96px 32px", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, margin: "0 0 16px", letterSpacing: "-0.03em", color: "#fff" }}>
          Prêt à prendre la route ?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 17, maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.65 }}>
          Rejoignez des centaines de conducteurs qui font confiance à BMZ Location pour leurs déplacements professionnels et personnels.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="dn-btn-blue" onClick={() => navigate("/cars")} style={{ padding: "14px 36px", borderRadius: 10, fontSize: 15 }}>
            Explorer le catalogue
          </button>
          <button className="dn-btn-outline" onClick={() => navigate("/contact")} style={{ padding: "14px 36px", borderRadius: 10, fontSize: 15 }}>
            Nous contacter
          </button>
        </div>
      </section>

      {/* ══════════ LOYALTY BLUE ══════════ */}
      <section style={{ background: BLUE, padding: "80px 32px", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, margin: "0 0 14px", letterSpacing: "-0.02em" }}>
          Gagnez des points à chaque location
        </h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.65 }}>
          Échangez-les contre des réductions, des upgrades gratuits et des avantages exclusifs.
        </p>
        <Link to="/register">
          <button
            style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.6)", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: sans, transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; }}
          >
            Créer un compte gratuitement <span style={{ fontSize: 16 }}>›</span>
          </button>
        </Link>
      </section>

      <Footer />
    </div>
  );
}
