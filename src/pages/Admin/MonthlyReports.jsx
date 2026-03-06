import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getFinancialStats, getTopCars } from './api/report.service';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';

// Mock data for the revenue chart (since it's not in the API yet)
const mockRevenueData = [
    { name: 'Jan', revenue: 4200 },
    { name: 'Fév', revenue: 3800 },
    { name: 'Mar', revenue: 5100 },
    { name: 'Avr', revenue: 4800 },
    { name: 'Mai', revenue: 6200 },
    { name: 'Juin', revenue: 7500 },
    { name: 'Juil', revenue: 8900 },
];

export default function MonthlyReports() {
    const [stats, setStats] = useState(null);
    const [financial, setFinancial] = useState(null);
    const [topCars, setTopCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, financialRes, topCarsRes] = await Promise.all([
                    getDashboardStats(),
                    getFinancialStats(),
                    getTopCars(),
                ]);
                setStats(statsRes.data);
                setFinancial(financialRes.data);
                setTopCars(topCarsRes.data);
            } catch (error) {
                console.error("Erreur chargement rapports", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const formatCurrency = (value) =>
        value?.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' DT';

    const maxRentals = topCars.length > 0 ? Math.max(...topCars.map(c => Number(c.total_rentals))) : 1;

    // Custom Tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
                    <p className="font-bold text-slate-800 mb-1">{label}</p>
                    <p className="text-primary-600 font-semibold">
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between px-8 py-5 border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="flex flex-col">
                    <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">
                        Administration
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                        Rapports & Finances
                    </h2>
                </div>
                <div className="flex items-center gap-3 mt-4 sm:mt-0">
                    <Link to="/admin/reports/forecasts" className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors border border-indigo-100">
                        <span className="text-lg">📈</span>
                        Prévisions IA
                    </Link>
                    <Link to="/admin/reports/export" className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
                        <span className="text-lg">📥</span>
                        Exporter PDF
                    </Link>
                </div>
            </header>

            <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                        <span className="font-medium">Calcul des données financières...</span>
                    </div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {/* Revenue Card */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300 text-6xl">
                                    💰
                                </div>
                                <div className="flex items-center justify-between mb-2 opacity-80">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Revenu du Mois</span>
                                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                        ↑ Live
                                    </span>
                                </div>
                                <p className="text-3xl font-black text-slate-900 mb-1">
                                    {formatCurrency(financial?.current_month_revenue)}
                                </p>
                                <p className="text-sm font-medium text-slate-400">
                                    Total: <span className="text-slate-600">{formatCurrency(financial?.total_revenue)}</span>
                                </p>
                            </div>

                            {/* Active Cars Card */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300 text-6xl">
                                    🏎️
                                </div>
                                <div className="flex items-center justify-between mb-2 opacity-80">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Véhicules Actifs</span>
                                </div>
                                <p className="text-3xl font-black text-slate-900 mb-1">
                                    {stats?.active_cars} <span className="text-lg font-medium text-slate-400">/ {stats?.total_cars}</span>
                                </p>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(stats?.active_cars / (stats?.total_cars || 1)) * 100}%` }}></div>
                                </div>
                            </div>

                            {/* Rentals Card */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300 text-6xl">
                                    🔑
                                </div>
                                <div className="flex items-center justify-between mb-2 opacity-80">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Locations en Cours</span>
                                </div>
                                <p className="text-3xl font-black text-slate-900 mb-1">
                                    {stats?.ongoing_rentals}
                                </p>
                                <p className="text-sm font-medium text-slate-400">
                                    Sur un total de {stats?.total_rentals} réservations
                                </p>
                            </div>

                            {/* Success Rate Card */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300 text-6xl">
                                    💳
                                </div>
                                <div className="flex items-center justify-between mb-2 opacity-80">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Paiements Validés</span>
                                </div>
                                <p className="text-3xl font-black text-slate-900 mb-1">
                                    {financial?.paid_payments}
                                </p>
                                <p className="text-sm font-medium text-slate-400">
                                    Sur {financial?.total_payments} factures au total
                                </p>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Revenue Chart */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-900">Évolution des Revenus</h3>
                                    <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2">
                                        <option>Cette année</option>
                                        <option>6 derniers mois</option>
                                    </select>
                                </div>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${value}`} dx={-10} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Top Cars Sidebar */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Top Véhicules</h3>
                                {topCars.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                                        Aucune donnée
                                    </div>
                                ) : (
                                    <div className="space-y-5 flex-1 overflow-y-auto pr-2">
                                        {topCars.map((car, idx) => (
                                            <div key={car.id} className="group cursor-default">
                                                <div className="flex justify-between text-sm mb-1.5 align-bottom">
                                                    <span className="font-bold text-slate-800 flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">{idx + 1}</span>
                                                        {car.brand} <span className="font-normal text-slate-500">{car.model}</span>
                                                    </span>
                                                    <span className="font-bold text-slate-900">{car.total_rentals} <span className="font-normal text-slate-400 text-xs">locs</span></span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-primary-500 h-full rounded-full transition-all duration-1000 ease-out group-hover:bg-primary-600"
                                                        style={{ width: `${Math.round((Number(car.total_rentals) / maxRentals) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Transactions / Detailed Stats */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-lg font-bold text-slate-900">Bilan Détaillé</h3>
                                <button className="text-primary-600 text-sm font-bold hover:text-primary-700">Voir tout →</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white text-slate-400 border-b border-slate-100 uppercase text-[10px] font-black tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Indicateur</th>
                                            <th className="px-6 py-4">Période</th>
                                            <th className="px-6 py-4 text-right">Valeur</th>
                                            <th className="px-6 py-4 text-right">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-sm">
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                                                <span className="text-xl">💰</span> Revenu Total Cumulé
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-medium">Historique complet</td>
                                            <td className="px-6 py-4 text-right font-black text-slate-900">{formatCurrency(financial?.total_revenue)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-bold bg-green-50 text-green-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Validé
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                                                <span className="text-xl">📅</span> Revenu du Mois
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-medium">Mois en cours</td>
                                            <td className="px-6 py-4 text-right font-black text-green-600">{formatCurrency(financial?.current_month_revenue)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> En cours
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
