import { useEffect, useState } from "react";
import { getAllFactures, downloadFacture } from "../../factures/api/facture.service";

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function AllFacturesPage() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllFactures().then(r => { setFactures(r.data.factures); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = factures.filter(f =>
    !search ||
    f.email?.toLowerCase().includes(search.toLowerCase()) ||
    f.brand?.toLowerCase().includes(search.toLowerCase()) ||
    f.model?.toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.reduce((s, f) => s + Number(f.total), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: sans, paddingTop: 64 }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #ebebeb", padding: "36px 40px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ color: "#0a0a0a", fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>All Invoices</h1>
            <p style={{ color: "#bbb", fontSize: 13, margin: "6px 0 0" }}>{filtered.length} results</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#bbb", fontSize: 12, marginBottom: 2 }}>Showing total</div>
            <div style={{ color: "#0a0a0a", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
              {total.toFixed(2)} <span style={{ color: "#ccc", fontSize: 13, fontWeight: 400 }}>TND</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "24px 40px 80px" }}>
        {/* Search */}
        <input
          placeholder="Search by client, brand or model..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", background: "#fff", border: "1px solid #e8e8e8",
            color: "#0a0a0a", padding: "11px 16px", fontSize: 13,
            fontFamily: sans, borderRadius: 9, outline: "none",
            boxSizing: "border-box", marginBottom: 16,
          }}
        />

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, overflow: "hidden" }}>
          {loading ? (
            <div style={{ color: "#ccc", padding: "60px", textAlign: "center", fontSize: 13 }}>Loading...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                  {["#", "Client", "Vehicle", "Period", "Amount", "Date", ""].map(h => (
                    <th key={h} style={{
                      color: "#bbb", fontSize: 11, fontWeight: 600,
                      textAlign: "left", padding: "12px 20px",
                      fontFamily: sans, letterSpacing: "0.04em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ color: "#ccc", padding: "48px", textAlign: "center", fontSize: 13 }}>No invoices found.</td></tr>
                ) : filtered.map((f, i) => (
                  <tr key={f.id} style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid #f8f8f8" : "none",
                    transition: "background 0.1s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ color: "#ccc", fontSize: 12, padding: "14px 20px" }}>#{String(f.id).padStart(5, "0")}</td>
                    <td style={{ color: "#0a0a0a", fontSize: 13, fontWeight: 500, padding: "14px 20px" }}>{f.email}</td>
                    <td style={{ color: "#666", fontSize: 13, padding: "14px 20px" }}>{f.brand} {f.model}</td>
                    <td style={{ color: "#aaa", fontSize: 12, padding: "14px 20px" }}>{fmt(f.start_date)} → {fmt(f.end_date)}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ color: "#0a0a0a", fontWeight: 700, fontSize: 14 }}>{f.total}</span>
                      <span style={{ color: "#ccc", fontSize: 11, marginLeft: 4 }}>TND</span>
                    </td>
                    <td style={{ color: "#aaa", fontSize: 12, padding: "14px 20px" }}>{fmt(f.created_at)}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <button onClick={() => downloadFacture(f.id)} style={{
                        background: "none", border: "1px solid #e8e8e8",
                        color: "#aaa", padding: "5px 12px", fontSize: 11,
                        fontFamily: sans, borderRadius: 6, cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                        onMouseEnter={e => { e.target.style.borderColor = "#0a0a0a"; e.target.style.color = "#0a0a0a"; }}
                        onMouseLeave={e => { e.target.style.borderColor = "#e8e8e8"; e.target.style.color = "#aaa"; }}
                      >PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}