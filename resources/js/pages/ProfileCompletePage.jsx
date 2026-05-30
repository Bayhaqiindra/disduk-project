import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const ProfileCompletePage = () => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [formData, setFormData] = useState({
    name: user?.name || '',
    nik: '',
    phone: '',
    alamat: '',
    password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }

      const response = await api.put('/profile/complete', payload);
      
      const updatedUser = response.data.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Navigate to dashboard after completing profile
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat().join(' ');
        setError(validationErrors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal menyimpan profil. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Lengkapi Profil Anda</h2>
          <p className="text-blue-100 text-sm mt-2">Sebagai Petugas Desa, Anda diwajibkan melengkapi data diri sebelum menggunakan sistem.</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">NIK (16 Digit)</label>
                <input 
                  type="text" 
                  name="nik"
                  required
                  pattern="\d{16}"
                  title="NIK harus 16 digit angka"
                  value={formData.nik}
                  onChange={handleChange}
                  placeholder="Contoh: 1401012345678901"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor HP / WhatsApp Aktif</label>
              <input 
                type="text" 
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Contoh: 081234567890"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Lengkap (Rumah)</label>
              <textarea 
                name="alamat"
                required
                rows="3"
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Tuliskan alamat lengkap beserta RT/RW"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              ></textarea>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Ganti Password (Opsional)</h3>
              <p className="text-xs text-gray-500 mb-4">Jika Anda ingin mengganti password default dari Admin, silakan isi di bawah ini.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password Baru</label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength="8"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Konfirmasi Password Baru</label>
                  <input 
                    type="password" 
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    minLength="8"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menyimpan Profil...</span>
                </>
              ) : (
                <span>Simpan dan Lanjutkan ke Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletePage;
