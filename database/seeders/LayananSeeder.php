<?php

namespace Database\Seeders;

use App\Models\Layanan;
use App\Models\Persyaratan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LayananSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear tables to avoid conflicts
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Persyaratan::truncate();
        Layanan::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        // 1. Kategori: Kartu Keluarga
        $kk = Layanan::create([
            'parent_id' => null,
            'kode' => 'KK',
            'nama' => 'Kartu Keluarga',
            'kategori' => 'Kartu Keluarga',
            'deskripsi' => 'Pengurusan dokumen Kartu Keluarga.',
            'icon' => 'IdCard',
            'urutan' => 1,
            'is_active' => true,
        ]);

        $kkBaru = Layanan::create([
            'parent_id' => $kk->id,
            'kode' => 'KK-BARU',
            'kode_formulir' => 'F-1.02 ~ F-1.06',
            'nama' => 'Penerbitan KK Baru untuk WNI',
            'kategori' => 'Kartu Keluarga',
            'deskripsi' => 'Pembuatan Kartu Keluarga baru bagi WNI.',
            'icon' => null,
            'urutan' => 1,
            'is_active' => true,
        ]);

        Persyaratan::create([
            'layanan_id' => $kkBaru->id,
            'nama_dokumen' => 'Buku nikah/kutipan akta perkawinan atau kutipan akta perceraian',
            'is_wajib' => true,
            'urutan' => 1,
        ]);
        Persyaratan::create([
            'layanan_id' => $kkBaru->id,
            'nama_dokumen' => 'Surat keterangan pindah/surat keterangan datang bagi penduduk yang pindah dalam wilayah NKRI',
            'is_wajib' => true,
            'catatan' => 'Bagi penduduk pindah',
            'urutan' => 2,
        ]);

        $kkUbah = Layanan::create([
            'parent_id' => $kk->id,
            'kode' => 'KK-UBAH',
            'kode_formulir' => 'F-1.02 ~ F-1.06',
            'nama' => 'Penerbitan KK Karena Perubahan Elemen Data',
            'kategori' => 'Kartu Keluarga',
            'deskripsi' => 'Perubahan elemen data pada Kartu Keluarga.',
            'icon' => null,
            'urutan' => 2,
            'is_active' => true,
        ]);

        Persyaratan::create([
            'layanan_id' => $kkUbah->id,
            'nama_dokumen' => 'KK lama',
            'is_wajib' => true,
            'catatan' => 'Asli atau scan',
            'urutan' => 1,
        ]);
        Persyaratan::create([
            'layanan_id' => $kkUbah->id,
            'nama_dokumen' => 'Surat keterangan/bukti perubahan Peristiwa Kependudukan dan Peristiwa Penting',
            'is_wajib' => true,
            'urutan' => 2,
        ]);

        $kkHilang = Layanan::create([
            'parent_id' => $kk->id,
            'kode' => 'KK-HILANG',
            'kode_formulir' => 'F-1.02',
            'nama' => 'Penerbitan KK Baru WNI Karena Hilang atau Rusak',
            'kategori' => 'Kartu Keluarga',
            'deskripsi' => 'Penggantian KK baru karena hilang atau rusak fisik.',
            'icon' => null,
            'urutan' => 3,
            'is_active' => true,
        ]);

        Persyaratan::create([
            'layanan_id' => $kkHilang->id,
            'nama_dokumen' => 'Surat keterangan hilang dari kepolisian ATAU KK yang rusak',
            'is_wajib' => true,
            'catatan' => 'Salah satu (scan)',
            'urutan' => 1,
        ]);
        Persyaratan::create([
            'layanan_id' => $kkHilang->id,
            'nama_dokumen' => 'Fotokopi KTP-el',
            'is_wajib' => true,
            'urutan' => 2,
        ]);


        // 2. Kategori: Akta Kelahiran
        $aktaLahir = Layanan::create([
            'parent_id' => null,
            'kode' => 'AK-LAHIR',
            'nama' => 'Akta Kelahiran',
            'kategori' => 'Akta Kelahiran',
            'deskripsi' => 'Pengurusan dokumen pencatatan kelahiran anak.',
            'icon' => 'Baby',
            'urutan' => 2,
            'is_active' => true,
        ]);

        $lahirNormal = Layanan::create([
            'parent_id' => $aktaLahir->id,
            'kode' => 'AK-LAHIR-NORMAL',
            'kode_formulir' => 'F-2.01a',
            'nama' => 'Penerbitan Akta Kelahiran (Kelahiran Normal)',
            'kategori' => 'Akta Kelahiran',
            'deskripsi' => 'Pencatatan kelahiran normal bagi anak.',
            'icon' => null,
            'urutan' => 1,
            'is_active' => true,
        ]);

        Persyaratan::create(['layanan_id' => $lahirNormal->id, 'nama_dokumen' => 'Surat keterangan kelahiran dari RS/bidan', 'is_wajib' => true, 'urutan' => 1]);
        Persyaratan::create(['layanan_id' => $lahirNormal->id, 'nama_dokumen' => 'Buku nikah/kutipan akta perkawinan atau bukti lain yang sah', 'is_wajib' => true, 'catatan' => 'Fotokopi', 'urutan' => 2]);
        Persyaratan::create(['layanan_id' => $lahirNormal->id, 'nama_dokumen' => 'Fotokopi KK', 'is_wajib' => true, 'urutan' => 3]);
        Persyaratan::create(['layanan_id' => $lahirNormal->id, 'nama_dokumen' => 'Fotokopi KTP orang tua', 'is_wajib' => true, 'urutan' => 4]);
        Persyaratan::create(['layanan_id' => $lahirNormal->id, 'nama_dokumen' => 'Fotokopi KTP pelapor', 'is_wajib' => true, 'urutan' => 5]);
        Persyaratan::create(['layanan_id' => $lahirNormal->id, 'nama_dokumen' => 'Fotokopi KTP 2 orang saksi', 'is_wajib' => true, 'urutan' => 6]);

        $lahirTemuan = Layanan::create([
            'parent_id' => $aktaLahir->id,
            'kode' => 'AK-LAHIR-TEMUAN',
            'kode_formulir' => 'F-2.01a',
            'nama' => 'Pencatatan Kelahiran WNI (Anak Temuan/Tidak Diketahui Asal-Usul)',
            'kategori' => 'Akta Kelahiran',
            'deskripsi' => 'Pencatatan kelahiran anak yang ditemukan atau tidak diketahui asal-usulnya.',
            'icon' => null,
            'urutan' => 2,
            'is_active' => true,
        ]);

        Persyaratan::create(['layanan_id' => $lahirTemuan->id, 'nama_dokumen' => 'Berita acara dari kepolisian', 'is_wajib' => true, 'urutan' => 1]);
        Persyaratan::create(['layanan_id' => $lahirTemuan->id, 'nama_dokumen' => 'Fotokopi KTP pelapor', 'is_wajib' => true, 'urutan' => 2]);
        Persyaratan::create(['layanan_id' => $lahirTemuan->id, 'nama_dokumen' => 'Fotokopi KTP 2 orang saksi', 'is_wajib' => true, 'urutan' => 3]);


        // 3. Akta Perkawinan
        $aktaNikah = Layanan::create([
            'parent_id' => null,
            'kode' => 'AK-NIKAH',
            'kode_formulir' => 'F-2.01b',
            'nama' => 'Akta Perkawinan',
            'kategori' => 'Akta Perkawinan',
            'deskripsi' => 'Pengurusan akta perkawinan bagi non-Muslim.',
            'icon' => 'Heart',
            'urutan' => 3,
            'is_active' => true,
        ]);

        Persyaratan::create(['layanan_id' => $aktaNikah->id, 'nama_dokumen' => 'Surat keterangan telah terjadinya perkawinan dari pemuka agama atau penghayat kepercayaan terhadap Tuhan Yang Maha Esa', 'is_wajib' => true, 'urutan' => 1]);
        Persyaratan::create(['layanan_id' => $aktaNikah->id, 'nama_dokumen' => 'Pas foto berwarna suami dan istri', 'is_wajib' => true, 'urutan' => 2]);
        Persyaratan::create(['layanan_id' => $aktaNikah->id, 'nama_dokumen' => 'Fotokopi KK', 'is_wajib' => true, 'urutan' => 3]);
        Persyaratan::create(['layanan_id' => $aktaNikah->id, 'nama_dokumen' => 'Fotokopi KTP-el pasangan suami istri', 'is_wajib' => true, 'urutan' => 4]);
        Persyaratan::create(['layanan_id' => $aktaNikah->id, 'nama_dokumen' => 'Fotokopi KTP 2 orang saksi', 'is_wajib' => true, 'urutan' => 5]);


        // 4. Akta Perceraian
        $aktaCerai = Layanan::create([
            'parent_id' => null,
            'kode' => 'AK-CERAI',
            'kode_formulir' => 'F-2.01c',
            'nama' => 'Akta Perceraian',
            'kategori' => 'Akta Perceraian',
            'deskripsi' => 'Pengurusan akta perceraian bagi non-Muslim.',
            'icon' => 'Scissors',
            'urutan' => 4,
            'is_active' => true,
        ]);

        Persyaratan::create(['layanan_id' => $aktaCerai->id, 'nama_dokumen' => 'Salinan putusan pengadilan yang telah mempunyai kekuatan hukum tetap', 'is_wajib' => true, 'urutan' => 1]);
        Persyaratan::create(['layanan_id' => $aktaCerai->id, 'nama_dokumen' => 'Kutipan akta perkawinan', 'is_wajib' => true, 'urutan' => 2]);
        Persyaratan::create(['layanan_id' => $aktaCerai->id, 'nama_dokumen' => 'Fotokopi KK', 'is_wajib' => true, 'urutan' => 3]);
        Persyaratan::create(['layanan_id' => $aktaCerai->id, 'nama_dokumen' => 'Fotokopi KTP-el pasangan', 'is_wajib' => true, 'urutan' => 4]);
        Persyaratan::create(['layanan_id' => $aktaCerai->id, 'nama_dokumen' => 'Fotokopi KTP 2 orang saksi', 'is_wajib' => true, 'urutan' => 5]);


        // 5. Akta Kematian
        $aktaMati = Layanan::create([
            'parent_id' => null,
            'kode' => 'AK-MATI',
            'kode_formulir' => 'F-2.28',
            'nama' => 'Akta Kematian',
            'kategori' => 'Akta Kematian',
            'deskripsi' => 'Pencatatan kematian penduduk dan penerbitan akta kematian.',
            'icon' => 'Activity',
            'urutan' => 5,
            'is_active' => true,
        ]);

        Persyaratan::create(['layanan_id' => $aktaMati->id, 'nama_dokumen' => 'Surat pengantar dari RT dan RW setempat', 'is_wajib' => true, 'urutan' => 1]);
        Persyaratan::create(['layanan_id' => $aktaMati->id, 'nama_dokumen' => 'Surat keterangan dari kepala desa/lurah setempat', 'is_wajib' => true, 'urutan' => 2]);
        Persyaratan::create(['layanan_id' => $aktaMati->id, 'nama_dokumen' => 'Surat keterangan kematian dari dokter/paramedis', 'is_wajib' => true, 'urutan' => 3]);
        Persyaratan::create(['layanan_id' => $aktaMati->id, 'nama_dokumen' => 'Fotokopi Kartu Keluarga', 'is_wajib' => true, 'urutan' => 4]);
        Persyaratan::create(['layanan_id' => $aktaMati->id, 'nama_dokumen' => 'Surat keterangan catatan kematian dari kepolisian', 'is_wajib' => false, 'catatan' => 'Bila ada', 'urutan' => 5]);
        Persyaratan::create(['layanan_id' => $aktaMati->id, 'nama_dokumen' => 'Surat keterangan penetapan pengadilan mengenai kematian yang hilang atau tidak diketahui jenazahnya', 'is_wajib' => false, 'catatan' => 'Bila ada', 'urutan' => 6]);
        Persyaratan::create(['layanan_id' => $aktaMati->id, 'nama_dokumen' => 'Fotokopi KTP pelapor', 'is_wajib' => true, 'urutan' => 7]);
        Persyaratan::create(['layanan_id' => $aktaMati->id, 'nama_dokumen' => 'Fotokopi KTP 2 orang saksi', 'is_wajib' => true, 'urutan' => 8]);


        // 6. Akta Pengakuan Anak
        $aktaAnak = Layanan::create([
            'parent_id' => null,
            'kode' => 'AK-ANAK',
            'kode_formulir' => 'F-2.01d',
            'nama' => 'Akta Pengakuan Anak',
            'kategori' => 'Akta Pengakuan Anak',
            'deskripsi' => 'Pencatatan pengakuan anak luar nikah oleh ayahnya.',
            'icon' => 'UserCheck',
            'urutan' => 6,
            'is_active' => true,
        ]);

        Persyaratan::create(['layanan_id' => $aktaAnak->id, 'nama_dokumen' => 'Surat pengantar dari RT/RW', 'is_wajib' => true, 'urutan' => 1]);
        Persyaratan::create(['layanan_id' => $aktaAnak->id, 'nama_dokumen' => 'Surat pernyataan pengakuan anak dari ayah biologis yang disetujui oleh ibu kandung', 'is_wajib' => true, 'urutan' => 2]);
        Persyaratan::create(['layanan_id' => $aktaAnak->id, 'nama_dokumen' => 'Kutipan akta kelahiran', 'is_wajib' => true, 'urutan' => 3]);
        Persyaratan::create(['layanan_id' => $aktaAnak->id, 'nama_dokumen' => 'Fotokopi KK dan KTP ayah biologis dan ibu kandung', 'is_wajib' => true, 'urutan' => 4]);
        Persyaratan::create(['layanan_id' => $aktaAnak->id, 'nama_dokumen' => 'Nomor putusan pengadilan/penetapan pengadilan', 'is_wajib' => false, 'catatan' => 'Bila ada', 'urutan' => 5]);


        // 7. Akta Pengesahan Anak
        $aktaSah = Layanan::create([
            'parent_id' => null,
            'kode' => 'AK-SAH',
            'kode_formulir' => 'F-2.01d',
            'nama' => 'Akta Pengesahan Anak',
            'kategori' => 'Akta Pengesahan Anak',
            'deskripsi' => 'Pengesahan anak luar nikah setelah orang tuanya melakukan pernikahan sah.',
            'icon' => 'Award',
            'urutan' => 7,
            'is_active' => true,
        ]);

        Persyaratan::create(['layanan_id' => $aktaSah->id, 'nama_dokumen' => 'Kutipan akta kelahiran', 'is_wajib' => true, 'urutan' => 1]);
        Persyaratan::create(['layanan_id' => $aktaSah->id, 'nama_dokumen' => 'Kutipan akta perkawinan', 'is_wajib' => true, 'urutan' => 2]);
        Persyaratan::create(['layanan_id' => $aktaSah->id, 'nama_dokumen' => 'Fotokopi KK pemohon', 'is_wajib' => true, 'urutan' => 3]);
        Persyaratan::create(['layanan_id' => $aktaSah->id, 'nama_dokumen' => 'Fotokopi KTP pemohon', 'is_wajib' => true, 'urutan' => 4]);
        Persyaratan::create(['layanan_id' => $aktaSah->id, 'nama_dokumen' => 'Surat keterangan penetapan pengadilan tentang pengesahan anak', 'is_wajib' => true, 'urutan' => 5]);


        // 8. Pencatatan Perubahan Nama
        $ubahNama = Layanan::create([
            'parent_id' => null,
            'kode' => 'UBAH-NAMA',
            'kode_formulir' => 'F-2.01e',
            'nama' => 'Pencatatan Perubahan Nama',
            'kategori' => 'Pencatatan Perubahan Nama',
            'deskripsi' => 'Pencatatan perubahan nama pemohon berdasarkan putusan pengadilan.',
            'icon' => 'FileText',
            'urutan' => 8,
            'is_active' => true,
        ]);

        Persyaratan::create(['layanan_id' => $ubahNama->id, 'nama_dokumen' => 'Salinan penetapan pengadilan negeri', 'is_wajib' => true, 'urutan' => 1]);
        Persyaratan::create(['layanan_id' => $ubahNama->id, 'nama_dokumen' => 'Kutipan akta Pencatatan Sipil (akta yang mau diubah namanya)', 'is_wajib' => true, 'urutan' => 2]);
        Persyaratan::create(['layanan_id' => $ubahNama->id, 'nama_dokumen' => 'Fotokopi KK', 'is_wajib' => true, 'urutan' => 3]);
        Persyaratan::create(['layanan_id' => $ubahNama->id, 'nama_dokumen' => 'Fotokopi KTP-el', 'is_wajib' => true, 'urutan' => 4]);
        Persyaratan::create(['layanan_id' => $ubahNama->id, 'nama_dokumen' => 'Dokumen Perjalanan bagi Orang Asing', 'is_wajib' => false, 'catatan' => 'Bila ada', 'urutan' => 5]);
    }
}
