import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  FileText, FileEdit, Baby, Activity, Heart, Scissors, UserCheck, Award,
  ArrowRight, ShieldCheck, Download, Upload, CheckCircle2, ChevronRight,
  AlertCircle, Loader2, Eye, Calendar, User, FileUp, X, Check, HelpCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';

const DashboardPetugas = () => {
  // Tabs: 'dashboard' | 'ajukan' | 'list'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard stats
  const [stats, setStats] = useState({ total: 0, menunggu: 0, diverifikasi: 0, diproses: 0, selesai: 0, dikembalikan: 0 });
  const [recentList, setRecentList] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Submissions list
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [loadingList, setLoadingList] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // New Submission state
  const [submitStep, setSubmitStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [formulirFile, setFormulirFile] = useState(null);
  const [reqFiles, setReqFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // 8 Services configuration from PRD
  const services = [
    { id: 1, kode: 'KK-BARU', nama: 'Pembuatan KK Baru', desc: 'Pembuatan Kartu Keluarga baru karena pernikahan baru, pemisahan KK, atau kedatangan.', icon: FileText, color: 'from-blue-500 to-indigo-600', req: ['Surat Pengantar RT/RW', 'Fotokopi KTP semua anggota keluarga', 'Fotokopi Akta Nikah/Cerai', 'Fotokopi Akta Kelahiran anak', 'Surat Keterangan Pindah'] },
    { id: 2, kode: 'KK-UBAH', nama: 'Perubahan KK', desc: 'Perubahan data KK karena penambahan, pengurangan, atau perbaikan data biodata.', icon: FileEdit, color: 'from-purple-500 to-pink-600', req: ['KK lama (asli)', 'Fotokopi KTP pemohon', 'Surat Pengantar RT/RW', 'Dokumen pendukung perubahan'] },
    { id: 3, kode: 'AK-LAHIR', nama: 'Penerbitan Akta Kelahiran', desc: 'Pencatatan kelahiran anak baru lahir untuk mendapatkan dokumen Akta Kelahiran.', icon: Baby, color: 'from-emerald-500 to-teal-600', req: ['Surat Keterangan Lahir dari RS/Bidan', 'Fotokopi KK orang tua', 'Fotokopi KTP kedua orang tua', 'Fotokopi Akta Nikah orang tua', 'Fotokopi KTP 2 orang saksi'] },
    { id: 4, kode: 'AK-MATI', nama: 'Penerbitan Akta Kematian', desc: 'Pencatatan kematian penduduk untuk mendapatkan sertifikat Akta Kematian.', icon: Activity, color: 'from-rose-500 to-orange-600', req: ['Surat Keterangan Kematian dari RS/Dokter/Kades', 'Fotokopi KK almarhum', 'Fotokopi KTP almarhum', 'Fotokopi KTP pelapor', 'Fotokopi KTP 2 orang saksi'] },
    { id: 5, kode: 'AK-NIKAH', nama: 'Penerbitan Akta Perkawinan', desc: 'Pencatatan pernikahan penduduk non-Muslim untuk mendapatkan Akta Perkawinan sah.', icon: Heart, color: 'from-pink-500 to-rose-600', req: ['Surat Keterangan dari pemuka agama', 'Fotokopi KTP kedua mempelai', 'Fotokopi Akta Kelahiran mempelai', 'Fotokopi KTP 2 orang saksi', 'Pas foto bersama 4x6'] },
    { id: 6, kode: 'AK-CERAI', nama: 'Penerbitan Akta Perceraian', desc: 'Pencatatan perceraian non-Muslim secara hukum berdasarkan keputusan pengadilan.', icon: Scissors, color: 'from-amber-500 to-red-600', req: ['Salinan Putusan Pengadilan', 'Fotokopi Akta Perkawinan asli', 'Fotokopi KTP kedua pihak', 'Fotokopi KK'] },
    { id: 7, kode: 'AK-ANAK', nama: 'Pengakuan Anak', desc: 'Pengakuan status anak luar kawin secara sah oleh ayahnya dengan persetujuan ibu kandung.', icon: UserCheck, color: 'from-cyan-500 to-blue-600', req: ['Surat Pernyataan Pengakuan Anak', 'Fotokopi KK', 'Fotokopi KTP kedua orang tua', 'Fotokopi Akta Kelahiran anak'] },
    { id: 8, kode: 'AK-SAH', nama: 'Pengesahan Anak', desc: 'Pengesahan status hukum anak luar nikah setelah pernikahan resmi kedua orang tua.', icon: Award, color: 'from-teal-500 to-indigo-600', req: ['Surat Pernyataan Pengesahan Anak', 'Fotokopi Akta Perkawinan orang tua', 'Fotokopi KK', 'Fotokopi Akta Kelahiran anak'] }
  ];

  useEffect(() => {
    fetchStats();
    fetchRecentSubmissions();
    
    // Check if redirect detail is in URL query parameters
    const params = new URLSearchParams(window.location.search);
    const detailId = params.get('detail');
    if (detailId) {
      handleViewDetail(detailId);
    }
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentSubmissions = async () => {
    try {
      const response = await api.get('/pengajuan');
      setRecentList(response.data.data.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllSubmissions = async (page = 1) => {
    setLoadingList(true);
    try {
      const response = await api.get(`/pengajuan?page=${page}`);
      setSubmissions(response.data.data.data);
      setPagination({
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'list') {
      fetchAllSubmissions();
    } else if (tab === 'dashboard') {
      fetchStats();
      fetchRecentSubmissions();
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

  // CLIENT-SIDE PDF GENERATOR using jsPDF
  const generateFormTemplate = (service) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 41, 59); // dark header banner
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('UPT DINAS KEPENDUDUKAN & PENCATATAN SIPIL', 105, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text('KABUPATEN BENGKALIS, PROVINSI RIAU', 105, 26, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Dokumen Resmi Form Pengajuan Kependudukan Online Mandiri', 105, 32, { align: 'center' });

    // Body Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text(`FORMULIR PENGAJUAN: ${service.nama.toUpperCase()}`, 105, 55, { align: 'center' });
    
    // Horizontal rule
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 62, 190, 62);

    // Form fields placeholder
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.setFont('Helvetica', 'bold');
    doc.text('DATA PEMOHON (ISI DENGAN HURUF KAPITAL):', 20, 75);
    
    doc.setFont('Helvetica', 'normal');
    const fields = [
      '1. Nama Lengkap Pemohon  : __________________________________________________',
      '2. Nomor Induk Kependudukan (NIK) : ________________________________________',
      '3. Nomor Kartu Keluarga (KK)  : ____________________________________________',
      '4. Tempat / Tanggal Lahir  : ____________________ / ________________________',
      '5. Alamat Lengkap Pemohon  : RT ____ / RW ____, Dusun ______________________',
      '6. Desa / Kelurahan   : __________________________________________________',
      '7. Nomor Telepon Aktif / WA  : ____________________________________________'
    ];

    let y = 85;
    fields.forEach(field => {
      doc.text(field, 20, y);
      y += 10;
    });

    // Requirements section
    doc.setFont('Helvetica', 'bold');
    doc.text('CHECKLIST DOKUMEN PERSYARATAN (DI-SCAN/FOTO DAN DIUPLOAD):', 20, 165);
    
    doc.setFont('Helvetica', 'normal');
    let ry = 175;
    service.req.forEach(r => {
      doc.rect(20, ry - 3.5, 4, 4); // Draw checkbox
      doc.text(r, 28, ry);
      ry += 8;
    });

    // Sign section
    const signY = 245;
    doc.text('Mengetahui,', 30, signY);
    doc.text('Petugas Operator Desa', 30, signY + 6);
    doc.text('_____________________', 30, signY + 30);

    doc.text('Bengkalis, _________________ 2026', 120, signY);
    doc.text('Tanda Tangan Pemohon', 120, signY + 6);
    doc.text('_____________________', 120, signY + 30);

    // Save/Download PDF locally in browser
    doc.save(`Formulir_${service.kode}.pdf`);
  };

  const handleSelectService = (svc) => {
    setSelectedService(svc);
    setSubmitStep(2);
    setFormulirFile(null);
    setReqFiles({});
    setSubmitError(null);
  };

  const handleFormulirChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10240 * 1024) {
        setSubmitError('Ukuran file formulir tidak boleh melebihi 10MB.');
        return;
      }
      setFormulirFile(file);
      setSubmitError(null);
    }
  };

  const handleReqFileChange = (reqName, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10240 * 1024) {
        setSubmitError(`Ukuran file persyaratan "${reqName}" tidak boleh melebihi 10MB.`);
        return;
      }
      setReqFiles(prev => ({
        ...prev,
        [reqName]: file
      }));
      setSubmitError(null);
    }
  };

  const handleSubmitPengajuan = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate formulir
    if (!formulirFile) {
      setSubmitError('Harap upload formulir yang telah diisi & ditandatangani.');
      return;
    }

    // Validate all requirements are uploaded
    const missing = selectedService.req.filter(r => !reqFiles[r]);
    if (missing.length > 0) {
      setSubmitError(`Harap upload berkas persyaratan: ${missing.join(', ')}.`);
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('layanan_id', selectedService.id);
      formData.append('formulir', formulirFile);
      
      // Append requirements files
      selectedService.req.forEach(r => {
        formData.append('persyaratan[]', reqFiles[r]);
      });

      await api.post('/pengajuan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Clear states & navigate back to dashboard
      setSelectedService(null);
      setFormulirFile(null);
      setReqFiles({});
      setSubmitStep(1);
      handleTabChange('dashboard');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setSubmitError(err.response.data.message);
      } else {
        setSubmitError('Terjadi kesalahan saat membuat pengajuan. Pastikan format file PDF/JPG/PNG.');
      }
    } finally {
      setSubmitting(false);
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
      {/* Top Navigation tabs for Petugas */}
      <div className="flex gap-3 pb-6 border-b border-slate-900 mb-8 overflow-x-auto">
        <button 
          onClick={() => handleTabChange('dashboard')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
            activeTab === 'dashboard' 
              ? 'bg-slate-900 border-indigo-500/40 text-white shadow-lg' 
              : 'border-slate-800/40 text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          Overview Ringkasan
        </button>
        <button 
          onClick={() => handleTabChange('ajukan')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
            activeTab === 'ajukan' 
              ? 'bg-slate-900 border-indigo-500/40 text-white shadow-lg' 
              : 'border-slate-800/40 text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          Ajukan Layanan Baru
        </button>
        <button 
          onClick={() => handleTabChange('list')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
            activeTab === 'list' 
              ? 'bg-slate-900 border-indigo-500/40 text-white shadow-lg' 
              : 'border-slate-800/40 text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          Pengajuan Saya ({stats.total})
        </button>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Stats widgets */}
          {loadingStats ? (
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

          {/* Recent Submissions list */}
          <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6">
            <h3 className="text-base font-bold text-white mb-6">Aktivitas Pengajuan Terbaru</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Nomor Pengajuan</th>
                    <th className="pb-3">Layanan</th>
                    <th className="pb-3">Tanggal Diajukan</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 text-xs">
                  {recentList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500">Belum ada pengajuan.</td>
                    </tr>
                  ) : (
                    recentList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-950/20">
                        <td className="py-3.5 font-bold text-slate-300">{item.nomor_pengajuan}</td>
                        <td className="py-3.5 text-slate-400 font-semibold">{item.layanan?.nama}</td>
                        <td className="py-3.5 text-slate-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 text-[9px] font-bold rounded-md border uppercase ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
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
          </div>
        </div>
      )}

      {/* 2. SUBMIT TAB (AJUKAN LAYANAN) */}
      {activeTab === 'ajukan' && (
        <div className="space-y-8">
          {/* Step indicator header */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-5 mb-8">
            <h2 className="text-xl font-black text-white">Ajukan Berkas Baru</h2>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition ${
                submitStep >= 1 ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-800 text-slate-500'
              }`}>1</span>
              <div className="w-8 h-0.5 bg-slate-800"></div>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition ${
                submitStep >= 2 ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-800 text-slate-500'
              }`}>2</span>
            </div>
          </div>

          {/* STEP 1: PILIH LAYANAN */}
          {submitStep === 1 && (
            <div className="space-y-6">
              <p className="text-sm text-slate-400">Pilih jenis layanan administrasi yang ingin Anda ajukan di bawah ini:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((svc) => {
                  const Icon = svc.icon;
                  return (
                    <div 
                      key={svc.id}
                      onClick={() => handleSelectService(svc)}
                      className="relative group p-6 bg-slate-900 border border-slate-900 hover:border-indigo-500/50 hover:bg-slate-900/60 rounded-2xl transition cursor-pointer overflow-hidden shadow-lg"
                    >
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${svc.color}`}></div>
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${svc.color} flex items-center justify-center text-white mb-4`}>
                        <Icon className="w-5.5 h-5.5" />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-indigo-400 transition">{svc.nama}</h3>
                      <p className="text-[11px] text-slate-400 leading-normal mb-3">{svc.desc}</p>
                      <div className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-400">
                        <span>Pilih Layanan</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition duration-200" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DOWNLOAD & UPLOAD */}
          {submitStep === 2 && selectedService && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left sidebar: Guidelines & Template */}
              <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 space-y-6 h-fit">
                <button 
                  onClick={() => setSubmitStep(1)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>

                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Layanan Terpilih</span>
                  <h3 className="text-base font-extrabold text-white mt-1">{selectedService.nama}</h3>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300">1. Unduh Template Formulir</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sistem akan membuat file formulir pendaftaran kosong secara otomatis. Silakan unduh, cetak, isi secara manual, dan tanda tangani.
                  </p>
                  <button 
                    onClick={() => generateFormTemplate(selectedService)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-bold rounded-xl text-xs transition"
                  >
                    <Download className="w-4 h-4" /> Download PDF Formulir
                  </button>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300">Persyaratan Dokumen:</h4>
                  <ul className="space-y-2">
                    {selectedService.req.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-400">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right panel: File Upload form */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-900 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-6">Upload Berkas Pemohon</h3>

                {submitError && (
                  <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl mb-6">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{submitError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitPengajuan} className="space-y-6">
                  {/* File 1: Formulir */}
                  <div className="p-5 bg-slate-950/40 border border-slate-800 rounded-2xl">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-xs font-bold text-white">Upload Formulir Pendaftaran</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Wajib formulir cetak yang diisi & ditandatangani.</p>
                      </div>
                      {formulirFile && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded-md uppercase">Terpilih</span>}
                    </div>
                    
                    <label className="flex items-center gap-3 px-4 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition text-xs text-slate-400 hover:text-white">
                      <FileUp className="w-5 h-5 text-slate-500" />
                      <span className="truncate">{formulirFile ? formulirFile.name : 'Pilih file scan/foto formulir (Max 10MB, PDF/JPG/PNG)'}</span>
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFormulirChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Requirements upload */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-300">Upload Berkas Persyaratan Tambahan</h4>
                    {selectedService.req.map((r, idx) => (
                      <div key={idx} className="p-4 bg-slate-950/20 border border-slate-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="max-w-md">
                          <p className="text-xs font-bold text-slate-300 leading-snug">{r}</p>
                          <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">Upload salinan foto/scan dokumen pendukung pemohon.</p>
                        </div>

                        <label className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer text-[11px] font-bold text-slate-400 hover:text-white transition w-fit shrink-0">
                          <Upload className="w-3.5 h-3.5 text-slate-500" />
                          <span className="max-w-[120px] truncate">{reqFiles[r] ? reqFiles[r].name : 'Pilih File'}</span>
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleReqFileChange(r, e)} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    ))}
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Mengirim Berkas Pengajuan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Kirim Pengajuan Online</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. SUBMISSIONS LIST TAB */}
      {activeTab === 'list' && (
        <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 space-y-6">
          <h2 className="text-base font-bold text-white">Daftar Semua Pengajuan Kependudukan Saya</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">Nomor Pengajuan</th>
                  <th className="pb-3">Layanan</th>
                  <th className="pb-3">Tanggal Diajukan</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-xs">
                {loadingList ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="py-4 bg-slate-950/10 h-10"></td>
                    </tr>
                  ))
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">Anda belum pernah mengirim pengajuan kependudukan.</td>
                  </tr>
                ) : (
                  submissions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-950/20">
                      <td className="py-4 font-bold text-slate-300">{item.nomor_pengajuan}</td>
                      <td className="py-4 text-slate-400 font-semibold">{item.layanan?.nama}</td>
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
            <div className="flex justify-center gap-2 pt-4 border-t border-slate-800/40">
              <button 
                disabled={pagination.current_page === 1}
                onClick={() => fetchAllSubmissions(pagination.current_page - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-bold hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none"
              >
                Sebelumnya
              </button>
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-500">
                Halaman {pagination.current_page} dari {pagination.last_page}
              </span>
              <button 
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => fetchAllSubmissions(pagination.current_page + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-bold hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. DETAILED VIEW MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <div>
                <span className={`px-2.5 py-1 text-[9px] font-bold rounded-md border uppercase ${getStatusBadge(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
                <h3 className="text-base font-extrabold text-white mt-2">{selectedSubmission.nomor_pengajuan}</h3>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              {/* Submission Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/30 border border-slate-800/60 rounded-2xl space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jenis Layanan</p>
                  <p className="text-sm font-bold text-white">{selectedSubmission.layanan?.nama}</p>
                </div>
                <div className="p-4 bg-slate-950/30 border border-slate-800/60 rounded-2xl space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Desa Pemohon</p>
                  <p className="text-sm font-bold text-white">Desa {selectedSubmission.user?.desa}</p>
                </div>
              </div>

              {/* Admin Note if Dikembalikan */}
              {selectedSubmission.catatan_admin && (
                <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-rose-400">Catatan Tanggapan Instansi:</h4>
                  <p className="text-xs text-rose-300/80 leading-relaxed">{selectedSubmission.catatan_admin}</p>
                </div>
              )}

              {/* Uploaded Documents */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300">File & Dokumen Pengajuan</h4>
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

              {/* Status logs Timeline */}
              <div className="space-y-4 pt-4 border-t border-slate-800/60">
                <h4 className="text-xs font-bold text-slate-300">Histori Perubahan Status</h4>
                <div className="space-y-3">
                  {selectedSubmission.logs?.map((log) => (
                    <div key={log.id} className="flex gap-4 items-start pl-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          Status diubah dari <span className="text-slate-400 font-semibold">{log.status_lama}</span> menjadi <span className="text-indigo-400 font-extrabold uppercase">{log.status_baru}</span>
                        </p>
                        {log.catatan && <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Catatan: {log.catatan}</p>}
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
    </Layout>
  );
};

export default DashboardPetugas;
