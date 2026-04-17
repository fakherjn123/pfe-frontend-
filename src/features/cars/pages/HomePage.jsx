import { useEffect, useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Shield, Zap, Award, Truck, ArrowRight, ChevronDown, Star } from "lucide-react";
import api from "../../../config/api.config";
import Footer from "../../../shared/components/layout/Footer";
import { AuthContext } from "../../auth/context/AuthContext";

const font = "'Poppins', 'Outfit', 'Inter', sans-serif";

/* ── Inject global styles for this page ── */
const injectStyles = () => {
  if (document.getElementById("bmz-home-v2-styles")) return;
  const el = document.createElement("style");
  el.id = "bmz-home-v2-styles";
  el.textContent = `
    @keyframes fadeUp    { from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn    { from{opacity:0}to{opacity:1} }
    @keyframes shimmer   { 0%{background-position:-800px 0}100%{background-position:800px 0} }
    @keyframes orbFloat  { 0%,100%{transform:translate(0,0)scale(1)}40%{transform:translate(var(--tx,25px),var(--ty,-22px))scale(1.04)}75%{transform:translate(var(--tx2,-15px),var(--ty2,12px))scale(.98)} }
    @keyframes gradPulse { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
    @keyframes scrollBounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(8px)} }
    @keyframes borderSpin { to{transform:rotate(360deg)} }
    @keyframes countUp   { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
    @keyframes heroImgFade { from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)} }

    /* Car cards */
    .lux-car { transition: transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .4s ease, border-color .3s ease; }
    .lux-car:hover { transform: translateY(-14px) scale(1.015); box-shadow: 0 36px 80px rgba(0,0,0,.65), 0 0 0 1px rgba(37,99,235,.35) !important; border-color: rgba(37,99,235,.4) !important; }
    .lux-car:hover .lux-car-img { transform: scale(1.09); }
    .lux-car-img { transition: transform .6s cubic-bezier(.34,1.56,.64,1); }

    /* Feature cards */
    .lux-feat { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
    .lux-feat:hover { transform: translateY(-8px); box-shadow: 0 24px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(37,99,235,.25) !important; border-color: rgba(37,99,235,.25) !important; }

    /* Gradient text */
    .grad-text {
      background: linear-gradient(135deg,#ffffff 0%,#d4d4d8 50%,#a1a1aa 100%);
      background-size: 200%;
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradPulse 5s ease infinite;
    }
    .grad-gold {
      background: linear-gradient(135deg,#f59e0b,#fbbf24,#f97316);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .price-grad {
      background: linear-gradient(135deg,#2563EB,#7C3AED);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Buttons */
    .btn-grad {
      background: linear-gradient(135deg,#2563EB 0%,#7C3AED 100%);
      color: #fff; border: none; font-weight: 700; cursor: pointer;
      transition: all .3s ease; font-family: ${font};
      position: relative; overflow: hidden;
    }
    .btn-grad::after { content:''; position:absolute; inset:0; background:rgba(255,255,255,0); transition:background .3s; }
    .btn-grad:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(37,99,235,.45); }
    .btn-grad:hover::after { background: rgba(255,255,255,.06); }
    .btn-grad:active { transform: scale(.98); }

    .btn-glass {
      background: rgba(255,255,255,.07); color: #fff;
      border: 1.5px solid rgba(255,255,255,.2);
      font-weight: 600; cursor: pointer;
      transition: all .3s ease; backdrop-filter: blur(14px);
      font-family: ${font};
    }
    .btn-glass:hover { background: rgba(255,255,255,.13); border-color: rgba(255,255,255,.4); transform: translateY(-2px); }

    /* Skeleton */
    .sk { background: linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 75%); background-size: 800px 100%; animation: shimmer 1.5s infinite linear; border-radius: 8px; }

    /* Scroll bounce */
    .scroll-bounce { animation: scrollBounce 2.2s ease-in-out infinite; }

    /* Orb */
    .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; animation: orbFloat var(--dur,9s) ease-in-out infinite; }

    /* Stat hover */
    .stat-item { transition: transform .2s ease; cursor: default; }
    .stat-item:hover { transform: scale(1.06); }

    /* Reveal on scroll */
    .reveal { opacity: 0; transform: translateY(32px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
    .reveal.shown { opacity: 1; transform: translateY(0); }
    .reveal-d1 { transition-delay: .1s; }
    .reveal-d2 { transition-delay: .2s; }
    .reveal-d3 { transition-delay: .3s; }
    .reveal-d4 { transition-delay: .4s; }
  `;
  document.head.appendChild(el);
};

/* ── Scroll reveal hook ── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("shown"); }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}

/* ── Feature data ── */
const FEATURES = [
  { Icon: Shield, color: "#2563EB", bg: "rgba(37,99,235,0.12)", title: "Sécurité Garantie", desc: "Tous nos véhicules sont vérifiés, assurés et maintenus aux plus hauts standards de sécurité." },
  { Icon: Zap,    color: "#f59e0b", bg: "rgba(245,158,11,0.12)", title: "Réservation Rapide", desc: "Réservez en moins de 3 minutes, confirmation instantanée, livraison sous 24h." },
  { Icon: Award,  color: "#a78bfa", bg: "rgba(124,58,237,0.12)", title: "Flotte Premium", desc: "Mercedes, Porsche, Tesla, Range Rover — uniquement des modèles d'exception." },
  { Icon: Truck,  color: "#10b981", bg: "rgba(16,185,129,0.12)", title: "Livraison à Domicile", desc: "Livraison gratuite à Sousse et ses environs. Recevez votre véhicule sans vous déplacer." },
];

const STATS = [
  { value: "500+", label: "Véhicules loués" },
  { value: "98%",  label: "Clients satisfaits" },
  { value: "24/7", label: "Support disponible" },
  { value: "5★",   label: "Note moyenne" },
];

/* ── Skeleton card ── */
const SkeletonCard = () => (
  <div style={{
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 22, overflow: "hidden",
  }}>
    <div className="sk" style={{ height: 210 }} />
    <div style={{ padding: "18px 20px 22px" }}>
      <div className="sk" style={{ height: 12, width: "40%", marginBottom: 10 }} />
      <div className="sk" style={{ height: 22, width: "65%", marginBottom: 18 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <div className="sk" style={{ height: 24, width: 72, borderRadius: 100 }} />
        <div className="sk" style={{ height: 24, width: 72, borderRadius: 100 }} />
      </div>
      <div className="sk" style={{ height: 42, borderRadius: 12 }} />
    </div>
  </div>
);

/* ── Car Card ── */
function CarCard({ car, index }) {
  const basePrice = Number(car.price_per_day);
  const promoPrice = car.promotion_price ? Number(car.promotion_price) : null;
  const displayPrice = promoPrice || basePrice;
  const imgSrc = car.image
    ? "http://localhost:3000" + car.image
    : "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80";

  return (
    <Link to={"/cars/" + car.id} style={{ textDecoration: "none" }}>
      <div className="lux-car" style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 22, overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        animation: "fadeUp 0.55s ease both",
        animationDelay: index * 0.1 + "s",
        position: "relative",
      }}>
        {/* Image */}
        <div style={{ height: 210, overflow: "hidden", position: "relative" }}>
          <img
            className="lux-car-img"
            src={imgSrc}
            alt={car.brand + " " + car.model}
            onError={e => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(3,6,15,.1) 0%, rgba(3,6,15,.55) 100%)" }} />

          {/* Availability */}
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

          {promoPrice && (
            <div style={{
              position: "absolute", top: 12, right: 12,
              background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
              color: "#0f172a", padding: "4px 12px", borderRadius: 100,
              fontSize: 10, fontWeight: 900, fontFamily: font,
              boxShadow: "0 4px 14px rgba(245,158,11,0.4)",
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
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 8, padding: "4px 10px",
                fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600, fontFamily: font,
              }}>
                <span style={{ fontSize: 12 }}>{icon}</span>{label}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div>
              {promoPrice && <span style={{ fontSize: 12, color: "#64748b", textDecoration: "line-through", fontFamily: font, marginRight: 6 }}>{basePrice} DT</span>}
              <span className="price-grad" style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", fontFamily: font }}>{displayPrice}</span>
              <span style={{ fontSize: 12, color: "#64748b", marginLeft: 4, fontWeight: 500 }}>DT/jour</span>
            </div>
            <button className="btn-grad" style={{ padding: "9px 18px", borderRadius: 10, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
              Voir <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Main Page ── */
export default function HomePage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroImages, setHeroImages] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [brandSearch, setBrandSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useScrollReveal();

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
    catch {} finally { setLoading(false); }
  };

  const featuredCars = cars.filter(c => c.available).slice(0, 3);

  const heroBg = heroImages.length > 0 && heroImages[heroIndex]
    ? "url(http://localhost:3000" + heroImages[heroIndex].image_url + ")"
    : "url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920)";

  return (
    <div style={{ minHeight: "100vh", background: "#03060f", fontFamily: font, color: "#f1f5f9" }}>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section style={{
        position: "relative", minHeight: "100vh",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        textAlign: "center", overflow: "hidden",
      }}>
        {/* Background images (rotating) */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          {heroImages.length > 0 ? heroImages.map((img, i) => (
            <div key={img.id || i} style={{
              position: "absolute", inset: 0,
              backgroundImage: "url(http://localhost:3000" + img.image_url + ")",
              backgroundSize: "cover", backgroundPosition: "center",
              transition: "opacity 1.8s ease",
              opacity: heroIndex === i ? 1 : 0,
            }} />
          )) : (
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920)",
              backgroundSize: "cover", backgroundPosition: "center",
            }} />
          )}
        </div>

        {/* Multi-layer dark overlay */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(160deg,rgba(3,6,15,0.82) 0%,rgba(6,11,26,0.72) 45%,rgba(12,10,32,0.82) 100%)",
        }} />
        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, zIndex: 2,
          background: "linear-gradient(transparent, #03060f)",
        }} />

        {/* Ambient orbs removed to cancel the blue effect */}


        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 3, padding: "0 24px", width: "100%", maxWidth: 900, margin: "0 auto" }}>

          {/* Main headline */}
          <h1 style={{ fontFamily: font, fontWeight: 900, letterSpacing: "-0.04em", margin: 0, lineHeight: 1.0 }}>
            <span style={{ display: "block", fontSize: "clamp(3.2rem, 8vw, 6.5rem)", color: "#fff", animation: "fadeUp .85s ease both .05s" }}>
              Conduisez
            </span>
            <span style={{ display: "block", fontSize: "clamp(3.2rem, 8vw, 6.5rem)", animation: "fadeUp .85s ease both .18s" }}>
              <span className="grad-text">le Meilleur</span>
            </span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.66)", fontSize: 18,
            maxWidth: 540, margin: "28px auto 52px", lineHeight: 1.75,
            animation: "fadeUp .85s ease both .3s", fontWeight: 400,
          }}>
            Découvrez notre flotte premium et réservez le véhicule idéal pour chaque occasion.
            Livraison à domicile incluse.
          </p>

          {/* Search pill */}
          <div style={{
            display: "flex", gap: 0,
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            border: "1.5px solid rgba(255,255,255,0.16)",
            borderRadius: 16, padding: 5, maxWidth: 520,
            margin: "0 auto 28px", flexWrap: "wrap",
            animation: "fadeUp .85s ease both .4s",
          }}>
            <div style={{ flex: 1, minWidth: 160, position: "relative" }}>
              <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.35)", pointerEvents: "none" }}>
                <Search size={14} />
              </span>
              <input
                placeholder="Marque ou modèle..."
                value={brandSearch}
                onChange={e => setBrandSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && navigate("/cars")}
                style={{
                  width: "100%", background: "transparent", border: "none", outline: "none",
                  color: "#fff", fontSize: 14, padding: "13px 14px 13px 42px",
                  fontFamily: font, boxSizing: "border-box",
                }}
              />
            </div>
            <button onClick={() => navigate("/cars")} className="btn-grad" style={{ padding: "12px 26px", borderRadius: 12, fontSize: 14 }}>
              Rechercher
            </button>
          </div>

          {/* CTA pair */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp .85s ease both .5s" }}>
            <button className="btn-grad" onClick={() => navigate("/cars")} style={{ padding: "15px 34px", borderRadius: 14, fontSize: 15, display: "flex", alignItems: "center", gap: 9 }}>
              Explorer le catalogue <ArrowRight size={16} />
            </button>
            <button className="btn-glass" onClick={() => navigate("/contact")} style={{ padding: "15px 34px", borderRadius: 14, fontSize: 15 }}>
              Nous contacter
            </button>
          </div>

          {/* Scroll cue */}
          <div className="scroll-bounce" style={{ marginTop: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: 0.4 }}>
            <span style={{ color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }}>Découvrir</span>
            <ChevronDown size={16} color="#fff" />
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 4,
          background: "rgba(3,6,15,0.7)",
          backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", justifyContent: "center", flexWrap: "wrap",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(37,99,235,.5),rgba(124,58,237,.5),transparent)" }} />
          {STATS.map(({ value, label }, i) => (
            <div key={i} className="stat-item" style={{
              padding: "18px 52px", textAlign: "center",
              borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              minWidth: 130,
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: font, letterSpacing: "-0.02em" }} className="price-grad">
                {value}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", marginTop: 3, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURED CARS
      ════════════════════════════════════════ */}
      <section style={{ padding: "100px 32px", background: "#03060f", position: "relative", overflow: "hidden" }}>
        {/* Background orbs */}
        <div className="orb" style={{ width: 500, height: 500, top: "-80px", left: "-120px", background: "radial-gradient(circle,rgba(37,99,235,.08),transparent 65%)", "--dur": "14s" }} />
        <div className="orb" style={{ width: 400, height: 400, bottom: "-60px", right: "-80px", background: "radial-gradient(circle,rgba(124,58,237,.07),transparent 65%)", "--dur": "11s" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: 64 }} className="reveal">
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "linear-gradient(135deg,rgba(37,99,235,.12),rgba(124,58,237,.12))",
              border: "1px solid rgba(124,58,237,.28)",
              color: "#a78bfa", fontSize: 11, fontWeight: 800,
              letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "6px 18px", borderRadius: 100, fontFamily: font,
              marginBottom: 20,
            }}>✦ Véhicules vedettes</span>
            <h2 style={{ fontSize: "clamp(2rem,4.5vw,3rem)", fontWeight: 900, color: "#f1f5f9", margin: "0 0 16px", letterSpacing: "-0.035em", fontFamily: font }}>
              Notre <span className="grad-text">Sélection Premium</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: 16, maxWidth: 500, margin: "0 auto", lineHeight: 1.75 }}>
              Nos véhicules les plus demandés, disponibles dès maintenant.
            </p>
          </div>

          {/* Cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 28 }}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredCars.length > 0
                ? featuredCars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)
                : (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#64748b" }}>
                    <p style={{ fontSize: 16 }}>Aucun véhicule disponible pour le moment.</p>
                  </div>
                )
            }
          </div>

          {/* See all CTA */}
          <div style={{ textAlign: "center", marginTop: 52 }} className="reveal">
            <Link to="/cars" style={{ textDecoration: "none" }}>
              <button className="btn-grad" style={{ padding: "14px 36px", borderRadius: 14, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 9 }}>
                Voir tous les véhicules <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(37,99,235,.25),rgba(124,58,237,.25),transparent)", margin: "0 80px" }} />

      {/* ════════════════════════════════════════
          WHY US
      ════════════════════════════════════════ */}
      <section style={{ padding: "100px 32px", background: "#03060f", position: "relative" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 64 }} className="reveal">
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "linear-gradient(135deg,rgba(245,158,11,.12),rgba(251,191,36,.08))",
              border: "1px solid rgba(245,158,11,.28)",
              color: "#fbbf24", fontSize: 11, fontWeight: 800,
              letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "6px 18px", borderRadius: 100, fontFamily: font,
              marginBottom: 20,
            }}>★ Pourquoi nous choisir</span>
            <h2 style={{ fontSize: "clamp(2rem,4.5vw,3rem)", fontWeight: 900, color: "#f1f5f9", margin: "0 0 16px", letterSpacing: "-0.035em", fontFamily: font }}>
              L'excellence à <span className="grad-gold">votre service</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: 16, maxWidth: 500, margin: "0 auto", lineHeight: 1.75 }}>
              Chez BMZ Location, chaque détail compte pour vous offrir une expérience inoubliable.
            </p>
          </div>

          {/* Feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 24 }}>
            {FEATURES.map(({ Icon, color, bg, title, desc }, i) => (
              <div key={i} className={"lux-feat reveal reveal-d" + (i + 1)} style={{
                background: "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20, padding: "32px 28px",
                boxShadow: "0 8px 32px rgba(0,0,0,.35)",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: bg, border: "1px solid " + color + "30",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 24, boxShadow: "0 4px 20px " + color + "25",
                }}>
                  <Icon size={26} color={color} strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f1f5f9", margin: "0 0 10px", fontFamily: font, letterSpacing: "-0.01em" }}>
                  {title}
                </h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.75, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════ */}
      <section style={{ padding: "80px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          background: "linear-gradient(135deg,rgba(37,99,235,.14) 0%,rgba(124,58,237,.14) 100%)",
          border: "1px solid rgba(124,58,237,.25)",
          borderRadius: 28, padding: "64px 56px",
          position: "relative", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 32,
        }} className="reveal">
          {/* Orbs inside */}
          <div style={{ position: "absolute", width: 300, height: 300, top: "-80px", right: "10%", background: "radial-gradient(circle,rgba(124,58,237,.25),transparent 65%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 200, height: 200, bottom: "-50px", left: "5%", background: "radial-gradient(circle,rgba(37,99,235,.2),transparent 65%)", borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 800, color: "#a78bfa", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: font, marginBottom: 12 }}>Prêt à conduire ?</span>
            <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.5rem)", fontWeight: 900, color: "#f1f5f9", margin: "0 0 12px", letterSpacing: "-0.03em", fontFamily: font }}>
              Réservez votre véhicule <span className="grad-text">dès maintenant</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: 15, margin: 0, maxWidth: 500, lineHeight: 1.7 }}>
              Rejoignez plus de 500 clients satisfaits. Confirmation instantanée, livraison dans l'heure.
            </p>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <button className="btn-grad" style={{ padding: "14px 32px", borderRadius: 14, fontSize: 15, display: "flex", alignItems: "center", gap: 9 }}>
                Créer un compte <ArrowRight size={16} />
              </button>
            </Link>
            <Link to="/cars" style={{ textDecoration: "none" }}>
              <button className="btn-glass" style={{ padding: "14px 32px", borderRadius: 14, fontSize: 15 }}>
                Voir le catalogue
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
