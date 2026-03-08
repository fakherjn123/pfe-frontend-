import React, { useEffect, useState } from "react";
import { getAllFactures, downloadFacture } from "../../factures/api/facture.service";
import { Search, FileText, Download, Calendar, Mail, Car, Receipt } from "lucide-react";

export default function AllFacturesPage() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllFactures()
      .then(r => {
        setFactures(r.data.factures || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = factures.filter(f =>
    !search ||
    f.email?.toLowerCase().includes(search.toLowerCase()) ||
    f.brand?.toLowerCase().includes(search.toLowerCase()) ||
    f.model?.toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.reduce((s, f) => s + Number(f.total), 0);

  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="pb-16 bg-slate-50 min-h-[calc(100vh-64px)]">
      {/* Header section matching other pages */}
      <div className="bg-white border-b border-slate-100 px-8 py-8 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Receipt className="w-5 h-5" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Factures</h2>
            </div>
            <p className="text-sm font-medium text-slate-500 ml-13">Vérifiez et téléchargez l'historique des factures de vos clients.</p>
          </div>
          <div className="text-right">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Affiché</div>
            <div className="text-3xl font-black text-slate-900">
              {formatCurrency(total)} <span className="text-lg text-slate-400 font-bold">DT</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-transparent focus:border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-100 text-sm transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400"
              placeholder="Rechercher par client, marque ou modèle..."
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
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">N° Facture</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Client</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Véhicule</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Période</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Date d'édition</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Montant</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-slate-400">
                      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin mx-auto mb-3"></div>
                      <p className="text-sm font-medium">Chargement des factures...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-slate-400">
                      <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium">Aucune facture trouvée pour "{search}"</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-xs">
                          #{String(f.id).padStart(5, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-bold">{f.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Car className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium">{f.brand} {f.model}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(f.start_date)}</span>
                          <span className="text-slate-300 mx-0.5">→</span>
                          <span>{formatDate(f.end_date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-xs font-medium text-slate-500">
                        {formatDate(f.created_at)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <span className="text-sm font-extrabold text-slate-900 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md tracking-tight">
                          {formatCurrency(f.total)} <span className="text-[10px] text-indigo-600/70 font-bold ml-0.5">DT</span>
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <button
                          onClick={() => downloadFacture(f.id)}
                          className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center mx-auto hover:shadow-sm"
                          title="Télécharger le PDF"
                        >
                          <Download className="w-4 h-4" />
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
    </div>
  );
}