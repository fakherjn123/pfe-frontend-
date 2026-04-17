import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../config/api.config';
import { Car, ArchiveRestore, Archive, Fuel, Settings, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ArchivedCarsPage() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unarchivingId, setUnarchivingId] = useState(null);
    const navigate = useNavigate();

    const fetchArchived = async () => {
        setLoading(true);
        try {
            const res = await api.get('/cars/archived');
            setCars(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchArchived(); }, []);

    const handleUnarchive = async (id) => {
        setUnarchivingId(id);
        try {
            await api.put(`/cars/${id}/unarchive`);
            setCars(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur lors du désarchivage.");
        }
        setUnarchivingId(null);
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }} className="pb-16 bg-slate-50 min-h-[calc(100vh-64px)]">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-8 py-8 mb-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <button
                            onClick={() => navigate('/admin/cars')}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm font-bold mb-4 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Retour au Parc
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <Archive className="w-5 h-5" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Archives</h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 ml-13">
                            Véhicules archivés — hors flotte active. Vous pouvez les restaurer à tout moment.
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total archivé</div>
                        <div className="text-3xl font-black text-slate-900">
                            {cars.length} <span className="text-lg text-slate-400 font-bold">véhicule{cars.length > 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-amber-500 animate-spin mb-4"></div>
                        <p className="text-slate-400 font-medium">Chargement des archives...</p>
                    </div>
                ) : cars.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <Archive className="w-16 h-16 text-slate-200 mb-4" />
                        <p className="text-slate-400 font-medium text-lg">Aucun véhicule archivé.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {cars.map(car => {
                            const imgSrc = car.image ? `http://localhost:3000${car.image}` : null;
                            return (
                                <div key={car.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm opacity-80 hover:opacity-100 transition-all group flex flex-col">
                                    {/* Image */}
                                    <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                        {imgSrc ? (
                                            <img
                                                src={imgSrc}
                                                alt="car"
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                                onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/f1f5f9/94a3b8?text=Image+Non+Disponible"; }}
                                            />
                                        ) : (
                                            <Car className="w-12 h-12 text-slate-300" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 bg-white/90 shadow-sm text-amber-600">
                                            <Archive className="w-3 h-3" /> Archivé
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4 flex-1">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{car.brand}</div>
                                                <div className="font-black text-slate-900 text-xl truncate pr-2 leading-tight">{car.model}</div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <Fuel className="w-3 h-3" /> {car.fuel_type || 'Essence'}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <Settings className="w-3 h-3" /> {car.transmission || 'Manuelle'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-slate-400 text-2xl">{car.price_per_day}</div>
                                                <div className="text-xs text-slate-400 font-medium">DT/jour</div>
                                            </div>
                                        </div>

                                        {/* Restore button */}
                                        <button
                                            onClick={() => handleUnarchive(car.id)}
                                            disabled={unarchivingId === car.id}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-bold transition-all border border-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed mt-auto"
                                        >
                                            <ArchiveRestore className="w-4 h-4" />
                                            {unarchivingId === car.id ? 'Restauration...' : 'Remettre en flotte'}
                                        </button>
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
