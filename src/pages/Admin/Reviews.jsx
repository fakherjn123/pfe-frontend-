import { useEffect, useState } from "react";
import api from "../../config/api.config";

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get("/reviews/all");
            setReviews(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteReview = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return;
        try {
            await api.delete(`/reviews/${id}`);
            setReviews(reviews.filter((r) => r.id !== id));
        } catch (err) {
            alert("Erreur lors de la suppression de l'avis");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement des avis...</div>;

    return (
        <div className="p-8 pb-32">
            <div className="mb-8 flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-800">Avis Clients & IA</h1>
                <p className="text-gray-500">Gérez les avis clients. Chaque avis déposé reçoit automatiquement une réponse générée par l'IA envoyée par email au client.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50/80 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Véhicule</th>
                                <th className="px-6 py-4">Note</th>
                                <th className="px-6 py-4">Commentaire</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Aucun avis trouvé.
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{r.user_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                                            {r.brand} {r.model}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded text-xs font-bold ${r.rating >= 4 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {r.rating} / 5
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={r.comment}>
                                            {r.comment || <span className="text-gray-400 italic">Aucun commentaire</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {new Date(r.created_at).toLocaleDateString("fr-FR")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteReview(r.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Supprimer l'avis"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
