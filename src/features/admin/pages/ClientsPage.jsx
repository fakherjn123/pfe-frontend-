import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClients } from '../api/client.service';
import { Search, Users, ExternalLink } from 'lucide-react';

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const BLUE = "#2563EB";

// ── KPI Card ─────────────────────────────────────────────────
function KpiCard({ icon, value, label, color = "#374151", bg = "#F9FAFB" }) {
  return (
    <div style={{
      flex: 1, minWidth: 150, background: "#fff",
      border: "1px solid #E5E7EB", borderRadius: 14,
      padding: "20px 22px",
    }}>
      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "#6B7280", marginTop: 6 }}>{label}</div>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────
function Avatar({ src, name }) {
  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (src) {
    return (
      <img
        src={src.startsWith("http") ? src : `http://localhost:3000${src}`}
        alt={name}
        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        onError={e => { e.target.style.display = "none"; }}
      />
    );
  }
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", background: "#E5E7EB",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 800, color: "#374151", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ── Permis badge ──────────────────────────────────────────────
function PermisBadge({ status }) {
  if (status === "approved") {
    return (
      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#059669", fontWeight: 600 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", border: "2px solid #059669", display: "inline-block" }} />
        Vérifié
      </span>
    );
  }
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#D97706", fontWeight: 600 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", border: "2px solid #D97706", display: "inline-block" }} />
      Non vérifié
    </span>
  );
}

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ active }) {
  return active ? (
    <span style={{
      display: "inline-block", background: "#ECFDF5", color: "#059669",
      border: "1px solid #A7F3D0", borderRadius: 20, padding: "3px 12px",
      fontSize: 12, fontWeight: 700,
    }}>Actif</span>
  ) : (
    <span style={{
      display: "inline-block", background: "#F9FAFB", color: "#6B7280",
      border: "1px solid #E5E7EB", borderRadius: 20, padding: "3px 12px",
      fontSize: 12, fontWeight: 700,
    }}>Inactif</span>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function ClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getClients()
      .then(res => setClients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Derived stats ─────────────────────────────────────────
  const totalCA    = clients.reduce((s, c) => s + Number(c.total_spent || 0), 0);
  const actifs     = clients.filter(c => c.total_rentals > 0).length;
  const permisOk   = clients.filter(c => c.driving_license_status === "approved").length;

  // ── Filter ────────────────────────────────────────────────
  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q);
    const isActive = c.total_rentals > 0;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && isActive) ||
      (statusFilter === "inactive" && !isActive) ||
      (statusFilter === "verified" && c.driving_license_status === "approved") ||
      (statusFilter === "unverified" && c.driving_license_status !== "approved");
    return matchSearch && matchStatus;
  });

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: sans, padding: "32px" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Users size={24} color="#374151" />
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
            Gestion Clients
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
          {clients.length} client{clients.length !== 1 ? "s" : ""} enregistré{clients.length !== 1 ? "s" : ""}&nbsp;·&nbsp;
          {totalCA.toLocaleString("fr-FR")} DT de chiffre d'affaires
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KpiCard icon="👥" value={clients.length} label="Total clients"  color="#374151" />
        <KpiCard icon="✅" value={actifs}          label="Actifs"        color="#059669" />
        <KpiCard icon="🪪" value={permisOk}        label="Permis vérifiés" color={BLUE}  />
        <KpiCard
          icon="💰"
          value={<>{totalCA.toLocaleString("fr-FR")} <span style={{ fontSize: 16 }}>DT</span></>}
          label="CA total"
          color="#D97706"
        />
      </div>

      {/* ── Search + Filter ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={14} style={{
            position: "absolute", left: 11, top: "50%",
            transform: "translateY(-50%)", color: "#9CA3AF",
          }} />
          <input
            placeholder="Nom, email, téléphone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", paddingLeft: 32, paddingRight: 12, height: 36,
              border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13,
              fontFamily: sans, outline: "none", boxSizing: "border-box",
              background: "#fff", color: "#374151",
            }}
            onFocus={e => e.target.style.borderColor = BLUE}
            onBlur={e => e.target.style.borderColor = "#E5E7EB"}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            height: 36, border: "1px solid #E5E7EB", borderRadius: 8,
            padding: "0 12px", fontSize: 13, fontFamily: sans,
            background: "#fff", color: "#374151", cursor: "pointer",
            outline: "none", minWidth: 140, appearance: "auto",
          }}
        >
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
          <option value="verified">Permis vérifié</option>
          <option value="unverified">Non vérifié</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB",
        overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
            Aucun client trouvé.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
                {["Client", "Contact", "Membre depuis", "Locations", "Dépensé", "Points", "Permis", "Statut", ""].map(h => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: "left",
                    fontSize: 12, fontWeight: 700, color: "#6B7280",
                    letterSpacing: "0.04em", textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((client, idx) => {
                const isActive = client.total_rentals > 0;
                return (
                  <tr
                    key={client.id}
                    style={{
                      borderBottom: idx < filtered.length - 1 ? "1px solid #F9FAFB" : "none",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Client */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar src={client.avatar || client.profile_picture} name={client.name} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                            {client.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 12, color: "#374151" }}>{client.email}</div>
                      {client.phone && (
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{client.phone}</div>
                      )}
                    </td>

                    {/* Membre depuis */}
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#374151", whiteSpace: "nowrap" }}>
                      {fmtDate(client.created_at)}
                    </td>

                    {/* Locations */}
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#374151", textAlign: "center" }}>
                      {client.total_rentals || 0}
                    </td>

                    {/* Dépensé */}
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                        {Number(client.total_spent || 0).toLocaleString("fr-FR")}
                      </div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>DT</div>
                    </td>

                    {/* Points */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 16 }}>🏆</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#D97706" }}>
                          {client.points || 0}
                        </span>
                      </div>
                    </td>

                    {/* Permis */}
                    <td style={{ padding: "14px 16px" }}>
                      <PermisBadge status={client.driving_license_status} />
                    </td>

                    {/* Statut */}
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge active={isActive} />
                    </td>

                    {/* Voir */}
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        onClick={() => navigate(`/admin/clients/${client.id}`, { state: { client } })}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 4,
                          fontSize: 13, fontWeight: 600, color: BLUE,
                          padding: "4px 2px", fontFamily: sans,
                        }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                      >
                        Voir <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Footer count */}
        {!loading && (
          <div style={{
            padding: "10px 16px", borderTop: "1px solid #F3F4F6",
            background: "#FAFAFA", fontSize: 12, color: "#9CA3AF",
          }}>
            {filtered.length} client{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
