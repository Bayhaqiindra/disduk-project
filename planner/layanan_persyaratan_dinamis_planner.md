# Planner — Penerbitan & Persyaratan Layanan Dinamis (SILADUK)

**Tanggal**: 27 Mei 2026  
**Status**: Planning  
**Terkait PRD**: v1.3 (Revisi dari v1.2)  
**Dokumen Kebutuhan**: `kebutuhan_revisi.md`

---

## 1. Konteks & Alasan Bisnis

Sebelumnya, daftar 8 layanan kependudukan dan persyaratannya bersifat statis dan langsung di-*hardcode* di frontend. Namun, di lapangan, satu layanan besar (misalnya "Kartu Keluarga") dapat bercabang menjadi beberapa sub-layanan dengan persyaratan berkas yang berbeda:
1. KK Baru untuk WNI
2. KK Perubahan Elemen Data
3. KK Hilang/Rusak

Maka dari itu, untuk mencegah petugas mengunggah berkas yang salah dan memudahkan pemeliharaan jangka panjang oleh tim IT UPT Disdukcapil Bengkalis, sistem perlu dibuat **dinamis berbasis database**. 

Daftar sub-layanan, formulir kosong yang perlu diunduh, serta daftar berkas persyaratan wajib/opsional akan disimpan dalam database dan diambil melalui API.

---

## 2. Struktur Database Baru

### A. Tabel `layanan` (Master Data & Hierarki)
Menambahkan kolom untuk mendukung model hierarkis *parent-child* (kategori vs sub-layanan).

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| parent_id | BIGINT FK -> layanan.id NULL | Mengacu ke kategori utama jika merupakan sub-layanan |
| kode | VARCHAR(20) UNIQUE | Kode layanan (e.g. `KK`, `KK-BARU`, `AK-LAHIR-NORMAL`) |
| kode_formulir | VARCHAR(50) NULL | Kode formulir resmi (e.g. `F-1.02`, `F-2.01a`) |
| nama | VARCHAR(255) | Nama kategori/sub-layanan |
| kategori | VARCHAR(100) | Pengelompokan (e.g. `Kartu Keluarga`, `Akta Kelahiran`) |
| urutan | INTEGER DEFAULT 0 | Pengurutan tampilan di UI |

### B. Tabel `persyaratan` (Tabel Baru)
Menyimpan berkas apa saja yang wajib/opsional diunggah untuk masing-masing sub-layanan/layanan.

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK | Auto increment |
| layanan_id | BIGINT FK -> layanan.id | Terhubung ke sub-layanan terkait |
| nama_dokumen | VARCHAR(255) | Nama berkas persyaratan (e.g. `Buku Nikah`, `KTP Pelapor`) |
| deskripsi | TEXT NULL | Deskripsi tambahan berkas |
| is_wajib | BOOLEAN DEFAULT true | Apakah berkas wajib diunggah |
| catatan | VARCHAR(255) NULL | Catatan khusus (e.g. `Bagi penduduk pindah`) |
| urutan | INTEGER DEFAULT 0 | Urutan berkas di form checklist |

### C. Tabel `dokumen_upload` (Penyematan Persyaratan)
Menghubungkan berkas yang diunggah oleh Petugas Desa dengan syarat spesifik dari tabel `persyaratan`.

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| persyaratan_id | BIGINT FK -> persyaratan.id NULL | Mengidentifikasi file untuk syarat yang mana |

---

## 3. Desain API & Endpoint Baru

### 1. `GET /api/layanan`
Mengembalikan pohon hierarki layanan beserta sub-layanan di bawahnya.
*   Jika `parent_id` bernilai `null`, ia adalah Kategori Utama (e.g., Kartu Keluarga).
*   Properti `sub_layanan` akan mengembalikan array sub-layanan di dalamnya.

### 2. `GET /api/layanan/{id}/persyaratan`
Mengambil berkas persyaratan untuk sub-layanan tertentu. Digunakan oleh Petugas Desa di Step 3 & 4 pengajuan berkas.

### 3. Modifikasi `POST /api/pengajuan`
*   Menerima array `dokumen` yang terhubung dengan `persyaratan_id`.
*   Validasi backend akan memeriksa apakah semua persyaratan berstatus `is_wajib = true` telah terisi oleh file upload.

---

## 4. Alur UI Baru (3 Step Menjadi 4 Step)

```
[Step 1: Pilih Kategori Utama]
    │  (Menampilkan 8 card kategori besar, seperti Kartu Keluarga, Akta Kelahiran, dll)
    ▼
[Step 2: Pilih Sub-Layanan]
    │  (Dinamis: Jika kategori memiliki sub-layanan, tampilkan pilihan. Jika tidak, lewati)
    ▼
[Step 3: Download & Persyaratan]
    │  (Tombol unduh formulir dinamis sesuai kode_formulir & lihat list persyaratan)
    ▼
[Step 4: Upload Berkas Sesuai Checklist]
    │  (Mengisi file input dinamis untuk masing-masing item persyaratan yang terdaftar)
    ▼
[Submit Pengajuan]
```

---

## 5. Rencana Migrasi & Pengisian Data (Seeder)
Kita akan menulis seeder lengkap berisi **8 kategori** dan **sub-layanannya**, serta total persyaratan dokumen yang sesuai dengan dokumen `kebutuhan_revisi.md`.
Untuk formulir kosong, sistem `jsPDF` di frontend akan disesuaikan agar mampu membaca `kode_formulir` dinamis untuk menghasilkan formulir PDF kosong yang tepat.
