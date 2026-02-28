import { useEffect, useState } from "react";
import api from "../../../config/api.config";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

function StatCard({ label, value, note, accent = "#0a0a0a" }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #ebebeb", borderRadius: 12,
      padding: "22px 24px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <span style={{ color: "#bbb", fontSize: 12, fontWeight: 500 }}>{label}</span>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent, marginTop: 3 }} />
      </div>
      <div style={{ color: "#0a0a0a", fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
        {value ?? <span style={{ color: "#e0e0e0" }}>—</span>}
      </div>
      {note && <div style={{ color: "#bbb", fontSize: 12, marginTop: 8 }}>{note}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [topCars, setTopCars] = useState([]);

  useEffect(() => {
    api.get("/dashboard/stats").then(r => setStats(r.data)).catch(console.error);
    api.get("/dashboard/financial").then(r => setFinancial(r.data)).catch(console.error);
    api.get("/dashboard/top-cars").then(r => setTopCars(r.data)).catch(console.error);
  }, []);

  const SectionTitle = ({ children }) => (
    <h2 style={{ color: "#bbb", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>
      {children}
    </h2>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: sans, paddingTop: 64 }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ebebeb", padding: "36px 40px" }}>
        <div style={{ maxWidth: "100%", margin: "0 auto" }}>
          <p style={{ color: "#bbb", fontSize: 12, margin: "0 0 6px" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 style={{ color: "#0a0a0a", fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            Dashboard
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 40px 80px" }}>
        {/* Fleet */}
        <SectionTitle>Fleet overview</SectionTitle>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12, marginBottom: 28,
        }}>
          <StatCard label="Total vehicles" value={stats?.total_cars} accent="#6366f1" />
          <StatCard label="Active" value={stats?.active_cars} accent="#22c55e" />
          <StatCard label="Total rentals" value={stats?.total_rentals} accent="#f59e0b" />
          <StatCard label="Ongoing" value={stats?.ongoing_rentals} note="In use" accent="#0ea5e9" />
          <StatCard label="Confirmed" value={stats?.confirmed_rentals} note="Upcoming" accent="#8b5cf6" />
          <StatCard label="Users" value={stats?.total_users} accent="#f43f5e" />
        </div>

        {/* Financial */}
        <SectionTitle>Revenue</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
          <StatCard
            label="Total revenue"
            value={financial ? `${financial.total_revenue} TND` : null}
            note={`${financial?.paid_payments ?? 0} paid`}
            accent="#22c55e"
          />
          <StatCard
            label="This month"
            value={financial ? `${financial.current_month_revenue} TND` : null}
            accent="#f59e0b"
          />
          <StatCard label="Payments" value={financial?.total_payments} accent="#6366f1" />
          <StatCard label="Confirmed" value={financial?.paid_payments} accent="#0ea5e9" />
        </div>

        {/* Top cars */}
        {topCars.length > 0 && (
          <>
            <SectionTitle>Top vehicles</SectionTitle>
            <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, overflow: "hidden" }}>
              {topCars.map((car, i) => (
                <div key={car.id} style={{
                  display: "flex", alignItems: "center", padding: "16px 24px",
                  borderBottom: i < topCars.length - 1 ? "1px solid #f5f5f5" : "none",
                }}>
                  <span style={{
                    width: 24, color: "#ddd", fontSize: 13, fontWeight: 600, flexShrink: 0,
                  }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: "#0a0a0a", fontSize: 14, fontWeight: 600 }}>{car.brand} </span>
                    <span style={{ color: "#aaa", fontSize: 14 }}>{car.model}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      height: 4, borderRadius: 2,
                      width: `${Math.max(24, (car.total_rentals / (topCars[0]?.total_rentals || 1)) * 80)}px`,
                      background: "#f0f0f0",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: 2, background: "#0a0a0a",
                        width: `${(car.total_rentals / (topCars[0]?.total_rentals || 1)) * 100}%`,
                      }} />
                    </div>
                    <span style={{ color: "#0a0a0a", fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: "right" }}>
                      {car.total_rentals}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Quick links */}
        <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
          {[{ label: "All invoices", href: "/admin/factures" }, { label: "Browse fleet", href: "/" }].map(({ label, href }) => (
            <a key={label} href={href} style={{
              color: "#666", textDecoration: "none", fontSize: 13, fontWeight: 500,
              padding: "9px 18px", border: "1px solid #e8e8e8", borderRadius: 8,
              background: "#fff", transition: "all 0.15s", display: "inline-block",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#999"; e.currentTarget.style.color = "#0a0a0a"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.color = "#666"; }}
            >{label} →</a>
          ))}
        </div>
      </div>
    </div>
  );
}