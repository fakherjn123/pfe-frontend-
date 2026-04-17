import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Fuel, Navigation, Camera, CheckSquare, ShieldCheck, X } from 'lucide-react';
import api from '../../../config/api.config.js';
import toast from 'react-hot-toast';

const sans = "'Inter', 'Helvetica Neue', sans-serif";

export default function InspectionModal({ rental, onClose, onRefresh, isAdmin }) {
  const [inspections, setInspections] = useState([]);
  const [activeTab, setActiveTab] = useState('check_in');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInspections();
  }, [rental.id]);

  const fetchInspections = async () => {
    try {
      const res = await api.get(`/inspections/rental/${rental.id}`);
      setInspections(res.data);
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
      toast.success("Données enregistrées avec succès.");
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSign = async () => {
    if (!editing.id) return toast.error("Veuillez d'abord enregistrer les modifications.");
    try {
      await api.put(`/inspections/${editing.id}/sign`);
      await fetchInspections();
      toast.success("État des lieux signé avec succès !");
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error("Erreur lors de la signature.");
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if(files.length === 0) return;
    
    // Convert multiple files to base64
    Promise.all(files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    })).then(base64Photos => {
      setEditing({ ...editing, photos: [...(editing.photos || []), ...base64Photos] });
    });
  };

  const removePhoto = (idxToRemove) => {
    const newPhotos = editing.photos.filter((_, idx) => idx !== idxToRemove);
    setEditing({ ...editing, photos: newPhotos });
  };

  const inputClass = "w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1";

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ fontFamily: sans }}>
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{rental.brand} {rental.model}</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location #{rental.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20} /></button>
        </div>

        {/* --- TABS --- */}
        <div className="flex px-6 bg-slate-50/50 border-b border-slate-100 gap-4">
          <button 
            onClick={() => handleTabChange('check_in')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-widest border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'check_in' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            ÉTAT AU DÉPART 
            {inspections.find(i => i.type === 'check_in')?.admin_signature && <ShieldCheck size={14}/>}
          </button>
          <button 
            onClick={() => handleTabChange('check_out')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-widest border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'check_out' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            ÉTAT AU RETOUR 
            {inspections.find(i => i.type === 'check_out')?.admin_signature && <ShieldCheck size={14}/>}
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}><Fuel size={12} className="inline mr-1" /> Niveau Carburant (%)</label>
              <input
                type="number" className={inputClass} value={editing.fuel_level}
                onChange={e => setEditing({ ...editing, fuel_level: e.target.value })}
                disabled={editing.admin_signature}
              />
            </div>
            <div>
              <label className={labelClass}><Navigation size={12} className="inline mr-1" /> Kilométrage (KM)</label>
              <input
                type="number" className={inputClass} value={editing.mileage}
                onChange={e => setEditing({ ...editing, mileage: e.target.value })}
                disabled={editing.admin_signature}
              />
            </div>
          </div>

          {/* Photo Section */}
          <div>
            <label className={labelClass}><Camera size={12} className="inline mr-1" /> Photos (Dommages, Chocs, État général)</label>
            <div className="flex gap-4 flex-wrap mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[140px] items-start">
              {editing.photos?.map((photo, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-300 shadow-sm">
                  <img src={photo} alt={"Inspection " + idx} className="w-full h-full object-cover" />
                  {!editing.admin_signature && (
                    <button 
                      onClick={() => removePhoto(idx)} 
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              {!editing.admin_signature && (
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-indigo-400 hover:border-indigo-500 hover:text-indigo-600 hover:bg-white cursor-pointer transition-all">
                  <Camera size={24} className="mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Ajouter</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
              {editing.admin_signature && (!editing.photos || editing.photos.length === 0) && (
                <p className="text-sm text-slate-400 italic">Aucune photo fournie pour cet état des lieux.</p>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Prenez en photo toutes rayures, chocs, ou détails importants.</p>
          </div>

          {/* Remaining text notes */}
          <div>
            <label className={labelClass}>Notes additionnelles (Optionnel)</label>
            <textarea
              className={`${inputClass} h-20 bg-slate-50`} placeholder="Observations particulières (propreté, éléments intérieurs...)"
              value={editing.interior_notes || ''}
              onChange={e => setEditing({ ...editing, interior_notes: e.target.value })}
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
              Signer numériquement le {activeTab === 'check_in' ? 'Départ' : 'Retour'}
            </button>
          )}

          {((isAdmin && editing.admin_signature) || (!isAdmin && editing.client_signature)) && (
            <div className="flex-1 bg-emerald-500 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest text-center shadow-xl shadow-emerald-500/20">
              État des lieux contrôlé et scellé
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
