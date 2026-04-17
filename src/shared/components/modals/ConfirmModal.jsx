import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmModal – Remplace window.confirm() avec une modale stylée.
 *
 * Props:
 *   open        {boolean}  – Afficher ou cacher la modale
 *   title       {string}   – Titre de la modale
 *   message     {string}   – Message de confirmation
 *   confirmText {string}   – Texte du bouton confirmer (défaut: "Confirmer")
 *   cancelText  {string}   – Texte du bouton annuler  (défaut: "Annuler")
 *   danger      {boolean}  – Bouton rouge si action destructive
 *   onConfirm   {function} – Callback à l'acceptation
 *   onCancel    {function} – Callback à l'annulation
 */
export default function ConfirmModal({
  open,
  title = 'Confirmation',
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  danger = false,
  onConfirm,
  onCancel,
}) {
  // Fermer avec Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmBg = danger
    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
    : 'linear-gradient(135deg, #6366f1, #4f46e5)';

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '32px 28px 24px',
          width: '100%', maxWidth: 420,
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Icon + Close */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: danger ? '#fef2f2' : '#eef2ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={22} color={danger ? '#ef4444' : '#6366f1'} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
            {message && (
              <p style={{ margin: '8px 0 0', fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{message}</p>
            )}
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94a3b8', padding: 4, borderRadius: 6, flexShrink: 0,
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px', borderRadius: 10, border: '1.5px solid #e2e8f0',
              background: '#f8fafc', color: '#475569',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 22px', borderRadius: 10, border: 'none',
              background: confirmBg, color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              boxShadow: danger ? '0 4px 14px rgba(239,68,68,0.3)' : '0 4px 14px rgba(99,102,241,0.3)',
              transition: 'opacity 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.88); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </div>
  );
}
