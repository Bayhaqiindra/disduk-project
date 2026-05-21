# Todo — Fitur Manajemen Akun Petugas Desa oleh Admin

**Tanggal**: 21 Mei 2026  
**Planner**: `planner/admin_user_management_planner.md`  
**PRD**: v1.2

---

## Phase 1: Revisi PRD & Database

- [x] Revisi PRD.md ke versi 1.2 (tambah section manajemen akun & profil)
- [x] Tambah kolom baru di migration `users`: `nik`, `alamat`, `is_profile_complete`, `is_active`, `created_by`
- [x] Update `User.php` model (fillable, casts, relasi `createdBy`)
- [x] Jalankan `php artisan migrate:fresh --seed` untuk rebuild database

## Phase 2: Backend — Service & Middleware

- [x] Buat `app/Services/UserManagementService.php` (Digabung di Controller sesuai standar REST Laravel API ringan saat ini, atau bisa direfactor nanti jika diperlukan)
- [x] Buat `app/Http/Middleware/EnsureProfileComplete.php`
  - [x] Cek `is_profile_complete` pada setiap request authenticated
  - [x] Return JSON error jika profil belum lengkap (untuk API)
- [x] Daftarkan middleware di `bootstrap/app.php`

## Phase 3: Backend — Controllers & Routes

- [x] Buat `app/Http/Controllers/Api/UserManagementController.php`
  - [x] `index()` — List akun petugas (filter: desa, status profil)
  - [x] `store()` — Buat akun petugas baru (validasi: name, email, password, desa)
  - [x] `resetPassword()` — Generate password baru untuk petugas
  - [x] `toggleActive()` — Aktifkan/nonaktifkan akun petugas
- [x] Buat `app/Http/Controllers/Api/ProfileController.php`
  - [x] `show()` — Get profil user saat ini
  - [x] `complete()` — Lengkapi profil (validasi: nik 16 digit, phone, alamat)
- [x] Update `AuthController@login` — Cek `is_active` sebelum login
- [x] Daftarkan semua route baru di `routes/api.php`
  - [x] Group `/admin/users` (Admin only)
  - [x] Route `/profile` dan `/profile/complete`

## Phase 4: Frontend — Profile Completion

- [ ] Buat `resources/js/pages/ProfileCompletePage.jsx`
  - [ ] Form: Nama (pre-filled), NIK, No. HP, Alamat Lengkap, Ganti Password (opsional)
  - [ ] Validasi client-side (NIK 16 digit, HP wajib, alamat wajib)
  - [ ] Submit → POST `/api/profile/complete` → redirect ke `/dashboard`
- [ ] Update `resources/js/app.jsx` (Router)
  - [ ] Tambah route `/profile/complete`
  - [ ] Update `RouteGuard` → cek `is_profile_complete` dari `localStorage.user`
  - [ ] Jika `is_profile_complete === false` → redirect ke `/profile/complete`

## Phase 5: Frontend — Admin Kelola Akun

- [ ] Update `resources/js/pages/DashboardAdmin.jsx`
  - [ ] Tambah tab baru "Kelola Akun Petugas"
  - [ ] Tabel daftar akun petugas (nama, email, desa, status profil, aksi)
  - [ ] Modal "Tambah Petugas Baru" (form: nama, email, password, desa)
  - [ ] Tombol "Reset Password" + konfirmasi modal
  - [ ] Tombol "Nonaktifkan/Aktifkan Akun" + konfirmasi
  - [ ] Filter: desa, status profil (lengkap/belum)
- [ ] Update `resources/js/components/Layout.jsx`
  - [ ] Tambah menu sidebar "Kelola Akun" untuk role admin

## Phase 6: Notifikasi & Email

- [ ] Update `NotifikasiService.php` — trigger notif saat akun dibuat
- [ ] Update `NotifikasiService.php` — trigger notif saat profil dilengkapi (ke admin)
- [ ] Update `NotifikasiService.php` — trigger notif saat akun dinonaktifkan

## Phase 7: Testing & Verifikasi

- [ ] Test: Admin buat akun petugas baru → kredensial tersimpan
- [ ] Test: Petugas login pertama → redirect ke halaman profil
- [ ] Test: Petugas lengkapi profil → redirect ke dashboard
- [ ] Test: Petugas login kedua kali → langsung ke dashboard (tanpa profil lagi)
- [ ] Test: Admin reset password petugas → password berubah
- [ ] Test: Admin nonaktifkan akun → petugas tidak bisa login
- [ ] Test: Akun belum lengkap profil → tidak bisa akses endpoint pengajuan
- [ ] Verifikasi build: `npm run build` tanpa error
