import { useEffect, useState } from "react";
import { getCars } from "../api/car.service";
import { Link } from "react-router-dom";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

function CarCard({ car }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={`/cars/${car.id}`}
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: "#fff",
        border: `1px solid ${hovered ? "#c8c8c8" : "#ebebeb"}`,
        borderRadius: 12,
        padding: "28px 24px",
        transition: "all 0.2s",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.07)" : "0 1px 4px rgba(0,0,0,0.03)",
        transform: hovered ? "translateY(-2px)" : "none",
        cursor: "pointer",
      }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", marginTop: 5,
            background: car.available ? "#22c55e" : "#f87171",
          }} />
          <span style={{
            fontSize: 11, color: "#bbb", fontWeight: 400, letterSpacing: "0.04em",
          }}>#{String(car.id).padStart(3, "0")}</span>
        </div>

        {/* Name */}
        <h3 style={{
          color: "#0a0a0a", fontFamily: sans, fontWeight: 700,
          fontSize: 18, margin: "0 0 3px", letterSpacing: "-0.01em",
        }}>{car.brand}</h3>
        <p style={{
          color: "#aaa", fontFamily: sans, fontSize: 13,
          margin: "0 0 24px", fontWeight: 400,
        }}>{car.model}</p>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 16, borderTop: "1px solid #f0f0f0",
        }}>
          <div>
            <span style={{ color: "#bbb", fontSize: 11 }}>per day</span>
            <div style={{ color: "#0a0a0a", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}>
              {car.price_per_day} <span style={{ color: "#ccc", fontSize: 12, fontWeight: 400 }}>TND</span>
            </div>
          </div>
          <div style={{
            background: hovered ? "#0a0a0a" : "#f5f5f5",
            color: hovered ? "#fff" : "#999",
            width: 32, height: 32, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, transition: "all 0.2s",
          }}>→</div>
        </div>
      </div>
    </Link>
  );
}

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [filters, setFilters] = useState({ brand: "", maxPrice: "", available: "" });
  const [loading, setLoading] = useState(true);

  const fetchCars = async () => {
    setLoading(true);
    const params = {};
    if (filters.brand) params.brand = filters.brand;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.available !== "") params.available = filters.available;
    const res = await getCars(params);
    setCars(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchCars(); }, []);

  const inputStyle = {
    background: "#fff", border: "1px solid #e8e8e8",
    color: "#0a0a0a", padding: "9px 14px", fontSize: 13,
    fontFamily: sans, borderRadius: 8, outline: "none",
    flex: 1, minWidth: 140, transition: "border 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: sans, paddingTop: 64 }}>
      {/* Hero */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ebebeb", padding: "56px 40px 40px" }}>
        <div style={{ maxWidth: "100%", margin: "0 auto" }}>
          <p style={{ color: "#bbb", fontSize: 12, letterSpacing: "0.12em", margin: "0 0 10px", fontWeight: 500, textTransform: "uppercase" }}>
            Available Fleet
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <h1 style={{
              color: "#0a0a0a", fontWeight: 800, fontSize: "clamp(28px, 4vw, 48px)",
              margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1,
            }}>Find your<br />perfect car</h1>
            <span style={{ color: "#bbb", fontSize: 13 }}>{cars.length} vehicles</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "100%", margin: "0 auto", padding: "32px 40px 80px" }}>
        {/* Filters */}
        <div style={{
          background: "#fff", border: "1px solid #ebebeb", borderRadius: 12,
          padding: "16px 20px", marginBottom: 28,
          display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
        }}>
          <input
            placeholder="Brand (e.g. BMW)"
            value={filters.brand}
            onChange={e => setFilters(f => ({ ...f, brand: e.target.value }))}
            style={inputStyle}
          />
          <input
            placeholder="Max price (TND)"
            type="number"
            value={filters.maxPrice}
            onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
            style={inputStyle}
          />
          <select
            value={filters.available}
            onChange={e => setFilters(f => ({ ...f, available: e.target.value }))}
            style={{ ...inputStyle, flex: "unset", color: filters.available ? "#0a0a0a" : "#aaa" }}
          >
            <option value="">All status</option>
            <option value="true">Available</option>
            <option value="false">Rented</option>
          </select>
          <button
            onClick={fetchCars}
            style={{
              background: "#0a0a0a", color: "#fff", border: "none",
              padding: "9px 22px", fontSize: 13, fontFamily: sans,
              fontWeight: 600, borderRadius: 8, cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >Search</button>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ color: "#ccc", padding: "80px 0", textAlign: "center", fontSize: 13 }}>Loading vehicles...</div>
        ) : cars.length === 0 ? (
          <div style={{ color: "#ccc", padding: "80px 0", textAlign: "center", fontSize: 13 }}>No vehicles found.</div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}>
            {cars.map(car => <CarCard key={car.id} car={car} />)}
          </div>
        )}
      </div>
    </div>
  );
}