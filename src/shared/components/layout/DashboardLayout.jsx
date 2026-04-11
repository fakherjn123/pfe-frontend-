import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';
import { io } from 'socket.io-client';

const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/cars': 'Gestion Flotte',
  '/admin/contracts': 'Contrats',
  '/admin/invoices': 'Factures',
  '/admin/services': 'Maintenance',
  '/admin/clients': 'Clients',
  '/admin/reports': 'Rapports de Performance',
  '/admin/reports/export': 'Export PDF',
  '/admin/reports/forecasts': 'Prévisions IA',
};

export default function DashboardLayout() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Admin';

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    document.documentElement.classList.add('dark');

    // Connect Socket.io
    const socket = io("http://localhost:5000");

    // Request joining admin room
    socket.emit("join-admin");

    socket.on("new_notification", (data) => {
      const id = Date.now();
      const newNotif = { ...data, id };
      setNotifications((prev) => [...prev, newNotif]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter(n => n.id !== id));
      }, 5000);
    });

    return () => {
      socket.disconnect();
    };
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

      {/* Toast Container */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.map(n => (
          <div key={n.id} style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px',
            color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', minWidth: '300px',
            borderLeft: n.type === 'license_upload' ? '4px solid #3b82f6' : '4px solid #10b981',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{n.title}</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>{n.message}</p>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}