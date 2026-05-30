import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPetugas from './pages/DashboardPetugas';
import DashboardAdmin from './pages/DashboardAdmin';
import ProfileCompletePage from './pages/ProfileCompletePage';

// Route Guard to verify auth tokens, roles, and profile completion
const RouteGuard = ({ children, allowedRoles, requireProfile = true }) => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const location = useLocation();

    if (!token || !savedUser) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(savedUser);

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard if role is incorrect
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
    }

    // Force profile completion for Petugas Desa
    if (requireProfile && user.role === 'petugas_desa' && !user.is_profile_complete) {
        if (location.pathname !== '/profile/complete') {
            return <Navigate to="/profile/complete" replace />;
        }
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

                {/* Profile Completion (Protected, but doesn't require complete profile yet) */}
                <Route 
                    path="/profile/complete" 
                    element={
                        <RouteGuard allowedRoles={['petugas_desa']} requireProfile={false}>
                            <ProfileCompletePage />
                        </RouteGuard>
                    } 
                />

                {/* Petugas Desa Dashboard (Protected & requires profile) */}
                <Route 
                    path="/dashboard" 
                    element={
                        <RouteGuard allowedRoles={['petugas_desa']}>
                            <DashboardPetugas />
                        </RouteGuard>
                    } 
                />

                {/* Admin Dashboard (Protected, admin doesn't need to complete profile) */}
                <Route 
                    path="/admin/dashboard" 
                    element={
                        <RouteGuard allowedRoles={['admin']} requireProfile={false}>
                            <DashboardAdmin />
                        </RouteGuard>
                    } 
                />

                {/* Fallback Catch All */}
                <Route path="*" element={
                    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50 text-gray-800 p-4">
                        <h1 className="text-6xl font-black mb-2 text-blue-600">404</h1>
                        <p className="text-gray-500 font-semibold">Halaman tidak ditemukan atau Anda tidak memiliki akses.</p>
                        <a href="/" className="mt-6 px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-sm font-bold rounded-xl text-gray-600 transition shadow-sm">
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
