import { useEffect, useState, useRef } from "react";
import api from "../../../config/api.config";
import { Link } from "react-router-dom";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

/* ─── Inject animations ───────────────────────────────────── */
const injectCarsStyles = () => {
  if (document.getElementById('cars-page-pub-styles')) return;
  const s = document.createElement('style');
  s.id = 'cars-page-pub-styles';
  s.textContent = `
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(24px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes gradientText {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes dotFloat {
      0%,100% { opacity: 0.3; transform: translate(0, 0); }
      50% { opacity: 0.8; transform: translate(var(--dx, 10px), var(--dy, -10px)); }
    }
    .car-pub-card {
      animation: fadeUp .5s ease both;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .car-pub-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 24px 48px rgba(0,0,0,0.1);
      border-color: #000 !important;
    }
    .car-pub-card:hover .car-pub-img {
      transform: scale(1.05);
    }
    .car-pub-img { transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
    .car-pub-card:hover .arrow-circle {
      background: #000 !important;
      color: #fff !important;
      transform: translateX(4px);
    }
    .arrow-circle { transition: all 0.3s ease; }
    .filter-pill { transition: all .2s ease; }
    .filter-pill:hover { border-color: #000 !important; color: #000 !important; }
    .hero-dot {
      position: absolute;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: rgba(0,0,0,0.06);
      animation: dotFloat 4s ease-in-out infinite;
    }
  `;
  document.head.appendChild(s);
};

/* ─── Car Card ────────────────────────────────────────────── */
function CarCard({ car, index }) {
  return (
    <Link
      to={`/cars/${car.id}`}
      style={{ textDecoration: "none" }}
    >
      <div className="car-pub-card" style={{
        background: "#fff",
        border: "1px solid #ebebeb",
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        animationDelay: `${index * 0.06}s`,
      }}>
        <div style={{ height: 210, background: "#f8f9fa", position: "relative", overflow: 'hidden' }}>
          <img
            className="car-pub-img"
            src={car.image ? `http://localhost:3000${car.image}` : "/placeholder-car.jpg"}
            alt={car.brand}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", bottom: 12, left: 12,
            display: 'flex', alignItems: 'center', gap: 6,
            background: car.available ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)',
            color: '#fff', padding: '3px 10px', borderRadius: 20,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
            backdropFilter: 'blur(4px)',
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
            {car.available ? 'AVAILABLE' : 'UNAVAILABLE'}
          </div>
        </div>

        <div style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#000", fontFamily: sans, letterSpacing: '-0.02em' }}>{car.brand}</h3>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: "#aaa", fontWeight: 500 }}>{car.model}</p>
            </div>
          </div>

          {/* Description preview */}
          {car.description && (
            <p style={{
              color: '#888', fontSize: 12, lineHeight: 1.6,
              margin: '0 0 14px', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{car.description}</p>
          )}

          <div style={{
            paddingTop: 16, borderTop: "1px solid #f0f0f0",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <span style={{ fontSize: 10, color: "#bbb", display: "block", marginBottom: 3, fontWeight: 600, letterSpacing: '0.06em' }}>DAILY RATE</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#000", letterSpacing: '-0.02em' }}>
                {car.price_per_day} <span style={{ fontSize: 11, fontWeight: 500, color: "#aaa" }}>TND</span>
              </span>
            </div>
            <div className="arrow-circle" style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "#f5f5f5", color: "#999",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 600,
            }}>
              →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ brand: "", maxPrice: "" });
  const [activeFilter, setActiveFilter] = useState('all');
  const heroRef = useRef(null);

  useEffect(() => {
    injectCarsStyles();
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/cars", { params: filters });
      setCars(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter
  const filteredCars = cars.filter(car => {
    if (activeFilter === 'available') return car.available;
    if (activeFilter === 'premium') return car.price_per_day >= 200;
    return true;
  });

  // Unique brands
  const brands = [...new Set(cars.map(c => c.brand).filter(Boolean))];

  const inputStyle = {
    background: "#fff", border: "1px solid #ebebeb",
    padding: "14px 22px", fontSize: 14, borderRadius: 14,
    outline: "none", fontFamily: sans, color: "#000",
    flex: 1, minWidth: 200, transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: 'border-box',
  };

  // Floating dots for hero
  const dots = Array.from({ length: 12 }, (_, i) => ({
    left: `${10 + (i * 7) % 80}%`,
    top: `${15 + (i * 13) % 60}%`,
    dx: `${(i % 3 - 1) * 12}px`,
    dy: `${(i % 2 === 0 ? -1 : 1) * 8}px`,
    delay: `${i * 0.3}s`,
    size: 4 + (i % 3) * 2,
  }));

  return (
    <div style={{ minHeight: "100vh", background: "#fdfdfd", paddingTop: 70, fontFamily: sans }}>

      {/* ── Hero Section ──────────────────────────────── */}
      <div ref={heroRef} style={{
        padding: "72px 40px 56px", maxWidth: 1200, margin: "0 auto",
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Floating dots */}
        {dots.map((d, i) => (
          <div key={i} className="hero-dot" style={{
            left: d.left, top: d.top,
            width: d.size, height: d.size,
            '--dx': d.dx, '--dy': d.dy,
            animationDelay: d.delay,
          }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            color: "#bbb", fontSize: 12, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 24, height: 1, background: '#ddd', display: 'inline-block' }} />
            Available Fleet
          </p>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, margin: "0 0 12px",
            letterSpacing: "-0.03em", lineHeight: 1.05,
          }}>
            <span style={{ color: '#000' }}>Find your</span><br />
            <span style={{
              background: 'linear-gradient(135deg, #000 0%, #333 40%, #888 80%, #000 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradientText 6s ease infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>perfect car</span>
          </h1>

          <p style={{ color: '#999', fontSize: 15, maxWidth: 440, lineHeight: 1.7, margin: '0 0 36px' }}>
            Explore our premium fleet of vehicles. Each car is meticulously maintained for your comfort and safety.
          </p>

          {/* Search Bar */}
          <div style={{
            display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
            background: '#fff', border: '1px solid #ebebeb', borderRadius: 18,
            padding: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
              <input
                placeholder="Search brand (e.g. BMW)"
                value={filters.brand}
                onChange={e => setFilters({ ...filters, brand: e.target.value })}
                style={{ ...inputStyle, border: 'none', paddingLeft: 42, background: 'transparent' }}
                onFocus={e => e.target.style.boxShadow = 'none'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
            </div>
            <div style={{ width: 1, height: 28, background: '#f0f0f0' }} />
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>💰</span>
              <input
                type="number"
                placeholder="Max price (TND)"
                value={filters.maxPrice}
                onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                style={{ ...inputStyle, border: 'none', paddingLeft: 42, background: 'transparent' }}
                onFocus={e => e.target.style.boxShadow = 'none'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
            </div>
            <button
              onClick={fetchCars}
              style={{
                padding: "14px 36px", background: "#000", color: "#fff",
                border: "none", borderRadius: 12, fontWeight: 800,
                fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                letterSpacing: '-0.01em', flexShrink: 0,
              }}
              onMouseEnter={e => { e.target.style.opacity = "0.85"; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = 'none'; }}
            >
              Explore →
            </button>
          </div>
        </div>
      </div>

      {/* ── Results Section ───────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}>
        {/* Filters Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Discover</h2>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 500, background: '#f5f5f5', padding: '4px 12px', borderRadius: 20 }}>
              {filteredCars.length} vehicles
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'available', label: 'Available' },
              { key: 'premium', label: 'Premium' },
            ].map(f => (
              <button key={f.key} className="filter-pill" onClick={() => setActiveFilter(f.key)} style={{
                padding: '7px 16px', borderRadius: 20,
                border: `1px solid ${activeFilter === f.key ? '#000' : '#ebebeb'}`,
                background: activeFilter === f.key ? '#000' : '#fff',
                color: activeFilter === f.key ? '#fff' : '#888',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 22 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid #ebebeb', borderRadius: 18,
                overflow: 'hidden', animation: 'fadeUp .4s ease both',
                animationDelay: `${i * 0.06}s`,
              }}>
                <div style={{
                  height: 210, background: 'linear-gradient(90deg, #f5f5f5 25%, #eee 50%, #f5f5f5 75%)',
                  backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear',
                }} />
                <div style={{ padding: 22 }}>
                  <div style={{ height: 14, background: '#f0f0f0', borderRadius: 6, width: '50%', marginBottom: 8 }} />
                  <div style={{ height: 20, background: '#f0f0f0', borderRadius: 6, width: '70%', marginBottom: 20 }} />
                  <div style={{ height: 1, background: '#f5f5f5', marginBottom: 16 }} />
                  <div style={{ height: 12, background: '#f0f0f0', borderRadius: 6, width: '30%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            background: '#fff', borderRadius: 18, border: '1px solid #ebebeb',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>No vehicles found</h3>
            <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>Try different search criteria.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
            gap: 22,
          }}>
            {filteredCars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
          </div>
        )}
      </div>

      {/* Shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>
    </div>
  );
}