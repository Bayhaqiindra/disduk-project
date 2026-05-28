import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, Bell, LogOut,
  Menu, X
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
    <div className="min-h-screen bg-gray-50 text-gray-800 flex font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col justify-between shadow-lg md:shadow-none`}>
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/15">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight text-gray-900 leading-tight">SILADUK</h2>
                <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">Disdukcapil Bengkalis</p>
              </div>
            </div>
            <button className="md:hidden text-gray-400 hover:text-gray-700" onClick={() => setSidebarOpen(false)}>
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
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
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
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase truncate">
                {user.role === 'admin' ? 'Admin Disduk' : `Desa ${user.desa}`}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Header Dashboard */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h3 className="text-sm font-bold text-gray-900">Dashboard Layanan Digital</h3>
              <p className="text-[10px] text-gray-500 font-semibold">{user.role === 'admin' ? 'Akses Penuh Verifikasi & Pengajuan' : `Layanan Pengajuan Desa ${user.desa}`}</p>
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
              className="relative p-2.5 bg-gray-50 border border-gray-200 hover:border-blue-300 rounded-xl transition text-gray-500 hover:text-blue-600"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {notifDropdownOpen && (
              <div className="absolute right-0 top-14 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 z-50 flex flex-col max-h-[400px]">
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 mb-2">
                  <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Notifikasi</h4>
                  {unreadCount > 0 && (
                    <button onClick={handleReadAll} className="text-[10px] font-bold text-blue-600 hover:underline">
                      Tandai Semua Dibaca
                    </button>
                  )}
                </div>
                
                {/* Notif List */}
                <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-[11px] text-gray-400 text-center py-8">Tidak ada notifikasi baru.</p>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                          notif.is_read 
                            ? 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-500' 
                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-gray-800'
                        }`}
                      >
                        <p className="text-xs font-bold truncate">{notif.judul}</p>
                        <p className="text-[10px] text-gray-500 leading-normal mt-1">{notif.pesan}</p>
                        <span className="text-[8px] font-bold text-gray-400 block mt-1.5">{new Date(notif.created_at).toLocaleString('id-ID')}</span>
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
