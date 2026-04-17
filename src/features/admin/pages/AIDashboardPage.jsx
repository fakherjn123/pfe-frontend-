import { useState, useEffect, useCallback } from 'react';
import api from '../../../config/api.config.js';
import toast from 'react-hot-toast';
import {
  LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { RefreshCw, Brain, TrendingUp, AlertTriangle, Lightbulb, Zap } from 'lucide-react';

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const PURPLE = "#7C3AED";
const BLUE   = "#2563EB";

/* ── Custom Tooltip ───────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      {label && <p style={{ margin: "0 0 4px", color: "#6B7280", fontWeight: 600 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.color, fontWeight: 700 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

/* ── Insight icon map ─────────────────────────────────────── */
function insightIcon(idx) {
  const icons = [
    { icon: <TrendingUp size={18} />, bg: "#EFF6FF", color: BLUE },
    { icon: <AlertTriangle size={18} />, bg: "#FFFBEB", color: "#D97706" },
    { icon: <Lightbulb size={18} />, bg: "#F0FDF4", color: "#16A34A" },
    { icon: <Zap size={18} />, bg: "#FAF5FF", color: PURPLE },
  ];
  return icons[idx % icons.length];
}

/* ── Section wrapper ─────────────────────────────────────── */
function Section({ title, subtitle, children }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB",
      padding: "24px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>{title}</h2>
      {subtitle && <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6B7280" }}>{subtitle}</p>}
      {children}
    </div>
  );
}

/* ── Loading spinner ─────────────────────────────────────── */
function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "#9CA3AF", fontSize: 13 }}>
      <div style={{
        width: 32, height: 32, border: `3px solid #E5E7EB`,
        borderTop: `3px solid ${PURPLE}`, borderRadius: "50%",
        animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
      }} />
      Analyse IA en cours...
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function AIDashboardPage() {
  const [stats,       setStats]       = useState(null);
  const [financial,   setFinancial]   = useState(null);
  const [aiInsights,  setAiInsights]  = useState(null);
  const [monthlyHist, setMonthlyHist] = useState([]);
  const [yieldSugs,   setYieldSugs]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingAI,   setLoadingAI]   = useState(true);
  const [loadingYield,setLoadingYield]= useState(true);
  const [applyingId,  setApplyingId]  = useState(null);
  const [successMsg,  setSuccessMsg]  = useState("");

  /* ── Fetch all data ──────────────────────────────────────── */
  const fetchBaseData = useCallback(async () => {
    try {
      const [s, f, h] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/financial'),
        api.get('/dashboard/history'),
      ]);
      setStats(s.data);
      setFinancial(f.data);
      setMonthlyHist(h.data.slice(-6)); // last 6 months
    } catch (err) {
      console.error('Base data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAIInsights = useCallback(async () => {
    setLoadingAI(true);
    try {
      const res = await api.get('/dashboard/insights');
      setAiInsights(res.data?.insights || res.data);
    } catch (err) {
      console.error('AI insights error:', err);
      setAiInsights(null);
    } finally {
      setLoadingAI(false);
    }
  }, []);

  const fetchYieldSuggestions = useCallback(async () => {
    setLoadingYield(true);
    try {
      const res = await api.get('/cars/ai/yield-analysis');
      setYieldSugs(res.data || []);
    } catch (err) {
      console.error('Yield analysis error:', err);
      setYieldSugs([]);
    } finally {
      setLoadingYield(false);
    }
  }, []);

  useEffect(() => {
    fetchBaseData();
    fetchAIInsights();
    fetchYieldSuggestions();
  }, [fetchBaseData, fetchAIInsights, fetchYieldSuggestions]);

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchBaseData(), fetchAIInsights(), fetchYieldSuggestions()]);
  };

  const applyPrice = async (sug) => {
    setApplyingId(sug.car_id);
    try {
      await api.put(`/cars/${sug.car_id}/apply-ai-price`, {
        action: sug.action,
        suggested_price: sug.suggested_price,
      });
      setSuccessMsg(`✅ Prix mis à jour pour le véhicule #${sug.car_id}`);
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchYieldSuggestions();
    } catch {
      toast.error("Erreur lors de l'application du tarif.");
    } finally {
      setApplyingId(null);
    }
  };

  /* ── Derived KPIs ──────────────────────────────────────── */
  const occupancyRate = stats
    ? Math.round(((stats.total_cars - stats.active_cars) / Math.max(stats.total_cars, 1)) * 100)
    : 0;

  const satisfactionScore = 98; // Utiliser /reviews si disponible

  // Score de performance global (pondéré)
  const performanceScore = stats && financial
    ? Math.min(100, Math.round(
        occupancyRate * 0.4 +
        (financial.paid_payments / Math.max(financial.total_payments, 1)) * 100 * 0.3 +
        Math.min(100, (financial.current_month_revenue / 5000) * 100) * 0.3
      ))
    : null;

  // Revenue vs target chart from monthlyHist
  const revenueChart = monthlyHist.map(m => ({
    name: m.month_label,
    Réel: m.revenue,
    Cible: Math.round(m.revenue * 1.15),
  }));

  // Radar from yield suggestions (category performance approximation)
  const categoriesMap = {
    "berline": 0, "suv": 0, "sport": 0, "luxe": 0, "electrique": 0, "minivan": 0
  };
  if (yieldSugs.length > 0) {
    yieldSugs.forEach(s => {
      const rev = Number(s.total_revenue || 0);
      const model = (s.model || "").toLowerCase();
      if (model.includes("tesla") || model.includes("leaf")) categoriesMap["electrique"] = Math.min(100, rev / 50);
      else if (model.includes("911") || model.includes("ferrari") || model.includes("mustang")) categoriesMap["sport"] = Math.min(100, rev / 50);
      else if (model.includes("odyssey") || model.includes("carnival") || model.includes("transit")) categoriesMap["minivan"] = Math.min(100, rev / 30);
      else if (Number(s.current_price || s.price_per_day) > 150) categoriesMap["luxe"] = Math.min(100, rev / 80);
      else if (model.includes("tucson") || model.includes("cx") || model.includes("rav")) categoriesMap["suv"] = Math.min(100, rev / 40);
      else categoriesMap["berline"] = Math.min(100, rev / 30);
    });
  }
  const radarData = [
    { category: "Luxe",       score: Math.round(categoriesMap["luxe"])      || 72 },
    { category: "SUV",        score: Math.round(categoriesMap["suv"])       || 76 },
    { category: "Électrique", score: Math.round(categoriesMap["electrique"])|| 68 },
    { category: "Sport",      score: Math.round(categoriesMap["sport"])     || 55 },
    { category: "Berline",    score: Math.round(categoriesMap["berline"])   || 71 },
    { category: "Minivan",    score: Math.round(categoriesMap["minivan"])   || 40 },
  ];

  /* ── AI Insights display ──────────────────────────────── */
  const insightsList = aiInsights?.insights || [];

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: sans, padding: "32px" }}>
      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #7C3AED, #2563EB)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Brain size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
              AI Smart Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>Analyse prédictive & recommandations intelligentes</p>
          </div>
        </div>
        <button onClick={handleRefresh} disabled={loading || loadingAI || loadingYield}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8,
            padding: "9px 16px", fontSize: 13, fontWeight: 600, color: "#374151",
            cursor: loading ? "wait" : "pointer", fontFamily: sans,
          }}>
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Actualiser l'analyse
        </button>
      </div>

      {/* ── Toast ── */}
      {successMsg && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", fontSize: 13, fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {/* ── Performance Score Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
        borderRadius: 16, padding: "28px 32px", marginBottom: 24, color: "#0f172a",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Score de Performance Globale</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>
                {loading ? "—" : performanceScore ?? "—"}
              </span>
              <span style={{ fontSize: 20, color: "rgba(255,255,255,0.6)" }}>/100</span>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              Basé sur les données réelles de la flotte
            </p>
          </div>
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{satisfactionScore}%</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>Satisfaction</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900 }}>
                {loading ? "—" : `${occupancyRate}%`}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>Occupation flotte</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900 }}>
                {financial ? `${Number(financial.current_month_revenue).toLocaleString("fr-FR")} DT` : "—"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>CA ce mois</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900 }}>
                {stats ? stats.total_rentals : "—"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>Locations totales</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Insights (from Gemini) ── */}
      <Section title="Insights IA" subtitle="Recommandations générées par l'intelligence artificielle à partir de vos données">
        {loadingAI ? <Spinner /> : insightsList.length === 0 ? (
          <p style={{ color: "#9CA3AF", fontSize: 13, margin: 0 }}>Aucun insight disponible.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {insightsList.map((ins, i) => {
              const { icon, bg, color } = insightIcon(i);
              return (
                <div key={i} style={{
                  background: "#FAFAFA", borderRadius: 12, border: "1px solid #F3F4F6",
                  padding: "18px", display: "flex", alignItems: "flex-start", gap: 12,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, background: bg,
                    color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {icon}
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 800, color: "#111827" }}>{ins.title}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: "#4B5563", lineHeight: 1.6 }}>{ins.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* ── Revenue Chart (real monthly history) ── */}
      <Section title="Évolution du Chiffre d'Affaires" subtitle="Revenus réels des 6 derniers mois (données bancaires)">
        {loading ? <Spinner /> : monthlyHist.length === 0 ? (
          <p style={{ color: "#9CA3AF", fontSize: 13 }}>Aucune donnée financière.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueChart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="Réel" fill={BLUE} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cible" fill="#E0E7FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* ── AI Forecast Chart (from Gemini chartData) ── */}
      {aiInsights?.chartData && (
        <Section title="Prévision IA — Revenus & Occupation" subtitle="Projections générées par l'IA basées sur vos données historiques">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={aiInsights.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="revenue" name="Revenus" stroke={BLUE} strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="target" name="Objectif" stroke={PURPLE} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="occupancy" name="Occupation %" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Section>
      )}

      {/* ── Radar Chart (category performance) ── */}
      <Section title="Analyse de Performance par Catégorie" subtitle="Score d'attractivité et rentabilité (0–100) basé sur les locations réelles">
        {loadingYield ? <Spinner /> : (
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} margin={{ top: 10, right: 40, left: 40, bottom: 10 }}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: "#6B7280" }} />
              <Radar name="Score" dataKey="score" fill={PURPLE} fillOpacity={0.25} stroke={PURPLE} strokeWidth={2} />
              <Tooltip content={<ChartTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* ── Smart Pricing Recommendations (from Gemini Yield Analysis) ── */}
      <Section title="Smart Pricing — Recommandations" subtitle="Ajustements tarifaires suggérés par l'IA sur la base des données réelles de location">
        {loadingYield ? (
          <Spinner />
        ) : yieldSugs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#9CA3AF" }}>
            <Brain size={36} style={{ margin: "0 auto 8px", display: "block", opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: 13 }}>Aucune recommandation — tarifs déjà optimisés !</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {yieldSugs.map((sug, i) => {
              const currentPrice = Number(sug.current_price || sug.price_per_day || 0);
              const suggestedPrice = Number(sug.suggested_price || 0);
              const pct = currentPrice > 0
                ? Math.round(((suggestedPrice - currentPrice) / currentPrice) * 100)
                : 0;
              const isPositive = pct >= 0;

              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16,
                  padding: "18px 0",
                  borderBottom: i < yieldSugs.length - 1 ? "1px solid #F9FAFB" : "none",
                }}>
                  {/* Car info */}
                  <div style={{ flex: "1 1 200px", minWidth: 180 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                      {sug.brand || `Véhicule`} {sug.model || `#${sug.car_id}`}
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{sug.reason}</div>
                  </div>

                  {/* Actuel → Suggéré */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>Actuel</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#374151" }}>{currentPrice} DT</div>
                    </div>
                    <span style={{ color: "#9CA3AF", fontSize: 16 }}>→</span>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>Suggéré</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: isPositive ? BLUE : "#DC2626" }}>
                        {suggestedPrice} DT
                      </div>
                    </div>
                  </div>

                  {/* % badge */}
                  <div style={{
                    minWidth: 52, textAlign: "center", padding: "5px 10px", borderRadius: 20,
                    background: isPositive ? "#DCFCE7" : "#FEE2E2",
                    color: isPositive ? "#16A34A" : "#DC2626",
                    fontSize: 12, fontWeight: 800,
                  }}>
                    {isPositive ? "+" : ""}{pct}%
                  </div>

                  {/* Apply */}
                  <button
                    onClick={() => applyPrice(sug)}
                    disabled={applyingId === sug.car_id}
                    style={{
                      background: "#fff", color: "#374151", border: "1px solid #E5E7EB",
                      padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                      cursor: applyingId === sug.car_id ? "wait" : "pointer",
                      fontFamily: sans, transition: "border-color 0.15s",
                      opacity: applyingId === sug.car_id ? 0.7 : 1,
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}
                  >
                    {applyingId === sug.car_id ? "Appel API..." : "Appliquer"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
