# Todo — Penerbitan & Persyaratan Layanan Dinamis (SILADUK)

**Tanggal**: 27 Mei 2026  
**Planner**: `planner/layanan_persyaratan_dinamis_planner.md`  
**PRD**: v1.3

---

## Phase 1: Revisi PRD.md
- [x] Revisi PRD.md untuk memuat ketentuan formulir, sub-layanan, tabel persyaratan, dan skema database baru berdasarkan `kebutuhan_revisi.md`.

## Phase 2: Database & Migrations
- [x] Buat migration baru untuk tabel `persyaratan`: `database/migrations/xxxx_xx_xx_xxxxxx_create_persyaratan_table.php`.
- [x] Buat migration update tabel `layanan`: tambahkan kolom `parent_id`, `kategori`, `kode_formulir`, `urutan` (bisa dengan modifikasi migration lama atau migration baru).
- [x] Buat migration update tabel `dokumen_upload`: tambahkan kolom `persyaratan_id`.
- [x] Terapkan relasi foreign key pada tabel `persyaratan` dan `dokumen_upload`.
- [x] Update Model `Layanan.php`: tambahkan relasi `subLayanan` dan `persyaratan`.
- [x] Buat Model `Persyaratan.php`: definisikan properti, fillable, dan relasinya.
- [x] Update Model `DokumenUpload.php`: tambahkan `persyaratan_id` dan relasi `persyaratan`.
- [x] Buat Seeder `LayananDanPersyaratanSeeder.php` (LayananSeeder.php) yang memuat lengkap 8 kategori, sub-layanan, dan syarat berkas dari `kebutuhan_revisi.md`.
- [x] Daftarkan seeder di `DatabaseSeeder.php`.
- [x] Jalankan `php artisan migrate:fresh --seed` untuk membersihkan dan memperbarui skema DB.

## Phase 3: Backend API Development
- [ ] Update `LayananController.php`:
  - [ ] Method `index()` untuk mengembalikan hierarki menu `layanan` (kategori utama dengan `sub_layanan`).
  - [ ] Method `show($id)` untuk mengembalikan detail layanan/sub-layanan beserta `persyaratan`-nya.
- [ ] Update `PengajuanController.php` (atau `PengajuanService.php` jika ada):
  - [ ] Ubah validasi saat menyimpan pengajuan agar mencocokkan dokumen yang diunggah dengan `persyaratan_id` yang wajib.
  - [ ] Hubungkan `persyaratan_id` saat menyimpan record `dokumen_upload`.
  - [ ] Sediakan relasi `persyaratan` di dalam response detail pengajuan.

## Phase 4: Frontend Development
- [ ] Update halaman "Ajukan Layanan" (`DashboardPetugas.jsx` atau komponen form pengajuan terkait):
  - [ ] Step 1: Tampilkan 8 Kategori Utama.
  - [ ] Step 2: Opsi Pilih Sub-Layanan (tampil bersyarat jika kategori yang dipilih memiliki anak/sub-layanan).
  - [ ] Step 3: Tampilkan link download formulir dinamis + info berkas persyaratan.
  - [ ] Step 4: Form upload berkas yang dinamis berdasarkan daftar persyaratan (wajib & opsional).
- [ ] Perbaiki generator formulir kosong (jsPDF) agar menyesuaikan dengan kode formulir yang dipilih.
- [ ] Update Halaman Detail Pengajuan Petugas & Admin:
  - [ ] Tampilkan file terunggah yang dipetakan langsung ke nama persyaratannya agar informatif bagi admin pemeriksa.

## Phase 5: Testing & Verifikasi
- [ ] Jalankan `npm run build` untuk memverifikasi kompilasi aset React.
- [ ] Lakukan verifikasi manual alur pengajuan lengkap dengan sub-layanan.
