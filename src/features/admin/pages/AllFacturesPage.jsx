import React, { useEffect, useState } from "react";
import { getAllFactures, downloadFacture } from "../../factures/api/facture.service";
import { Search, FileText, Download, Calendar, Mail, Car, Receipt } from "lucide-react";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

export default function AllFacturesPage() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllFactures()
      .then(r => {
        setFactures(r.data.factures || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = factures.filter(f =>
    !search ||
    f.email?.toLowerCase().includes(search.toLowerCase()) ||
    f.brand?.toLowerCase().includes(search.toLowerCase()) ||
    f.model?.toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.reduce((s, f) => s + Number(f.total), 0);

  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatDateFull = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={{ fontFamily: sans, minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* ── Header ────────────────────────────────────────── */}
      <div style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)", borderBottom: "1px solid #e2e8f0",
          padding: "60px 40px", position: "relative", overflow: "hidden"
      }}>
          {/* Glow Effects */}
          <div style={{
              position: 'absolute', top: -100, right: 100, width: 300, height: 300,
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
              borderRadius: '50%', pointerEvents: 'none'
          }} />
          
          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      <div style={{
                          width: 72, height: 72, background: 'rgba(0,0,0,0.02)', borderRadius: 24,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: "#0f172a",
                          border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'
                      }}>
                          <Receipt size={32} />
                      </div>
                      <div>
                          <h1 style={{ color: "#0f172a", fontSize: 36, fontWeight: 900, margin: '0 0 8px', letterSpacing: "-0.02em" }}>
                              Factures
                          </h1>
                          <p style={{ color: "#94a3b8", fontSize: 16, margin: 0, fontWeight: 500 }}>
                              Vérifiez et téléchargez l'historique des factures de vos clients.
                          </p>
                      </div>
                  </div>
                  <div style={{ textAlign: "right", background: "#ffffff", padding: '16px 24px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ color: "#64748b", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                          Total Affiché
                      </div>
                      <div style={{ color: "#10b981", fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em" }}>
                          {formatCurrency(total)} <span style={{ fontSize: 16, color: "#64748b" }}>TND</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "-32px auto 80px", padding: "0 40px", position: "relative", zIndex: 10 }}>
          {/* Search */}
          <div style={{
              background: "#fff", borderRadius: 24, padding: "24px", marginBottom: 24,
              boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: "1px solid #e2e8f0",
              display: 'flex', alignItems: 'center', gap: 16
          }}>
              <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={20} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                      style={{
                          width: '100%', padding: '16px 20px 16px 56px', background: '#f8fafc',
                          border: '1px solid transparent', borderRadius: 16, fontSize: 15,
                          color: '#0f172a', fontWeight: 500, outline: 'none', transition: 'all 0.2s',
                          boxSizing: 'border-box'
                      }}
                      onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = '0 0 0 4px #f1f5f9'; }}
                      onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                      placeholder="Rechercher par client, marque ou modèle..."
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                  />
              </div>
          </div>

          {/* Table container */}
          <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e2e8f0", boxShadow: '0 10px 30px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", textAlign: "left" }}>
                      <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                              <th style={{ padding: "20px 24px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>N° Facture</th>
                              <th style={{ padding: "20px 24px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>Client</th>
                              <th style={{ padding: "20px 24px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>Véhicule / Période</th>
                              <th style={{ padding: "20px 24px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>Date d'édition</th>
                              <th style={{ padding: "20px 24px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em", textAlign: "right" }}>Montant</th>
                              <th style={{ padding: "20px 24px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em", textAlign: "center" }}>Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          {loading ? (
                              <tr>
                                  <td colSpan="6" style={{ padding: "64px 24px", textAlign: "center", color: "#94a3b8" }}>
                                      <div style={{ fontSize: 15, fontWeight: 600 }}>Chargement des factures...</div>
                                  </td>
                              </tr>
                          ) : filtered.length === 0 ? (
                              <tr>
                                  <td colSpan="6" style={{ padding: "80px 24px", textAlign: "center" }}>
                                      <div style={{ width: 64, height: 64, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#94a3b8' }}>
                                          <Receipt size={32} />
                                      </div>
                                      <div style={{ color: "#0f172a", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Aucune facture trouvée</div>
                                      <div style={{ color: "#64748b", fontSize: 15 }}>Il n'y a pas de résultat pour "{search}".</div>
                                  </td>
                              </tr>
                          ) : (
                              filtered.map((f) => (
                                  <tr key={f.id}
                                      style={{ borderBottom: "1px solid #f1f5f9", transition: "all 0.2s" }}
                                      onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.querySelector('td:last-child button').style.transform = 'translateY(-2px)'; e.currentTarget.querySelector('td:last-child button').style.boxShadow = '0 4px 12px rgba(99,102,241,0.15)'; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.querySelector('td:last-child button').style.transform = 'none'; e.currentTarget.querySelector('td:last-child button').style.boxShadow = 'none'; }}
                                  >
                                      {/* Invoice ID */}
                                      <td style={{ padding: "20px 24px" }}>
                                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f5f9', color: '#475569', fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                              <FileText size={14} /> #{String(f.id).padStart(5, "0")}
                                          </div>
                                      </td>

                                      {/* Client */}
                                      <td style={{ padding: "20px 24px" }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#0f172a", fontSize: 14, fontWeight: 700 }}>
                                              <Mail size={16} color="#94a3b8" />
                                              {f.email}
                                          </div>
                                      </td>

                                      {/* Car & Dates */}
                                      <td style={{ padding: "20px 24px" }}>
                                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#0f172a", fontSize: 14, fontWeight: 700 }}>
                                                  <Car size={16} color="#94a3b8" />
                                                  {f.brand} {f.model}
                                              </div>
                                              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 12, fontWeight: 600 }}>
                                                  <Calendar size={14} color="#94a3b8" />
                                                  {formatDateShort(f.start_date)} <span style={{ color: '#cbd5e1' }}>→</span> {formatDateShort(f.end_date)}
                                              </div>
                                          </div>
                                      </td>

                                      {/* Creation Date */}
                                      <td style={{ padding: "20px 24px", color: "#64748b", fontSize: 13, fontWeight: 600 }}>
                                          {formatDateFull(f.created_at)}
                                      </td>

                                      {/* Amount */}
                                      <td style={{ padding: "20px 24px", textAlign: "right" }}>
                                          <div style={{ color: "#059669", fontSize: 16, fontWeight: 900, background: '#ecfdf5', padding: '4px 10px', borderRadius: 8, display: 'inline-block' }}>
                                              {formatCurrency(f.total)} <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: '0.04em' }}>TND</span>
                                          </div>
                                      </td>

                                      {/* Action */}
                                      <td style={{ padding: "20px 24px", textAlign: "center" }}>
                                          <button style={{
                                              width: 36, height: 36, borderRadius: '10px', background: '#eef2ff', color: '#6366f1', border: '1px solid #e0e7ff',
                                              display: 'flex', alignItems: 'center', justifySelf: 'center', transition: 'all 0.2s', cursor: 'pointer', margin: '0 auto'
                                          }}
                                          onClick={() => downloadFacture(f.id)}
                                          title="Télécharger"
                                          >
                                              <Download size={18} style={{ margin: 'auto' }} />
                                          </button>
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
              
              <div style={{ padding: "16px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", color: "#64748b", fontSize: 13, fontWeight: 600 }}>
                  {loading ? '...' : `Total : ${filtered.length} facture(s)`}
              </div>
          </div>
      </div>
      
      <style>{`
          input::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  );
}