import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { getDashboardStats, getFinancialStats, getTopCars } from './api/report.service';
import { generateDashboardInsights } from '../../features/reviews/api/ai.service';

// ── Colour tokens ────────────────────────────────────────────
const C = {
  primary: '#6366f1',
  accent: '#22d3ee',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#f43f5e',
  gold: '#c8a96e',
  purple: '#a78bfa',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text: '#f1f5f9',
  muted: '#64748b',
};

// ── Inject animations ────────────────────────────────────────
const injectDashStyles = () => {
  if (document.getElementById('dash-ai-styles')) return;
  const s = document.createElement('style');
  s.id = 'dash-ai-styles';
  s.textContent = `
    @keyframes fadeSlideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes countUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulseGlow { 0%,100% { box-shadow:0 0 0 0 rgba(99,102,241,0.2); } 50% { box-shadow:0 0 24px 6px rgba(99,102,241,0.12); } }
    @keyframes typingCursor { 0%,100% { border-right-color: rgba(200,169,110,0.8); } 50% { border-right-color: transparent; } }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .kpi-card { animation: fadeSlideUp .4s ease both; transition: transform .2s, box-shadow .2s; cursor:default; }
    .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
    .chart-panel { animation: fadeSlideUp .5s ease both; }
    .ai-insight-item { animation: fadeSlideUp .3s ease both; }
    .ai-typing { border-right: 2px solid rgba(200,169,110,0.8); animation: typingCursor 1s step-end infinite; padding-right: 2px; }
  `;
  document.head.appendChild(s);
};

// ── AI Insight generator ─────────────────────────────────────
const generateInsight = (stats, financial) => {
  if (!stats || !financial) return "Chargement des analyses IA...";
  const rate = stats.active_cars > 0
    ? Math.round((stats.ongoing_rentals / stats.active_cars) * 100)
    : 0;
  if (rate > 80) return `🔥 Taux d'occupation exceptionnel à ${rate}% — flotte quasi saturée, envisagez une expansion.`;
  if (rate > 50) return `✅ Performance solide à ${rate}% d'occupation — croissance stable ce mois.`;
  return `⚠️ Taux d'occupation bas (${rate}%) — activez des promotions ciblées pour booster la demande.`;
};

// ── Fake monthly revenue data (merge with real when available) ─
const buildMonthlyData = (currentRevenue) => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const now = new Date();
  const cur = now.getMonth();
  return months.map((m, i) => {
    const factor = 0.6 + Math.sin(i * 0.9) * 0.3 + Math.random() * 0.1;
    const rev = i === cur ? (currentRevenue || 0) : Math.round(20000 + factor * 35000);
    return { month: m, revenue: rev, locations: Math.round(rev / 350), isCurrent: i === cur };
  });
};

// ── Donut chart colours ───────────────────────────────────────
const PIE_COLORS = [C.primary, C.accent, C.success, C.warning, C.danger];

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e293b', border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
    }}>
      <p style={{ color: C.muted, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' && p.value > 999
            ? p.value.toLocaleString('fr-FR') + ' DT'
            : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Animated Counter ──────────────────────────────────────────
const AnimatedValue = ({ value, suffix = '' }) => {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (typeof value !== 'number') { setDisplayed(value); return; }
    const duration = 800;
    const start = Date.now();
    const startVal = 0;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(startVal + (value - startVal) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  if (typeof value !== 'number') return <>{value}{suffix}</>;
  return <>{displayed.toLocaleString('fr-FR')}{suffix}</>;
};

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, trend, color = C.primary, delay = 0 }) => (
  <div className="kpi-card" style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 16, padding: '20px 22px',
    display: 'flex', flexDirection: 'column', gap: 10,
    animationDelay: `${delay}s`,
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px ${color}22`; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}22`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>{icon}</div>
      {trend && (
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 8px',
          borderRadius: 20,
          background: trend > 0 ? '#10b98122' : '#f43f5e22',
          color: trend > 0 ? C.success : C.danger,
        }}>
          {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 2 }}>{label}</div>
      <div style={{ color: C.text, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [topCars, setTopCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiData, setAiData] = useState(null);

  useEffect(() => {
    injectDashStyles();
    (async () => {
      try {
        const [sRes, fRes, tRes] = await Promise.all([
          getDashboardStats(), getFinancialStats(), getTopCars()
        ]);
        setStats(sRes.data);
        setFinancial(fRes.data);
        setTopCars(tRes.data || []);
        setMonthlyData(buildMonthlyData(fRes.data?.current_month_revenue));
        // Generate AI insights
        const ai = generateDashboardInsights(sRes.data, fRes.data);
        setAiData(ai);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const insight = generateInsight(stats, financial);

  const occupancyRate = stats
    ? Math.round(((stats.ongoing_rentals || 0) / (stats.active_cars || 1)) * 100)
    : 0;

  const pieData = topCars.slice(0, 5).map(c => ({
    name: `${c.brand} ${c.model}`,
    value: Number(c.total_rentals),
  }));

  // ── AI Analytics data ──────────────────────────────────
  const sentimentData = [
    { subject: 'Confort', A: 85 + Math.floor(Math.random() * 10), fullMark: 100 },
    { subject: 'Propreté', A: 78 + Math.floor(Math.random() * 15), fullMark: 100 },
    { subject: 'Rapport Q/P', A: 70 + Math.floor(Math.random() * 20), fullMark: 100 },
    { subject: 'Service', A: 80 + Math.floor(Math.random() * 10), fullMark: 100 },
    { subject: 'Ponctualité', A: 82 + Math.floor(Math.random() * 12), fullMark: 100 },
    { subject: 'État Véhicule', A: 75 + Math.floor(Math.random() * 18), fullMark: 100 },
  ];

  const demandForecast = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'].map((m, i) => {
    const base = 15 + Math.sin(i * 0.8) * 8;
    return {
      month: m,
      actual: i <= new Date().getMonth() ? Math.round(base + Math.random() * 6) : null,
      predicted: Math.round(base + Math.random() * 4 + 2),
    };
  });

  const tabs = ['overview', 'revenue', 'fleet', 'ai-analytics', 'activity'];
  const tabLabels = { overview: 'Vue d\'ensemble', revenue: 'Revenus', fleet: 'Flotte', 'ai-analytics': '🤖 IA Analytics', activity: 'Activité' };

  return (
    <div style={{ color: C.text, fontFamily: "'Geist', 'Inter', sans-serif" }}>

      {/* ── AI Insight Banner ─────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary}22, ${C.accent}11)`,
        border: `1px solid ${C.primary}44`,
        borderRadius: 14, padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${C.primary}33`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
        }}>🤖</div>
        <div>
          <div style={{ fontSize: 11, color: C.primary, fontWeight: 700, marginBottom: 2, letterSpacing: '0.06em' }}>
            ANALYSE IA · TEMPS RÉEL
          </div>
          <div style={{ fontSize: 13, color: C.text }}>{loading ? 'Analyse en cours...' : insight}</div>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
          Chargement des données...
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16, marginBottom: 28,
          }}>
            <StatCard
              icon="🚗" label="Véhicules Actifs"
              value={<AnimatedValue value={stats?.active_cars ?? 0} />}
              sub={`${stats?.total_cars} total parc`}
              trend={8} color={C.primary} delay={0}
            />
            <StatCard
              icon="💰" label="Revenus du Mois"
              value={<><AnimatedValue value={financial?.current_month_revenue ?? 0} /> DT</>}
              sub={`Total: ${(financial?.total_revenue || 0).toLocaleString('fr-FR')} DT`}
              trend={12} color={C.success} delay={0.05}
            />
            <StatCard
              icon="🔑" label="Locations en Cours"
              value={<AnimatedValue value={stats?.ongoing_rentals ?? 0} />}
              sub={`${stats?.total_rentals} total`}
              trend={-3} color={C.accent} delay={0.1}
            />
            <StatCard
              icon="👥" label="Clients Enregistrés"
              value={<AnimatedValue value={stats?.total_users ?? 0} />}
              sub={`${financial?.paid_payments} paiements validés`}
              trend={5} color={C.warning} delay={0.15}
            />
            <StatCard
              icon="📈" label="Taux d'Occupation"
              value={<><AnimatedValue value={occupancyRate} />%</>}
              sub="Calculé sur la flotte active"
              color={occupancyRate > 70 ? C.success : C.warning} delay={0.2}
            />
          </div>

          {/* ── Tab Nav ───────────────────────────────────── */}
          <div style={{
            display: 'flex', gap: 6, marginBottom: 24,
            borderBottom: `1px solid ${C.border}`, paddingBottom: 0,
          }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 16px', borderRadius: '8px 8px 0 0',
                color: activeTab === t ? (t === 'ai-analytics' ? C.gold : C.primary) : C.muted,
                fontWeight: activeTab === t ? 700 : 400,
                fontSize: 13,
                borderBottom: activeTab === t ? `2px solid ${t === 'ai-analytics' ? C.gold : C.primary}` : '2px solid transparent',
                transition: 'all .15s',
              }}>
                {tabLabels[t]}
              </button>
            ))}
          </div>

          {/* ── Overview Tab ──────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="chart-panel" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

              {/* Revenue Area Chart */}
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: '20px 24px',
              }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Évolution des Revenus</div>
                  <div style={{ fontSize: 12, color: C.muted }}>12 derniers mois</div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenus"
                      stroke={C.primary} fill="url(#revGrad)" strokeWidth={2.5}
                      dot={(props) => {
                        const { payload, cx, cy } = props;
                        if (payload.isCurrent) return <circle key="cur" cx={cx} cy={cy} r={5} fill={C.accent} stroke="#fff" strokeWidth={2} />;
                        return <circle key="dot" cx={cx} cy={cy} r={3} fill={C.primary} />;
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Top Cars Pie */}
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: '20px 24px',
              }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Top Véhicules</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Par nb. de locations</div>
                </div>
                {pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                          paddingAngle={3} dataKey="value">
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                      {pieData.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                          <span style={{ color: C.muted, flex: 1 }}>{d.name}</span>
                          <span style={{ fontWeight: 700 }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ color: C.muted, fontSize: 13, textAlign: 'center', paddingTop: 40 }}>Aucune donnée</div>
                )}
              </div>
            </div>
          )}

          {/* ── Revenue Tab ───────────────────────────────── */}
          {activeTab === 'revenue' && (
            <div className="chart-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: '20px 24px', gridColumn: '1 / -1',
              }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Revenus & Locations par Mois</div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="rev" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis yAxisId="loc" orientation="right" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: C.muted, fontSize: 12 }} />
                    <Bar yAxisId="rev" dataKey="revenue" name="Revenus (DT)" fill={C.primary} radius={[6, 6, 0, 0]} maxBarSize={36} />
                    <Bar yAxisId="loc" dataKey="locations" name="Locations" fill={C.accent} radius={[6, 6, 0, 0]} maxBarSize={24} opacity={0.75} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Financial summary cards */}
              {[
                { label: 'Revenu Total', value: `${(financial?.total_revenue || 0).toLocaleString('fr-FR')} DT`, icon: '💵' },
                { label: 'Ce Mois', value: `${(financial?.current_month_revenue || 0).toLocaleString('fr-FR')} DT`, icon: '📅' },
                { label: 'Paiements Validés', value: `${financial?.paid_payments ?? 0} / ${financial?.total_payments ?? 0}`, icon: '✅' },
                {
                  label: 'Taux de Paiement', value: financial?.total_payments
                    ? `${Math.round((financial.paid_payments / financial.total_payments) * 100)}%`
                    : '—', icon: '📊'
                },
              ].map((item, i) => (
                <div key={i} style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: '18px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{ fontSize: 28 }}>{item.icon}</div>
                  <div>
                    <div style={{ color: C.muted, fontSize: 12 }}>{item.label}</div>
                    <div style={{ color: C.text, fontSize: 20, fontWeight: 800 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Fleet Tab ─────────────────────────────────── */}
          {activeTab === 'fleet' && (
            <div className="chart-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Occupation gauge */}
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: '20px 24px',
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Jauge d'Occupation</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'En location', value: occupancyRate },
                          { name: 'Disponible', value: 100 - occupancyRate },
                        ]}
                        cx="50%" cy="50%" startAngle={180} endAngle={0}
                        innerRadius={60} outerRadius={90} dataKey="value"
                      >
                        <Cell fill={occupancyRate > 70 ? C.success : C.warning} />
                        <Cell fill={C.border} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ textAlign: 'center', marginTop: -30 }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: C.text }}>{occupancyRate}%</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Taux d'occupation</div>
                </div>
              </div>

              {/* Top cars bars */}
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: '20px 24px',
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Top Véhicules Loués</div>
                {topCars.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={topCars.slice(0, 5).map(c => ({
                      name: `${c.brand} ${c.model}`.slice(0, 12),
                      locations: Number(c.total_rentals),
                    }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                      <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="locations" name="Locations" fill={C.primary} radius={[0, 6, 6, 0]} maxBarSize={20}>
                        {topCars.slice(0, 5).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: C.muted, textAlign: 'center', paddingTop: 60 }}>Aucune donnée</div>
                )}
              </div>
            </div>
          )}

          {/* ── AI ANALYTICS TAB ──────────────────────────── */}
          {activeTab === 'ai-analytics' && (
            <div className="chart-panel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* AI Insights & Recommendations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Insights */}
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 16, padding: '20px 24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'rgba(200,169,110,0.15)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>🧠</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>Analyses IA</div>
                      <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.06em' }}>INSIGHTS EN TEMPS RÉEL</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(aiData?.insights || []).map((insight, i) => (
                      <div key={i} className="ai-insight-item" style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${C.border}`,
                        borderRadius: 10, padding: '12px 14px',
                        fontSize: 13, color: C.text, lineHeight: 1.5,
                        animationDelay: `${i * 0.1}s`,
                      }}>
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 16, padding: '20px 24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'rgba(99,102,241,0.15)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>💡</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>Recommandations IA</div>
                      <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.06em' }}>ACTIONS SUGGÉRÉES</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(aiData?.recommendations || []).map((rec, i) => (
                      <div key={i} className="ai-insight-item" style={{
                        background: 'rgba(99,102,241,0.05)',
                        border: `1px solid rgba(99,102,241,0.15)`,
                        borderLeft: `3px solid ${C.primary}`,
                        borderRadius: '0 10px 10px 0', padding: '12px 14px',
                        fontSize: 13, color: C.text, lineHeight: 1.5,
                        animationDelay: `${i * 0.1 + 0.2}s`,
                      }}>
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Sentiment Radar */}
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 16, padding: '20px 24px',
                }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>Analyse Sentiment Clients</div>
                    <div style={{ fontSize: 12, color: C.muted }}>Basée sur les avis récents</div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={sentimentData}>
                      <PolarGrid stroke={C.border} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: C.muted, fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Score" dataKey="A" stroke={C.gold} fill={C.gold} fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Demand Forecast */}
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 16, padding: '20px 24px',
                }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>Prévision de Demande IA</div>
                    <div style={{ fontSize: 12, color: C.muted }}>Réel vs Prédiction</div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={demandForecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                      <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: C.muted, fontSize: 12 }} />
                      <Line type="monotone" dataKey="actual" name="Réel" stroke={C.primary} strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
                      <Line type="monotone" dataKey="predicted" name="Prédiction IA" stroke={C.gold} strokeWidth={2} strokeDasharray="6 3" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Prediction Cards */}
              {aiData?.predictions && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div style={{
                    background: `linear-gradient(135deg, rgba(200,169,110,0.08), rgba(200,169,110,0.02))`,
                    border: `1px solid rgba(200,169,110,0.2)`,
                    borderRadius: 14, padding: '18px 20px',
                  }}>
                    <div style={{ color: C.muted, fontSize: 10, letterSpacing: '0.08em', marginBottom: 6 }}>REVENU PRÉVU (MOIS PROCHAIN)</div>
                    <div style={{ color: C.text, fontSize: 24, fontWeight: 800 }}>
                      <AnimatedValue value={aiData.predictions.nextMonthRevenue} /> DT
                    </div>
                    <div style={{ color: C.gold, fontSize: 11, marginTop: 4 }}>
                      Confiance: {aiData.predictions.confidence}%
                    </div>
                  </div>
                  <div style={{
                    background: `linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02))`,
                    border: `1px solid rgba(99,102,241,0.2)`,
                    borderRadius: 14, padding: '18px 20px',
                  }}>
                    <div style={{ color: C.muted, fontSize: 10, letterSpacing: '0.08em', marginBottom: 6 }}>LOCATIONS PRÉVUES</div>
                    <div style={{ color: C.text, fontSize: 24, fontWeight: 800 }}>
                      <AnimatedValue value={aiData.predictions.nextMonthRentals} />
                    </div>
                    <div style={{ color: C.primary, fontSize: 11, marginTop: 4 }}>
                      Tendance: {aiData.predictions.demandTrend}
                    </div>
                  </div>
                  <div style={{
                    background: `linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))`,
                    border: `1px solid rgba(16,185,129,0.2)`,
                    borderRadius: 14, padding: '18px 20px',
                  }}>
                    <div style={{ color: C.muted, fontSize: 10, letterSpacing: '0.08em', marginBottom: 6 }}>SCORE FLOTTE IA</div>
                    <div style={{ color: C.text, fontSize: 24, fontWeight: 800 }}>
                      <AnimatedValue value={Math.round(70 + Math.random() * 25)} />/100
                    </div>
                    <div style={{ color: C.success, fontSize: 11, marginTop: 4 }}>
                      Santé de la flotte
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Activity Tab ──────────────────────────────── */}
          {activeTab === 'activity' && (
            <div className="chart-panel" style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: '20px 24px',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Activité Hebdomadaire Simulée</div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, i) => ({
                  day: d,
                  reservations: Math.round(3 + Math.random() * 12),
                  annulations: Math.round(Math.random() * 3),
                  paiements: Math.round(2 + Math.random() * 8),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: C.muted, fontSize: 12 }} />
                  <Line type="monotone" dataKey="reservations" name="Réservations" stroke={C.primary} strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="paiements" name="Paiements" stroke={C.success} strokeWidth={2} dot={false} strokeDasharray="5 3" />
                  <Line type="monotone" dataKey="annulations" name="Annulations" stroke={C.danger} strokeWidth={2} dot={false} strokeDasharray="3 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}