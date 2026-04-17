import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Archive, Trash2, Loader2, Calendar, MapPin, Phone, Building2, Plus, Edit2, Info } from 'lucide-react';
import api from '../../../config/api.config';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../shared/components/modals/ConfirmModal';

const AdminContactPage = () => {
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'coordonnees'
    
    // Messages state
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true);

    // Details state
    const [details, setDetails] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: null, type: 'address', label: '', value: '' });
    const [confirmModal, setConfirmModal] = useState({ open: false });

    // --- FETCH DATA ---
    useEffect(() => {
        if (activeTab === 'messages') {
            fetchMessages();
        } else {
            fetchDetails();
        }
    }, [activeTab]);

    const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
            const res = await api.get('/contacts');
            setMessages(res.data);
        } catch (error) {
            console.error("Erreur chargement messages", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const fetchDetails = async () => {
        setLoadingDetails(true);
        try {
            const res = await api.get('/contacts/info');
            setDetails(res.data);
        } catch (error) {
            console.error("Erreur chargement infos de contact", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    // --- MESSAGES HANDLERS ---
    const updateMessageStatus = async (id, newStatus) => {
        try {
            await api.patch(`/contacts/${id}/status`, { status: newStatus });
            setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m));
        } catch (err) {
            console.error("Erreur mise à jour message", err);
        }
    };

    const deleteMessage = (id) => {
        setConfirmModal({
            open: true,
            title: 'Supprimer le message',
            message: 'Êtes-vous sûr de vouloir supprimer définitivement ce message ?',
            confirmText: 'Supprimer',
            danger: true,
            onConfirm: async () => {
                setConfirmModal(m => ({ ...m, open: false }));
                try {
                    await api.delete(`/contacts/${id}`);
                    setMessages(messages.filter(m => m.id !== id));
                    toast.success('Message supprimé.');
                } catch (err) {
                    toast.error('Erreur lors de la suppression.');
                    console.error(err);
                }
            },
        });
    };

    // --- DETAILS HANDLERS ---
    const handleDetailSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const res = await api.put(`/contacts/info/${formData.id}`, formData);
                setDetails(details.map(d => d.id === formData.id ? res.data.data : d));
            } else {
                const res = await api.post('/contacts/info', formData);
                setDetails([...details, res.data.data]);
            }
            setShowModal(false);
        } catch (error) {
            console.error("Erreur sauvegarde coordonnée", error);
            toast.error("Erreur lors de la sauvegarde.");
        }
    };

    const deleteDetail = (id) => {
        setConfirmModal({
            open: true,
            title: 'Supprimer la coordonnée',
            message: 'Voulez-vous vraiment supprimer cette coordonnée de contact ?',
            confirmText: 'Supprimer',
            danger: true,
            onConfirm: async () => {
                setConfirmModal(m => ({ ...m, open: false }));
                try {
                    await api.delete(`/contacts/info/${id}`);
                    setDetails(details.filter(d => d.id !== id));
                    toast.success('Coordonnée supprimée.');
                } catch (err) {
                    toast.error('Erreur lors de la suppression.');
                    console.error(err);
                }
            },
        });
    };

    const openEditModal = (detail) => {
        setFormData({ id: detail.id, type: detail.type, label: detail.label, value: detail.value });
        setIsEditing(true);
        setShowModal(true);
    };

    const openCreateModal = () => {
        setFormData({ id: null, type: 'phone', label: '', value: '' });
        setIsEditing(false);
        setShowModal(true);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'address': return <MapPin size={20} className="text-slate-400" />;
            case 'phone':
            case 'whatsapp': return <Phone size={20} className="text-slate-400" />;
            case 'email': return <Mail size={20} className="text-slate-400" />;
            case 'description': return <Info size={20} className="text-slate-400" />;
            default: return <Building2 size={20} className="text-slate-400" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'address': return 'Adresse';
            case 'phone': return 'Téléphone';
            case 'whatsapp': return 'WhatsApp';
            case 'email': return 'Email';
            case 'description': return 'Description';
            default: return type;
        }
    };

    return (
        <>
        <main className="flex-1 overflow-y-auto p-6 min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Building2 strokeWidth={2.5} />
                        Gestion des Contacts
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Gérez les messages clients et les coordonnées publiques de l'agence.</p>
                </div>
                {activeTab === 'coordonnees' && (
                    <button onClick={openCreateModal} className="px-4 py-2 bg-slate-900 text-white rounded-lg flex items-center gap-2 hover:bg-slate-800 transition text-sm font-semibold">
                        <Plus size={18} /> Ajouter une info
                    </button>
                )}
            </div>

            {/* TABS */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-8">
                <button 
                    onClick={() => setActiveTab('messages')}
                    className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'messages' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <div className="flex items-center gap-2">
                        <Mail size={18} />
                        Messages Reçus
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('archives')}
                    className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'archives' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <div className="flex items-center gap-2">
                        <Archive size={18} />
                        Archives
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('coordonnees')}
                    className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'coordonnees' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <div className="flex items-center gap-2">
                        <MapPin size={18} />
                        Coordonnées Publiques
                    </div>
                </button>
            </div>

            {/* TAB CONTENT: MESSAGES & ARCHIVES */}
            {(activeTab === 'messages' || activeTab === 'archives') && (
                <div>
                    {loadingMessages ? (
                        <div className="flex items-center justify-center py-20 text-slate-500"><Loader2 className="animate-spin" size={40} /></div>
                    ) : (() => {
                        const displayedMessages = messages.filter(m => activeTab === 'messages' ? m.status !== 'archivé' : m.status === 'archivé');
                        
                        if (displayedMessages.length === 0) {
                            return (
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-4">
                                        {activeTab === 'messages' ? <Mail size={48} className="text-slate-300 dark:text-slate-600" /> : <Archive size={48} className="text-slate-300 dark:text-slate-600" />}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                                        {activeTab === 'messages' ? 'Aucun message pour le moment' : 'Aucune archive'}
                                    </h3>
                                    <p className="text-slate-500 max-w-sm">
                                        {activeTab === 'messages' ? "Vous n'avez reçu aucun message via la page de contact récemment." : "Vos messages archivés apparaîtront ici."}
                                    </p>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-4">
                                {displayedMessages.map((msg) => (
                                    <div key={msg.id} className={`bg-white dark:bg-slate-900 border overflow-hidden rounded-xl shadow-sm transition-all ${msg.status === 'non lu' ? 'border-l-4 border-l-primary border-t-slate-200 border-r-slate-200 border-b-slate-200' : 'border-slate-200 dark:border-slate-800 opacity-75'}`}>
                                        <div className="p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{msg.subject}</h3>
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${msg.status === 'non lu' ? 'bg-amber-100 text-amber-700' : msg.status === 'lu' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {msg.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4 flex-wrap">
                                                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                                        <span className="material-symbols-outlined text-sm">person</span>
                                                        {msg.name}
                                                    </span>
                                                    <span className="flex items-center gap-1">{msg.email}</span>
                                                    {msg.phone && <span className="flex items-center gap-1"><Phone size={14} />{msg.phone}</span>}
                                                    <span className="flex items-center gap-1"><Calendar size={14} />{new Date(msg.created_at).toLocaleString('fr-FR')}</span>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">{msg.message}</div>
                                            </div>
                                            <div className="flex lg:flex-col items-center gap-2 lg:min-w-[140px] border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
                                                {msg.status !== 'lu' && msg.status !== 'archivé' && (
                                                    <button onClick={() => updateMessageStatus(msg.id, 'lu')} className="w-full justify-center flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-semibold transition">
                                                        <CheckCircle2 size={16} /> Lu
                                                    </button>
                                                )}
                                                {msg.status !== 'archivé' && (
                                                    <button onClick={() => updateMessageStatus(msg.id, 'archivé')} className="w-full justify-center flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition">
                                                        <Archive size={16} /> Archiver
                                                    </button>
                                                )}
                                                {msg.status === 'archivé' && (
                                                    <button onClick={() => updateMessageStatus(msg.id, 'lu')} className="w-full justify-center flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold transition">
                                                        <Archive size={16} className="rotate-180" /> Désarchiver
                                                    </button>
                                                )}
                                                <button onClick={() => deleteMessage(msg.id)} className="w-full justify-center flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition mt-auto">
                                                    <Trash2 size={16} /> Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* TAB CONTENT: COORDONNEES */}
            {activeTab === 'coordonnees' && (
                <div>
                    {loadingDetails ? (
                        <div className="flex items-center justify-center py-20 text-slate-500"><Loader2 className="animate-spin" size={40} /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {details.map(detail => (
                                <div key={detail.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg shrink-0">
                                                {getTypeIcon(detail.type)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 capitalize tracking-wide">{getTypeLabel(detail.type)}</p>
                                                <p className="font-semibold text-slate-900 dark:text-slate-100 my-0.5">{detail.label}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 overflow-hidden text-ellipsis line-clamp-3 leading-relaxed mt-1">
                                                    {detail.value}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(detail)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => deleteDetail(detail.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL AJOUT/EDITION COORDONNEES */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-lg">{isEditing ? 'Modifier une information' : 'Ajouter une information'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-800"><Plus className="rotate-45" size={24}/></button>
                        </div>
                        <form onSubmit={handleDetailSubmit} className="p-6 space-y-4 text-sm">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Type d'information</label>
                                <select 
                                    className="w-full border rounded-lg px-3 py-2.5 outline-none focus:border-primary"
                                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="phone">Téléphone</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="address">Adresse</option>
                                    <option value="email">Email</option>
                                    <option value="description">Description (Paragraphe)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Titre (Label)</label>
                                <input 
                                    required type="text" placeholder="Ex: Bureau principal, WhatsApp France..." 
                                    className="w-full border rounded-lg px-3 py-2.5 outline-none focus:border-primary"
                                    value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Valeur</label>
                                {formData.type === 'description' ? (
                                    <textarea 
                                        required placeholder="Votre description..." rows="4"
                                        className="w-full border rounded-lg px-3 py-2.5 outline-none focus:border-primary"
                                        value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})}
                                    />
                                ) : (
                                    <input 
                                        required type="text" placeholder="Ex: +33 7 45 18 45 64" 
                                        className="w-full border rounded-lg px-3 py-2.5 outline-none focus:border-primary"
                                        value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})}
                                    />
                                )}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition">Annuler</button>
                                <button type="submit" className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>

        <ConfirmModal
            open={confirmModal.open}
            title={confirmModal.title}
            message={confirmModal.message}
            confirmText={confirmModal.confirmText}
            danger={confirmModal.danger}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal(m => ({ ...m, open: false }))}
        />
        </>
    );
};

export default AdminContactPage;
