import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPetugas from './pages/DashboardPetugas';
import DashboardAdmin from './pages/DashboardAdmin';

// Route Guard to verify auth tokens and roles
const RouteGuard = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(savedUser);

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard if role is incorrect
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
    }

    return children;
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Petugas Desa Dashboard (Protected) */}
                <Route 
                    path="/dashboard" 
                    element={
                        <RouteGuard allowedRoles={['petugas_desa']}>
                            <DashboardPetugas />
                        </RouteGuard>
                    } 
                />

                {/* Admin Dashboard (Protected) */}
                <Route 
                    path="/admin/dashboard" 
                    element={
                        <RouteGuard allowedRoles={['admin']}>
                            <DashboardAdmin />
                        </RouteGuard>
                    } 
                />

                {/* Fallback Catch All */}
                <Route path="*" element={
                    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-slate-950 text-white p-4">
                        <h1 className="text-6xl font-black mb-2 text-indigo-500">404</h1>
                        <p className="text-slate-400 font-semibold">Halaman tidak ditemukan atau Anda tidak memiliki akses.</p>
                        <a href="/" className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-bold rounded-xl text-slate-300 transition">
                            Kembali ke Beranda
                        </a>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
