import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Fuel, Navigation, Camera, CheckSquare, ShieldCheck, X } from 'lucide-react';
import api from '../../../config/api.config.js';

const sans = "'Inter', 'Helvetica Neue', sans-serif";

export default function InspectionModal({ rental, onClose, onRefresh, isAdmin }) {
  const [inspections, setInspections] = useState([]);
  const [activeTab, setActiveTab ] = useState('check_in');
  const [editing, setEditing] = useState(null); // the current inspection object being edited
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInspections();
  }, [rental.id]);

  const fetchInspections = async () => {
    try {
      const res = await api.get(`/inspections/rental/${rental.id}`);
      setInspections(res.data);
      // Select the active tab or create one
      const found = res.data.find(i => i.type === activeTab);
      setEditing(found || { rental_id: rental.id, type: activeTab, fuel_level: 100, mileage: 0, exterior_notes: '', interior_notes: '', photos: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (type) => {
    setActiveTab(type);
    const found = inspections.find(i => i.type === type);
    setEditing(found || { rental_id: rental.id, type: type, fuel_level: 100, mileage: 0, exterior_notes: '', interior_notes: '', photos: [] });
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (editing.id) {
        await api.put(`/inspections/${editing.id}`, editing);
      } else {
        const res = await api.post('/inspections', editing);
        setEditing(res.data);
      }
      await fetchInspections();
      alert("Données enregistrées.");
    } catch (err) {
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSign = async () => {
    if (!editing.id) return alert("Veuillez d'abord enregistrer les données.");
    try {
      await api.put(`/inspections/${editing.id}/sign`);
      await fetchInspections();
      alert("Signé avec succès.");
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Erreur lors de la signature.");
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1";

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ fontFamily: sans }}>
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">État des Lieux Numérique</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{rental.brand} {rental.model} — #{rental.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20}/></button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 m-6 mb-0 rounded-2xl">
          {['check_in', 'check_out'].map(t => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t === 'check_in' ? 'Départ (Check-in)' : 'Retour (Check-out)'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          {/* Status Alert */}
          {editing.client_signature && editing.admin_signature ? (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700">
              <ShieldCheck size={20} />
              <span className="text-xs font-bold uppercase tracking-wide">État des lieux validé et signé par les deux parties</span>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-black uppercase tracking-wide">
                <ClipboardCheck size={16} />
                Signatures requises
              </div>
              <div className="flex gap-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${editing.admin_signature ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>ADMIN: {editing.admin_signature ? 'SIGNE' : 'EN ATTENTE'}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${editing.client_signature ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>CLIENT: {editing.client_signature ? 'SIGNE' : 'EN ATTENTE'}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}><Fuel size={12} className="inline mr-1"/> Niveau Carburant (%)</label>
              <input 
                type="number" className={inputClass} value={editing.fuel_level} 
                onChange={e => setEditing({...editing, fuel_level: e.target.value})}
                disabled={editing.admin_signature}
              />
            </div>
            <div>
              <label className={labelClass}><Navigation size={12} className="inline mr-1"/> Kilométrage (KM)</label>
              <input 
                type="number" className={inputClass} value={editing.mileage} 
                onChange={e => setEditing({...editing, mileage: e.target.value})}
                disabled={editing.admin_signature}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes Extérieures (Dommages, Chocs...)</label>
            <textarea 
              className={`${inputClass} h-24`} placeholder="Notez ici les rayures ou chocs visibles..." 
              value={editing.exterior_notes || ''} 
              onChange={e => setEditing({...editing, exterior_notes: e.target.value})}
              disabled={editing.admin_signature}
            />
          </div>

          <div>
            <label className={labelClass}>Notes Intérieures (Sièges, Odeurs...)</label>
            <textarea 
              className={`${inputClass} h-24`} placeholder="État de la sellerie, propreté..." 
              value={editing.interior_notes || ''} 
              onChange={e => setEditing({...editing, interior_notes: e.target.value})}
              disabled={editing.admin_signature}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50/50">
          {!editing.admin_signature && isAdmin && (
            <button 
              onClick={handleSave} disabled={submitting}
              className="flex-1 bg-slate-900 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer Modifications'}
            </button>
          )}

          {((isAdmin && !editing.admin_signature) || (!isAdmin && !editing.client_signature)) && (
            <button 
              onClick={handleSign}
              className="flex-3 bg-indigo-600 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
            >
              Signer numériquement
            </button>
          )}
          
          {((isAdmin && editing.admin_signature) || (!isAdmin && editing.client_signature)) && (
            <div className="flex-1 bg-emerald-500 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest text-center">
              Déjà signé par vous-même
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
