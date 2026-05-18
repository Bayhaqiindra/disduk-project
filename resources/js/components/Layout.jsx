import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, FileSpreadsheet, Bell, LogOut,
  User, Menu, X, ArrowLeft, RefreshCw
} from 'lucide-react';
import api from '../services/api';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [user, setUser] = useState({ name: 'User', role: 'petugas_desa', desa: '' });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Load current user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate('/login');
    }

    // Load initial notification count
    fetchUnreadCount();
    fetchNotifications();

    // Set polling for notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifikasi/unread-count');
      setUnreadCount(response.data.data.unread_count);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifikasi');
      setNotifications(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await api.put(`/notifikasi/${notif.id}/read`);
        fetchUnreadCount();
        fetchNotifications();
      }
      setNotifDropdownOpen(false);
      // Redirect to detailed pengajuan page if referenced
      if (notif.pengajuan_id) {
        if (user.role === 'admin') {
          navigate(`/admin/dashboard?detail=${notif.pengajuan_id}`);
        } else {
          navigate(`/dashboard?detail=${notif.pengajuan_id}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAll = async () => {
    try {
      await api.put('/notifikasi/read-all');
      fetchUnreadCount();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // Navigations according to roles
  const menuItems = user.role === 'admin' 
    ? [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800/80 transition-transform duration-300 md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col justify-between`}>
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight text-white leading-tight">DISDUKCAPIL</h2>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Bengkalis Digital</p>
              </div>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu navigation */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    active 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/15' 
                      : 'text-slate-400 hover:bg-slate-800/55 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar / User Info */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/50 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-extrabold text-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase truncate">
                {user.role === 'admin' ? 'Admin Disduk' : `Desa ${user.desa}`}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/5 transition"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Header Dashboard */}
        <header className="sticky top-0 z-30 h-16 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/50 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h3 className="text-sm font-bold text-white">Dashboard Layanan Digital</h3>
              <p className="text-[10px] text-slate-500 font-semibold">{user.role === 'admin' ? 'Akses Penuh Verifikasi & Pengajuan' : `Layanan Pengajuan Desa ${user.desa}`}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Notification Bell */}
            <button 
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                if (!notifDropdownOpen) {
                  fetchNotifications();
                }
              }}
              className="relative p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition text-slate-400 hover:text-white"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[9px] font-black border-2 border-slate-950 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {notifDropdownOpen && (
              <div className="absolute right-0 top-14 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 flex flex-col max-h-[400px]">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 mb-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Notifikasi Sistem</h4>
                  {unreadCount > 0 && (
                    <button onClick={handleReadAll} className="text-[10px] font-bold text-indigo-400 hover:underline">
                      Tandai Semua Dibaca
                    </button>
                  )}
                </div>
                
                {/* Notif List */}
                <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-[11px] text-slate-500 text-center py-8">Tidak ada notifikasi baru.</p>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                          notif.is_read 
                            ? 'bg-slate-950/30 border-slate-900/60 hover:bg-slate-900/40 text-slate-400' 
                            : 'bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10 text-white'
                        }`}
                      >
                        <p className="text-xs font-bold truncate">{notif.judul}</p>
                        <p className="text-[10px] text-slate-400 leading-normal mt-1">{notif.pesan}</p>
                        <span className="text-[8px] font-bold text-slate-500 block mt-1.5">{new Date(notif.created_at).toLocaleString('id-ID')}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Main Content wrapper */}
        <main className="p-6 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
