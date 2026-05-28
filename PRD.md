# PRD — Sistem Layanan Administrasi Kependudukan Digital
## UPT Disdukcapil Bengkalis

**Versi**: 1.3  
**Tanggal**: 27 Mei 2026  
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

## 6. Daftar Layanan (8 Kategori & Sub-Layanan Dinamis)

Sistem melayani 8 kategori layanan kependudukan utama, dengan beberapa kategori memiliki sub-layanan spesifik yang diatur secara dinamis melalui database:

1. **Kartu Keluarga (KK)**
   - Penerbitan KK Baru untuk WNI (`KK-BARU`, Formulir: `F-1.02 ~ F-1.06`)
   - Penerbitan KK Karena Perubahan Elemen Data (`KK-UBAH`, Formulir: `F-1.02 ~ F-1.06`)
   - Penerbitan KK Baru WNI Karena Hilang/Rusak (`KK-HILANG`, Formulir: `F-1.02`)
2. **Akta Kelahiran**
   - Penerbitan Akta Kelahiran Normal (`AK-LAHIR-NORMAL`, Formulir: `F-2.01a`)
   - Pencatatan Kelahiran WNI Anak Temuan/Tidak Diketahui Asal-Usul (`AK-LAHIR-TEMUAN`, Formulir: `F-2.01a`)
3. **Akta Perkawinan** (`AK-NIKAH`, Formulir: `F-2.01b`)
4. **Akta Perceraian** (`AK-CERAI`, Formulir: `F-2.01c`)
5. **Akta Kematian** (`AK-MATI`, Formulir: `F-2.28`)
6. **Akta Pengakuan Anak** (`AK-ANAK`, Formulir: `F-2.01d`)
7. **Akta Pengesahan Anak** (`AK-SAH`, Formulir: `F-2.01d`)
8. **Pencatatan Perubahan Nama** (`UBAH-NAMA`, Formulir: `F-2.01e`)

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

#### 7.3.2 Ajukan Layanan (Step-by-Step Dinamis - 4 Langkah)

**Step 1 — Pilih Kategori Layanan**
- Grid 8 card kategori besar (Kartu Keluarga, Akta Kelahiran, dll)
- Klik kategori → lanjut ke Step 2 (jika kategori memiliki sub-layanan) atau langsung ke Step 3 (jika tidak).

**Step 2 — Pilih Jenis Sub-Layanan**
- Tampil jika kategori terpilih memiliki sub-layanan (misalnya Kartu Keluarga memiliki 3 opsi).
- Memilih salah satu sub-layanan, lalu lanjut ke Step 3.

**Step 3 — Unduh Formulir & Ketahui Persyaratan**
- Menampilkan kode formulir (misal `F-1.02`) dengan tombol unduh dinamis.
- Menampilkan daftar berkas persyaratan (wajib & opsional) yang diambil dari database.
- Klik lanjut ke Step 4.

**Step 4 — Unggah Formulir & Berkas**
- Menyediakan dynamic input upload untuk masing-masing item persyaratan yang terdaftar.
- **Validasi Unggahan**:
  - Format: PDF, JPG, PNG
  - Ukuran max: 10MB per file
  - Berkas bertanda wajib (`is_wajib = true`) mutlak harus diupload.

**Step 5 — Konfirmasi & Submit**
- Preview ringkasan pilihan layanan dan nama berkas yang telah diupload.
- Tombol "Ajukan" -> simpan ke database -> status = "menunggu".

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
| parent_id | BIGINT FK → layanan.id NULL | Mengacu ke kategori utama jika merupakan sub-layanan |
| kode | VARCHAR(20) UNIQUE | Kode layanan (e.g. KK, KK-BARU, AK-LAHIR-NORMAL) |
| kode_formulir | VARCHAR(50) NULL | Kode formulir resmi (e.g. F-1.02) |
| nama | VARCHAR(255) | Nama kategori/sub-layanan |
| kategori | VARCHAR(100) NULL | Pengelompokan (e.g. Kartu Keluarga, Akta Kelahiran) |
| deskripsi | TEXT NULL | Deskripsi layanan |
| icon | VARCHAR(100) NULL | Nama icon (untuk kategori utama) |
| urutan | INTEGER DEFAULT 0 | Pengurutan sorting di UI |
| is_active | BOOLEAN DEFAULT true | Status aktif |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 9.3 Tabel `persyaratan`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK | Auto increment |
| layanan_id | BIGINT FK → layanan.id | Terhubung ke sub-layanan terkait |
| nama_dokumen | VARCHAR(255) | Nama berkas persyaratan |
| deskripsi | TEXT NULL | Deskripsi tambahan berkas |
| is_wajib | BOOLEAN DEFAULT true | Apakah berkas wajib diunggah |
| catatan | VARCHAR(255) NULL | Catatan khusus (e.g. "Bagi penduduk pindah") |
| urutan | INTEGER DEFAULT 0 | Urutan berkas di checklist |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 9.4 Tabel `pengajuan`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK | Auto increment |
| nomor_pengajuan | VARCHAR(50) UNIQUE | Format: `LYN-YYYYMMDD-XXXXX` |
| user_id | BIGINT FK → users.id | Petugas yang mengajukan |
| layanan_id | BIGINT FK → layanan.id | Jenis layanan/sub-layanan |
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

### 9.5 Tabel `dokumen_upload`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK | Auto increment |
| pengajuan_id | BIGINT FK → pengajuan.id | Relasi ke pengajuan |
| persyaratan_id | BIGINT FK → persyaratan.id NULL | Menghubungkan berkas ke item persyaratan spesifik |
| tipe | ENUM | `formulir`, `persyaratan`, `hasil` |
| nama_file | VARCHAR(255) | Nama asli file |
| path | VARCHAR(500) | Path penyimpanan di storage |
| mime_type | VARCHAR(100) | MIME type file |
| ukuran | INTEGER | Ukuran file dalam bytes |
| uploaded_by | BIGINT FK → users.id | User yang upload |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

> **RLS**: Akses file mengikuti akses pengajuan induk

### 9.6 Tabel `notifikasi`

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

### 9.7 Tabel `status_log`

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
| GET | `/api/layanan` | List semua layanan aktif dengan hierarki (kategori + sub_layanan) | All authenticated |
| GET | `/api/layanan/{id}` | Detail layanan / sub-layanan | All authenticated |
| GET | `/api/layanan/{id}/persyaratan` | Daftar persyaratan untuk layanan/sub-layanan tertentu | All authenticated |

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

Daftar berkas persyaratan wajib (atau opsional jika ditandai "bila ada") untuk masing-masing layanan kependudukan:

### 14.1 Kartu Keluarga (KK)
*   **Penerbitan KK Baru untuk WNI (`KK-BARU`)**
    1. Buku nikah/kutipan akta perkawinan atau kutipan akta perceraian (Wajib)
    2. Surat keterangan pindah/surat keterangan datang bagi penduduk yang pindah dalam wilayah NKRI (Wajib)
*   **Penerbitan KK Karena Perubahan Elemen Data (`KK-UBAH`)**
    1. KK lama (asli/scan) (Wajib)
    2. Surat keterangan/bukti perubahan Peristiwa Kependudukan dan Peristiwa Penting (Wajib)
*   **Penerbitan KK Baru untuk WNI Karena Hilang atau Rusak (`KK-HILANG`)**
    1. Surat keterangan hilang dari kepolisian ATAU KK yang rusak (scan) (Wajib)
    2. Fotokopi KTP-el (Wajib)

### 14.2 Akta Kelahiran
*   **Penerbitan Akta Kelahiran Normal (`AK-LAHIR-NORMAL`)**
    1. Surat keterangan kelahiran dari RS/bidan (Wajib)
    2. Buku nikah/kutipan akta perkawinan atau bukti lain yang sah (fotokopi) (Wajib)
    3. Fotokopi KK (Wajib)
    4. Fotokopi KTP orang tua (Wajib)
    5. Fotokopi KTP pelapor (Wajib)
    6. Fotokopi KTP 2 orang saksi (Wajib)
*   **Pencatatan Kelahiran WNI Temuan/Tidak Diketahui Asal-Usul (`AK-LAHIR-TEMUAN`)**
    1. Berita acara dari kepolisian (Wajib)
    2. Fotokopi KTP pelapor (Wajib)
    3. Fotokopi KTP 2 orang saksi (Wajib)

### 14.3 Akta Perkawinan (`AK-NIKAH`)
1. Surat keterangan telah terjadinya perkawinan dari pemuka agama atau penghayat kepercayaan terhadap Tuhan Yang Maha Esa (Wajib)
2. Pas foto berwarna suami dan istri (Wajib)
3. Fotokopi KK (Wajib)
4. Fotokopi KTP-el pasangan suami istri (Wajib)
5. Fotokopi KTP 2 orang saksi (Wajib)

### 14.4 Akta Perceraian (`AK-CERAI`)
1. Salinan putusan pengadilan yang telah mempunyai kekuatan hukum tetap (Wajib)
2. Kutipan akta perkawinan (Wajib)
3. Fotokopi KK (Wajib)
4. Fotokopi KTP-el pasangan (Wajib)
5. Fotokopi KTP 2 orang saksi (Wajib)

### 14.5 Akta Kematian (`AK-MATI`)
1. Surat pengantar dari RT dan RW setempat (Wajib)
2. Surat keterangan dari kepala desa/lurah setempat (Wajib)
3. Surat keterangan kematian dari dokter/paramedis (Wajib)
4. Fotokopi Kartu Keluarga (Wajib)
5. Surat keterangan catatan kematian dari kepolisian (Opsional - bila ada)
6. Surat keterangan penetapan pengadilan mengenai kematian yang hilang atau tidak diketahui jenazahnya (Opsional - bila ada)
7. Fotokopi KTP pelapor (Wajib)
8. Fotokopi KTP 2 orang saksi (Wajib)

### 14.6 Akta Pengakuan Anak (`AK-ANAK`)
1. Surat pengantar dari RT/RW (Wajib)
2. Surat pernyataan pengakuan anak dari ayah biologis yang disetujui oleh ibu kandung (Wajib)
3. Kutipan akta kelahiran (Wajib)
4. Fotokopi KK dan KTP ayah biologis dan ibu kandung (Wajib)
5. Nomor putusan pengadilan/penetapan pengadilan (Opsional - bila ada)

### 14.7 Akta Pengesahan Anak (`AK-SAH`)
1. Kutipan akta kelahiran (Wajib)
2. Kutipan akta perkawinan (Wajib)
3. Fotokopi KK pemohon (Wajib)
4. Fotokopi KTP pemohon (Wajib)
5. Surat keterangan penetapan pengadilan tentang pengesahan anak (Wajib)

### 14.8 Pencatatan Perubahan Nama (`UBAH-NAMA`)
1. Salinan penetapan pengadilan negeri (Wajib)
2. Kutipan akta Pencatatan Sipil (akta yang mau diubah namanya) (Wajib)
3. Fotokopi KK (Wajib)
4. Fotokopi KTP-el (Wajib)
5. Dokumen Perjalanan bagi Orang Asing (Opsional - bila ada)

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
