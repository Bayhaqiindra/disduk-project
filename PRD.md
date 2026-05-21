# PRD — Sistem Layanan Administrasi Kependudukan Digital
## UPT Disdukcapil Bengkalis

**Versi**: 1.2  
**Tanggal**: 21 Mei 2026  
**Status**: Draft

---

## 1. Ringkasan Eksekutif

Sistem layanan administrasi kependudukan digital yang memungkinkan **Petugas Desa** mengajukan berkas KK & Akta Pencatatan Sipil secara online tanpa perlu datang ke kantor UPT Disdukcapil Bengkalis. Sistem ini mendigitalisasi alur pengajuan, verifikasi, dan penerbitan dokumen kependudukan.

---

## 2. Latar Belakang & Masalah

| Masalah | Dampak |
|---------|--------|
| Petugas Desa harus datang langsung ke kantor Disdukcapil | Waktu & biaya transportasi tinggi |
| Proses verifikasi manual | Lambat & rawan kesalahan |
| Tidak ada tracking status pengajuan | Ketidakpastian bagi pemohon |
| Dokumen fisik rentan rusak/hilang | Risiko kehilangan data |

**Solusi**: Platform web-based yang menyediakan pengajuan online, tracking real-time, dan notifikasi otomatis.

---

## 3. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React (Vite) |
| Backend | Laravel 11 |
| Database | MySQL/PostgreSQL + RLS |
| Auth | Email + Password (Laravel Sanctum) |
| PDF Generator | jsPDF (client-side) |
| File Storage | Laravel Storage (local/S3) |
| Email | Laravel Mail (SMTP) |

---

## 4. Roles & Permissions

### 4.1 Petugas Desa
- Login dengan email + password
- Mengajukan berkas layanan kependudukan
- Upload dokumen persyaratan
- Memantau status pengajuan
- Download template formulir (PDF)
- Download hasil dokumen jadi
- Menerima notifikasi perubahan status

### 4.2 Admin (2 orang, hak akses identik)

> [!NOTE]
> Terdapat 2 akun Admin yang memiliki **hak akses yang sama persis**. Keduanya dapat melakukan seluruh fungsi administrasi tanpa perbedaan wewenang. Pembagian kerja dilakukan secara operasional, bukan berdasarkan pembatasan sistem.

**Kemampuan Admin**:
- Login dengan email + password
- **Membuat akun Petugas Desa baru** (nama, email, password, desa)
- **Mengelola akun Petugas Desa** (reset password, aktifkan/nonaktifkan)
- Melihat semua pengajuan dari semua desa
- Preview file yang diupload
- Verifikasi berkas → status "diverifikasi"
- Kembalikan berkas → status "dikembalikan" + catatan
- Ubah status pengajuan: "diproses" / "selesai"
- Upload file hasil penerbitan dokumen
- Filter pengajuan berdasarkan status, layanan, desa, tanggal
- Kirim notifikasi email otomatis ke petugas desa
- Akses dashboard statistik & chart

---

## 5. Autentikasi & Keamanan

### 5.1 Login
- **Metode**: Email + Password
- **Guard**: Laravel Sanctum (SPA token-based)
- **Session**: Token disimpan di httpOnly cookie
- **Validasi tambahan saat login**:
  - Cek `is_active == true` → jika `false`, tolak login dengan pesan "Akun Anda telah dinonaktifkan"
  - Setelah login sukses, response menyertakan flag `is_profile_complete`

### 5.2 Registrasi & Manajemen Akun

> [!IMPORTANT]
> Petugas Desa **TIDAK** dapat mendaftar sendiri. Pembuatan akun hanya dapat dilakukan oleh Admin UPT Disdukcapil.

**Alasan**: Hanya petugas resmi yang ditunjuk oleh desa yang boleh mengakses sistem kependudukan. Registrasi publik berisiko membuka akses kepada pihak tidak berwenang.

**Alur Pembuatan Akun**:
1. Admin login ke sistem
2. Admin membuka menu "Kelola Akun Petugas"
3. Admin mengisi form pembuatan akun minimal:
   - Nama Lengkap *(wajib)*
   - Email *(wajib, unik)*
   - Password *(wajib, min 8 karakter)*
   - Desa *(wajib)*
4. Sistem membuat akun dengan `is_profile_complete = false`
5. Admin menyerahkan kredensial (email + password) ke petugas secara offline

### 5.3 Kelengkapan Profil (First-Login Flow)

> [!IMPORTANT]
> Petugas Desa yang baru dibuatkan akun oleh Admin **WAJIB** melengkapi profil pribadi saat login pertama kali. Sebelum profil dilengkapi, petugas **tidak dapat mengakses** fitur pengajuan maupun dashboard.

**Data yang harus dilengkapi oleh Petugas**:

| Field | Validasi |
|-------|----------|
| Nama Lengkap | Pre-filled dari data Admin, bisa diubah |
| NIK | Wajib, 16 digit angka |
| Nomor HP/WA | Wajib, format nomor telepon Indonesia |
| Alamat Lengkap | Wajib, min 10 karakter |
| Ganti Password | Opsional (disarankan untuk keamanan) |

**Setelah profil dilengkapi**:
- `is_profile_complete` diubah menjadi `true`
- Petugas di-redirect ke `/dashboard`
- Login selanjutnya langsung masuk dashboard tanpa halaman profil lagi

### 5.4 Row Level Security (RLS)
> [!IMPORTANT]
> RLS wajib diaktifkan untuk **semua tabel** yang menyimpan data pengajuan.

| Rule | Deskripsi |
|------|-----------|
| Petugas Desa | Hanya dapat melihat & mengelola pengajuan miliknya sendiri |
| Admin | Dapat melihat semua pengajuan tanpa batasan |

**Implementasi di Laravel**:
- Global Scope pada Model (auto-filter by `user_id` untuk petugas desa)
- Middleware role-checking pada setiap route group
- Middleware `EnsureProfileComplete` pada route yang membutuhkan profil lengkap
- Policy class untuk authorization granular

---

## 6. Daftar Layanan (8 Kartu)

| No | Layanan | Kode |
|----|---------|------|
| 1 | Pembuatan KK Baru | KK-BARU |
| 2 | Perubahan KK | KK-UBAH |
| 3 | Penerbitan Akta Kelahiran | AK-LAHIR |
| 4 | Penerbitan Akta Kematian | AK-MATI |
| 5 | Penerbitan Akta Perkawinan | AK-NIKAH |
| 6 | Penerbitan Akta Perceraian | AK-CERAI |
| 7 | Pengakuan Anak | AK-ANAK |
| 8 | Pengesahan Anak | AK-SAH |

---

## 7. Halaman & Fitur

### 7.1 Landing Page (Public — Tanpa Login)

**Route**: `/`

| Elemen | Deskripsi |
|--------|-----------|
| Hero Section | Judul sistem, deskripsi singkat, CTA "Masuk" |
| Info Layanan | Grid card 8 layanan yang tersedia |
| Alur Pengajuan | Step-by-step cara mengajukan berkas |
| Kontak | Alamat & kontak UPT Disdukcapil Bengkalis |
| Footer | Copyright, link penting |

---

### 7.2 Halaman Login

**Route**: `/login`

| Field | Validasi |
|-------|----------|
| Email | Required, format email valid |
| Password | Required, min 8 karakter |

- Redirect setelah login berdasarkan role
- Jika `is_profile_complete == false` → redirect ke `/profile/complete`
- Jika `is_active == false` → tampilkan error "Akun dinonaktifkan"
- Error message jika kredensial salah

---

### 7.3 Dashboard Petugas Desa

**Route**: `/dashboard`

**Sidebar Menu**:
1. Dashboard
2. Ajukan Layanan
3. Pengajuan Saya
4. Notifikasi

#### 7.3.1 Dashboard
| Widget | Deskripsi |
|--------|-----------|
| Total Pengajuan | Jumlah semua pengajuan |
| Menunggu Verifikasi | Pengajuan status "menunggu" |
| Diproses | Pengajuan status "diproses" |
| Selesai | Pengajuan status "selesai" |
| Dikembalikan | Pengajuan status "dikembalikan" |
| Tabel Pengajuan Terbaru | 5 pengajuan terakhir |

#### 7.3.2 Ajukan Layanan (Step-by-Step)

**Step 1 — Pilih Layanan**
- Grid 8 card layanan
- Setiap card berisi: ikon, nama layanan, deskripsi singkat
- Klik card → lanjut ke Step 2

**Step 2 — Download & Upload**

| Aksi | Detail |
|------|--------|
| Download Template | Generate PDF formulir kosong via jsPDF |
| Petunjuk | "Cetak → isi manual → tanda tangani → scan/foto" |
| Upload Formulir | File yang sudah diisi & ditandatangani |
| Upload Berkas Persyaratan | Dokumen pendukung sesuai jenis layanan |

**Validasi Upload**:
- Format: PDF, JPG, PNG
- Ukuran max: 10MB per file
- Minimum 1 file formulir + berkas persyaratan

**Step 3 — Konfirmasi & Submit**
- Preview ringkasan pengajuan
- Tombol "Ajukan" → simpan ke database → status = "menunggu"

#### 7.3.3 Pengajuan Saya

| Kolom Tabel | Deskripsi |
|-------------|-----------|
| No. Pengajuan | ID unik pengajuan |
| Jenis Layanan | Nama layanan |
| Tanggal Pengajuan | Timestamp submit |
| Status | Badge warna (lihat §8) |
| Aksi | Detail / Download Hasil |

- Filter by status
- Search by nomor pengajuan
- Pagination

#### 7.3.4 Notifikasi
- List notifikasi perubahan status
- Badge "belum dibaca" (unread count)
- Klik → redirect ke detail pengajuan

---

### 7.4 Halaman Lengkapi Profil (First-Login)

**Route**: `/profile/complete`

> [!NOTE]
> Halaman ini hanya muncul saat Petugas Desa login pertama kali (ketika `is_profile_complete == false`). Setelah profil dilengkapi, halaman ini tidak akan muncul lagi.

| Field | Validasi | Keterangan |
|-------|----------|------------|
| Nama Lengkap | Required | Pre-filled dari data yang diisi Admin |
| NIK | Required, 16 digit angka | Nomor Induk Kependudukan pribadi petugas |
| Nomor HP/WA | Required, format HP | Nomor HP/WhatsApp aktif petugas |
| Alamat Lengkap | Required, min 10 char | Alamat domisili petugas |
| Password Baru | Optional, min 8 char | Disarankan mengganti password default dari Admin |
| Konfirmasi Password | Required if password diisi | Harus sama dengan password baru |

**Setelah submit**:
- Data profil disimpan → `is_profile_complete = true`
- Redirect ke `/dashboard`
- Notifikasi dikirim ke Admin bahwa petugas telah melengkapi profil

---

### 7.5 Dashboard Admin

**Route**: `/admin/dashboard`

> [!NOTE]
> Kedua Admin memiliki sidebar menu dan hak akses yang **identik**.

**Sidebar Menu**:
1. Dashboard
2. Verifikasi Berkas
3. Semua Pengajuan
4. Kelola Akun Petugas
5. Notifikasi

#### 7.5.1 Dashboard Admin

| Widget | Deskripsi |
|--------|-----------|
| Total Pengajuan | Semua pengajuan masuk |
| Menunggu Verifikasi | Perlu diverifikasi |
| Sedang Diproses | Status "diproses" |
| Selesai | Status "selesai" |
| Dikembalikan | Status "dikembalikan" |
| Chart | Grafik pengajuan per bulan |
| Tabel Terbaru | 10 pengajuan terakhir |

#### 7.5.2 Verifikasi Berkas

**Tabel Pengajuan Masuk** (status = "menunggu"):

| Kolom | Deskripsi |
|-------|-----------|
| No. Pengajuan | ID unik |
| Petugas Desa | Nama petugas & desa |
| Jenis Layanan | Nama layanan |
| Tanggal | Timestamp |
| Aksi | Preview / Verifikasi / Kembalikan |

**Aksi Verifikasi**:

| Aksi | Efek |
|------|------|
| Preview | Buka file upload dalam modal/tab baru |
| Verifikasi | Status → "diverifikasi" + kirim email ke petugas |
| Kembalikan | Status → "dikembalikan" + isi catatan alasan + kirim email |

#### 7.5.3 Semua Pengajuan

**Tabel semua pengajuan** dengan filter:

| Filter | Opsi |
|--------|------|
| Status | Semua / Menunggu / Diverifikasi / Diproses / Selesai / Dikembalikan |
| Jenis Layanan | Dropdown 8 layanan |
| Desa | Dropdown daftar desa |
| Tanggal | Date range picker |

**Aksi pada setiap pengajuan**:

| Aksi | Detail |
|------|--------|
| Lihat Detail | Preview semua file & info pengajuan |
| Ubah Status | Dropdown: "diproses" / "selesai" |
| Upload Hasil | Upload file dokumen jadi (PDF) |
| Kirim Notifikasi | Email otomatis saat status berubah |

#### 7.5.4 Kelola Akun Petugas

**Tabel Daftar Akun Petugas Desa**:

| Kolom | Deskripsi |
|-------|-----------|
| Nama | Nama lengkap petugas |
| Email | Email login |
| Desa | Nama desa |
| Status Profil | Badge "Lengkap" / "Belum Lengkap" |
| Status Akun | Badge "Aktif" / "Nonaktif" |
| Tanggal Dibuat | Timestamp pembuatan akun |
| Aksi | Reset Password / Nonaktifkan / Aktifkan |

**Filter**:

| Filter | Opsi |
|--------|------|
| Desa | Dropdown daftar desa |
| Status Profil | Semua / Lengkap / Belum Lengkap |
| Status Akun | Semua / Aktif / Nonaktif |

**Aksi Tambah Akun** (Modal Form):

| Field | Validasi |
|-------|----------|
| Nama Lengkap | Required |
| Email | Required, format email, unique |
| Password | Required, min 8 karakter |
| Desa | Required |

**Aksi Pada Akun Existing**:

| Aksi | Detail |
|------|--------|
| Reset Password | Generate password baru + tampilkan ke Admin untuk dicatat |
| Nonaktifkan | Set `is_active = false`, petugas tidak bisa login lagi |
| Aktifkan | Set `is_active = true`, petugas bisa login kembali |

---

## 8. Status Pengajuan & Alur

### 8.1 Daftar Status

| Status | Badge Color | Deskripsi |
|--------|-------------|-----------|
| Menunggu | 🟡 Yellow | Baru diajukan, belum diverifikasi |
| Diverifikasi | 🔵 Blue | Berkas sudah diverifikasi admin |
| Dikembalikan | 🔴 Red | Berkas dikembalikan + catatan perbaikan |
| Diproses | 🟠 Orange | Sedang diproses oleh Disdukcapil |
| Selesai | 🟢 Green | Dokumen selesai, siap didownload |

### 8.2 State Flow

```
[Petugas Desa Submit]
        │
        ▼
   ┌──────────┐
   │ Menunggu  │
   └────┬──────┘
        │
   [Admin Review]
        │
   ┌────┴─────────────┐
   ▼                  ▼
┌─────────────┐  ┌──────────────┐
│ Diverifikasi│  │ Dikembalikan │──→ [Petugas perbaiki & submit ulang]
└────┬────────┘  └──────────────┘              │
     │                                        ▼
     │                                   ┌──────────┐
     │                                   │ Menunggu  │
     │                                   └──────────┘
[Admin Proses]
     │
     ▼
┌──────────┐
│ Diproses │
└────┬─────┘
     │
[Admin Upload Hasil]
     │
     ▼
┌──────────┐
│  Selesai  │──→ [Petugas download dokumen]
└──────────┘
```

---

## 9. Database Schema

> [!IMPORTANT]
> Semua tabel yang menyimpan data user-specific WAJIB menerapkan RLS melalui Laravel Global Scopes & Policies.

### 9.1 Tabel `users`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK | Auto increment |
| name | VARCHAR(255) | Nama lengkap |
| email | VARCHAR(255) UNIQUE | Email login |
| password | VARCHAR(255) | Hashed password |
| role | ENUM | `petugas_desa`, `admin` |
| desa | VARCHAR(255) NULL | Nama desa (untuk petugas) |
| phone | VARCHAR(20) NULL | Nomor telepon |
| nik | VARCHAR(16) NULL | NIK petugas (16 digit) |
| alamat | TEXT NULL | Alamat lengkap petugas |
| is_profile_complete | BOOLEAN DEFAULT false | Profil sudah dilengkapi? |
| is_active | BOOLEAN DEFAULT true | Akun aktif? |
| created_by | BIGINT FK → users.id NULL | Admin yang membuat akun |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

> **Catatan**: Terdapat 2 akun dengan role `admin`, keduanya memiliki hak akses identik.
> Akun Petugas Desa dibuat oleh Admin dengan `is_profile_complete = false`. Petugas wajib melengkapi profil (NIK, phone, alamat) saat login pertama.

### 9.2 Tabel `layanan`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK | Auto increment |
| kode | VARCHAR(20) UNIQUE | Kode layanan (e.g. KK-BARU) |
| nama | VARCHAR(255) | Nama layanan |
| deskripsi | TEXT | Deskripsi layanan |
| persyaratan | JSON | List persyaratan dokumen |
| icon | VARCHAR(100) | Nama icon |
| is_active | BOOLEAN | Status aktif |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 9.3 Tabel `pengajuan`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK | Auto increment |
| nomor_pengajuan | VARCHAR(50) UNIQUE | Format: `LYN-YYYYMMDD-XXXXX` |
| user_id | BIGINT FK → users.id | Petugas yang mengajukan |
| layanan_id | BIGINT FK → layanan.id | Jenis layanan |
| status | ENUM | `menunggu`, `diverifikasi`, `dikembalikan`, `diproses`, `selesai` |
| catatan_admin | TEXT NULL | Catatan dari admin (jika dikembalikan) |
| verified_by | BIGINT FK → users.id NULL | Admin yang verifikasi |
| processed_by | BIGINT FK → users.id NULL | Admin yang proses |
| verified_at | TIMESTAMP NULL | Waktu verifikasi |
| processed_at | TIMESTAMP NULL | Waktu mulai proses |
| completed_at | TIMESTAMP NULL | Waktu selesai |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

> **RLS**: Petugas Desa hanya melihat `WHERE user_id = auth()->id()`

### 9.4 Tabel `dokumen_upload`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK | Auto increment |
| pengajuan_id | BIGINT FK → pengajuan.id | Relasi ke pengajuan |
| tipe | ENUM | `formulir`, `persyaratan`, `hasil` |
| nama_file | VARCHAR(255) | Nama asli file |
| path | VARCHAR(500) | Path penyimpanan di storage |
| mime_type | VARCHAR(100) | MIME type file |
| ukuran | INTEGER | Ukuran file dalam bytes |
| uploaded_by | BIGINT FK → users.id | User yang upload |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

> **RLS**: Akses file mengikuti akses pengajuan induk

### 9.5 Tabel `notifikasi`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK | Auto increment |
| user_id | BIGINT FK → users.id | Penerima notifikasi |
| pengajuan_id | BIGINT FK → pengajuan.id NULL | Relasi pengajuan |
| judul | VARCHAR(255) | Judul notifikasi |
| pesan | TEXT | Isi pesan |
| is_read | BOOLEAN DEFAULT false | Status baca |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

> **RLS**: User hanya melihat `WHERE user_id = auth()->id()`

### 9.6 Tabel `status_log`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK | Auto increment |
| pengajuan_id | BIGINT FK → pengajuan.id | Relasi pengajuan |
| status_lama | VARCHAR(50) | Status sebelumnya |
| status_baru | VARCHAR(50) | Status terbaru |
| catatan | TEXT NULL | Catatan perubahan |
| changed_by | BIGINT FK → users.id | User yang mengubah |
| created_at | TIMESTAMP | |

---

## 10. API Endpoints

### 10.1 Auth

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/login` | Login user (cek `is_active`, return `is_profile_complete`) |
| POST | `/api/logout` | Logout user |
| GET | `/api/user` | Get current user |

### 10.2 Layanan

| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/layanan` | List semua layanan aktif | All authenticated |
| GET | `/api/layanan/{id}` | Detail layanan + persyaratan | All authenticated |

### 10.3 Pengajuan

| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/pengajuan` | List pengajuan (RLS) | All authenticated |
| POST | `/api/pengajuan` | Buat pengajuan baru | Petugas Desa |
| GET | `/api/pengajuan/{id}` | Detail pengajuan (RLS) | All authenticated |
| PUT | `/api/pengajuan/{id}/verify` | Verifikasi berkas | Admin |
| PUT | `/api/pengajuan/{id}/return` | Kembalikan berkas | Admin |
| PUT | `/api/pengajuan/{id}/process` | Ubah status → diproses | Admin |
| PUT | `/api/pengajuan/{id}/complete` | Ubah status → selesai | Admin |

### 10.4 Dokumen

| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| POST | `/api/pengajuan/{id}/upload` | Upload berkas | Petugas Desa |
| POST | `/api/pengajuan/{id}/upload-hasil` | Upload hasil dokumen | Admin |
| GET | `/api/dokumen/{id}/download` | Download file (RLS) | All authenticated |
| GET | `/api/dokumen/{id}/preview` | Preview file (RLS) | All authenticated |

### 10.5 Notifikasi

| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/notifikasi` | List notifikasi user (RLS) | All authenticated |
| GET | `/api/notifikasi/unread-count` | Jumlah notifikasi belum dibaca | All authenticated |
| PUT | `/api/notifikasi/{id}/read` | Tandai sudah dibaca | All authenticated |
| PUT | `/api/notifikasi/read-all` | Tandai semua sudah dibaca | All authenticated |

### 10.6 Dashboard Stats

| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/dashboard/stats` | Statistik dashboard (RLS) | All authenticated |
| GET | `/api/dashboard/chart` | Data chart pengajuan per bulan | Admin |

### 10.7 Manajemen Akun Petugas (Admin Only)

| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/admin/users` | List semua akun petugas desa | Admin |
| POST | `/api/admin/users` | Buat akun petugas baru | Admin |
| PUT | `/api/admin/users/{id}/reset-password` | Reset password petugas | Admin |
| PUT | `/api/admin/users/{id}/toggle-active` | Aktifkan/nonaktifkan akun | Admin |

### 10.8 Profil User

| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/profile` | Get profil lengkap user saat ini | All authenticated |
| PUT | `/api/profile/complete` | Lengkapi profil pertama kali (NIK, phone, alamat) | Petugas Desa |

---

## 11. Notifikasi Email

### 11.1 Trigger Email

| Event | Penerima | Subject |
|-------|----------|---------|
| Akun baru dibuat oleh Admin | Petugas Desa | "Akun SILADUK Anda Telah Dibuat" |
| Profil berhasil dilengkapi | Admin | "Petugas {nama} dari Desa {desa} Telah Melengkapi Profil" |
| Akun dinonaktifkan | Petugas Desa | "Akun SILADUK Anda Dinonaktifkan" |
| Pengajuan baru dibuat | Admin | "Pengajuan Baru: {jenis_layanan} - {nomor}" |
| Status → Diverifikasi | Petugas Desa | "Berkas Diverifikasi: {nomor}" |
| Status → Dikembalikan | Petugas Desa | "Berkas Dikembalikan: {nomor}" |
| Status → Diproses | Petugas Desa | "Pengajuan Sedang Diproses: {nomor}" |
| Status → Selesai | Petugas Desa | "Dokumen Selesai: {nomor} — Silakan Download" |

---

## 12. Validasi & Business Rules

### 12.1 Upload File
- Format: PDF, JPG, PNG
- Max ukuran per file: 10MB
- Wajib upload minimal 1 formulir + 1 berkas persyaratan

### 12.2 Status Transition Rules

| Dari | Ke | Siapa |
|------|----|-------|
| — | Menunggu | System (auto saat submit) |
| Menunggu | Diverifikasi | Admin |
| Menunggu | Dikembalikan | Admin |
| Dikembalikan | Menunggu | System (auto saat re-submit) |
| Diverifikasi | Diproses | Admin |
| Diproses | Selesai | Admin (wajib upload hasil) |

### 12.3 Download Hasil
- Hanya tersedia jika status = "selesai"
- File hasil harus sudah diupload oleh Admin

---

## 13. PDF Template Generator (jsPDF)

### 13.1 Template Formulir per Layanan
Setiap layanan memiliki template PDF formulir yang di-generate client-side menggunakan **jsPDF**.

| Konten Template | Deskripsi |
|-----------------|-----------|
| Header | Logo + Nama Instansi |
| Judul Formulir | Sesuai jenis layanan |
| Data Pemohon | Field kosong untuk diisi manual |
| Persyaratan | Checklist dokumen yang perlu dilampirkan |
| TTD | Area tanda tangan pemohon & petugas |
| Footer | Nomor formulir, tanggal cetak |

---

## 14. Persyaratan Dokumen per Layanan

### KK Baru (KK-BARU)
1. Surat Pengantar RT/RW
2. Fotokopi KTP semua anggota keluarga
3. Fotokopi Akta Nikah/Cerai
4. Fotokopi Akta Kelahiran anak
5. Surat Keterangan Pindah (jika pindah)

### Perubahan KK (KK-UBAH)
1. KK lama (asli)
2. Fotokopi KTP pemohon
3. Surat Pengantar RT/RW
4. Dokumen pendukung perubahan

### Akta Kelahiran (AK-LAHIR)
1. Surat Keterangan Lahir dari RS/Bidan
2. Fotokopi KK orang tua
3. Fotokopi KTP kedua orang tua
4. Fotokopi Akta Nikah orang tua
5. Fotokopi KTP 2 orang saksi

### Akta Kematian (AK-MATI)
1. Surat Keterangan Kematian dari RS/Dokter
2. Fotokopi KK almarhum
3. Fotokopi KTP almarhum
4. Fotokopi KTP pelapor
5. Fotokopi KTP 2 orang saksi

### Akta Perkawinan (AK-NIKAH)
1. Surat Keterangan dari pemuka agama
2. Fotokopi KTP kedua mempelai
3. Fotokopi Akta Kelahiran kedua mempelai
4. Fotokopi KTP 2 orang saksi
5. Pas foto bersama

### Akta Perceraian (AK-CERAI)
1. Salinan Putusan Pengadilan
2. Fotokopi Akta Perkawinan
3. Fotokopi KTP kedua pihak
4. Fotokopi KK

### Pengakuan Anak (AK-ANAK)
1. Surat Pernyataan Pengakuan Anak
2. Fotokopi KK
3. Fotokopi KTP kedua orang tua
4. Fotokopi Akta Kelahiran anak

### Pengesahan Anak (AK-SAH)
1. Surat Pernyataan Pengesahan Anak
2. Fotokopi Akta Perkawinan orang tua
3. Fotokopi KK
4. Fotokopi Akta Kelahiran anak

---

## 15. Non-Functional Requirements

| Aspek | Requirement |
|-------|-------------|
| **Performance** | Halaman load < 3 detik |
| **Security** | RLS aktif semua tabel, CSRF protection, input sanitization |
| **File Storage** | Max 10MB per file, disimpan terenkripsi |
| **Browser Support** | Chrome, Firefox, Edge (versi terbaru) |
| **Responsive** | Mobile-friendly (min 375px) |
| **Availability** | Target uptime 99% |

---

## 16. Sitemap

```
/                           → Landing Page (Public)
/login                      → Halaman Login
/profile/complete           → Lengkapi Profil (First-Login, Petugas Desa)

/dashboard                  → Dashboard Petugas Desa
/ajukan-layanan             → Pilih Layanan (Step 1)
/ajukan-layanan/:id         → Upload Berkas (Step 2-3)
/pengajuan                  → List Pengajuan Saya
/pengajuan/:id              → Detail Pengajuan
/notifikasi                 → List Notifikasi

/admin/dashboard            → Dashboard Admin
/admin/verifikasi           → List Berkas untuk Verifikasi
/admin/verifikasi/:id       → Detail & Aksi Verifikasi
/admin/pengajuan            → Semua Pengajuan
/admin/pengajuan/:id        → Detail Pengajuan
/admin/users                → Kelola Akun Petugas Desa
/admin/notifikasi           → List Notifikasi Admin
```

---

## 17. Milestone & Timeline

| Phase | Durasi | Deliverable |
|-------|--------|-------------|
| **Phase 1** — Setup & Auth | 1 minggu | Project setup, DB migration, auth system, RLS |
| **Phase 2** — Landing & Dashboard | 1 minggu | Landing page, dashboard UI, statistik widget |
| **Phase 3** — Pengajuan Flow | 2 minggu | Form pengajuan, upload file, PDF template, tracking |
| **Phase 4** — Admin Panel | 2 minggu | Verifikasi, semua pengajuan, status management |
| **Phase 5** — Notifikasi & Email | 1 minggu | In-app notification, email otomatis |
| **Phase 6** — Testing & Polish | 1 minggu | Bug fix, UI polish, responsive, UAT |

**Total estimasi: ~8 minggu**

---

## 18. Glossary

| Istilah | Deskripsi |
|---------|-----------|
| RLS | Row Level Security — pembatasan akses data per baris berdasarkan role/user |
| Disdukcapil | Dinas Kependudukan dan Pencatatan Sipil |
| UPT | Unit Pelaksana Teknis |
| KK | Kartu Keluarga |
| Petugas Desa | Operator desa yang bertugas mengurus administrasi kependudukan |
| Admin | Petugas Disdukcapil yang memverifikasi & memproses pengajuan (2 orang, hak akses identik) |
| jsPDF | Library JavaScript untuk generate file PDF di sisi client |
