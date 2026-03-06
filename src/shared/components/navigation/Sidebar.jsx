import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/admin/dashboard', icon: 'grid_view', label: 'Dashboard' },
  { to: '/admin/ai-dashboard', icon: 'psychology', label: 'Analyse IA' },
  { to: '/admin/cars', icon: 'garage', label: 'Flotte' },
  { to: '/admin/rentals', icon: 'description', label: 'Locations' },
  { to: '/admin/factures', icon: 'receipt_long', label: 'Factures' },
  { to: '/admin/services', icon: 'build_circle', label: 'Maintenance' },
  { to: '/admin/clients', icon: 'group', label: 'Clients' },
];

const REPORTS = [
  { to: '/admin/reports', icon: 'bar_chart', label: 'Performance' },
  { to: '/admin/reports/export', icon: 'picture_as_pdf', label: 'Export PDF' },
  { to: '/admin/reports/forecasts', icon: 'trending_up', label: 'Prévisions' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const linkClass = ({ isActive }) => [
    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden',
    isActive
      ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/10 text-white border border-indigo-500/30'
      : 'text-slate-500 hover:text-slate-200 hover:bg-white/5',
  ].join(' ');

  return (
    <aside
      className="relative flex flex-col shrink-0 min-h-screen transition-all duration-300"
      style={{
        width: collapsed ? 72 : 256,
        background: 'linear-gradient(180deg, #0a0f1e 0%, #0d1117 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -60, left: -40,
        width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)',
        pointerEvents: 'none',
      }} />

      <div className="flex flex-col h-full p-4 gap-6">

        {/* Brand + collapse toggle */}
        <div className="flex items-center justify-between pt-2">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined text-white text-xl">directions_car</span>
              </div>
              <div>
                <div className="text-white text-sm font-black tracking-tight leading-none">BMZ</div>
                <div className="text-slate-500 text-[10px] font-medium tracking-widest">LOCATION</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
            }}>
              <span className="material-symbols-outlined text-white text-xl">directions_car</span>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex justify-center p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        )}

        {/* Main Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {!collapsed && (
            <div className="px-3 mb-1">
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em]">Navigation</span>
            </div>
          )}

          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} className={linkClass} title={collapsed ? label : undefined}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: '60%', borderRadius: '0 4px 4px 0',
                      background: 'linear-gradient(180deg,#6366f1,#22d3ee)',
                    }} />
                  )}
                  <span
                    className="material-symbols-outlined text-xl shrink-0 transition-colors"
                    style={{ color: isActive ? '#818cf8' : undefined }}
                  >{icon}</span>
                  {!collapsed && (
                    <span className="text-sm font-medium">{label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Reports section */}
          <div className={`${collapsed ? 'mt-4' : 'mt-4 pt-4'} border-t border-white/5`}>
            {!collapsed && (
              <div className="px-3 mb-1">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em]">Rapports IA</span>
              </div>
            )}
            {REPORTS.map(({ to, icon, label }) => (
              <NavLink key={to} to={to} end={to === '/admin/reports'} className={linkClass} title={collapsed ? label : undefined}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div style={{
                        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                        width: 3, height: '60%', borderRadius: '0 4px 4px 0',
                        background: 'linear-gradient(180deg,#6366f1,#22d3ee)',
                      }} />
                    )}
                    <span
                      className="material-symbols-outlined text-xl shrink-0"
                      style={{ color: isActive ? '#818cf8' : undefined }}
                    >{icon}</span>
                    {!collapsed && <span className="text-sm font-medium">{label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* AI Feature badge */}
        {!collapsed && (
          <div style={{
            background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(34,211,238,0.08))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>
              ✨ FONCTIONS IA ACTIVES
            </div>
            <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
              Auto-réponse avis · Annonces voitures · Dashboard intelligent
            </div>
          </div>
        )}

        {/* User */}
        <div className={`pt-4 border-t border-white/5 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 800,
          }}>A</div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-white text-sm font-semibold truncate">Admin</div>
              <div className="text-slate-600 text-xs">Manager</div>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}