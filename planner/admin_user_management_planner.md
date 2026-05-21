# Planner — Fitur Manajemen Akun Petugas Desa oleh Admin

**Tanggal**: 21 Mei 2026  
**Status**: Planning  
**Terkait PRD**: v1.2 — Section 5.3, 7.4.5, 7.5, 9.1, 10.7

---

## 1. Konteks & Alasan Bisnis

Petugas Desa **tidak boleh** mendaftar sendiri melalui form registrasi publik karena:
- Hanya petugas resmi yang ditunjuk oleh desa yang boleh mengakses sistem
- Mencegah akun tidak sah masuk ke sistem kependudukan
- Admin UPT bertanggung jawab penuh atas siapa yang mendapat akses

**Masalah praktis**: Admin hanya tahu informasi minimal tentang petugas baru (nama + desa asal). Detail pribadi seperti nomor HP, alamat lengkap, NIK — hanya petugas itu sendiri yang tahu.

**Solusi**: Sistem 2-tahap:
1. **Admin** membuat akun minimal → memberikan kredensial ke petugas
2. **Petugas** login pertama kali → wajib lengkapi profil sebelum bisa menggunakan sistem

---

## 2. Alur Kerja Detail

### 2.1 Alur Admin Membuat Akun

```
[Admin login]
    │
    ▼
[Sidebar: "Kelola Akun Petugas"]
    │
    ▼
[Halaman Daftar Akun Petugas]
    │
    ├── Lihat semua akun petugas desa (tabel)
    ├── Filter: desa, status profil (lengkap/belum)
    │
    └── Tombol "Tambah Petugas Baru"
            │
            ▼
        [Modal/Form Tambah Akun]
        ┌───────────────────────┐
        │ Nama Lengkap*         │ ← Admin isi
        │ Email*                │ ← Admin isi (untuk login)
        │ Password*             │ ← Auto-generate atau admin isi manual
        │ Desa*                 │ ← Admin pilih/isi
        └───────────────────────┘
            │
            ▼
        [Simpan → Akun dibuat]
        [is_profile_complete = false]
            │
            ▼
        [Admin catat/kasih kredensial ke petugas secara offline]
```

### 2.2 Alur Petugas Login Pertama Kali

```
[Petugas login dengan kredensial dari Admin]
    │
    ▼
[System cek: is_profile_complete == false ?]
    │
    ├── YA (belum lengkap) ──────────────────────┐
    │                                             ▼
    │                                 [Redirect ke /profile/complete]
    │                                 ┌───────────────────────────────┐
    │                                 │ Halaman Lengkapi Profil       │
    │                                 │                               │
    │                                 │ Nama Lengkap (pre-filled)     │
    │                                 │ NIK*                          │
    │                                 │ Nomor HP/WA*                  │
    │                                 │ Alamat Lengkap*               │
    │                                 │ Ganti Password (opsional)     │
    │                                 └───────────────────────────────┘
    │                                             │
    │                                    [Submit → is_profile_complete = true]
    │                                             │
    │                                             ▼
    │                                    [Redirect ke /dashboard]
    │
    └── TIDAK (sudah lengkap) ──→ [Langsung ke /dashboard]
```

### 2.3 Alur Admin Mengelola Akun Existing

```
[Admin melihat tabel akun petugas]
    │
    ├── Reset Password → Generate password baru
    ├── Nonaktifkan Akun → Soft disable (is_active = false)
    └── Lihat Status Profil → Badge "Lengkap" / "Belum Lengkap"
```

---

## 3. Perubahan Database

### Tabel `users` — Kolom Baru

| Kolom | Tipe | Default | Deskripsi |
|-------|------|---------|-----------|
| nik | VARCHAR(16) NULL | NULL | Nomor Induk Kependudukan petugas |
| alamat | TEXT NULL | NULL | Alamat lengkap rumah petugas |
| is_profile_complete | BOOLEAN | false | Flag profil sudah dilengkapi |
| is_active | BOOLEAN | true | Flag akun aktif/nonaktif |
| created_by | BIGINT FK → users.id NULL | NULL | Admin yang membuat akun ini |

---

## 4. Arsitektur Clean (Backend)

### Service Layer
- **`UserManagementService.php`** (BARU)
  - `createPetugasAccount(data)` → Buat akun minimal + set `is_profile_complete = false`
  - `completeProfile(userId, data)` → Update profil + set `is_profile_complete = true`
  - `resetPassword(userId)` → Generate password baru
  - `toggleActive(userId)` → Aktifkan/nonaktifkan akun
  - `listPetugas(filters)` → Ambil daftar akun petugas dengan filter

### Controller Layer
- **`UserManagementController.php`** (BARU) → Admin kelola akun
- **`ProfileController.php`** (BARU) → Petugas lengkapi profil

### Middleware Layer
- **`EnsureProfileComplete.php`** (BARU) → Cek `is_profile_complete`, redirect jika belum

### API Endpoints Baru

| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/admin/users` | List semua akun petugas | Admin |
| POST | `/api/admin/users` | Buat akun petugas baru | Admin |
| PUT | `/api/admin/users/{id}/reset-password` | Reset password petugas | Admin |
| PUT | `/api/admin/users/{id}/toggle-active` | Aktifkan/nonaktifkan akun | Admin |
| GET | `/api/profile` | Get profil lengkap user saat ini | All authenticated |
| PUT | `/api/profile/complete` | Lengkapi profil pertama kali | Petugas Desa |

---

## 5. Arsitektur Clean (Frontend)

### Pages Baru
- **`ProfileCompletePage.jsx`** → Halaman wajib isi profil (first-login)
- Penambahan di **`DashboardAdmin.jsx`** → Tab baru "Kelola Akun Petugas"

### Components Baru
- **`CreateUserModal.jsx`** → Modal form tambah akun petugas
- Modifikasi di **`Layout.jsx`** → Sidebar tambah menu "Kelola Akun"

### Logic Baru di `app.jsx` (Router)
- `RouteGuard` harus cek `is_profile_complete`
- Jika `false` → paksa redirect ke `/profile/complete`
- Halaman `/profile/complete` tidak boleh di-skip

---

## 6. Keamanan & Validasi

| Rule | Detail |
|------|--------|
| Hanya Admin yang bisa membuat akun | Middleware `role:admin` pada route |
| NIK harus 16 digit angka | Validasi regex `^\d{16}$` |
| Email harus unik | Validasi `unique:users,email` |
| Password minimal 8 karakter | Validasi `min:8` |
| Petugas tidak bisa skip profil | Middleware `EnsureProfileComplete` pada semua route dashboard |
| Akun nonaktif tidak bisa login | Cek `is_active` saat login |

---

## 7. Notifikasi

| Event | Penerima | Aksi |
|-------|----------|------|
| Akun baru dibuat | Petugas Desa | Log email berisi kredensial awal |
| Profil dilengkapi | Admin | Notifikasi in-app "Petugas X telah melengkapi profil" |
| Akun dinonaktifkan | Petugas Desa | Log email pemberitahuan akun nonaktif |
