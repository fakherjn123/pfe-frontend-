import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';

const PAGE_TITLES = {
  '/admin/dashboard':          'Dashboard',
  '/admin/cars':               'Gestion Flotte',
  '/admin/contracts':          'Contrats',
  '/admin/invoices':           'Factures',
  '/admin/services':           'Maintenance',
  '/admin/clients':            'Clients',
  '/admin/reports':            'Rapports de Performance',
  '/admin/reports/export':     'Export PDF',
  '/admin/reports/forecasts':  'Prévisions IA',
};

export default function DashboardLayout() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Admin';

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', overflow: 'hidden',
      background: '#0a0f1e',
      fontFamily: "'Geist', 'Inter', sans-serif",
      color: '#f1f5f9',
    }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header title={title} />

        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '28px 32px 48px',
        }}>
          {/* Subtle top glow */}
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(34,211,238,0.3), transparent)',
            pointerEvents: 'none', zIndex: 100,
          }} />
          <Outlet />
        </div>
      </main>
    </div>
  );
}