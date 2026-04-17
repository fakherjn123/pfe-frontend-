import { Link } from "react-router-dom";

const font = "'Poppins', 'Outfit', 'Inter', sans-serif";

const FUEL_ICONS = { electric: "⚡", hybrid: "🔋", diesel: "🛢️", essence: "⛽", default: "🚗" };
const CATEGORY_COLORS = {
  luxury: { from: "rgba(245,158,11,0.15)", to: "rgba(251,191,36,0.05)", border: "rgba(245,158,11,0.25)", text: "#fbbf24" },
  sport:  { from: "rgba(239,68,68,0.15)",  to: "rgba(239,68,68,0.05)",  border: "rgba(239,68,68,0.25)",  text: "#f87171" },
  suv:    { from: "rgba(37,99,235,0.15)",  to: "rgba(37,99,235,0.05)",  border: "rgba(37,99,235,0.25)",  text: "#60a5fa" },
  default:{ from: "rgba(124,58,237,0.15)", to: "rgba(124,58,237,0.05)", border: "rgba(124,58,237,0.25)", text: "#a78bfa" },
};

export default function CarCard({ car, index = 0, discount = 0 }) {
  const isDiscounted = discount > 0;
  const originalPrice = car.price_per_day;
  const discountedPrice = isDiscounted ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;

  const catKey = car.category?.toLowerCase();
  const catStyle = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.default;
  const fuelIcon = FUEL_ICONS[car.fuel_type?.toLowerCase()] || FUEL_ICONS.default;

  return (
    <>
      <style>{`
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .luxury-car-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px;
          overflow: hidden;
          animation: cardReveal 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
          animation-delay: ${index * 0.08}s;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.4s ease,
                      border-color 0.3s ease;
          position: relative;
          text-decoration: none;
          display: block;
        }
        .luxury-car-card:hover {
          transform: translateY(-14px) scale(1.01);
          box-shadow: 0 36px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(37,99,235,0.35);
          border-color: rgba(37,99,235,0.4);
        }
        .luxury-car-card:hover .car-img-inner { transform: scale(1.09); }
        .car-img-inner { transition: transform 0.6s cubic-bezier(0.34,1.56,0.64,1); }

        .rent-btn {
          width: 100%;
          background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
          color: #fff; border: none;
          font-family: ${font}; font-size: 14px; font-weight: 700;
          padding: 12px; border-radius: 12px; cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(37,99,235,0.3);
          letter-spacing: 0.02em;
        }
        .rent-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(37,99,235,0.45);
        }
        .rent-btn:active { transform: scale(0.98); }

        .car-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; font-family: ${font};
          padding: 4px 10px; border-radius: 100px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          white-space: nowrap;
        }
      `}</style>

      <Link to={`/cars/${car.id}`} className="luxury-car-card">
        {/* Image */}
        <div style={{ position: "relative", overflow: "hidden", height: 200 }}>
          <div className="car-img-inner" style={{ height: "100%", width: "100%" }}>
            <img
              src={car.image_url || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"}
              alt={`${car.brand} ${car.model}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { e.target.src = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"; }}
            />
          </div>

          {/* Dark overlay gradient */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(3,6,15,0.1) 0%, rgba(3,6,15,0.5) 100%)",
          }} />

          {/* Availability badge */}
          <div style={{
            position: "absolute", top: 12, left: 12,
            display: "inline-flex", alignItems: "center", gap: 5,
            background: car.available !== false ? "rgba(16,185,129,0.85)" : "rgba(239,68,68,0.85)",
            backdropFilter: "blur(8px)",
            color: "#fff", fontSize: 11, fontWeight: 700,
            padding: "4px 10px", borderRadius: 100,
            fontFamily: font, letterSpacing: "0.04em",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#fff", display: "inline-block",
            }} />
            {car.available !== false ? "Disponible" : "Indisponible"}
          </div>

          {/* Discount badge */}
          {isDiscounted && (
            <div style={{
              position: "absolute", top: 12, right: 12,
              background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
              color: "#0f172a", fontSize: 11, fontWeight: 900,
              padding: "4px 10px", borderRadius: 100,
              fontFamily: font, letterSpacing: "0.04em",
              boxShadow: "0 4px 12px rgba(245,158,11,0.4)",
            }}>
              -{discount}%
            </div>
          )}

          {/* Category tag */}
          {car.category && (
            <div style={{
              position: "absolute", bottom: 12, right: 12,
              background: catStyle.from,
              border: `1px solid ${catStyle.border}`,
              backdropFilter: "blur(8px)",
              color: catStyle.text, fontSize: 10, fontWeight: 800,
              padding: "3px 10px", borderRadius: 100,
              fontFamily: font, letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              {car.category}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "18px 20px 20px" }}>
          {/* Brand + Model */}
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: font }}>
              {car.brand}
            </span>
            <h3 style={{
              margin: "2px 0 0", fontSize: 18, fontWeight: 800,
              color: "#f1f5f9", letterSpacing: "-0.02em", fontFamily: font,
            }}>
              {car.model}
            </h3>
          </div>

          {/* Specs row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {car.year && <span className="car-pill">📅 {car.year}</span>}
            {car.seats && <span className="car-pill">💺 {car.seats} places</span>}
            {car.fuel_type && <span className="car-pill">{fuelIcon} {car.fuel_type}</span>}
            {car.transmission && <span className="car-pill">⚙️ {car.transmission}</span>}
          </div>

          {/* Price + CTA */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              {isDiscounted && (
                <span style={{ fontSize: 12, color: "#64748b", textDecoration: "line-through", fontFamily: font, display: "block", lineHeight: 1.2 }}>
                  {originalPrice} TND/j
                </span>
              )}
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{
                  fontSize: 24, fontWeight: 900, fontFamily: font,
                  background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                  WebkitBackgroundClip: "text", backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  {discountedPrice}
                </span>
                <span style={{ fontSize: 13, color: "#64748b", fontFamily: font, fontWeight: 600 }}>TND / jour</span>
              </div>
            </div>
          </div>

          <button className="rent-btn">
            Louer maintenant →
          </button>
        </div>
      </Link>
    </>
  );
}
