import React from 'react';
import { Link } from 'react-router-dom';

const ReportsExport = () => {
    return (
        <main className="flex-1 overflow-y-auto flex flex-col bg-slate-50 dark:bg-[#121620]">

            {/* Header */}
            <header className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between px-6 lg:px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#121620]/80 backdrop-blur-md gap-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Rapports de Performance Mensuels</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="material-symbols-outlined text-slate-400 text-sm">calendar_today</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Mars 2026</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 gap-2 cursor-pointer hover:border-primary transition-colors text-slate-700 dark:text-slate-300 shadow-sm">
                        <span className="material-symbols-outlined text-slate-400">date_range</span>
                        <span className="text-sm font-medium">Sélectionner la période</span>
                        <span className="material-symbols-outlined text-slate-400">expand_more</span>
                    </div>
                    <Link to="/admin/reports" className="flex items-center justify-center gap-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        Retour
                    </Link>
                    <Link to="/admin/reports/forecasts" className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-100 dark:border-indigo-800">
                        <span className="material-symbols-outlined text-[20px]">trending_up</span>
                        Prévisions
                    </Link>
                </div>
            </header>

            <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Chiffre d'Affaires Total</span>
                            <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">trending_up</span>
                                +12%
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">45 280 €</p>
                        <p className="text-xs text-slate-400 mt-2">vs 40 428 € le mois dernier</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Taux d'Occupation</span>
                            <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">trending_up</span>
                                +5%
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">88%</p>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4">
                            <div className="bg-primary h-full rounded-full" style={{ width: '88%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow hidden lg:block">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Durée Moyenne</span>
                            <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">trending_up</span>
                                +0.8%
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">4.2 jours</p>
                        <p className="text-xs text-slate-400 mt-2">Cycle de rotation stable</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Nouveaux Contrats</span>
                            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">trending_down</span>
                                -2%
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">124</p>
                        <p className="text-xs text-slate-400 mt-2">Objectif atteint à 94%</p>
                    </div>

                    <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-xl border border-primary/20 dark:border-primary/40 shadow-sm col-span-1 md:col-span-2 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-primary dark:text-primary/80 uppercase tracking-wider">Prévisions Avril</span>
                            <div className="bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary-300 text-[10px] font-bold px-2 py-1 rounded-full">PROJETÉ</div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">48 500 €</p>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-[11px]">
                                <span className="text-slate-500">Réservations confirmées</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">38 200 €</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                                <span className="text-slate-500">Croissance estimée (+7%)</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">10 300 €</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                                <div className="bg-primary h-full rounded-l-full" style={{ width: '78%' }}></div>
                                <div className="bg-primary/30 h-full rounded-r-full" style={{ width: '22%' }}></div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end pt-4 border-t border-primary/10 gap-2">
                            <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md hover:opacity-90 transition-opacity cursor-pointer">
                                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                                Exporter en PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Line Chart Replacement (With Forecast) */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-base font-bold mb-6 text-slate-900 dark:text-slate-100">Évolution du Chiffre d'Affaires</h3>
                        <div className="h-64 relative flex items-end justify-between px-2 gap-1 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-[#121620]/50">
                            {/* SVG Chart Visual with Forecast */}
                            <svg className="absolute inset-0 w-full h-full p-4" preserveAspectRatio="none" viewBox="0 0 500 150">
                                {/* Historical Data */}
                                <path d="M0,130 C20,110 40,140 60,100 C80,60 100,120 120,90 C140,60 160,50 180,70 C200,90 220,40 240,30 C260,20 280,60 300,50 C320,40 340,30 360,20 C380,10 400,0 400,0" fill="none" stroke="#1e3b8a" strokeLinecap="round" strokeWidth="3"></path>
                                {/* Forecast Data (Dashed) */}
                                <path d="M400,0 L500,-20" fill="none" stroke="#1e3b8a" strokeDasharray="6,4" strokeLinecap="round" strokeWidth="3"></path>
                                {/* Gradient Fill */}
                                <path className="fill-primary/5" d="M0,130 C20,110 40,140 60,100 C80,60 100,120 120,90 C140,60 160,50 180,70 C200,90 220,40 240,30 C260,20 280,60 300,50 C320,40 340,30 360,20 C380,10 400,0 L500,-20 V150 H0 Z"></path>
                            </svg>
                            <div className="flex w-full justify-between items-end mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4 border-t border-slate-100 dark:border-slate-800 pt-2 absolute bottom-0 left-0 right-0">
                                <span>Sem 1</span>
                                <span>Sem 2</span>
                                <span>Sem 3</span>
                                <span>Sem 4</span>
                                <span className="text-primary font-black">Prévision</span>
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart Replacement */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-base font-bold mb-6 text-slate-900 dark:text-slate-100">Top Véhicules par Rentabilité</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Tesla Model 3</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">12 400 €</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Audi Q5</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">9 850 €</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-primary/70 h-full rounded-full" style={{ width: '65%' }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">BMW X3</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">7 200 €</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-primary/50 h-full rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Fiat 500e</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">4 100 €</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-primary/30 h-full rounded-full" style={{ width: '25%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Performance par Catégorie de Véhicule</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Catégorie</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Flotte</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Utilisation</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Revenu Total</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">RevPar</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-primary text-[20px]">directions_car</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Citadine</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">42 véhicules</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">92%</span>
                                            <div className="flex-1 min-w-[60px] bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-green-500 h-full rounded-full" style={{ width: '92%' }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">14 250 €</td>
                                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">339 € / vh</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/50">Performance Haute</span>
                                    </td>
                                </tr>

                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-primary text-[20px]">electric_car</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">SUV</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">28 véhicules</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">85%</span>
                                            <div className="flex-1 min-w-[60px] bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">18 400 €</td>
                                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">657 € / vh</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">Stable</span>
                                    </td>
                                </tr>

                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-primary text-[20px]">workspace_premium</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Luxe</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">12 véhicules</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">78%</span>
                                            <div className="flex-1 min-w-[60px] bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-amber-500 h-full rounded-full" style={{ width: '78%' }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">12 630 €</td>
                                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">1 052 € / vh</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">Rentabilité Élevée</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button className="text-sm font-bold text-primary hover:underline cursor-pointer">Voir les détails complets</button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ReportsExport;
