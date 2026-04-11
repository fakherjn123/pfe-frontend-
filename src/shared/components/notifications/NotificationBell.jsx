import React, { useState, useEffect, useContext, useRef } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../../../features/auth/context/AuthContext';
import { socket } from '../../utils/socket';
import api from '../../../config/api.config.js';

export default function NotificationBell() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Socket listeners
    socket.connect();
    
    if (user.role === 'admin') {
      socket.emit("join-admin");
    }
    socket.emit("join-user", user.id);

    const handleNewNotif = (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Bonus: Audio/Visual feedback can be added here
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notif.title, { body: notif.message });
      }
    };

    socket.on("new_notification", handleNewNotif);

    return () => {
      socket.off("new_notification", handleNewNotif);
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_rental': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'error': return <AlertTriangle className="text-rose-500" size={18} />;
      default: return <Info className="text-indigo-500" size={18} />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors group"
      >
        <Bell size={20} className={unreadCount > 0 ? "text-indigo-600" : "text-slate-600"} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-bottom border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
              >
                Tout lire
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <Bell size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-xs font-medium">Aucune notification pour le moment.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => !notif.is_read && markRead(notif.id)}
                  className={`p-4 border-b border-slate-50 flex gap-3 cursor-pointer transition-colors ${!notif.is_read ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                >
                  <div className="shrink-0 mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{notif.title}</h4>
                      {!notif.is_read && <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-600 leading-normal mb-1">{notif.message}</p>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button className="text-[11px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider">
              Voir tout l'historique
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
