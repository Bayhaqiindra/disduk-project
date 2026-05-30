import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FileText, Eye, Check, X, Download, AlertCircle, TrendingUp, Filter, MessageSquare, CheckCircle2,
  Users, UserPlus, ShieldAlert, Loader2, Pencil, Trash2
} from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';

const DashboardAdmin = () => {
  // Tabs: 'overview' | 'verifikasi' | 'semua' | 'akun'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats
  const [stats, setStats] = useState({ total: 0, menunggu: 0, diverifikasi: 0, diproses: 0, selesai: 0, dikembalikan: 0 });
  const [chartData, setChartData] = useState([]);
  const [recentList, setRecentList] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Verifikasi
  const [verifList, setVerifList] = useState([]);
  const [loadingVerif, setLoadingVerif] = useState(false);

  // Semua Pengajuan
  const [allList, setAllList] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [loadingAll, setLoadingAll] = useState(false);

  // Akun Petugas
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', desa: '' });
  
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [editUserFormData, setEditUserFormData] = useState({ name: '', email: '', password: '', desa: '', nik: '', phone: '', alamat: '' });

  // Filtering states
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLayanan, setFilterLayanan] = useState('');
  const [filterDesa, setFilterDesa] = useState('');

  // Modals / Detail actions
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  // Admin action states
  const [returnNote, setReturnNote] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Complete status state
  const [hasilFile, setHasilFile] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const services = [
    { id: 1, nama: 'Kartu Keluarga' },
    { id: 2, nama: 'Akta Kelahiran' },
    { id: 3, nama: 'Akta Perkawinan' },
    { id: 4, nama: 'Akta Perceraian' },
    { id: 5, nama: 'Akta Kematian' },
    { id: 6, nama: 'Pengakuan Anak' },
    { id: 7, nama: 'Pengesahan Anak' },
    { id: 8, nama: 'Perubahan Nama' }
  ];

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const detailId = params.get('detail');
    const tab = params.get('tab') || 'overview';
    
    setActiveTab(tab);
    
    if (tab === 'verifikasi') fetchVerifList();
    else if (tab === 'semua') fetchAllList();
    else if (tab === 'overview') fetchOverview();
    else if (tab === 'akun') fetchUsersList();

    if (detailId) {
      handleViewDetail(detailId);
    }
  }, [location.search]);

  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const statsRes = await api.get('/dashboard/stats');
      setStats(statsRes.data.data);

      const chartRes = await api.get('/dashboard/chart');
      setChartData(chartRes.data.data);

      const listRes = await api.get('/pengajuan');
      setRecentList(listRes.data.data.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchVerifList = async () => {
    setLoadingVerif(true);
    try {
      const response = await api.get('/pengajuan?status=menunggu');
      setVerifList(response.data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVerif(false);
    }
  };

  const fetchAllList = async (page = 1) => {
    setLoadingAll(true);
    try {
      let url = `/pengajuan?page=${page}`;
      if (filterStatus) url += `&status=${filterStatus}`;
      if (filterLayanan) url += `&layanan_id=${filterLayanan}`;
      if (filterDesa) url += `&desa=${filterDesa}`;

      const response = await api.get(url);
      setAllList(response.data.data.data);
      setPagination({
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAll(false);
    }
  };

  const fetchUsersList = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/admin/users');
      setUsersList(response.data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };



  const handleViewDetail = async (id) => {
    try {
      const response = await api.get(`/pengajuan/${id}`);
      setSelectedSubmission(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Workflow Actions
  const handleVerify = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/pengajuan/${id}/verify`);
      if (selectedSubmission) handleViewDetail(id);
      fetchVerifList();
      fetchOverview();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Gagal verifikasi.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put(`/pengajuan/${selectedSubmission.id}/return`, { catatan: returnNote });
      setShowReturnModal(false);
      setReturnNote('');
      handleViewDetail(selectedSubmission.id);
      fetchVerifList();
      fetchOverview();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcess = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/pengajuan/${id}/process`);
      if (selectedSubmission) handleViewDetail(id);
      fetchAllList();
      fetchOverview();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('file_hasil', hasilFile);

      await api.post(`/pengajuan/${selectedSubmission.id}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowCompleteModal(false);
      setHasilFile(null);
      handleViewDetail(selectedSubmission.id);
      fetchAllList();
      fetchOverview();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      await api.post('/admin/users', userFormData);
      setShowCreateUserModal(false);
      setUserFormData({ name: '', email: '', password: '', desa: '' });
      fetchUsersList();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Gagal membuat akun.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEditUser = (user) => {
    setSelectedUserForEdit(user);
    setEditUserFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // blank unless changing
      desa: user.desa || '',
      nik: user.nik || '',
      phone: user.phone || '',
      alamat: user.alamat || ''
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      const dataToSubmit = { ...editUserFormData };
      if (!dataToSubmit.password) delete dataToSubmit.password; // Don't send empty password

      await api.put(`/admin/users/${selectedUserForEdit.id}`, dataToSubmit);
      setShowEditUserModal(false);
      setSelectedUserForEdit(null);
      fetchUsersList();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Gagal memperbarui akun.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('AWAS: Anda yakin ingin menghapus akun ini secara permanen?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsersList();
    } catch (err) {
      alert('Gagal menghapus akun.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      menunggu: 'bg-amber-100 text-amber-700 border-amber-200',
      diverifikasi: 'bg-blue-100 text-blue-700 border-blue-200',
      dikembalikan: 'bg-red-100 text-red-700 border-red-200',
      diproses: 'bg-orange-100 text-orange-700 border-orange-200',
      selesai: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <Layout>


      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase">Total Pengajuan</p>
              <h3 className="text-3xl font-black text-gray-900 mt-2">{stats.total}</h3>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-amber-500 uppercase">Menunggu</p>
              <h3 className="text-3xl font-black text-amber-600 mt-2">{stats.menunggu}</h3>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-orange-500 uppercase">Diproses</p>
              <h3 className="text-3xl font-black text-orange-600 mt-2">{stats.diproses}</h3>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-emerald-500 uppercase">Selesai</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-2">{stats.selesai}</h3>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-red-500 uppercase">Dikembalikan</p>
              <h3 className="text-3xl font-black text-red-600 mt-2">{stats.dikembalikan}</h3>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Berkas Masuk Terbaru</h3>
            <div className="space-y-3">
              {recentList.map((item) => (
                <div key={item.id} onClick={() => handleViewDetail(item.id)} className="p-4 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:border-blue-200 transition flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.nomor_pengajuan}</h4>
                    <p className="text-xs text-blue-600 font-semibold">{item.layanan?.nama}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Desa {item.user?.desa}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border uppercase ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. VERIFIKASI */}
      {activeTab === 'verifikasi' && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Verifikasi Berkas Masuk</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                <th className="pb-3">No. Pengajuan</th>
                <th className="pb-3">Layanan</th>
                <th className="pb-3">Desa</th>
                <th className="pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {verifList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-4 font-bold">{item.nomor_pengajuan}</td>
                  <td className="py-4">{item.layanan?.nama}</td>
                  <td className="py-4">{item.user?.desa}</td>
                  <td className="py-4">
                    <button onClick={() => handleViewDetail(item.id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Tinjau</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. SEMUA PENGAJUAN */}
      {activeTab === 'semua' && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex gap-4 mb-4">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
              <option value="">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="diverifikasi">Diverifikasi</option>
            </select>
            <button onClick={() => fetchAllList(1)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Filter</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                <th className="pb-3">No</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {allList.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-4 font-bold">{item.nomor_pengajuan}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border uppercase ${getStatusBadge(item.status)}`}>{item.status}</span>
                  </td>
                  <td className="py-4">
                    <button onClick={() => handleViewDetail(item.id)} className="text-blue-600 font-bold text-xs">Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. AKUN PETUGAS */}
      {activeTab === 'akun' && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Kelola Akun Petugas Desa</h2>
            <button 
              onClick={() => setShowCreateUserModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
            >
              <UserPlus className="w-4 h-4" /> Tambah Akun
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                  <th className="pb-3">Nama Lengkap</th>
                  <th className="pb-3">Email & Desa</th>
                  <th className="pb-3">Profil Lengkap?</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {usersList.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-gray-500">Belum ada akun petugas desa.</td></tr>
                ) : usersList.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 font-bold text-gray-900">{user.name}</td>
                    <td className="py-4">
                      <p className="text-gray-800">{user.email}</p>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">Desa {user.desa}</p>
                    </td>
                    <td className="py-4">
                      {user.is_profile_complete ? 
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">Lengkap</span> : 
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-200">Belum</span>
                      }
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEditUser(user)} className="p-1.5 bg-gray-100 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Detail / Edit Akun">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 rounded-lg transition bg-red-50 text-red-600 hover:bg-red-100" title="Hapus Akun">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateUser} className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <h3 className="text-lg font-extrabold text-gray-900">Tambah Akun Petugas Desa</h3>
            
            {actionError && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">{actionError}</div>}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Lengkap</label>
              <input type="text" required value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
              <input type="email" required value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
              <input type="password" required minLength="8" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Desa</label>
              <input type="text" required value={userFormData.desa} onChange={e => setUserFormData({...userFormData, desa: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setShowCreateUserModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-600 rounded-xl">Batal</button>
              <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white rounded-xl flex items-center gap-2">
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin"/>} Simpan Akun
              </button>
            </div>
          </form>
        </div>
      )}
      {/* EDIT USER MODAL */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateUser} className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-gray-900">Detail & Edit Akun Petugas</h3>
            
            {actionError && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">{actionError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Lengkap</label>
                <input type="text" required value={editUserFormData.name} onChange={e => setEditUserFormData({...editUserFormData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input type="email" required value={editUserFormData.email} onChange={e => setEditUserFormData({...editUserFormData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ganti Password (Kosongkan jika tidak diganti)</label>
                <input type="password" minLength="8" value={editUserFormData.password} onChange={e => setEditUserFormData({...editUserFormData, password: e.target.value})} placeholder="********" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Desa</label>
                <input type="text" required value={editUserFormData.desa} onChange={e => setEditUserFormData({...editUserFormData, desa: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">NIK</label>
                <input type="text" value={editUserFormData.nik} onChange={e => setEditUserFormData({...editUserFormData, nik: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nomor HP</label>
                <input type="text" value={editUserFormData.phone} onChange={e => setEditUserFormData({...editUserFormData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alamat</label>
                <textarea value={editUserFormData.alamat} onChange={e => setEditUserFormData({...editUserFormData, alamat: e.target.value})} rows="2" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
              <button type="button" onClick={() => setShowEditUserModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-600 rounded-xl">Batal</button>
              <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white rounded-xl flex items-center gap-2">
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin"/>} Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAIL MODAL (SIMPLIFIED FOR SPACE) */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setSelectedSubmission(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"><X className="w-6 h-6"/></button>
            <h3 className="text-xl font-black text-gray-900 mb-2">{selectedSubmission.nomor_pengajuan}</h3>
            <span className={`px-3 py-1 text-xs font-bold rounded-md border uppercase ${getStatusBadge(selectedSubmission.status)}`}>{selectedSubmission.status}</span>
            
            <div className="mt-6 flex flex-wrap gap-2">
              {selectedSubmission.status === 'menunggu' && (
                <>
                  <button onClick={() => handleVerify(selectedSubmission.id)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl">Verifikasi</button>
                  <button onClick={() => setShowReturnModal(true)} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl">Kembalikan</button>
                </>
              )}
              {selectedSubmission.status === 'diverifikasi' && (
                <button onClick={() => handleProcess(selectedSubmission.id)} className="px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-xl">Proses Cetak</button>
              )}
              {selectedSubmission.status === 'diproses' && (
                <button onClick={() => setShowCompleteModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl">Selesai & Upload</button>
              )}
            </div>

            {/* Dokumen lampiran */}
            <div className="mt-8">
              <h4 className="font-bold text-gray-900 mb-4">Lampiran Pemohon</h4>
              <div className="grid grid-cols-2 gap-4">
                {selectedSubmission.uploads?.map(up => (
                  <div key={up.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700 truncate">{up.nama_file}</span>
                    <a href={`/api/dokumen/${up.id}/download`} className="text-blue-600"><Download className="w-4 h-4"/></a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RETURN MODAL */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <form onSubmit={handleReturnSubmit} className="w-full max-w-md bg-white rounded-2xl p-6">
            <h3 className="font-bold mb-4">Catatan Revisi</h3>
            <textarea required value={returnNote} onChange={e => setReturnNote(e.target.value)} className="w-full border rounded-xl p-3" rows="4"></textarea>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setShowReturnModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl">Batal</button>
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-xl">Kirim</button>
            </div>
          </form>
        </div>
      )}

      {/* COMPLETE MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <form onSubmit={handleCompleteSubmit} className="w-full max-w-md bg-white rounded-2xl p-6">
            <h3 className="font-bold mb-4">Upload Dokumen Hasil</h3>
            <input type="file" required onChange={e => setHasilFile(e.target.files[0])} className="w-full" accept=".pdf" />
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setShowCompleteModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl">Batal</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl">Selesai</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default DashboardAdmin;
