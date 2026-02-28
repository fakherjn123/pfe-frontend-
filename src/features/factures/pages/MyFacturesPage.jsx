// MyFacturesPage.jsx
import { useEffect, useState } from "react";
import { getMyFactures, downloadFacture } from "../api/facture.service";

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function MyFacturesPage() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyFactures().then(r => { setFactures(r.data.factures); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: sans, paddingTop: 64 }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #ebebeb", padding: "36px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ color: "#0a0a0a", fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            My Invoices
          </h1>
          <p style={{ color: "#bbb", fontSize: 13, margin: "6px 0 0" }}>{factures.length} invoice{factures.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 40px 80px" }}>
        {loading ? (
          <div style={{ color: "#ccc", padding: "60px 0", textAlign: "center", fontSize: 13 }}>Loading...</div>
        ) : factures.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, padding: "60px", textAlign: "center" }}>
            <p style={{ color: "#ccc", fontSize: 14 }}>No invoices yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {factures.map(f => (
              <div key={f.id} style={{
                background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, padding: "24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ color: "#bbb", fontSize: 11, fontWeight: 500, marginBottom: 2 }}>Invoice</div>
                    <div style={{ color: "#0a0a0a", fontSize: 14, fontWeight: 700 }}>#{String(f.id).padStart(5, "0")}</div>
                  </div>
                  <div style={{ color: "#bbb", fontSize: 12 }}>{fmt(f.created_at)}</div>
                </div>

                <div style={{ borderTop: "1px solid #f5f5f5", borderBottom: "1px solid #f5f5f5", padding: "14px 0", margin: "0 0 14px" }}>
                  <div style={{ color: "#0a0a0a", fontSize: 15, fontWeight: 700, marginBottom: 3 }}>
                    {f.brand} {f.model}
                  </div>
                  <div style={{ color: "#bbb", fontSize: 12 }}>{fmt(f.start_date)} → {fmt(f.end_date)}</div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ color: "#aaa", fontSize: 12 }}>Total</span>
                  <span style={{ color: "#0a0a0a", fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>
                    {f.total} <span style={{ color: "#ccc", fontSize: 12, fontWeight: 400 }}>TND</span>
                  </span>
                </div>

                <button onClick={() => downloadFacture(f.id)} style={{
                  width: "100%", background: "#fafafa", color: "#666",
                  border: "1px solid #e8e8e8", padding: "9px", fontSize: 12,
                  fontFamily: sans, fontWeight: 500, borderRadius: 8, cursor: "pointer",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.target.style.background = "#0a0a0a"; e.target.style.color = "#fff"; e.target.style.borderColor = "#0a0a0a"; }}
                  onMouseLeave={e => { e.target.style.background = "#fafafa"; e.target.style.color = "#666"; e.target.style.borderColor = "#e8e8e8"; }}
                >↓ Download PDF</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}