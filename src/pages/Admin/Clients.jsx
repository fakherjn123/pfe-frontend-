import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClients } from './api/client.service';

const Clients = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await getClients();
                setClients(response.data);
            } catch (error) {
                console.error("Erreur chargement clients", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    const filtered = clients.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="bg-white border-b border-slate-100 px-8 py-8 mb-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clients</h2>
                    </div>
                    <button className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20 cursor-pointer">
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Nouveau Client
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                {/* Search */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-transparent focus:border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-100 text-sm transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400"
                            placeholder="Rechercher un client (nom, email)..."
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Client</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Contact</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Activité</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center text-slate-400">
                                            <span className="material-symbols-outlined animate-spin text-slate-300 text-4xl block mb-3">autorenew</span>
                                            <p className="text-sm font-medium">Chargement des clients...</p>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center text-slate-400">
                                            <span className="material-symbols-outlined text-5xl block mb-3 text-slate-200">group_off</span>
                                            <p className="text-sm font-medium">Aucun client trouvé pour "{search}"</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((client) => (
                                        <tr key={client.id}
                                            onClick={() => navigate(`/admin/clients/${client.id}`, { state: { client } })}
                                            className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform group-hover:bg-slate-900 group-hover:text-white text-slate-600">
                                                        <span className="text-sm font-black">{getInitials(client.name)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{client.name}</p>
                                                        <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                                            {client.role || 'Client'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                                                    <p className="text-sm font-medium">{client.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-6">
                                                    <div>
                                                        <span className="text-xs text-slate-400 font-medium block mb-1">Locations</span>
                                                        <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">{client.total_rentals || 0}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-slate-400 font-medium block mb-1">Dépenses</span>
                                                        <span className="text-sm font-extrabold text-slate-900 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md tracking-tight">
                                                            {Number(client.total_spent || 0).toLocaleString('fr-FR')} <span className="text-[10px] text-emerald-600/70 font-bold ml-0.5">TND</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right">
                                                <button className="w-8 h-8 rounded-full hover:bg-white text-slate-400 hover:text-slate-900 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all flex items-center justify-center ml-auto">
                                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                        <p className="text-xs font-medium text-slate-500">
                            {loading ? '...' : `Total: ${filtered.length} client(s)`}
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-between group hover:border-slate-200 transition-colors">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Clients Inscrits</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{clients.length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined text-slate-400">group</span>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-between group hover:border-slate-200 transition-colors">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Résultats Actuels</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{filtered.length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined text-slate-400">filter_list</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Clients;
