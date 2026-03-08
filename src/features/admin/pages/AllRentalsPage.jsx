import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../config/api.config";
import { Car, Calendar, Clock, CreditCard, ChevronRight, Activity, CalendarDays, Key } from "lucide-react";

const STATUS = {
    confirmed: { color: "text-sky-600", bg: "bg-sky-50", label: "Confirmée" },
    ongoing: { color: "text-emerald-600", bg: "bg-emerald-50", label: "En cours" },
    completed: { color: "text-slate-500", bg: "bg-slate-100", label: "Terminée" },
    cancelled: { color: "text-rose-600", bg: "bg-rose-50", label: "Annulée" },
    awaiting_payment: { color: "text-amber-600", bg: "bg-amber-50", label: "Paiement requis" },
};

export default function AllRentalsPage() {
    const navigate = useNavigate();
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get("/rentals/all")
            .then(res => setRentals(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "2-digit", month: "short", year: "numeric"
        });
    };

    const calculateDays = (s, e) => Math.ceil((new Date(e) - new Date(s)) / 86400000);

    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }} className="pb-16 bg-slate-50 min-h-[calc(100vh-64px)]">
            {/* Header section matching other pages */}
            <div className="bg-white border-b border-slate-100 px-8 py-8 mb-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Key className="w-5 h-5" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Toutes les Locations</h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 ml-13">Gérez et suivez l'ensemble de vos réservations.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/rentals/history')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                        >
                            <Activity className="w-5 h-5" />
                            Historique Mensuel
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                {/* Stats / Overview Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-wrap gap-6 items-center">
                    <div className="flex-1 px-4 py-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Réservations</div>
                        <div className="text-2xl font-black text-slate-900">{rentals.length}</div>
                    </div>
                    <div className="w-px h-12 bg-slate-100 hidden md:block"></div>
                    <div className="flex-1 px-4 py-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">En Cours</div>
                        <div className="text-2xl font-black text-emerald-600">
                            {rentals.filter(r => r.status === 'ongoing').length}
                        </div>
                    </div>
                    <div className="w-px h-12 bg-slate-100 hidden md:block"></div>
                    <div className="flex-1 px-4 py-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">En Attente</div>
                        <div className="text-2xl font-black text-amber-500">
                            {rentals.filter(r => r.status === 'awaiting_payment').length}
                        </div>
                    </div>
                </div>

                {/* Grid List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mb-4"></div>
                        <p className="text-slate-400 font-medium">Chargement des locations...</p>
                    </div>
                ) : rentals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <Key className="w-16 h-16 text-slate-200 mb-4" />
                        <p className="text-slate-400 font-medium text-lg">Aucune location n'a été trouvée.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {rentals.map(rental => {
                            const cfg = STATUS[rental.status] || STATUS.confirmed;
                            const duration = calculateDays(rental.start_date, rental.end_date);

                            return (
                                <div key={rental.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                                    <div className="p-5 flex-grow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${cfg.bg} ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                                <span className="text-xs font-bold text-slate-300">#{String(rental.id).padStart(4, "0")}</span>
                                            </div>
                                            <div className="text-sm font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md">
                                                {rental.user_name || `Client #${rental.user_id}`}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-slate-900 mt-2 mb-4 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                                <Car className="w-4 h-4" />
                                            </div>
                                            {rental.brand || rental.Car?.brand} {rental.model || rental.Car?.model}
                                        </h3>

                                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 bg-slate-50/50 p-4 rounded-xl border border-slate-50">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                    <CalendarDays className="w-3 h-3" /> Départ
                                                </div>
                                                <div className="text-sm font-bold text-slate-700">{formatDate(rental.start_date)}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" /> Retour
                                                </div>
                                                <div className="text-sm font-bold text-slate-700">{formatDate(rental.end_date)}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" /> Durée
                                                </div>
                                                <div className="text-sm font-bold text-slate-700">{duration} jour{duration > 1 ? 's' : ''}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                    <CreditCard className="w-3 h-3" /> Montant
                                                </div>
                                                <div className="text-sm font-black text-indigo-700">{formatCurrency(rental.total_price)} <span className="text-[10px] font-bold text-indigo-400">DT</span></div>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
