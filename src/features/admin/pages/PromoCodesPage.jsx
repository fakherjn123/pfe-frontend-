import { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, Calendar, Hash, Percent, DollarSign, Pencil, X, Check } from 'lucide-react';
import api from "../../../config/api.config.js";

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const BLUE = "#2563EB";

/* ── Toggle Switch ────────────────────────────────────────── */
function ToggleSwitch({ active, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: active ? BLUE : "#D1D5DB",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 0.2s", flexShrink: 0,
        padding: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3,
        left: active ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

/* ── Stat Box ─────────────────────────────────────────────── */
function StatBox({ value, label }) {
  return (
    <div style={{
      flex: 1, background: "#F8FAFC", borderRadius: 10,
      padding: "14px 12px", textAlign: "center",
      border: "1px solid #F3F4F6",
    }}>
      <div style={{ fontSize: 17, fontWeight: 900, color: "#111827", letterSpacing: "-0.01em" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3 }}>{label}</div>
    </div>
  );
}

/* ── Promo Card ───────────────────────────────────────────── */
function PromoCard({ promo, onToggle, onDelete, onEdit }) {
  const usagePct = promo.usage_limit
    ? Math.min(100, Math.round((promo.used_count / promo.usage_limit) * 100))
    : 0;

  const discountLabel = promo.discount_type === 'percentage'
    ? `${promo.discount_value}%`
    : `${promo.discount_value} DT`;

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  const isExpired = promo.expiration_date && new Date(promo.expiration_date) < new Date();

  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      border: "1.5px solid #E5E7EB",
      padding: "22px", display: "flex", flexDirection: "column", gap: 16,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      opacity: promo.is_active ? 1 : 0.65,
    }}>
      {/* Top row: code tag + toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          display: "inline-block", background: "#EFF6FF",
          color: BLUE, fontSize: 11, fontWeight: 800,
          letterSpacing: "0.08em", padding: "4px 10px",
          borderRadius: 6, border: `1px solid #BFDBFE`,
        }}>
          {promo.code}
        </span>
        <ToggleSwitch active={!!promo.is_active} onChange={() => onToggle(promo.id, promo.is_active)} />
      </div>

      {/* Description */}
      {promo.description && (
        <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
          {promo.description}
        </p>
      )}

      {/* Stats: réduction + utilisations */}
      <div style={{ display: "flex", gap: 10 }}>
        <StatBox
          value={discountLabel}
          label="Réduction"
        />
        <StatBox
          value={promo.usage_limit ? `${promo.used_count}/${promo.usage_limit}` : `${promo.used_count}/∞`}
          label="Utilisations"
        />
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "#6B7280" }}>Utilisation</span>
          <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 600 }}>{usagePct}%</span>
        </div>
        <div style={{ height: 5, background: "#EFF6FF", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            width: `${usagePct}%`,
            background: BLUE,
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {/* Expiration */}
      <div style={{ fontSize: 12, color: isExpired ? "#DC2626" : "#6B7280" }}>
        {isExpired ? "⚠️ Expiré le " : "Expire le "}{fmtDate(promo.expiration_date)}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          onClick={() => onEdit(promo)}
          style={{
            flex: 1, background: "#fff", border: "1px solid #E5E7EB",
            borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600,
            color: "#374151", cursor: "pointer", fontFamily: sans,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "border-color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}
        >
          <Pencil size={13} /> Modifier
        </button>
        <button
          onClick={() => onDelete(promo.id)}
          style={{
            width: 36, height: 36, borderRadius: 8, border: "1.5px solid #FECACA",
            background: "#FEF2F2", color: "#DC2626", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#FEE2E2"}
          onMouseLeave={e => e.currentTarget.style.background = "#FEF2F2"}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Input style helper ───────────────────────────────────── */
const inp = {
  width: "100%", padding: "10px 12px", fontSize: 13, border: "1px solid #E5E7EB",
  borderRadius: 8, outline: "none", fontFamily: sans, boxSizing: "border-box",
  background: "#fff", color: "#374151", transition: "border-color 0.2s",
};

/* ── Form (create / edit) ─────────────────────────────────── */
function PromoForm({ initial = null, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    code: '', discount_type: 'percentage', discount_value: '',
    expiration_date: '', usage_limit: '', description: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }}
      style={{
        background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 16,
        padding: "28px", marginBottom: 28,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 800, color: "#111827" }}>
        {initial ? "✏️ Modifier le code promo" : "➕ Nouveau code promo"}
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { key: "code",           label: "Code unique",                type: "text",   placeholder: "ETE2026", upper: true },
          { key: "discount_value", label: "Valeur",                     type: "number", placeholder: "10" },
          { key: "usage_limit",    label: "Limite d'utilisation",       type: "number", placeholder: "100" },
          { key: "expiration_date",label: "Date d'expiration",          type: "date",   placeholder: "" },
          { key: "description",    label: "Description (optionnel)",    type: "text",   placeholder: "10% sur locations >200 DT", col2: true },
        ].map(({ key, label, type, placeholder, upper, col2 }) => (
          <div key={key} style={col2 ? { gridColumn: "1 / -1" } : {}}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {label}
            </label>
            <input
              type={type} placeholder={placeholder} required={key !== "expiration_date" && key !== "description" && key !== "usage_limit"}
              value={form[key]}
              onChange={e => set(key, upper ? e.target.value.toUpperCase() : e.target.value)}
              style={inp}
              onFocus={e => e.target.style.borderColor = BLUE}
              onBlur={e => e.target.style.borderColor = "#E5E7EB"}
            />
          </div>
        ))}
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Type
          </label>
          <select value={form.discount_type} onChange={e => set("discount_type", e.target.value)}
            style={{ ...inp, cursor: "pointer", appearance: "auto" }}>
            <option value="percentage">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (DT)</option>
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button type="submit" style={{
          background: BLUE, color: "#fff", border: "none",
          padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: sans, display: "flex", alignItems: "center", gap: 6,
        }}>
          <Check size={14} /> {initial ? "Enregistrer" : "Créer le code"}
        </button>
        <button type="button" onClick={onCancel} style={{
          background: "#F9FAFB", color: "#374151", border: "1px solid #E5E7EB",
          padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: sans, display: "flex", alignItems: "center", gap: 6,
        }}>
          <X size={14} /> Annuler
        </button>
      </div>
    </form>
  );
}

/* ── Main Page ────────────────────────────────────────────── */
export default function PromoCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => { fetchCodes(); }, []);

  const fetchCodes = async () => {
    try {
      const res = await api.get('/promos');
      setCodes(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const notify = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleCreate = async (form) => {
    try {
      await api.post('/promos', form);
      notify('success', 'Code promo créé avec succès !');
      setShowAdd(false);
      fetchCodes();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Erreur lors de la création.');
    }
  };

  const handleEdit = async (form) => {
    try {
      await api.put(`/promos/${editTarget.id}`, form);
      notify('success', 'Code promo modifié.');
      setEditTarget(null);
      fetchCodes();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Erreur lors de la modification.');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/promos/${id}/toggle`, { is_active: !currentStatus });
      setCodes(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    } catch { notify('error', 'Erreur mise à jour statut.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce code promo ?")) return;
    try {
      await api.delete(`/promos/${id}`);
      setCodes(prev => prev.filter(c => c.id !== id));
      notify('success', 'Code supprimé.');
    } catch { notify('error', 'Erreur lors de la suppression.'); }
  };

  const activeCount   = codes.filter(c => c.is_active).length;
  const totalUsage    = codes.reduce((s, c) => s + (c.used_count || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: sans, padding: "32px" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Codes Promo
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
            {codes.length} code{codes.length !== 1 ? "s" : ""} — {activeCount} actif{activeCount !== 1 ? "s" : ""} — {totalUsage} utilisation{totalUsage !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditTarget(null); }}
          style={{
            background: showAdd ? "#F9FAFB" : BLUE,
            color: showAdd ? "#374151" : "#fff",
            border: showAdd ? "1px solid #E5E7EB" : "none",
            padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: sans,
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          {showAdd ? <><X size={14} /> Annuler</> : <><Plus size={14} /> Nouveau code</>}
        </button>
      </div>

      {/* ── Toast ── */}
      {message && (
        <div style={{
          marginBottom: 16, padding: "12px 16px", borderRadius: 10,
          background: message.type === "success" ? "#F0FDF4" : "#FEF2F2",
          border: `1px solid ${message.type === "success" ? "#BBF7D0" : "#FECACA"}`,
          color: message.type === "success" ? "#166534" : "#DC2626",
          fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {message.type === "success" ? "✅" : "❌"} {message.text}
        </div>
      )}

      {/* ── Create Form ── */}
      {showAdd && !editTarget && (
        <PromoForm onSave={handleCreate} onCancel={() => setShowAdd(false)} />
      )}

      {/* ── Edit Form ── */}
      {editTarget && (
        <PromoForm
          initial={{ ...editTarget, expiration_date: editTarget.expiration_date?.slice(0, 10) || "" }}
          onSave={handleEdit}
          onCancel={() => setEditTarget(null)}
        />
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF", fontSize: 14 }}>
          Chargement...
        </div>
      ) : codes.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 40px",
          background: "#fff", borderRadius: 16, border: "1.5px dashed #E5E7EB",
        }}>
          <Ticket size={40} color="#D1D5DB" style={{ margin: "0 auto 12px", display: "block" }} />
          <p style={{ color: "#9CA3AF", fontSize: 14, margin: 0, fontWeight: 500 }}>
            Aucun code promo. Créez-en un !
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
          {codes.map(promo => (
            <PromoCard
              key={promo.id}
              promo={promo}
              onToggle={toggleStatus}
              onDelete={handleDelete}
              onEdit={p => { setEditTarget(p); setShowAdd(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
