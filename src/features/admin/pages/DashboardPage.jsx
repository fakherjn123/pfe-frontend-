import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle, AlertTriangle, Bot, Settings, Car, DollarSign, Key, Users, TrendingUp, Banknote, Calendar, BarChart3, Brain, Sparkles, Lightbulb, Target, Rocket, Shield } from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { getDashboardStats, getFinancialStats, getTopCars, getMonthlyHistory } from '../api/report.service';
import api from '../../../config/api.config';

// ── Colour tokens ────────────────────────────────────────────
const C = {
  primary: '#6366f1',
  accent: '#0ea5e9',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#f43f5e',
  gold: '#b4860b',
  purple: '#8b5cf6',
  surface: '#ffffff',
  border: '#ebebeb',
  text: '#0a0a0a',
  muted: '#666666',
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
  if (rate > 80) return <><Flame className="w-4 h-4 inline-block mb-1 text-primary-500" /> Taux d'occupation exceptionnel à {rate}% — flotte quasi saturée, envisagez une expansion.</>;
  if (rate > 50) return <><CheckCircle className="w-4 h-4 inline-block mb-1 text-green-500" /> Performance solide à {rate}% d'occupation — croissance stable ce mois.</>;
  return <><AlertTriangle className="w-4 h-4 inline-block mb-1 text-amber-500" /> Taux d'occupation bas ({rate}%) — activez des promotions ciblées pour booster la demande.</>;
};

// Removed Fake monthly revenue logic

// ── Donut chart colours ───────────────────────────────────────
const PIE_COLORS = [C.primary, C.accent, C.success, C.warning, C.danger];

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#ffffff', border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
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
import { Link } from 'react-router-dom';

const StatCard = ({ icon, label, value, sub, trend, color = C.primary, delay = 0, to }) => {
  const cardContent = (
    <div className="kpi-card" style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 10,
      animationDelay: `${delay}s`,
      height: '100%',
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

  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{cardContent}</Link> : cardContent;
};

// ── Main Dashboard ────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [topCars, setTopCars] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Real AI Insights states
  const [realAiData, setRealAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    injectDashStyles();
    (async () => {
      try {
        const [st, fin, cars, hist] = await Promise.all([
          getDashboardStats().then(r => r.data).catch(() => null),
          getFinancialStats().then(r => r.data).catch(() => null),
          getTopCars().then(r => r.data).catch(() => []),
          getMonthlyHistory().then(r => r.data).catch(() => [])
        ]);
        setStats(st);
        setFinancial(fin);
        setTopCars(cars);
        setHistory(hist);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
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

  const fetchRealAiInsights = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await api.get('/dashboard/insights');
      setRealAiData(res.data.insights);
    } catch (err) {
      console.error(err);
      setAiError("Erreur lors de la génération avec l'IA. Veuillez réessayer.");
    } finally {
      setAiLoading(false);
    }
  };

  const tabs = ['overview', 'revenue', 'fleet', 'ai-analytics', 'activity'];
  const tabLabels = { overview: 'Vue d\'ensemble', revenue: 'Revenus', fleet: 'Flotte', 'ai-analytics': <><Bot className="w-4 h-4 inline-block mb-1" /> IA Analytics</>, activity: 'Activité' };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Inter', 'Helvetica Neue', sans-serif", paddingTop: 64, color: C.text }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "36px 40px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <p style={{ color: C.muted, fontSize: 12, margin: "0 0 6px" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            Dashboard
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 40px 80px" }}>

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
          }}><Bot className="w-6 h-6 text-primary-500" /></div>
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
            <div style={{ marginBottom: 16 }}><Settings className="w-10 h-10 mx-auto text-slate-300 animate-spin" /></div>
            Chargement des données...
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16, marginBottom: 28,
            }}>
              <StatCard
                icon={<Car className="w-6 h-6" />} label="Véhicules Actifs"
                value={<AnimatedValue value={stats?.active_cars ?? 0} />}
                sub={`${stats?.total_cars} total parc`}
                trend={8} color={C.primary} delay={0}
                to="/admin/cars"
              />
              <StatCard
                icon={<DollarSign className="w-6 h-6" />} label="Revenus du Mois"
                value={<><AnimatedValue value={financial?.current_month_revenue ?? 0} /> DT</>}
                sub={`Total: ${(financial?.total_revenue || 0).toLocaleString('fr-FR')} DT`}
                trend={12} color={C.success} delay={0.05}
                to="/admin/payments"
              />
              <StatCard
                icon={<Key className="w-6 h-6" />} label="Locations en Cours"
                value={<AnimatedValue value={stats?.ongoing_rentals ?? 0} />}
                sub={`${stats?.total_rentals} total`}
                trend={-3} color={C.accent} delay={0.1}
                to="/admin/rentals"
              />
              <StatCard
                icon={<Users className="w-6 h-6" />} label="Clients Enregistrés"
                value={<AnimatedValue value={stats?.total_users ?? 0} />}
                sub={`${financial?.paid_payments} paiements validés`}
                trend={5} color={C.warning} delay={0.15}
                to="/admin/clients"
              />
              <StatCard
                icon={<TrendingUp className="w-6 h-6" />} label="Taux d'Occupation"
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
                  {history && history.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={history}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={C.primary} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                        <XAxis dataKey="month_label" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
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
                  ) : (
                    <div style={{ color: C.muted, fontSize: 13, textAlign: 'center', paddingTop: 40 }}>Aucune donnée d'historique</div>
                  )}
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
                  {history && history.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={history} barGap={4}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={C.primary} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorLoc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={C.accent} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                        <XAxis dataKey="month_label" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fill: C.muted, fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: C.muted, fontSize: 12 }} />
                        <Bar yAxisId="left" dataKey="revenue" name="Revenus (DT)" fill={C.primary} radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar yAxisId="right" dataKey="payment_count" name="Locations" fill={C.accent} radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ color: C.muted, fontSize: 13, textAlign: 'center', paddingTop: 40 }}>Aucune donnée d'historique</div>
                  )}
                </div>

                {/* Financial summary cards */}
                {[
                  { label: 'Revenu Total', value: `${(financial?.total_revenue || 0).toLocaleString('fr-FR')} DT`, icon: <Banknote className="w-8 h-8 text-slate-400" /> },
                  { label: 'Ce Mois', value: `${(financial?.current_month_revenue || 0).toLocaleString('fr-FR')} DT`, icon: <Calendar className="w-8 h-8 text-slate-400" /> },
                  { label: 'Paiements Validés', value: `${financial?.paid_payments ?? 0} / ${financial?.total_payments ?? 0}`, icon: <CheckCircle className="w-8 h-8 text-green-500" /> },
                  {
                    label: 'Taux de Paiement', value: financial?.total_payments
                      ? `${Math.round((financial.paid_payments / financial.total_payments) * 100)}%`
                      : '—', icon: <BarChart3 className="w-8 h-8 text-slate-400" />
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

                {/* Header & Button */}
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 16, padding: '24px', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
                }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.text, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Brain className="w-6 h-6 text-purple-500" /> Analyse Stratégique par IA
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                      Générez des prévisions et conseils basés sur les vraies données de votre agence (Google Gemini).
                    </div>
                  </div>

                  <button
                    onClick={fetchRealAiInsights}
                    disabled={aiLoading}
                    style={{
                      background: aiLoading ? '#334155' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12,
                      fontSize: 14, fontWeight: 700, cursor: aiLoading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10,
                      boxShadow: aiLoading ? 'none' : '0 4px 15px rgba(99,102,241,0.3)',
                      transition: 'all .2s'
                    }}
                  >
                    {aiLoading ? 'Analyse en cours...' : <><Sparkles className="w-4 h-4 inline-block mr-2" /> Générer l'Analyse IA</>}
                  </button>
                </div>

                {aiError && (
                  <div style={{ background: 'rgba(244,63,94,0.1)', border: `1px solid rgba(244,63,94,0.2)`, borderRadius: 12, padding: 16, color: C.danger, fontSize: 14 }}>
                    <AlertTriangle className="w-4 h-4 inline-block mr-2" /> {aiError}
                  </div>
                )}

                {/* Loader Skeleton */}
                {aiLoading && (
                  <div style={{ padding: 40, textAlign: 'center', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 16, background: C.surface }}>
                    <div className="ai-spinner" style={{
                      width: 30, height: 30, border: '3px solid rgba(255,255,255,0.1)',
                      borderTop: `3px solid ${C.primary}`, borderRadius: '50%', margin: '0 auto 16px',
                      animation: 'aiSpin 1s linear infinite'
                    }} />
                    L'IA Gemini analyse votre flotte et vos revenus...
                  </div>
                )}

                {/* Real AI Data Results */}
                {realAiData && !aiLoading && (
                  <>
                    {/* AI Chart - Revenue Forecast */}
                    {realAiData.chartData?.length > 0 && (
                      <div style={{
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: 16, padding: '24px',
                      }}>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                          <BarChart3 className="w-4 h-4 inline-block mr-2 text-primary-500" /> Prévision des Revenus (IA)
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Estimation sur les 3 prochains mois selon la tendance actuelle</div>
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={realAiData.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                            <Bar dataKey="revenue" name="Projection Revenus (DT)" fill={C.primary} radius={[6, 6, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="target" name="Objectif Idéal (DT)" fill={C.accent} opacity={0.6} radius={[6, 6, 0, 0]} maxBarSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* AI Advice Cards */}
                    {realAiData.insights?.length > 0 && (
                      <div style={{
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: 16, padding: '24px',
                      }}>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: C.gold, display: 'flex', alignItems: 'center' }}>
                          <Lightbulb className="w-4 h-4 inline-block mr-2" /> Recommandations Locatives (Générées par l'IA)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                          {realAiData.insights.map((insight, idx) => (
                            <div key={idx} style={{
                              background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
                              borderLeft: `3px solid ${[C.primary, C.gold, C.accent][idx % 3]}`,
                              borderRadius: '0 12px 12px 0', padding: '16px 20px',
                              display: 'flex', gap: 16, alignItems: 'flex-start'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {idx % 4 === 0 && <Target className="w-6 h-6 text-primary-500" />}
                                {idx % 4 === 1 && <Rocket className="w-6 h-6 text-accent-500" />}
                                {idx % 4 === 2 && <Lightbulb className="w-6 h-6 text-gold-500" />}
                                {idx % 4 === 3 && <Shield className="w-6 h-6 text-success-500" />}
                              </div>
                              <div>
                                <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{insight.title}</div>
                                <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>{insight.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
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
    </div>
  );
}
