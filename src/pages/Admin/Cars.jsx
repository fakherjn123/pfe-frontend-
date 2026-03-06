import React, { useState, useEffect, useRef } from 'react';
import api from '../../config/api.config';
import { generateCarDescription } from '../../features/reviews/api/ai.service';

const EMPTY_FORM = { id: null, brand: '', model: '', price_per_day: '', status: 'available', image: null, existingImage: null, description: '' };
const FILTERS = ['Tous', 'Disponible', 'Loué', 'Maintenance'];

const getStatus = (car) => {
  if (!car.available) return { label: 'Indisponible', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' };
  if (car.status === 'maintenance') return { label: 'Maintenance', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' };
  return { label: 'Disponible', color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' };
};

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('id');

  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTypingText, setAiTypingText] = useState('');

  useEffect(() => { fetchCars(); }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cars');
      setCars(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setIsEdit(false); setForm(EMPTY_FORM); setPreview(null); setModal(true); };
  const openEdit = (car) => {
    setIsEdit(true);
    setForm({
      id: car.id, brand: car.brand, model: car.model, price_per_day: car.price_per_day,
      status: car.available ? 'available' : 'unavailable', image: null, existingImage: car.image,
      description: car.description || ''
    });
    setPreview(car.image ? `http://localhost:3000${car.image}` : null);
    setModal(true);
  };

  const handleSubmit = async () => {
    if (!form.brand || !form.model || !form.price_per_day) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('brand', form.brand);
      fd.append('model', form.model);
      fd.append('price_per_day', form.price_per_day);
      if (form.description) fd.append('description', form.description);
      fd.append('status', form.status);
      if (form.image instanceof File) fd.append('image', form.image);

      if (isEdit) {
        await api.put(`/cars/${form.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/cars', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setModal(false);
      fetchCars();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/cars/${id}`); fetchCars(); }
    catch (e) { console.error(e); }
    setDeleteId(null);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setForm(p => ({ ...p, image: f }));
    setPreview(URL.createObjectURL(f));
  };

  const handleAiGenerate = async () => {
    if (!form.brand && !form.model) return;
    setAiGenerating(true);
    setAiTypingText('');
    try {
      const desc = await generateCarDescription(form);
      let i = 0;
      const interval = setInterval(() => {
        i += 2;
        setAiTypingText(desc.slice(0, i));
        if (i >= desc.length) {
          clearInterval(interval);
          setForm(p => ({ ...p, description: desc }));
          setAiGenerating(false);
        }
      }, 10);
    } catch (e) {
      console.error(e);
      setAiGenerating(false);
    }
  };

  // Filter + search + sort
  const visible = cars
    .filter(c => {
      const q = search.toLowerCase();
      return c.brand?.toLowerCase().includes(q) || c.model?.toLowerCase().includes(q);
    })
    .filter(c => {
      if (filter === 'Tous') return true;
      if (filter === 'Disponible') return c.available;
      if (filter === 'Loué') return !c.available;
      if (filter === 'Maintenance') return c.status === 'maintenance';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price_per_day - b.price_per_day;
      if (sortBy === 'price_desc') return b.price_per_day - a.price_per_day;
      if (sortBy === 'name') return `${a.brand}${a.model}`.localeCompare(`${b.brand}${b.model}`);
      return a.id - b.id;
    });

  const totalAvailable = cars.filter(c => c.available).length;
  const totalUnavailable = cars.filter(c => !c.available).length;
  const avgPrice = cars.length ? Math.round(cars.reduce((s, c) => s + Number(c.price_per_day), 0) / cars.length) : 0;

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between px-8 py-5 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="flex flex-col">
          <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">
            Gestion Flotte
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Parc Automobile
          </h2>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <button onClick={openAdd} className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
            <span className="text-lg">+</span>
            Ajouter un Véhicule
          </button>
        </div>
      </header>

      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">🚗</div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Total Flotte</div>
              <div className="text-2xl font-black text-slate-900">{cars.length}</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-2xl">✅</div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Disponibles</div>
              <div className="text-2xl font-black text-slate-900">{totalAvailable}</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-2xl">🔴</div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Indisponibles</div>
              <div className="text-2xl font-black text-slate-900">{totalUnavailable}</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl">💰</div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Prix Moyen/Jour</div>
              <div className="text-2xl font-black text-slate-900">{avgPrice} DT</div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[200px] relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher marque ou modèle..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block pl-10 p-2.5 transition-colors"
            />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 cursor-pointer">
            <option value="id">Tri : ID</option>
            <option value="name">Tri : Nom</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
          <div className="flex bg-slate-50 rounded-xl border border-slate-200 p-1">
            <button onClick={() => setViewMode('grid')} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm font-bold text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>⊞</button>
            <button onClick={() => setViewMode('list')} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm font-bold text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>☰</button>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <div className="text-5xl mb-4">🚗</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun véhicule trouvé</h3>
            <p className="text-slate-500 mb-6">{search ? `Aucun résultat pour "${search}"` : "Ajoutez votre premier véhicule"}</p>
            <button onClick={openAdd} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
              + Ajouter un Véhicule
            </button>
          </div>
        ) : (
          <div className={`gap-6 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col'}`}>
            {visible.map((car) => {
              const st = getStatus(car);
              const imgSrc = car.image ? `http://localhost:3000${car.image}` : null;
              if (viewMode === 'list') {
                return (
                  <div key={car.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-24 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl">
                      {imgSrc ? <img src={imgSrc} alt="car" className="w-full h-full object-cover" /> : '🚗'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-slate-900 truncate text-lg">
                        {car.brand} <span className="font-normal text-slate-500">{car.model}</span>
                      </div>
                      <div className="text-slate-400 text-xs mt-1 font-mono">#{String(car.id).padStart(4, '0')}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${st.bg} ${st.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span> {st.label}
                    </div>
                    <div className="w-28 text-right font-black text-primary-600 text-xl pl-4">
                      {car.price_per_day} <span className="font-medium text-slate-400 text-sm">DT/j</span>
                    </div>
                    <div className="flex gap-2 pl-6">
                      <button onClick={() => openEdit(car)} className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-bold transition-colors border border-slate-200">Éditer</button>
                      <button onClick={() => setDeleteId(car.id)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors border border-red-100">Supprimer</button>
                    </div>
                  </div>
                );
              }
              return (
                <div key={car.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group hover:-translate-y-1">
                  <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {imgSrc ? (
                      <img src={imgSrc} alt="car" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="text-6xl opacity-30">🚗</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60"></div>
                    <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 bg-white shadow-sm ${st.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span> {st.label}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{car.brand}</div>
                        <div className="font-black text-slate-900 text-xl truncate pr-2">{car.model}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-primary-600 text-2xl">{car.price_per_day}</div>
                        <div className="text-xs text-slate-400 font-medium">DT/jour</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                      <button onClick={() => openEdit(car)} className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-bold transition-colors border border-slate-200 flex items-center justify-center gap-2">
                        ✏️ Éditer
                      </button>
                      <button onClick={() => setDeleteId(car.id)} className="py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition-colors border border-red-100 flex items-center justify-center gap-2">
                        🗑️ Sup
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {viewMode === 'grid' && (
              <button onClick={openAdd} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl min-h-[300px] flex flex-col items-center justify-center gap-3 hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-slate-500 hover:text-indigo-600 group">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">+</div>
                <span className="font-bold">Nouveau Véhicule</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-black text-xl text-slate-900">{isEdit ? 'Modifier Véhicule' : 'Nouveau Véhicule'}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">{isEdit ? 'Mettre à jour les infos' : 'Ajouter à la flotte de location'}</p>
              </div>
              <button onClick={() => setModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Marque *</label>
                  <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-primary-500 focus:border-primary-500 font-medium text-sm transition-colors" placeholder="Ex: BMW" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Modèle *</label>
                  <input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-primary-500 focus:border-primary-500 font-medium text-sm transition-colors" placeholder="Ex: Série 5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Prix (DT/Jour) *</label>
                  <input type="number" value={form.price_per_day} onChange={e => setForm({ ...form, price_per_day: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-primary-500 focus:border-primary-500 font-medium text-sm transition-colors" placeholder="120" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Statut</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-primary-500 focus:border-primary-500 font-medium text-sm transition-colors cursor-pointer">
                    <option value="available">✅ Disponible</option>
                    <option value="unavailable">❌ Indisponible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Photo</label>
                <div onClick={() => fileRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${preview ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}>
                  {preview ? (
                    <img src={preview} alt="preview" className="h-32 w-full object-contain rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <span className="text-3xl mb-2">📸</span>
                      <span className="text-sm font-bold text-slate-600">Cliquez pour ajouter une image</span>
                      <span className="text-xs mt-1">PNG, JPG (Max 5Mo)</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Description</label>
                  <button onClick={handleAiGenerate} disabled={aiGenerating || (!form.brand && !form.model)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${aiGenerating ? 'bg-indigo-100 text-indigo-700 cursor-wait' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'}`}>
                    {aiGenerating ? <span className="w-3 h-3 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin"></span> : '✨'}
                    {aiGenerating ? 'Génération...' : 'IA Générer'}
                  </button>
                </div>
                <textarea
                  value={aiGenerating ? aiTypingText : form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  readOnly={aiGenerating}
                  placeholder="Description du véhicule..."
                  rows={4}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-primary-500 focus:border-primary-500 font-medium text-sm transition-colors resize-none ${aiGenerating && 'border-indigo-300 ring-2 ring-indigo-100'}`}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={handleSubmit} disabled={saving} className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                {saving ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Ajouter à la flotte')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-8 text-center border-t-4 border-t-red-500">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
            <h3 className="font-black text-xl text-slate-900 mb-2">Supprimer le véhicule ?</h3>
            <p className="text-sm text-slate-500 font-medium mb-8">Cette action est définitive et supprimera toutes les données liées.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Annuler</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/20">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}