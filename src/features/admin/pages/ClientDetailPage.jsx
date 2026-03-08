import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getClientRentals } from '../api/client.service';
import { getAllFactures, downloadFacture } from '../../factures/api/facture.service';
import api from '../../../config/api.config';

const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Si on arrive depuis la liste, "client" est dans le state, sinon on le laisse vide (le fetch pourrait l'ajouter si on veut)
    const [clientProfile, setClientProfile] = useState(location.state?.client || { id, name: "Client", total_rentals: 0, total_spent: 0 });
    const [rentals, setRentals] = useState([]);
    const [factures, setFactures] = useState([]);
    const [activeTab, setActiveTab] = useState('locations');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                let currentEmail = location.state?.client?.email;
                if (!currentEmail) {
                    const usersRes = await api.get('/users');
                    const c = usersRes.data.find(u => u.id === parseInt(id));
                    if (c) {
                        setClientProfile(c);
                        currentEmail = c.email;
                    }
                }

                // Charger l'historique de location
                const rentalsRes = await getClientRentals(parseInt(id));
                setRentals(rentalsRes.data || []);

                // Charger les factures
                const facturesRes = await getAllFactures();
                if (facturesRes.data && facturesRes.data.factures) {
                    const userFactures = facturesRes.data.factures.filter(f => f.email === currentEmail);
                    setFactures(userFactures);
                }
            } catch (error) {
                console.error("Erreur serveur", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [id, location.state]);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateString) => {
        if (!dateString) return;
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const calculateDays = (start, end) => {
        const diffTime = Math.abs(new Date(end) - new Date(start));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Terminée</span>;
            case 'ongoing': return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">En cours</span>;
            case 'pending': return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">En attente</span>;
            case 'cancelled': return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">Annulée</span>;
            default: return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{status}</span>;
        }
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }} className="w-full">
            {/* Top Back Action & Title */}
            <div className="bg-white border-b border-slate-100 px-8 py-6 mb-8">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Profil Client</h2>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Détails et historique comptable</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 space-y-8 pb-12">

                {/* Customer Profile Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
                    <div className="flex items-center gap-8">
                        <div className="w-28 h-28 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-4xl font-black shrink-0 shadow-xl shadow-slate-900/20">
                            {getInitials(clientProfile.name)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{clientProfile.name}</h1>
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">
                                    {clientProfile.role || 'Client'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-500 text-sm font-medium mt-2">
                                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <span className="material-symbols-outlined text-[16px] text-slate-400">badge</span>
                                    ID #{id}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                                    {clientProfile.email}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-12 pr-6">
                        <div className="text-center group">
                            <div className="w-12 h-12 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined text-slate-400">receipt_long</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Locations</p>
                            <p className="text-2xl font-black text-slate-900">{clientProfile.total_rentals || rentals.length}</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-12 h-12 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                                <span className="material-symbols-outlined text-emerald-500">payments</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dépenses</p>
                            <p className="text-2xl font-black text-slate-900 flex items-baseline justify-center gap-1">
                                {Number(clientProfile.total_spent || 0).toLocaleString('fr-FR')}
                                <span className="text-sm font-bold text-emerald-500 tracking-normal">TND</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rental & Invoices History */}
                <div>
                    <section className="bg-white rounded-3xl border border-slate-100 flex flex-col shadow-sm overflow-hidden min-h-[500px]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 tracking-tight text-lg">
                                Historique
                            </h3>
                            <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100/50">
                                <button
                                    onClick={() => setActiveTab('locations')}
                                    className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'locations' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Locations
                                </button>
                                <button
                                    onClick={() => setActiveTab('factures')}
                                    className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'factures' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Factures
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            {activeTab === 'locations' ? (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] uppercase font-bold tracking-widest text-slate-500 border-b border-slate-100">
                                            <th className="px-8 py-5">Dates & Durée</th>
                                            <th className="px-8 py-5">Véhicule</th>
                                            <th className="px-8 py-5">Montant</th>
                                            <th className="px-8 py-5">Statut</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-16 text-center text-slate-400">
                                                    <span className="material-symbols-outlined animate-spin text-slate-300 text-4xl block mb-3">autorenew</span>
                                                    <p className="text-sm font-medium">Chargement de l'historique...</p>
                                                </td>
                                            </tr>
                                        ) : rentals.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-16 text-center text-slate-400">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <span className="material-symbols-outlined text-3xl text-slate-300">directions_car</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-600">Aucune location</p>
                                                    <p className="text-xs mt-1">Ce client n'a pas encore loué de véhicule.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            rentals.map((rental) => (
                                                <tr key={rental.id} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <p className="text-sm font-bold text-slate-900">{formatDate(rental.start_date)} - {formatDate(rental.end_date)}</p>
                                                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{calculateDays(rental.start_date, rental.end_date)} Jours</p>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                                {rental.Car?.image ? (
                                                                    <img src={rental.Car.image ? `http://localhost:3000${rental.Car.image}` : "https://placehold.co/400x400/f1f5f9/94a3b8?text=Photo+Absente"} alt="car" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x400/f1f5f9/94a3b8?text=Photo+Absente"; }} />
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-slate-400">directions_car</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{rental.Car?.brand} {rental.Car?.model}</p>
                                                                <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">Ref: {rental.car_id}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <p className="text-sm font-black text-slate-900">{Number(rental.total_price || 0).toLocaleString('fr-FR')} <span className="text-[10px] text-slate-400 font-bold">TND</span></p>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        {getStatusBadge(rental.status)}
                                                    </td>
                                                    <td className="px-8 py-5 text-right whitespace-nowrap">
                                                        <button onClick={() => window.open(`/cars/${rental.car_id}`, '_blank')} className="w-8 h-8 rounded-full hover:bg-white text-slate-400 hover:text-slate-900 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all flex items-center justify-center ml-auto">
                                                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] uppercase font-bold tracking-widest text-slate-500 border-b border-slate-100">
                                            <th className="px-8 py-5">Date</th>
                                            <th className="px-8 py-5">Véhicule</th>
                                            <th className="px-8 py-5">Période</th>
                                            <th className="px-8 py-5">Montant</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-16 text-center text-slate-400">
                                                    <span className="material-symbols-outlined animate-spin text-slate-300 text-4xl block mb-3">autorenew</span>
                                                    <p className="text-sm font-medium">Chargement des factures...</p>
                                                </td>
                                            </tr>
                                        ) : factures.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-16 text-center text-slate-400">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <span className="material-symbols-outlined text-3xl text-slate-300">receipt_long</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-600">Aucune facture</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            factures.map((facture) => (
                                                <tr key={facture.id} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <p className="text-sm font-bold text-slate-900">{formatDate(facture.created_at)}</p>
                                                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">#{String(facture.id).padStart(5, '0')}</p>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <p className="text-sm font-bold text-slate-900">{facture.brand} {facture.model}</p>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-500">
                                                        {formatDate(facture.start_date)} - {formatDate(facture.end_date)}
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <p className="text-sm font-black text-slate-900">{Number(facture.total || 0).toLocaleString('fr-FR')} <span className="text-[10px] text-slate-400 font-bold">TND</span></p>
                                                    </td>
                                                    <td className="px-8 py-5 text-right whitespace-nowrap">
                                                        <button onClick={() => downloadFacture(facture.id)} className="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-2 ml-auto shadow-sm">
                                                            <span className="material-symbols-outlined text-[16px]">download</span>
                                                            PDF
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {activeTab === 'locations' ? `${rentals.length} dossier(s)` : `${factures.length} document(s)`}
                            </span>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ClientDetail;

