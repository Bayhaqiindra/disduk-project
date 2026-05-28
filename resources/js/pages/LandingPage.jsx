import React, { useState } from 'react';
import { 
  IdCard, Baby, Heart, Scissors, Activity, UserCheck, Award, FileText,
  ArrowRight, ShieldCheck, Download, Upload, CheckCircle2, ChevronRight,
  HelpCircle, Phone, Mail, MapPin, Clock, ChevronDown
} from 'lucide-react';

const LandingPage = () => {
  const [selectedService, setSelectedService] = useState(null);

  // 8 service categories matching the dynamic database
  const services = [
    {
      id: 1, kode: 'KK', nama: 'Kartu Keluarga',
      desc: 'Penerbitan KK Baru, Perubahan Data KK, dan Penggantian KK Hilang/Rusak.',
      icon: IdCard,
      subLayanan: ['Penerbitan KK Baru untuk WNI', 'Penerbitan KK karena Perubahan Elemen Data', 'Penerbitan KK karena Hilang/Rusak']
    },
    {
      id: 2, kode: 'AK-LAHIR', nama: 'Akta Kelahiran',
      desc: 'Pencatatan kelahiran normal dan anak temuan/tidak diketahui asal-usulnya.',
      icon: Baby,
      subLayanan: ['Akta Kelahiran Normal', 'Kelahiran Anak Temuan']
    },
    {
      id: 3, kode: 'AK-NIKAH', nama: 'Akta Perkawinan',
      desc: 'Pencatatan perkawinan bagi penduduk non-Muslim.',
      icon: Heart, subLayanan: []
    },
    {
      id: 4, kode: 'AK-CERAI', nama: 'Akta Perceraian',
      desc: 'Pencatatan perceraian berdasarkan putusan pengadilan.',
      icon: Scissors, subLayanan: []
    },
    {
      id: 5, kode: 'AK-MATI', nama: 'Akta Kematian',
      desc: 'Pencatatan kematian penduduk dan penerbitan akta kematian resmi.',
      icon: Activity, subLayanan: []
    },
    {
      id: 6, kode: 'AK-ANAK', nama: 'Pengakuan Anak',
      desc: 'Pencatatan pengakuan anak luar nikah oleh ayahnya.',
      icon: UserCheck, subLayanan: []
    },
    {
      id: 7, kode: 'AK-SAH', nama: 'Pengesahan Anak',
      desc: 'Pengesahan anak setelah orang tua melakukan pernikahan sah.',
      icon: Award, subLayanan: []
    },
    {
      id: 8, kode: 'UBAH-NAMA', nama: 'Perubahan Nama',
      desc: 'Pencatatan perubahan nama berdasarkan putusan pengadilan.',
      icon: FileText, subLayanan: []
    }
  ];

  const steps = [
    { title: 'Pilih Layanan', desc: 'Pilih kategori layanan dan jenis sub-layanan yang sesuai.', icon: HelpCircle },
    { title: 'Unduh & Isi Formulir', desc: 'Download formulir resmi, cetak, isi manual, lalu tanda tangani.', icon: Download },
    { title: 'Upload Berkas', desc: 'Scan/foto formulir beserta berkas persyaratan, lalu upload ke sistem.', icon: Upload },
    { title: 'Pantau & Unduh Hasil', desc: 'Pantau status verifikasi real-time. Jika selesai, download dokumen Anda.', icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col selection:bg-blue-500 selection:text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-gray-900">SILADUK</h1>
              <p className="text-[10px] text-blue-600 font-semibold tracking-widest uppercase">Disdukcapil Bengkalis</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#layanan" className="hover:text-blue-600 transition">Layanan</a>
            <a href="#alur" className="hover:text-blue-600 transition">Alur Kerja</a>
            <a href="#kontak" className="hover:text-blue-600 transition">Kontak</a>
          </nav>

          <a 
            href="/login" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 hover:shadow-blue-700/30 transition active:scale-[0.98]"
          >
            Masuk Sistem
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6">
        {/* Subtle blue gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-600 mb-6">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Layanan Online UPT Disdukcapil Bengkalis
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Administrasi Kependudukan <br className="hidden md:inline"/>
            <span className="text-blue-600">Tanpa Perlu Keluar Desa</span>
          </h2>

          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Platform digital yang memberdayakan Petugas Desa untuk mengajukan berkas Kartu Keluarga & Akta Pencatatan Sipil secara online dan memantau statusnya dari kantor desa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/login" 
              className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 hover:scale-[1.02] active:scale-[0.98] transition duration-200"
            >
              Mulai Pengajuan Online <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="#layanan" 
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-300 hover:text-blue-600 transition duration-200"
            >
              Lihat Daftar Layanan
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="layanan" className="max-w-7xl mx-auto w-full px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">8 Kategori Layanan Kependudukan</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            Klik salah satu kategori untuk melihat jenis sub-layanan yang tersedia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((svc) => {
            const Icon = svc.icon;
            const isOpen = selectedService === svc.id;
            return (
              <div 
                key={svc.id}
                onClick={() => setSelectedService(isOpen ? null : svc.id)}
                className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  isOpen 
                    ? 'bg-blue-50 border-blue-300 shadow-lg shadow-blue-100' 
                    : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    isOpen ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                  } transition`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                    {svc.kode}
                  </span>
                </div>

                <h3 className={`text-base font-bold mb-2 transition ${isOpen ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'}`}>
                  {svc.nama}
                </h3>
                
                <p className="text-gray-500 text-xs leading-relaxed mb-3">
                  {svc.desc}
                </p>

                {/* Sub-layanan expand */}
                <div className={`transition-all duration-300 overflow-hidden ${
                  isOpen ? 'max-h-60 mt-3 pt-3 border-t border-blue-200' : 'max-h-0'
                }`}>
                  {svc.subLayanan.length > 0 ? (
                    <>
                      <h4 className="text-[10px] font-bold text-blue-600 mb-2 uppercase tracking-wider">Sub-Layanan:</h4>
                      <ul className="space-y-1.5">
                        {svc.subLayanan.map((sub, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                            <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{sub}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-[11px] text-gray-500 italic">Layanan ini tidak memiliki sub-layanan.</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mt-2">
                  <span>{isOpen ? 'Tutup' : 'Lihat Detail'}</span>
                  <ChevronDown className={`w-4 h-4 transition duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow Section */}
      <section id="alur" className="bg-blue-50/50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Alur Pengajuan yang Mudah</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              4 langkah sederhana untuk menyelesaikan pengurusan dokumen kependudukan secara digital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={idx} className="relative flex flex-col items-center text-center p-6 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold shadow-md shadow-blue-600/20">
                    {idx + 1}
                  </div>

                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-5 mt-4">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mb-2">{st.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="mt-auto bg-gray-900 text-white pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">UPT DISDUKCAPIL</h3>
                <p className="text-[10px] text-blue-400 font-semibold tracking-wider">KABUPATEN BENGKALIS</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Sistem Layanan Administrasi Kependudukan Online Bengkalis — wujud inovasi efisiensi layanan bagi masyarakat di tingkat desa.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider">Kontak Instansi</h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+62 766 123456</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@disdukcapil-bengkalis.go.id</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Jl. Pertanian No. 12, Bengkalis, Riau</span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider">Jam Layanan Kantor</h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-300">Senin - Kamis</p>
                  <p className="text-[10px] text-gray-500">08:00 WIB - 16:00 WIB</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-300">Jumat</p>
                  <p className="text-[10px] text-gray-500">08:00 WIB - 11:30 WIB</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} UPT Disdukcapil Bengkalis. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300 transition">Kebijakan Privasi</a>
            <a href="#" className="hover:text-gray-300 transition">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
