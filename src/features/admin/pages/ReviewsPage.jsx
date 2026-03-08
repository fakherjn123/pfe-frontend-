import { useEffect, useState } from "react";
import { Sparkles, Mail, RefreshCw, AlertTriangle, ClipboardList, Smile, Meh, Frown, BarChart3, Star, Search, Inbox } from "lucide-react";
import api from "../../../config/api.config";
import { generateReviewReply, analyzeSentiment } from "../../reviews/api/ai.service";

/* ─── Typing Indicator ────────────────────────────────────── */
const TypingIndicator = () => (
    <div className="flex gap-1.5 items-center py-2">
        {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
        <span className="text-slate-400 text-xs font-medium ml-2">L'IA rédige une réponse...</span>
    </div>
);

/* ─── Stat Card ───────────────────────────────────────────── */
const StatCard = ({ icon, label, value, colorClass, bgClass }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:-translate-y-0.5 transition-transform duration-200">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${bgClass} ${colorClass}`}>
            {icon}
        </div>
        <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</div>
            <div className="text-2xl font-black text-slate-900">{value}</div>
        </div>
    </div>
);

/* ─── Review Row with AI Reply ────────────────────────────── */
const ReviewRow = ({ review, onAiReply }) => {
    const [expanded, setExpanded] = useState(false);
    const [aiReply, setAiReply] = useState(review.ai_reply || null);
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(Boolean(review.ai_reply));
    const [sendError, setSendError] = useState(null);

    const sentiment = analyzeSentiment(review.rating);

    // Map the pseudo-colors to actual Tailwind classes based on sentiment
    let sentimentColorText = 'text-green-600';
    let sentimentColorBg = 'bg-green-50';
    let sentimentColorBorder = 'border-green-100';
    let avatarBg = 'bg-emerald-100';
    let avatarText = 'text-emerald-700';

    if (sentiment.label === 'NEGATIVE') {
        sentimentColorText = 'text-red-600';
        sentimentColorBg = 'bg-red-50';
        sentimentColorBorder = 'border-red-100';
        avatarBg = 'bg-rose-100';
        avatarText = 'text-rose-700';
    } else if (sentiment.label === 'NEUTRAL') {
        sentimentColorText = 'text-amber-600';
        sentimentColorBg = 'bg-amber-50';
        sentimentColorBorder = 'border-amber-100';
        avatarBg = 'bg-amber-100';
        avatarText = 'text-amber-700';
    }

    const handleGenerateReply = async () => {
        if (sent && !aiReply) {
            // Already sent but we might not have the text loaded properly
            setExpanded(!expanded);
            return;
        } else if (sent) {
            setExpanded(!expanded);
            return;
        }
        setExpanded(true);
        setGenerating(true);
        setSendError(null);
        try {
            const reply = await generateReviewReply(review);
            setAiReply(reply);
        } catch (e) {
            setSendError('Erreur lors de la génération');
        }
        setGenerating(false);
    };

    const handleSendEmail = async () => {
        setSending(true);
        setSendError(null);
        try {
            const res = await api.post("/reviews/manual-reply", {
                review_id: review.id,
                reply_text: aiReply
            });
            if (res.status === 200) {
                setSent(true);
                if (onAiReply) onAiReply();
            } else {
                setSendError("Erreur lors de l'envoi");
            }
        } catch (e) {
            setSendError(e.response?.data?.message || 'Erreur réseau');
        }
        setSending(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Main row */}
            <div className="p-5 flex flex-wrap lg:flex-nowrap items-center gap-5">
                {/* User info */}
                <div className="flex items-center gap-3 min-w-[200px] flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0 ${avatarBg} ${avatarText}`}>
                        {review.user_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                        <div className="text-slate-900 font-bold truncate">
                            {review.user_name || 'Client'}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5 truncate font-medium">
                            {review.brand} {review.model}
                        </div>
                    </div>
                </div>

                {/* Rating */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shrink-0 border ${sentimentColorBg} ${sentimentColorText} ${sentimentColorBorder}`}>
                    {sentiment.emoji} {review.rating}/10
                </div>

                {/* Comment preview */}
                <div className="text-slate-600 text-sm max-w-sm truncate flex-[2] hidden md:block" title={review.comment}>
                    {review.comment || <span className="text-slate-400 italic">Aucun commentaire</span>}
                </div>

                {/* Date & Status */}
                <div className="shrink-0 w-28 text-right flex flex-col items-end gap-1.5">
                    <div className="text-slate-400 text-xs font-medium">
                        {new Date(review.created_at).toLocaleDateString("fr-FR")}
                    </div>
                    {sent && (
                        <div className="text-[10px] font-black text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded uppercase tracking-widest">
                            Réponse envoyée
                        </div>
                    )}
                </div>

                {/* AI Reply Button */}
                <div className="flex gap-2 shrink-0 justify-end w-36">
                    <button
                        onClick={handleGenerateReply}
                        disabled={generating}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 w-full
                        ${generating
                                ? 'bg-indigo-50 text-indigo-400 cursor-wait'
                                : sent ? 'bg-white border border-indigo-200 text-indigo-600 hover:bg-slate-50 shadow-sm' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 hover:-translate-y-0.5'}`}
                    >
                        {generating ? (
                            <>
                                <span className="w-3 h-3 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></span>
                                Génération...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" /> {sent ? "Voir Réponse" : "Réponse IA"}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Comment view (visible only on small screens) */}
            <div className="px-5 pb-4 md:hidden text-slate-600 text-sm border-t border-slate-50 pt-3 mt-1">
                {review.comment || <span className="text-slate-400 italic">Aucun commentaire</span>}
            </div>

            {/* Expandable AI Reply Section */}
            {expanded && (
                <div className="border-t border-indigo-50 px-5 py-4 bg-indigo-50/30 overflow-hidden relative">
                    {/* Decorative side border */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400"></div>

                    {generating ? (
                        <TypingIndicator />
                    ) : aiReply ? (
                        <div className="pl-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs"><Sparkles className="w-4 h-4" /></div>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">
                                    Brouillon Généré par l'IA
                                </span>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-700 text-sm leading-relaxed mb-4 shadow-sm relative">
                                {/* Quotes decoration */}
                                <div className="absolute -top-3 -right-2 text-4xl text-slate-100 font-serif leading-none opacity-50 select-none">"</div>
                                {aiReply}
                            </div>

                            <div className="flex flex-wrap gap-3 items-center">
                                {!sent && (
                                    <>
                                        <button
                                            onClick={handleSendEmail}
                                            disabled={sending}
                                            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                                        >
                                            {sending ? (
                                                <>
                                                    <span className="w-4 h-4 rounded-full border-2 border-slate-600 border-t-white animate-spin"></span>
                                                    Envoi...
                                                </>
                                            ) : (
                                                <>
                                                    <Mail className="w-5 h-5 inline-block mr-1" /> Envoyer l'Email
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleGenerateReply}
                                            disabled={sending}
                                            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <RefreshCw className="w-4 h-4" /> Régénérer
                                        </button>
                                    </>
                                )}
                                {sent && (
                                    <div className="px-5 py-2.5 rounded-xl text-sm bg-green-50 text-green-700 font-bold flex items-center gap-2 border border-green-100">
                                        <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</div>
                                        Le client a reçu la réponse par email
                                    </div>
                                )}
                            </div>

                            {sendError && (
                                <div className="mt-3 px-4 py-2 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> {sendError}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

/* ─── MAIN PAGE ───────────────────────────────────────────── */
export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiRepliesCount, setAiRepliesCount] = useState(0);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

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

    const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : '—';
    const positiveCount = reviews.filter(r => r.rating >= 4).length;
    const positivePercent = reviews.length ? Math.round((positiveCount / reviews.length) * 100) : 0;

    // Filter logic
    const filtered = reviews
        .filter(r => {
            if (filter === 'positive') return r.rating >= 4;
            if (filter === 'neutral') return r.rating === 3;
            if (filter === 'negative') return r.rating < 3;
            return true;
        })
        .filter(r => {
            if (!search) return true;
            const q = search.toLowerCase();
            return (r.user_name?.toLowerCase().includes(q))
                || (r.comment?.toLowerCase().includes(q))
                || (`${r.brand} ${r.model}`.toLowerCase().includes(q));
        });

    const FILTERS = [
        { key: 'all', label: 'Tous', icon: <ClipboardList className="w-4 h-4" /> },
        { key: 'positive', label: 'Positifs', icon: <Smile className="w-4 h-4" /> },
        { key: 'neutral', label: 'Neutres', icon: <Meh className="w-4 h-4" /> },
        { key: 'negative', label: 'Négatifs', icon: <Frown className="w-4 h-4" /> },
    ];

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 min-h-screen">


            <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">

                {/* AI Banner */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 flex items-start sm:items-center gap-4 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-indigo-100 to-transparent opacity-50"></div>
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl shrink-0 z-10"><Sparkles className="w-6 h-6 text-indigo-500" /></div>
                    <div className="z-10">
                        <div className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">
                            Assistant IA Intégré
                        </div>
                        <div className="text-slate-600 text-sm font-medium">
                            Générez instantanément des réponses professionnelles, personnalisées au client, au véhicule et au contexte de l'avis.
                        </div>
                    </div>
                </div>

                {/* KPI Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={<BarChart3 className="w-6 h-6" />} label="Total Avis" value={reviews.length} colorClass="text-blue-600" bgClass="bg-blue-50" />
                    <StatCard icon={<Star className="w-6 h-6" />} label="Note Moyenne" value={`${avgRating}/10`} colorClass="text-amber-500" bgClass="bg-amber-50" />
                    <StatCard icon={<Smile className="w-6 h-6" />} label="Avis Positifs" value={`${positivePercent}%`} colorClass="text-green-600" bgClass="bg-green-50" />
                </div>

                {/* Controls Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex-1 min-w-[200px] relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search className="w-5 h-5" /></span>
                        <input
                            type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher par client, véhicule ou commentaire..."
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block pl-10 p-2.5 transition-colors font-medium"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5
                                ${filter === f.key ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                            >
                                <span className="flex items-center">{f.icon}</span> {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Count */}
                {!loading && (
                    <div className="text-slate-500 text-sm font-medium px-1">
                        {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
                        {search && <span className="text-slate-400"> pour "<span className="text-slate-700">{search}</span>"</span>}
                    </div>
                )}

                {/* Reviews List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                        <span className="font-medium">Chargement des avis...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                        <div className="mb-4"><Inbox className="w-12 h-12 mx-auto text-slate-300" /></div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun avis trouvé</h3>
                        <p className="text-slate-500">{search ? `Aucun résultat pour la recherche` : 'Aucun avis dans cette catégorie'}</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 pb-8">
                        {filtered.map((review) => (
                            <ReviewRow
                                key={review.id}
                                review={review}
                                onAiReply={() => setAiRepliesCount(c => c + 1)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
