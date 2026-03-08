import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../config/api.config";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from "recharts";
import { Activity, ArrowLeft, TrendingUp, DollarSign } from "lucide-react";

export default function RentalHistoryPage() {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRentals, setTotalRentals] = useState(0);

    useEffect(() => {
        setLoading(true);
        api.get("/rentals/all")
            .then(res => {
                const rentals = res.data;
                setTotalRentals(rentals.length);

                // Group by Month Year
                const grouped = rentals.reduce((acc, rental) => {
                    const d = new Date(rental.start_date);
                    // Format as YYYY-MM to sort chronologically easier
                    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    const label = d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });

                    if (!acc[monthKey]) {
                        acc[monthKey] = {
                            monthKey,
                            name: label,
                            locations: 0,
                            revenus: 0
                        };
                    }
                    acc[monthKey].locations += 1;
                    acc[monthKey].revenus += Number(rental.total_price) || 0;
                    return acc;
                }, {});

                // Convert to array and sort chronologically
                const dataArray = Object.values(grouped).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

                setChartData(dataArray);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Custom Tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 border border-slate-200 p-4 rounded-xl shadow-xl shadow-slate-200/50 backdrop-blur-sm">
                    <p className="m-0 mb-3 font-bold text-sm text-slate-900">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-3 mb-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                            <span className="text-sm font-medium text-slate-500 flex-1">{entry.name}:</span>
                            <span className="text-sm font-black text-slate-900">
                                {Number(entry.value).toLocaleString('fr-FR')} {entry.name === "Revenus" ? "DT" : ""}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }} className="pb-16 bg-slate-50 min-h-[calc(100vh-64px)]">
            {/* Header section matching other pages */}
            <div className="bg-white border-b border-slate-100 px-8 py-8 mb-8">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Évolution Mensuelle</h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 ml-13">Aperçu chronologique de vos locations et revenus.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/rentals"
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all hover:shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour aux locations
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-8">
                {/* Global Stats Overview */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-wrap gap-6 items-center">
                    <div className="flex-1 px-4 py-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Historique</div>
                        <div className="text-2xl font-black text-slate-900">{totalRentals} locations</div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mb-4"></div>
                        <p className="text-slate-400 font-medium">Chargement des données...</p>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <Activity className="w-16 h-16 text-slate-200 mb-4" />
                        <p className="text-slate-400 font-medium text-lg">Aucune donnée disponible pour afficher le graphique.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {/* Chart 1: Evolution of Rentals */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                            <div className="mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 m-0 leading-none mb-1.5">Nombre de locations</h3>
                                    <p className="text-xs font-medium text-slate-500 m-0">Courbe d'évolution du volume mensuel</p>
                                </div>
                            </div>

                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorLocations" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="locations" name="Locations" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorLocations)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 2: Evolution of Revenue */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                            <div className="mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 m-0 leading-none mb-1.5">Chiffre d'affaires (TND)</h3>
                                    <p className="text-xs font-medium text-slate-500 m-0">Revenus générés par mois</p>
                                </div>
                            </div>

                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="revenus" name="Revenus" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenus)" activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
