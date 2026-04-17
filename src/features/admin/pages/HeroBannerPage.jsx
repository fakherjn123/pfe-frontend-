import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, CheckCircle, XCircle, Layout, Upload } from 'lucide-react';
import { getHeroImages, addHeroImage, deleteHeroImage, updateHeroImage } from '../api/hero.service';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../shared/components/modals/ConfirmModal';

const HeroBannerPage = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ open: false });

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await getHeroImages();
            setImages(res.data);
        } catch (error) {
            console.error("Erreur lors du chargement des images", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('is_active', true);

        try {
            await addHeroImage(formData);
            setSelectedFile(null);
            setPreview(null);
            fetchImages();
        } catch (error) {
            console.error("Erreur lors de l'upload", error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            open: true,
            title: 'Supprimer cette image',
            message: 'Voulez-vous vraiment supprimer cette image de la bannière ?',
            confirmText: 'Supprimer',
            danger: true,
            onConfirm: async () => {
                setConfirmModal(m => ({ ...m, open: false }));
                try {
                    await deleteHeroImage(id);
                    toast.success('Image supprimée.');
                    fetchImages();
                } catch (error) {
                    toast.error('Erreur lors de la suppression.');
                    console.error(error);
                }
            },
        });
    };

    const toggleStatus = async (image) => {
        try {
            await updateHeroImage(image.id, { is_active: !image.is_active });
            fetchImages();
        } catch (error) {
            console.error("Erreur lors de la mise à jour", error);
        }
    };

    return (
        <>
        <div style={{ fontFamily: "'Inter', sans-serif" }} className="pb-16 bg-slate-50 min-h-[calc(100vh-64px)]">
            <div className="bg-white border-b border-slate-100 px-8 py-8 mb-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Layout className="w-5 h-5" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestion de la Bannière</h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 ml-13">Gérez les photos qui s'affichent en arrière-plan sur la page d'accueil.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                {/* Upload Section */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-8">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-600" />
                        Ajouter une nouvelle photo
                    </h3>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-full md:w-1/2">
                            <label className="group relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all overflow-hidden">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-10 h-10 text-slate-300 mb-4 group-hover:text-indigo-400 group-hover:scale-110 transition-transform" />
                                        <p className="mb-2 text-sm text-slate-500"><span className="font-black">Cliquez pour uploader</span> ou glissez-déposez</p>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">PNG, JPG, WEBP (Max. 5MB)</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div>

                        <div className="w-full md:w-1/2 space-y-4">
                            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                                <h4 className="text-indigo-900 font-black text-sm mb-2">Conseils pour une belle bannière :</h4>
                                <ul className="text-indigo-700 text-xs font-medium space-y-2">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                        Utilisez des images haute résolution (1920x1080 min).
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                        Photos de voitures centrées ou de profil.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                        Mettez en avant le côté Premium et Luxe.
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${!selectedFile || uploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 shadow-xl'}`}
                            >
                                {uploading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Plus className="w-5 h-5" />
                                )}
                                {uploading ? "Envoi..." : "Ajouter à la bannière"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Images List */}
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                    Photos actuelles
                </h3>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                        <p className="text-slate-400 font-bold text-sm">Chargement des photos...</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <ImageIcon className="w-16 h-16 text-slate-100 mb-4" />
                        <p className="text-slate-400 font-bold">Aucune photo dans la bannière.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((img) => (
                            <div key={img.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                <div className="h-48 relative overflow-hidden">
                                    <img
                                        src={`http://localhost:3000${img.image_url}`}
                                        alt="Banner"
                                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!img.is_active ? 'grayscale opacity-50' : ''}`}
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${img.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                                            {img.is_active ? "Actif" : "Inactif"}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => toggleStatus(img)}
                                            className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                            title={img.is_active ? "Désactiver" : "Activer"}
                                        >
                                            {img.is_active ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(img.id)}
                                            className="w-10 h-10 rounded-full bg-white text-rose-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 flex justify-between items-center bg-slate-50/50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Ajouté le {new Date(img.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-300">#{img.id}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

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

export default HeroBannerPage;
