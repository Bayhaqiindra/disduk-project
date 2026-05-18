<?php

namespace Database\Seeders;

use App\Models\Layanan;
use Illuminate\Database\Seeder;

class LayananSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $layanan = [
            [
                'kode' => 'KK-BARU',
                'nama' => 'Pembuatan KK Baru',
                'deskripsi' => 'Pengajuan pembuatan Kartu Keluarga baru karena pernikahan baru, pemisahan KK, atau kedatangan penduduk.',
                'persyaratan' => json_encode([
                    'Surat Pengantar RT/RW',
                    'Fotokopi KTP semua anggota keluarga',
                    'Fotokopi Akta Nikah/Cerai',
                    'Fotokopi Akta Kelahiran anak',
                    'Surat Keterangan Pindah (jika pindah datang)'
                ]),
                'icon' => 'FileText',
                'is_active' => true,
            ],
            [
                'kode' => 'KK-UBAH',
                'nama' => 'Perubahan KK',
                'deskripsi' => 'Pengajuan perubahan data Kartu Keluarga karena penambahan anggota keluarga, pengurangan, atau perubahan data biodata.',
                'persyaratan' => json_encode([
                    'KK lama (asli)',
                    'Fotokopi KTP pemohon',
                    'Surat Pengantar RT/RW',
                    'Dokumen pendukung perubahan (seperti Ijazah, Surat Nikah, dll)'
                ]),
                'icon' => 'FileEdit',
                'is_active' => true,
            ],
            [
                'kode' => 'AK-LAHIR',
                'nama' => 'Penerbitan Akta Kelahiran',
                'deskripsi' => 'Pengajuan pencatatan kelahiran anak baru untuk penerbitan dokumen Akta Kelahiran resmi.',
                'persyaratan' => json_encode([
                    'Surat Keterangan Lahir dari RS/Bidan',
                    'Fotokopi KK orang tua',
                    'Fotokopi KTP kedua orang tua',
                    'Fotokopi Akta Nikah orang tua',
                    'Fotokopi KTP 2 orang saksi'
                ]),
                'icon' => 'Baby',
                'is_active' => true,
            ],
            [
                'kode' => 'AK-MATI',
                'nama' => 'Penerbitan Akta Kematian',
                'deskripsi' => 'Pengajuan pencatatan kematian penduduk untuk penerbitan dokumen resmi Akta Kematian.',
                'persyaratan' => json_encode([
                    'Surat Keterangan Kematian dari RS/Dokter/Kades',
                    'Fotokopi KK almarhum',
                    'Fotokopi KTP almarhum',
                    'Fotokopi KTP pelapor',
                    'Fotokopi KTP 2 orang saksi'
                ]),
                'icon' => 'Activity',
                'is_active' => true,
            ],
            [
                'kode' => 'AK-NIKAH',
                'nama' => 'Penerbitan Akta Perkawinan',
                'deskripsi' => 'Pengajuan pencatatan perkawinan non-Muslim untuk penerbitan dokumen resmi Akta Perkawinan.',
                'persyaratan' => json_encode([
                    'Surat Keterangan dari pemuka agama',
                    'Fotokopi KTP kedua mempelai',
                    'Fotokopi Akta Kelahiran kedua mempelai',
                    'Fotokopi KTP 2 orang saksi',
                    'Pas foto bersama ukuran 4x6'
                ]),
                'icon' => 'Heart',
                'is_active' => true,
            ],
            [
                'kode' => 'AK-CERAI',
                'nama' => 'Penerbitan Akta Perceraian',
                'deskripsi' => 'Pengajuan pencatatan perceraian non-Muslim berdasarkan salinan putusan pengadilan.',
                'persyaratan' => json_encode([
                    'Salinan Putusan Pengadilan',
                    'Fotokopi Akta Perkawinan asli',
                    'Fotokopi KTP kedua pihak',
                    'Fotokopi KK'
                ]),
                'icon' => 'Scissors',
                'is_active' => true,
            ],
            [
                'kode' => 'AK-ANAK',
                'nama' => 'Pengakuan Anak',
                'deskripsi' => 'Pengajuan pengakuan anak luar kawin oleh ayahnya dengan persetujuan ibu kandung.',
                'persyaratan' => json_encode([
                    'Surat Pernyataan Pengakuan Anak',
                    'Fotokopi KK',
                    'Fotokopi KTP kedua orang tua',
                    'Fotokopi Akta Kelahiran anak'
                ]),
                'icon' => 'UserCheck',
                'is_active' => true,
            ],
            [
                'kode' => 'AK-SAH',
                'nama' => 'Pengesahan Anak',
                'deskripsi' => 'Pengajuan pengesahan status anak luar nikah setelah orang tua kandungnya melakukan pernikahan sah.',
                'persyaratan' => json_encode([
                    'Surat Pernyataan Pengesahan Anak',
                    'Fotokopi Akta Perkawinan orang tua',
                    'Fotokopi KK',
                    'Fotokopi Akta Kelahiran anak'
                ]),
                'icon' => 'Award',
                'is_active' => true,
            ],
        ];

        foreach ($layanan as $item) {
            Layanan::updateOrCreate(['kode' => $item['kode']], $item);
        }
    }
}
