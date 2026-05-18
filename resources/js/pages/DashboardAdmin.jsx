import React, { useState, useEffect } from 'react';
import { 
  FileText, FileEdit, Baby, Activity, Heart, Scissors, UserCheck, Award,
  ShieldCheck, Download, Upload, CheckCircle2, ChevronRight,
  AlertCircle, Loader2, Eye, Calendar, User, FileUp, X, Check, HelpCircle,
  TrendingUp, Users, RefreshCw, Filter, MessageSquare
} from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';

const DashboardAdmin = () => {
  // Tabs: 'overview' | 'verifikasi' | 'semua'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats
  const [stats, setStats] = useState({ total: 0, menunggu: 0, diverifikasi: 0, diproses: 0, selesai: 0, dikembalikan: 0 });
  const [chartData, setChartData] = useState([]);
  const [recentList, setRecentList] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Verifikasi (submissions waiting: 'menunggu')
  const [verifList, setVerifList] = useState([]);
  const [loadingVerif, setLoadingVerif] = useState(false);

  // Semua Pengajuan (all with filters & pagination)
  const [allList, setAllList] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [loadingAll, setLoadingAll] = useState(false);

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

  // Services list for filter
  const services = [
    { id: 1, kode: 'KK-BARU', nama: 'Pembuatan KK Baru' },
    { id: 2, kode: 'KK-UBAH', nama: 'Perubahan KK' },
    { id: 3, kode: 'AK-LAHIR', nama: 'Penerbitan Akta Kelahiran' },
    { id: 4, kode: 'AK-MATI', nama: 'Penerbitan Akta Kematian' },
    { id: 5, kode: 'AK-NIKAH', nama: 'Penerbitan Akta Perkawinan' },
    { id: 6, kode: 'AK-CERAI', nama: 'Penerbitan Akta Perceraian' },
    { id: 7, kode: 'AK-ANAK', nama: 'Pengakuan Anak' },
    { id: 8, kode: 'AK-SAH', nama: 'Pengesahan Anak' }
  ];

  useEffect(() => {
    fetchOverview();
    // Check if redirect detail is in URL query parameters
    const params = new URLSearchParams(window.location.search);
    const detailId = params.get('detail');
    if (detailId) {
      handleViewDetail(detailId);
    }
  }, []);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'verifikasi') {
      fetchVerifList();
    } else if (tab === 'semua') {
      fetchAllList();
    } else if (tab === 'overview') {
      fetchOverview();
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
    setActionError(null);
    try {
      await api.put(`/pengajuan/${id}/verify`);
      if (selectedSubmission) handleViewDetail(id);
      fetchVerifList();
      fetchAllList();
      fetchOverview();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Gagal melakukan verifikasi berkas.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnNote || returnNote.length < 5) {
      setActionError('Catatan perbaikan minimal 5 karakter.');
      return;
    }

    setActionLoading(true);
    setActionError(null);
    try {
      await api.put(`/pengajuan/${selectedSubmission.id}/return`, { catatan: returnNote });
      setShowReturnModal(false);
      setReturnNote('');
      handleViewDetail(selectedSubmission.id);
      fetchVerifList();
      fetchAllList();
      fetchOverview();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Gagal mengembalikan berkas.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcess = async (id) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await api.put(`/pengajuan/${id}/process`);
      if (selectedSubmission) handleViewDetail(id);
      fetchAllList();
      fetchOverview();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Gagal memproses berkas.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!hasilFile) {
      setActionError('Wajib upload salinan cetak fisik dokumen hasil kependudukan.');
      return;
    }

    setActionLoading(true);
    setActionError(null);
    try {
      const formData = new FormData();
      formData.append('file_hasil', hasilFile);

      await api.post(`/pengajuan/${selectedSubmission.id}/complete`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowCompleteModal(false);
      setHasilFile(null);
      handleViewDetail(selectedSubmission.id);
      fetchAllList();
      fetchOverview();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Gagal menyelesaikan pengajuan.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      menunggu: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      diverifikasi: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      dikembalikan: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      diproses: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      selesai: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    };
    return badges[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  };

  return (
    <Layout>
      {/* Top Tabs for Admin */}
      <div className="flex gap-3 pb-6 border-b border-slate-900 mb-8 overflow-x-auto">
        <button 
          onClick={() => handleTabChange('overview')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
            activeTab === 'overview' 
              ? 'bg-slate-900 border-indigo-500/40 text-white shadow-lg' 
              : 'border-slate-800/40 text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          Ringkasan Statistik
        </button>
        <button 
          onClick={() => handleTabChange('verifikasi')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
            activeTab === 'verifikasi' 
              ? 'bg-slate-900 border-indigo-500/40 text-white shadow-lg' 
              : 'border-slate-800/40 text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          Verifikasi Berkas Masuk ({stats.menunggu})
        </button>
        <button 
          onClick={() => handleTabChange('semua')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
            activeTab === 'semua' 
              ? 'bg-slate-900 border-indigo-500/40 text-white shadow-lg' 
              : 'border-slate-800/40 text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          Semua Daftar Pengajuan
        </button>
      </div>

      {/* 1. OVERVIEW RINGKASAN */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Stats widgets */}
          {loadingOverview ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-900 h-24 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900 border border-slate-900 p-5 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Pengajuan</p>
                <h3 className="text-3xl font-black text-white mt-1.5">{stats.total}</h3>
              </div>
              <div className="bg-slate-900 border border-slate-900 p-5 rounded-2xl">
                <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">Menunggu</p>
                <h3 className="text-3xl font-black text-amber-400 mt-1.5">{stats.menunggu}</h3>
              </div>
              <div className="bg-slate-900 border border-slate-900 p-5 rounded-2xl">
                <p className="text-[10px] font-bold text-orange-500/80 uppercase tracking-widest">Diproses</p>
                <h3 className="text-3xl font-black text-orange-400 mt-1.5">{stats.diproses}</h3>
              </div>
              <div className="bg-slate-900 border border-slate-900 p-5 rounded-2xl">
                <p className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">Selesai</p>
                <h3 className="text-3xl font-black text-emerald-400 mt-1.5">{stats.selesai}</h3>
              </div>
              <div className="bg-slate-900 border border-slate-900 p-5 rounded-2xl">
                <p className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest">Dikembalikan</p>
                <h3 className="text-3xl font-black text-rose-400 mt-1.5">{stats.dikembalikan}</h3>
              </div>
            </div>
          )}

          {/* Dynamic Interactive Chart & Recent Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* HSL Column Bars Chart */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-900 rounded-3xl p-6 flex flex-col">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Tren Grafik Pengajuan Bulanan
              </h3>

              {loadingOverview ? (
                <div className="h-64 flex-1 bg-slate-950/20 rounded-2xl animate-pulse"></div>
              ) : (
                <div className="flex items-end justify-between flex-1 h-64 px-4 pt-8">
                  {chartData.map((c, idx) => {
                    const max = Math.max(...chartData.map(d => d.count), 1);
                    const heightPercent = `${(c.count / max) * 100}%`;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 group flex-1">
                        <span className="text-[10px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition duration-150">
                          {c.count}
                        </span>
                        
                        <div className="w-6 sm:w-8 bg-slate-950 rounded-lg relative h-48 flex items-end">
                          <div 
                            style={{ height: heightPercent }}
                            className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400 rounded-lg transition-all duration-500 ease-out shadow-lg shadow-indigo-500/10"
                          ></div>
                        </div>

                        <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">{c.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent activity list */}
            <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white mb-6">Berkas Masuk Terbaru</h3>
              <div className="space-y-4">
                {recentList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">Belum ada aktivitas.</p>
                ) : (
                  recentList.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleViewDetail(item.id)}
                      className="p-3.5 bg-slate-950/35 border border-slate-900 hover:border-slate-800 rounded-2xl text-left cursor-pointer transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-300 truncate max-w-[120px]">{item.nomor_pengajuan}</span>
                        <span className={`px-2 py-0.5 text-[8px] font-bold rounded-md border uppercase ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-indigo-400 truncate">{item.layanan?.nama}</p>
                      <div className="flex justify-between items-center mt-2.5 text-[9px] text-slate-500 font-semibold uppercase">
                        <span>Desa {item.user?.desa}</span>
                        <span>{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VERIFIKASI BERKAS MASUK (Status: 'menunggu') */}
      {activeTab === 'verifikasi' && (
        <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6">
          <h2 className="text-base font-bold text-white mb-6">Persetujuan & Verifikasi Berkas Masuk</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">Nomor Pengajuan</th>
                  <th className="pb-3">Layanan</th>
                  <th className="pb-3">Desa</th>
                  <th className="pb-3">Tanggal Pengajuan</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-xs">
                {loadingVerif ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="py-4 bg-slate-950/10 h-10"></td>
                    </tr>
                  ))
                ) : verifList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">Tidak ada berkas baru menunggu verifikasi.</td>
                  </tr>
                ) : (
                  verifList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-950/20">
                      <td className="py-4 font-bold text-slate-300">{item.nomor_pengajuan}</td>
                      <td className="py-4 text-slate-400 font-semibold">{item.layanan?.nama}</td>
                      <td className="py-4 text-slate-400">Desa {item.user?.desa}</td>
                      <td className="py-4 text-slate-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleViewDetail(item.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold rounded-lg text-white transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Tinjau Berkas
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SEMUA PENGAJUAN (WITH PAGINATED FILTERS) */}
      {activeTab === 'semua' && (
        <div className="space-y-6">
          {/* Smart Filters Panel */}
          <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-400" />
              Penyaringan Cerdas Pengajuan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status Dokumen</label>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Semua Status</option>
                  <option value="menunggu">Menunggu</option>
                  <option value="diverifikasi">Diverifikasi</option>
                  <option value="dikembalikan">Dikembalikan</option>
                  <option value="diproses">Diproses</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Jenis Layanan</label>
                <select 
                  value={filterLayanan}
                  onChange={(e) => setFilterLayanan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Semua Layanan</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Desa</label>
                <input 
                  type="text"
                  value={filterDesa}
                  onChange={(e) => setFilterDesa(e.target.value)}
                  placeholder="Contoh: Senggoro"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-800/40 pt-4">
              <button 
                onClick={() => {
                  setFilterStatus('');
                  setFilterLayanan('');
                  setFilterDesa('');
                  setTimeout(() => fetchAllList(1), 50);
                }}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-400 hover:text-white rounded-xl transition"
              >
                Reset Filter
              </button>
              <button 
                onClick={() => fetchAllList(1)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-[11px] font-bold text-white rounded-xl transition"
              >
                Terapkan Filter
              </button>
            </div>
          </div>

          {/* Paginated list table */}
          <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Nomor</th>
                    <th className="pb-3">Layanan</th>
                    <th className="pb-3">Desa</th>
                    <th className="pb-3">Tanggal</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 text-xs">
                  {loadingAll ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="6" className="py-4 bg-slate-950/10 h-10"></td>
                      </tr>
                    ))
                  ) : allList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">Tidak ada pengajuan yang sesuai dengan kriteria filter.</td>
                    </tr>
                  ) : (
                    allList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-950/20">
                        <td className="py-4 font-bold text-slate-300">{item.nomor_pengajuan}</td>
                        <td className="py-4 text-slate-400 font-semibold">{item.layanan?.nama}</td>
                        <td className="py-4 text-slate-400">Desa {item.user?.desa}</td>
                        <td className="py-4 text-slate-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 text-[9px] font-bold rounded-md border uppercase ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleViewDetail(item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-bold rounded-lg text-slate-300 transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex justify-center gap-2 pt-4 border-t border-slate-800/40 mt-4">
                <button 
                  disabled={pagination.current_page === 1}
                  onClick={() => fetchAllList(pagination.current_page - 1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-bold hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-500">
                  Halaman {pagination.current_page} dari {pagination.last_page}
                </span>
                <button 
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => fetchAllList(pagination.current_page + 1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-bold hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. DETAILED TINJAU/WORKFLOW MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <div>
                <span className={`px-2.5 py-1 text-[9px] font-bold rounded-md border uppercase ${getStatusBadge(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
                <h3 className="text-base font-extrabold text-white mt-2">{selectedSubmission.nomor_pengajuan}</h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedSubmission(null);
                  setActionError(null);
                }}
                className="p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              {actionError && (
                <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl mb-4">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{actionError}</p>
                </div>
              )}

              {/* Basic Meta Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/30 border border-slate-800/60 rounded-2xl space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Layanan Kependudukan</p>
                  <p className="text-sm font-bold text-white">{selectedSubmission.layanan?.nama}</p>
                </div>
                <div className="p-4 bg-slate-950/30 border border-slate-800/60 rounded-2xl space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Petugas Desa Pemohon</p>
                  <p className="text-sm font-bold text-white">{selectedSubmission.user?.name} (Desa {selectedSubmission.user?.desa})</p>
                </div>
              </div>

              {/* WORKFLOW ACTION PANEL (ADMIN DECISION LOGIC) */}
              <div className="p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider">Tindakan Alur Kerja Admin</h4>
                
                <div className="flex flex-wrap gap-3">
                  {/* Status: Menunggu -> Admin can Verify or Return */}
                  {selectedSubmission.status === 'menunggu' && (
                    <>
                      <button 
                        onClick={() => handleVerify(selectedSubmission.id)}
                        disabled={actionLoading}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Setujui & Verifikasi Berkas
                      </button>
                      <button 
                        onClick={() => setShowReturnModal(true)}
                        disabled={actionLoading}
                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Kembalikan Berkas (Revisi)
                      </button>
                    </>
                  )}

                  {/* Status: Diverifikasi -> Admin can Process */}
                  {selectedSubmission.status === 'diverifikasi' && (
                    <button 
                      onClick={() => handleProcess(selectedSubmission.id)}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                      <TrendingUp className="w-4 h-4" /> Mulai Produksi Cetak Fisik
                    </button>
                  )}

                  {/* Status: Diproses -> Admin must upload finished doc and Selesai */}
                  {selectedSubmission.status === 'diproses' && (
                    <button 
                      onClick={() => setShowCompleteModal(true)}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Terbitkan & Selesaikan Pengajuan
                    </button>
                  )}

                  {selectedSubmission.status === 'selesai' && (
                    <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Dokumen kependudukan telah berhasil diterbitkan dan diselesaikan.
                    </p>
                  )}

                  {selectedSubmission.status === 'dikembalikan' && (
                    <p className="text-xs text-rose-400 font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Berkas telah dikembalikan ke petugas desa untuk perbaikan biodata.
                    </p>
                  )}
                </div>
              </div>

              {/* Uploaded Files grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300">File & Dokumen Lampiran Pemohon</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSubmission.uploads?.map((up) => (
                    <div key={up.id} className="p-4 bg-slate-950/30 border border-slate-800/60 rounded-2xl flex items-center justify-between gap-4">
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{up.nama_file}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">{up.tipe}</p>
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        <a 
                          href={`/api/dokumen/${up.id}/preview`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a 
                          href={`/api/dokumen/${up.id}/download`}
                          className="p-2 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-lg text-indigo-400 transition"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline changes */}
              <div className="space-y-4 pt-4 border-t border-slate-800/60">
                <h4 className="text-xs font-bold text-slate-300">Histori Audit Perubahan Status</h4>
                <div className="space-y-3">
                  {selectedSubmission.logs?.map((log) => (
                    <div key={log.id} className="flex gap-4 items-start pl-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          Status diubah dari <span className="text-slate-400 font-semibold">{log.status_lama}</span> menjadi <span className="text-indigo-400 font-extrabold uppercase">{log.status_baru}</span>
                        </p>
                        {log.catatan && <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Catatan/Alasan: {log.catatan}</p>}
                        <span className="text-[8px] font-bold text-slate-600 block mt-1">
                          Oleh {log.user?.name} ({new Date(log.created_at).toLocaleString('id-ID')})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. RETURN NOTES MODAL */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleReturnSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" />
              Alasan Pengembalian Berkas
            </h3>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Silakan tulis catatan revisi atau kelengkapan berkas yang salah agar dapat diperbaiki oleh Petugas Operator Desa.
            </p>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Pesan Revisi / Catatan Perbaikan</label>
              <textarea 
                required
                rows="4"
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                placeholder="Contoh: Lampiran foto KTP orang tua buram atau tidak jelas dibaca. Silakan scan ulang berkas persyaratan nomor 2."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => {
                  setShowReturnModal(false);
                  setReturnNote('');
                }}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 rounded-xl transition"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-xl transition"
              >
                {actionLoading ? 'Memproses...' : 'Kirim Pengembalian'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. COMPLETE / UPLOAD DOKUMEN JADI MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCompleteSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Upload Dokumen Hasil Jadi
            </h3>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sebelum menyelesaikan status pengajuan menjadi selesai, Anda wajib meng-upload salinan cetak fisik dokumen kependudukan resmi hasil jadi agar dapat didownload oleh Petugas Desa.
            </p>

            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-400">File Hasil Dokumen</span>
                {hasilFile && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded-md uppercase">Terpilih</span>}
              </div>
              
              <label className="flex items-center gap-3 px-4 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition text-xs text-slate-400 hover:text-white">
                <FileUp className="w-5 h-5 text-slate-500" />
                <span className="truncate">{hasilFile ? hasilFile.name : 'Pilih file hasil (Max 10MB, PDF/JPG/PNG)'}</span>
                <input 
                  type="file" 
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setHasilFile(e.target.files[0])} 
                  className="hidden" 
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => {
                  setShowCompleteModal(false);
                  setHasilFile(null);
                }}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 rounded-xl transition"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition"
              >
                {actionLoading ? 'Mengunggah...' : 'Selesaikan & Terbitkan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default DashboardAdmin;
