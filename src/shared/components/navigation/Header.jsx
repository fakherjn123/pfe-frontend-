import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ title = 'Dashboard' }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header style={{
      height: 64, flexShrink: 0,
      background: 'rgba(10,15,30,0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky', top: 0, zIndex: 50,
    }}>

      {/* Left: breadcrumb + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#475569', fontSize: 12 }}>Admin</span>
        <span style={{ color: '#334155', fontSize: 12 }}>/</span>
        <span style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>{title}</span>
      </div>

      {/* Right: search + actions + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Search */}
        <div style={{
          position: 'relative', display: 'flex', alignItems: 'center',
        }}>
          <span className="material-symbols-outlined" style={{
            position: 'absolute', left: 10, color: '#475569', fontSize: 18,
          }}>search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, paddingLeft: 34, paddingRight: 12,
              height: 36, color: '#f1f5f9', fontSize: 13, outline: 'none',
              width: 220,
              transition: 'border-color .15s, width .2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.width = '280px'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.width = '220px'; }}
          />
        </div>

        {/* Notification */}
        <button style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
          transition: 'background .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        >
          <span className="material-symbols-outlined" style={{ color: '#94a3b8', fontSize: 18 }}>notifications</span>
          <div style={{
            position: 'absolute', top: 7, right: 7,
            width: 7, height: 7, borderRadius: '50%',
            background: '#6366f1', border: '1.5px solid #0a0f1e',
          }} />
        </button>

        {/* User + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#6366f1,#22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 800,
          }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>
              {user?.name || user?.email?.split('@')[0] || 'Admin'}
            </div>
            <div style={{ color: '#475569', fontSize: 10 }}>Administrator</div>
          </div>
          <button onClick={handleLogout} style={{
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: 8, padding: '5px 10px',
            color: '#f43f5e', fontSize: 11, fontWeight: 600,
            cursor: 'pointer', transition: 'all .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }}
          >
            Déconnexion
          </button>
        </div>

      </div>
    </header>
  );
}