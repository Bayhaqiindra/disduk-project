import React, { useState } from 'react';
import { 
  FileText, FileEdit, Baby, Activity, Heart, Scissors, UserCheck, Award,
  ArrowRight, ShieldCheck, Download, Upload, CheckCircle2, ChevronRight,
  HelpCircle, Phone, Mail, MapPin, Clock
} from 'lucide-react';

const LandingPage = () => {
  const [selectedService, setSelectedService] = useState(null);

  // 8 Services configuration from PRD
  const services = [
    {
      id: 1,
      kode: 'KK-BARU',
      nama: 'Pembuatan KK Baru',
      desc: 'Pembuatan Kartu Keluarga baru karena pernikahan baru, pemisahan KK, atau kedatangan penduduk.',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      req: [
        'Surat Pengantar RT/RW',
        'Fotokopi KTP semua anggota keluarga',
        'Fotokopi Akta Nikah/Cerai',
        'Fotokopi Akta Kelahiran anak',
        'Surat Keterangan Pindah (jika pindah datang)'
      ]
    },
    {
      id: 2,
      kode: 'KK-UBAH',
      nama: 'Perubahan KK',
      desc: 'Perubahan data Kartu Keluarga karena penambahan, pengurangan, atau perbaikan biodata anggota keluarga.',
      icon: FileEdit,
      color: 'from-purple-500 to-pink-600',
      req: [
        'KK lama (asli)',
        'Fotokopi KTP pemohon',
        'Surat Pengantar RT/RW',
        'Dokumen pendukung perubahan (Ijazah, Surat Nikah, dll)'
      ]
    },
    {
      id: 3,
      kode: 'AK-LAHIR',
      nama: 'Penerbitan Akta Kelahiran',
      desc: 'Pencatatan kelahiran anak baru lahir untuk mendapatkan dokumen Akta Kelahiran resmi.',
      icon: Baby,
      color: 'from-emerald-500 to-teal-600',
      req: [
        'Surat Keterangan Lahir dari RS/Bidan',
        'Fotokopi KK orang tua',
        'Fotokopi KTP kedua orang tua',
        'Fotokopi Akta Nikah orang tua',
        'Fotokopi KTP 2 orang saksi'
      ]
    },
    {
      id: 4,
      kode: 'AK-MATI',
      nama: 'Penerbitan Akta Kematian',
      desc: 'Pencatatan kematian penduduk untuk mendapatkan sertifikat Akta Kematian resmi.',
      icon: Activity,
      color: 'from-rose-500 to-orange-600',
      req: [
        'Surat Keterangan Kematian dari RS/Dokter/Kades',
        'Fotokopi KK almarhum',
        'Fotokopi KTP almarhum',
        'Fotokopi KTP pelapor',
        'Fotokopi KTP 2 orang saksi'
      ]
    },
    {
      id: 5,
      kode: 'AK-NIKAH',
      nama: 'Penerbitan Akta Perkawinan',
      desc: 'Pencatatan pernikahan penduduk non-Muslim untuk mendapatkan Akta Perkawinan sah.',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      req: [
        'Surat Keterangan dari pemuka agama',
        'Fotokopi KTP kedua mempelai',
        'Fotokopi Akta Kelahiran kedua mempelai',
        'Fotokopi KTP 2 orang saksi',
        'Pas foto bersama ukuran 4x6'
      ]
    },
    {
      id: 6,
      kode: 'AK-CERAI',
      nama: 'Penerbitan Akta Perceraian',
      desc: 'Pencatatan perceraian non-Muslim secara hukum berdasarkan keputusan resmi pengadilan.',
      icon: Scissors,
      color: 'from-amber-500 to-red-600',
      req: [
        'Salinan Putusan Pengadilan',
        'Fotokopi Akta Perkawinan asli',
        'Fotokopi KTP kedua pihak',
        'Fotokopi KK'
      ]
    },
    {
      id: 7,
      kode: 'AK-ANAK',
      nama: 'Pengakuan Anak',
      desc: 'Pengakuan status anak luar kawin secara sah oleh ayahnya dengan persetujuan ibu kandung.',
      icon: UserCheck,
      color: 'from-cyan-500 to-blue-600',
      req: [
        'Surat Pernyataan Pengakuan Anak',
        'Fotokopi KK',
        'Fotokopi KTP kedua orang tua',
        'Fotokopi Akta Kelahiran anak'
      ]
    },
    {
      id: 8,
      kode: 'AK-SAH',
      nama: 'Pengesahan Anak',
      desc: 'Pengesahan status hukum anak luar nikah setelah pernikahan resmi kedua orang tua kandungnya.',
      icon: Award,
      color: 'from-teal-500 to-indigo-600',
      req: [
        'Surat Pernyataan Pengesahan Anak',
        'Fotokopi Akta Perkawinan orang tua',
        'Fotokopi KK',
        'Fotokopi Akta Kelahiran anak'
      ]
    }
  ];

  const steps = [
    {
      title: 'Pilih Layanan',
      desc: 'Pilih salah satu dari 8 layanan kependudukan yang tersedia di desa Anda.',
      icon: HelpCircle
    },
    {
      title: 'Download & Isi',
      desc: 'Unduh template formulir kosong (PDF), isi secara manual, lalu berikan tanda tangan fisik.',
      icon: Download
    },
    {
      title: 'Upload Dokumen',
      desc: 'Ambil foto/scan formulir yang sudah diisi beserta semua berkas persyaratan, lalu upload.',
      icon: Upload
    },
    {
      title: 'Pantau & Unduh',
      desc: 'Pantau proses verifikasi admin secara real-time. Jika selesai, download file hasil dokumen Anda.',
      icon: CheckCircle2
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              DISDUKCAPIL
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">
              Bengkalis Digital
            </p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#layanan" className="hover:text-white transition">Daftar Layanan</a>
          <a href="#alur" className="hover:text-white transition">Alur Pengajuan</a>
          <a href="#kontak" className="hover:text-white transition">Hubungi Kami</a>
        </nav>

        <a 
          href="/login" 
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-bold text-white rounded-xl group bg-gradient-to-br from-indigo-500 to-violet-600 group-hover:from-indigo-500 group-hover:to-violet-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-indigo-800 transition shadow-lg shadow-indigo-500/20 mt-2"
        >
          <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-slate-950 rounded-xl group-hover:bg-opacity-0">
            Masuk Sistem
          </span>
        </a>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-indigo-400 mb-6 shadow-inner">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Layanan Online UPT Disdukcapil Bengkalis
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-4xl leading-tight">
          Administrasi Kependudukan <br className="hidden md:inline"/>
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            Tanpa Perlu Keluar Desa
          </span>
        </h2>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mb-10 leading-relaxed">
          Platform digital mandiri yang memberdayakan Petugas Desa untuk mengajukan berkas Kartu Keluarga & Akta Pencatatan Sipil secara instan dan memantau statusnya langsung dari kantor desa.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <a 
            href="/login" 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/35 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition duration-200"
          >
            Mulai Pengajuan Online <ArrowRight className="w-5 h-5" />
          </a>
          <a 
            href="#layanan" 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 hover:text-white transition duration-200"
          >
            Lihat Persyaratan
          </a>
        </div>
      </section>

      {/* Grid Services Section */}
      <section id="layanan" className="max-w-7xl mx-auto w-full px-6 py-20 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">8 Layanan Kependudukan Utama</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Klik salah satu jenis layanan di bawah ini untuk melihat berkas dan dokumen persyaratan lengkap yang harus disiapkan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div 
                key={svc.id}
                onClick={() => setSelectedService(selectedService === svc.id ? null : svc.id)}
                className={`relative group p-6 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                  selectedService === svc.id 
                    ? 'bg-slate-900 border-indigo-500/60 shadow-xl shadow-indigo-500/5' 
                    : 'bg-slate-900/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/60'
                }`}
              >
                {/* Colored Top Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${svc.color} opacity-80`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${svc.color} flex items-center justify-center text-white shadow-md shadow-indigo-500/10`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                    {svc.kode}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 group-hover:text-indigo-400 transition">
                  {svc.nama}
                </h3>
                
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  {svc.desc}
                </p>

                {/* Requirements Expand */}
                <div className={`transition-all duration-300 overflow-hidden ${
                  selectedService === svc.id ? 'max-h-60 mt-4 pt-4 border-t border-slate-800' : 'max-h-0'
                }`}>
                  <h4 className="text-xs font-bold text-indigo-400 mb-2.5 uppercase tracking-wider">Persyaratan Berkas:</h4>
                  <ul className="space-y-1.5">
                    {svc.req.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-400 leading-snug">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 mt-2">
                  <span>{selectedService === svc.id ? 'Tutup Detail' : 'Lihat Syarat'}</span>
                  <ChevronRight className={`w-4 h-4 transition ${selectedService === svc.id ? 'rotate-90' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Alur Kerja Section */}
      <section id="alur" className="max-w-7xl mx-auto w-full px-6 py-20 border-t border-slate-900 bg-slate-950/20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Alur Kerja Sistem yang Cepat</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            4 langkah praktis penyelesaian dokumen tanpa perlu petugas desa datang ke kantor UPT Disdukcapil.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div key={idx} className="relative flex flex-col items-center text-center p-6 bg-slate-900/20 border border-slate-900/60 rounded-2xl hover:border-slate-800 transition">
                {/* Step circle */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-xs font-black text-indigo-400">
                  {idx + 1}
                </div>

                <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 mt-4">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-base font-bold text-white mb-2">{st.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Premium Footer */}
      <footer id="kontak" className="mt-auto bg-slate-950 border-t border-slate-900 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">UPT DISDUKCAPIL</h3>
                <p className="text-[10px] text-indigo-400 font-semibold tracking-wider">KABUPATEN BENGKALIS</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Sistem Layanan Administrasi Kependudukan Online Bengkalis merupakan wujud inovasi efisiensi layanan bagi masyarakat di tingkat desa.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Kontak Instansi</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>+62 766 123456</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>support@disdukcapil-bengkalis.go.id</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Jl. Pertanian No. 12, Bengkalis, Riau</span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Jam Layanan Kantor</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-300">Senin - Kamis</p>
                  <p className="text-[10px] text-slate-500">08:00 WIB - 16:00 WIB</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-300">Jumat</p>
                  <p className="text-[10px] text-slate-500">08:00 WIB - 11:30 WIB</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-900/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} UPT Disdukcapil Bengkalis. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Kebijakan Privasi</a>
            <a href="#" className="hover:underline">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
