import React, { useState, useEffect } from 'react';
import { getServices, getAlerts, updateServiceStatus, createService } from './api/service.service';
import api from '../../config/api.config';

const Services = () => {
    const [services, setServices] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [cars, setCars] = useState([]);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        car_id: '',
        service_type: '',
        details: '',
        due_date: '',
        estimated_cost: '',
    });

    const fetchAll = async () => {
        try {
            const [servicesRes, alertsRes] = await Promise.all([
                getServices(),
                getAlerts(),
            ]);
            setServices(servicesRes.data);
            setAlerts(alertsRes.data);
        } catch (error) {
            console.error("Erreur chargement services", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // Load cars for the modal dropdown
    const openModal = async () => {
        try {
            const res = await api.get('/cars');
            setCars(res.data);
        } catch (e) {
            console.error("Erreur chargement voitures", e);
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await createService(form);
            setShowModal(false);
            setForm({ car_id: '', service_type: '', details: '', due_date: '', estimated_cost: '' });
            await fetchAll(); // Reload the list from DB
        } catch (err) {
            console.error("Erreur création service", err);
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateServiceStatus(id, newStatus);
            setServices(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        } catch (err) {
            console.error("Erreur mise à jour statut", err);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'En attente': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200';
            case 'En maintenance': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200';
            case 'Terminé': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
            default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200';
        }
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-8 min-h-full">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Suivi de Maintenance</h2>
                    <p className="text-slate-500 dark:text-slate-400">Entretiens gérés depuis la base de données en temps réel.</p>
                </div>
                <button
                    onClick={openModal}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-lg shadow-slate-900/20 transition-all cursor-pointer"
                >
                    <span className="material-symbols-outlined">add_task</span>
                    Planifier un Entretien
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">autorenew</span>
                    <span>Chargement depuis la base de donnéesDT</span>
                </div>
            )}

            {!loading && (
                <>
                    {/* Urgent Alerts */}
                    {alerts.length > 0 && (
                        <section className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
                                <span className="material-symbols-outlined">report</span>
                                Alertes Urgentes ({alerts.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {alerts.map((alert) => (
                                    <div key={alert.car_id} className={`border p-4 rounded-xl flex gap-4 shadow-sm ${alert.severity === 'CRITIQUE' ? 'bg-red-50 dark:bg-red-900/10 border-red-200' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200'}`}>
                                        <div className={`p-2 rounded-lg h-fit ${alert.severity === 'CRITIQUE' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                            <span className="material-symbols-outlined">verified_user</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-xs font-bold uppercase tracking-wider ${alert.severity === 'CRITIQUE' ? 'text-red-600' : 'text-amber-600'}`}>{alert.severity}</p>
                                            <p className="font-bold text-slate-900 dark:text-slate-100">{alert.alert_type} expirée</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{alert.vehicle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Véhicule</th>
                                        <th className="px-6 py-4">Type de Service</th>
                                        <th className="px-6 py-4">Échéance</th>
                                        <th className="px-6 py-4">Statut</th>
                                        <th className="px-6 py-4">Coût estimé</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {services.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                                                <span className="material-symbols-outlined text-5xl block mb-3 text-slate-300">build</span>
                                                <p className="font-medium">Aucun entretien planifié</p>
                                                <p className="text-sm mt-1">Cliquez sur <strong>"Planifier un Entretien"</strong> pour en ajouter un.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        services.map((service) => (
                                            <tr key={service.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                            <span className="material-symbols-outlined text-slate-400">directions_car</span>
                                                        </div>
                                                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{service.vehicle}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-900 dark:text-slate-100">{service.type}</p>
                                                    <p className="text-xs text-slate-500">{service.details}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{service.due_date}</p>
                                                    <p className="text-xs text-slate-500">{service.due_in}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(service.status)}`}>
                                                        {service.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                        {service.cost ? parseFloat(service.cost).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DT' : 'DT'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <select
                                                        value={service.status}
                                                        onChange={(e) => handleStatusChange(service.id, e.target.value)}
                                                        className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                                                    >
                                                        <option>En attente</option>
                                                        <option>En maintenance</option>
                                                        <option>Terminé</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* DTDT MODAL : Planifier un Entretien DTDT */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-primary">add_task</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Planifier un Entretien</h3>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">

                            {/* Vehicle */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Véhicule <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={form.car_id}
                                    onChange={e => setForm({ ...form, car_id: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                >
                                    <option value="">-- Sélectionner un véhicule --</option>
                                    {cars.map(car => (
                                        <option key={car.id} value={car.id}>
                                            {car.brand} {car.model}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Service Type */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Type de Service <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={form.service_type}
                                    onChange={e => setForm({ ...form, service_type: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                >
                                    <option value="">-- Choisir un type --</option>
                                    <option>Vidange moteur</option>
                                    <option>Révision annuelle</option>
                                    <option>Contrôle technique</option>
                                    <option>Remplacement pneus</option>
                                    <option>Freinage</option>
                                    <option>Assurance</option>
                                    <option>Autre</option>
                                </select>
                            </div>

                            {/* Details */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Détails</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Filtres, bougies, huileDT"
                                    value={form.details}
                                    onChange={e => setForm({ ...form, details: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                />
                            </div>

                            {/* Due Date + Cost (2 cols) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Date d'échéance <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={form.due_date}
                                        onChange={e => setForm({ ...form, due_date: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Coût estimé (DT)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Ex: 250"
                                        value={form.estimated_cost}
                                        onChange={e => setForm({ ...form, estimated_cost: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold shadow transition-all cursor-pointer disabled:opacity-60"
                                >
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                                            EnregistrementDT
                                        </span>
                                    ) : 'Planifier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Services;
