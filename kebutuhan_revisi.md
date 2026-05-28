# PROMPT: STRUKTUR FORMULIR DAN PERSYARATAN UPLOAD
## Berdasarkan Dokumen Kebutuhan Formulir dan Persyaratan SILADUK

---

## 📖 Penjelasan Konsep

Hai! Setelah membaca dokumen kebutuhan dari UPT Disdukcapil Bengkalis, saya menemukan bahwa sistem SILADUK perlu menangani **8 jenis layanan kependudukan** yang berbeda. Setiap layanan punya:

1. **Formulir yang harus didownload** (kode F-xxx)
2. **Daftar persyaratan dokumen** yang harus diupload

Nah, yang menarik adalah: untuk satu kategori besar (misalnya "Kartu Keluarga"), bisa ada **beberapa sub-layanan** dengan persyaratan yang berbeda-beda. Contohnya:
- KK Baru untuk WNI → persyaratannya A, B, C
- KK karena Perubahan Data → persyaratannya X, Y
- KK karena Hilang/Rusak → persyaratannya P, Q

Jadi sistemnya harus **dinamis** dan bisa menampilkan persyaratan yang tepat sesuai dengan sub-layanan yang dipilih petugas.

---

## 📊 STRUKTUR DATA LENGKAP (8 Layanan)

Berdasarkan dokumen, ini breakdown lengkapnya:

---

### **1. KARTU KELUARGA (3 Sub-Layanan)**

#### **A. Penerbitan KK Baru untuk WNI**

**Kode Formulir:** F-1.02 sampai F-1.06

**Persyaratan Upload:**
1. Buku nikah/kutipan akta perkawinan atau kutipan akta perceraian
2. Surat keterangan pindah/surat keterangan datang bagi penduduk yang pindah dalam wilayah NKRI

#### **B. Penerbitan KK Karena Perubahan Elemen Data**

**Kode Formulir:** F-1.02 sampai F-1.06

**Persyaratan Upload:**
1. KK lama (asli/scan)
2. Surat keterangan/bukti perubahan Peristiwa Kependudukan dan Peristiwa Penting

#### **C. Penerbitan KK Baru untuk WNI Karena Hilang atau Rusak**

**Kode Formulir:** F-1.02

**Persyaratan Upload:**
1. Surat keterangan hilang dari kepolisian ATAU KK yang rusak (scan)
2. Fotokopi KTP-el

---

### **2. AKTA KELAHIRAN (2 Sub-Layanan)**

#### **A. Penerbitan Akta Kelahiran (Kelahiran Normal)**

**Kode Formulir:** F-2.01a

**Persyaratan Upload:**
1. Surat keterangan kelahiran (dari RS/bidan)
2. Buku nikah/kutipan akta perkawinan atau bukti lain yang sah (fotokopi)
3. Fotokopi KK
4. Fotokopi KTP orang tua
5. Fotokopi KTP pelapor
6. Fotokopi KTP 2 orang saksi

#### **B. Pencatatan Kelahiran WNI (Anak Baru Lahir/Ditemukan, Tidak Diketahui Asal Usul)**

**Kode Formulir:** F-2.01a

**Persyaratan Upload:**
1. Berita acara dari kepolisian
2. Fotokopi KTP pelapor
3. Fotokopi KTP 2 orang saksi

---

### **3. AKTA PERKAWINAN**

**Kode Formulir:** F-2.01b

**Persyaratan Upload:**
1. Surat keterangan telah terjadinya perkawinan dari pemuka agama atau penghayat kepercayaan terhadap Tuhan Yang Maha Esa
2. Pas foto berwarna suami dan istri
3. Fotokopi KK
4. Fotokopi KTP-el pasangan suami istri
5. Fotokopi KTP 2 orang saksi

---

### **4. AKTA PERCERAIAN**

**Kode Formulir:** F-2.01c

**Persyaratan Upload:**
1. Salinan putusan pengadilan yang telah mempunyai kekuatan hukum tetap
2. Kutipan akta perkawinan
3. Fotokopi KK
4. Fotokopi KTP-el pasangan
5. Fotokopi KTP 2 orang saksi

---

### **5. AKTA KEMATIAN**

**Kode Formulir:** F-2.01b (kemungkinan typo di dokumen, seharusnya F-2.28 atau kode lain)

**Persyaratan Upload:**
1. Surat pengantar dari RT dan RW setempat
2. Surat keterangan dari kepala desa/lurah setempat
3. Surat keterangan kematian dari dokter/paramedis
4. Fotokopi Kartu Keluarga
5. Surat keterangan catatan kematian dari kepolisian (bila ada)
6. Surat keterangan penetapan pengadilan mengenai kematian yang hilang atau tidak diketahui jenazahnya (bila ada)
7. Fotokopi KTP pelapor
8. Fotokopi KTP 2 orang saksi

---

### **6. AKTA PENGAKUAN ANAK**

**Kode Formulir:** F-2.01d

**Persyaratan Upload:**
1. Surat pengantar dari RT/RW
2. Surat pernyataan pengakuan anak dari ayah biologis yang disetujui oleh ibu kandung
3. Kutipan akta kelahiran
4. Fotokopi KK dan KTP ayah biologis dan ibu kandung
5. Nomor putusan pengadilan/penetapan pengadilan (bila ada)

---

### **7. AKTA PENGESAHAN ANAK**

**Kode Formulir:** F-2.01d (sama dengan Pengakuan Anak)

**Persyaratan Upload:**
1. Kutipan akta kelahiran
2. Kutipan akta perkawinan
3. Fotokopi KK pemohon
4. Fotokopi KTP pemohon
5. Surat keterangan penetapan pengadilan tentang pengesahan anak

---

### **8. PENCATATAN PERUBAHAN NAMA (Berlaku untuk Semua Akta)**

**Kode Formulir:** F-2.01e

**Persyaratan Upload:**
1. Salinan penetapan pengadilan negeri
2. Kutipan akta Pencatatan Sipil (akta yang mau diubah namanya)
3. Fotokopi KK
4. Fotokopi KTP-el
5. Dokumen Perjalanan bagi Orang Asing (bila ada)

---

## 🎯 YANG PERLU DIIMPLEMENTASIKAN

Berdasarkan struktur di atas, ini yang harus dibuat di sistem:

### **1. Database: Tabel `layanan` (Master Data)**

Update tabel `layanan` yang sudah ada di PRD dengan struktur yang lebih detail:

```sql
CREATE TABLE layanan (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  parent_id BIGINT NULL, -- untuk sub-layanan, referensi ke parent
  kode VARCHAR(20) UNIQUE NOT NULL, -- KK-BARU, KK-UBAH, dll
  kode_formulir VARCHAR(50), -- F-1.02, F-1.06, F-2.01a, dll
  nama VARCHAR(255) NOT NULL,
  kategori VARCHAR(100), -- 'Kartu Keluarga', 'Akta Kelahiran', dll
  deskripsi TEXT,
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  urutan INT DEFAULT 0, -- untuk sorting
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Contoh Data:**

| id | parent_id | kode | kode_formulir | nama | kategori |
|----|-----------|------|---------------|------|----------|
| 1 | NULL | KK | NULL | Kartu Keluarga | Kartu Keluarga |
| 2 | 1 | KK-BARU | F-1.02~F-1.06 | Penerbitan KK Baru untuk WNI | Kartu Keluarga |
| 3 | 1 | KK-UBAH | F-1.02~F-1.06 | Penerbitan KK Karena Perubahan Data | Kartu Keluarga |
| 4 | 1 | KK-HILANG | F-1.02 | Penerbitan KK Karena Hilang/Rusak | Kartu Keluarga |
| 5 | NULL | AK-LAHIR | NULL | Akta Kelahiran | Akta Kelahiran |
| 6 | 5 | AK-LAHIR-NORMAL | F-2.01a | Penerbitan Akta Kelahiran Normal | Akta Kelahiran |
| 7 | 5 | AK-LAHIR-TEMUAN | F-2.01a | Pencatatan Kelahiran Anak Temuan | Akta Kelahiran |
| 8 | NULL | AK-NIKAH | F-2.01b | Akta Perkawinan | Akta Perkawinan |
| 9 | NULL | AK-CERAI | F-2.01c | Akta Perceraian | Akta Perceraian |
| 10 | NULL | AK-MATI | F-2.28 | Akta Kematian | Akta Kematian |
| 11 | NULL | AK-ANAK | F-2.01d | Akta Pengakuan Anak | Akta Pengakuan Anak |
| 12 | NULL | AK-SAH | F-2.01d | Akta Pengesahan Anak | Akta Pengesahan Anak |
| 13 | NULL | UBAH-NAMA | F-2.01e | Perubahan Nama | Perubahan Nama |

---

### **2. Database: Tabel `persyaratan` (Master Persyaratan)**

Tabel baru untuk menyimpan daftar persyaratan dokumen:

```sql
CREATE TABLE persyaratan (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  layanan_id BIGINT NOT NULL, -- FK ke layanan.id
  nama_dokumen VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  is_wajib BOOLEAN DEFAULT true, -- wajib atau opsional
  urutan INT DEFAULT 0, -- untuk sorting
  catatan TEXT NULL, -- contoh: "bila ada", "jika orang asing"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (layanan_id) REFERENCES layanan(id) ON DELETE CASCADE
);
```

**Contoh Data:**

| id | layanan_id | nama_dokumen | is_wajib | catatan |
|----|------------|--------------|----------|---------|
| 1 | 2 | Buku nikah/kutipan akta perkawinan atau kutipan akta perceraian | true | NULL |
| 2 | 2 | Surat keterangan pindah/surat keterangan datang | true | Bagi penduduk pindah |
| 3 | 3 | KK lama | true | Asli atau scan |
| 4 | 3 | Surat keterangan/bukti perubahan Peristiwa Kependudukan | true | NULL |
| 5 | 4 | Surat keterangan hilang dari kepolisian ATAU KK yang rusak | true | Salah satu |
| 6 | 4 | Fotokopi KTP-el | true | NULL |
| ... | ... | ... | ... | ... |

---

### **3. UI: Halaman "Ajukan Layanan" (Update Flow)**

Di PRD sebelumnya kita punya 2 step: (1) Pilih Layanan, (2) Upload Berkas. Sekarang kita perlu **tambah 1 step** untuk layanan yang punya sub-layanan:

#### **Step 1: Pilih Kategori Layanan**

Grid 8 card kategori besar:
- Kartu Keluarga
- Akta Kelahiran
- Akta Perkawinan
- Akta Perceraian
- Akta Kematian
- Akta Pengakuan Anak
- Akta Pengesahan Anak
- Perubahan Nama

#### **Step 2: Pilih Sub-Layanan (Jika Ada)**

Kalau kategori yang dipilih punya sub-layanan (misalnya: Kartu Keluarga), tampilkan opsi sub-layanan:

```
┌─────────────────────────────────────────────────────────┐
│  Pilih Jenis Layanan Kartu Keluarga                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ○ Penerbitan KK Baru untuk WNI                         │
│    Untuk pembuatan KK baru bagi WNI                     │
│                                                          │
│  ○ Penerbitan KK Karena Perubahan Data                  │
│    Untuk perubahan elemen data di KK                    │
│                                                          │
│  ○ Penerbitan KK Karena Hilang/Rusak                    │
│    Untuk penggantian KK yang hilang atau rusak         │
│                                                          │
│                                  [Lanjut]               │
└─────────────────────────────────────────────────────────┘
```

Kalau kategori tidak punya sub-layanan (misalnya: Akta Perkawinan), langsung skip ke step berikutnya.

#### **Step 3: Download Formulir & Lihat Persyaratan**

Tampilkan:
1. **Tombol download formulir** (sesuai kode formulir)
2. **Daftar persyaratan dokumen** (dari tabel `persyaratan`)

```
┌─────────────────────────────────────────────────────────┐
│  Penerbitan KK Baru untuk WNI                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📄 Formulir yang Dibutuhkan:                           │
│  ┌────────────────────────────────────┐                │
│  │  Formulir F-1.02 sampai F-1.06     │                │
│  │  [📥 Download Formulir]            │                │
│  └────────────────────────────────────┘                │
│                                                          │
│  Cetak formulir, isi manual, tanda tangani, lalu       │
│  scan/foto untuk diupload.                              │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📋 Persyaratan Dokumen:                                │
│                                                          │
│  ✅ 1. Buku nikah/kutipan akta perkawinan atau          │
│        kutipan akta perceraian                          │
│                                                          │
│  ✅ 2. Surat keterangan pindah/surat keterangan         │
│        datang bagi penduduk yang pindah dalam           │
│        wilayah NKRI                                     │
│                                                          │
│                              [Lanjut ke Upload]         │
└─────────────────────────────────────────────────────────┘
```

#### **Step 4: Upload Formulir & Berkas Persyaratan**

Form upload dengan checklist sesuai persyaratan:

```
┌─────────────────────────────────────────────────────────┐
│  Upload Berkas                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Formulir F-1.02 ~ F-1.06 (yang sudah diisi) *       │
│  ┌────────────────────────────────────┐                │
│  │  [📎 Pilih File]                   │                │
│  │  Format: PDF, JPG, PNG - Max 10MB  │                │
│  └────────────────────────────────────┘                │
│                                                          │
│  2. Buku nikah/kutipan akta perkawinan *                │
│  ┌────────────────────────────────────┐                │
│  │  [📎 Pilih File]                   │                │
│  └────────────────────────────────────┘                │
│                                                          │
│  3. Surat keterangan pindah/surat keterangan datang *   │
│  ┌────────────────────────────────────┐                │
│  │  [📎 Pilih File]                   │                │
│  └────────────────────────────────────┘                │
│                                                          │
│                                  [Ajukan]               │
└─────────────────────────────────────────────────────────┘
```

**Validasi:**
- Jumlah file yang diupload harus sesuai dengan jumlah persyaratan wajib (is_wajib = true)
- Minimal 1 file formulir + semua persyaratan wajib

---

### **4. Backend: API Endpoints (Tambahan)**

#### **GET `/api/layanan` — List Layanan dengan Hierarki**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "kode": "KK",
      "nama": "Kartu Keluarga",
      "kategori": "Kartu Keluarga",
      "icon": "id-card",
      "sub_layanan": [
        {
          "id": 2,
          "kode": "KK-BARU",
          "nama": "Penerbitan KK Baru untuk WNI",
          "kode_formulir": "F-1.02~F-1.06"
        },
        {
          "id": 3,
          "kode": "KK-UBAH",
          "nama": "Penerbitan KK Karena Perubahan Data",
          "kode_formulir": "F-1.02~F-1.06"
        },
        {
          "id": 4,
          "kode": "KK-HILANG",
          "nama": "Penerbitan KK Karena Hilang/Rusak",
          "kode_formulir": "F-1.02"
        }
      ]
    },
    {
      "id": 5,
      "kode": "AK-LAHIR",
      "nama": "Akta Kelahiran",
      "kategori": "Akta Kelahiran",
      "icon": "baby",
      "sub_layanan": [
        {
          "id": 6,
          "kode": "AK-LAHIR-NORMAL",
          "nama": "Penerbitan Akta Kelahiran Normal",
          "kode_formulir": "F-2.01a"
        },
        {
          "id": 7,
          "kode": "AK-LAHIR-TEMUAN",
          "nama": "Pencatatan Kelahiran Anak Temuan",
          "kode_formulir": "F-2.01a"
        }
      ]
    },
    {
      "id": 8,
      "kode": "AK-NIKAH",
      "nama": "Akta Perkawinan",
      "kategori": "Akta Perkawinan",
      "kode_formulir": "F-2.01b",
      "icon": "rings",
      "sub_layanan": []
    }
    // ... dst
  ]
}
```

#### **GET `/api/layanan/{id}/persyaratan` — Daftar Persyaratan per Layanan**

**Response:**
```json
{
  "success": true,
  "data": {
    "layanan": {
      "id": 2,
      "kode": "KK-BARU",
      "nama": "Penerbitan KK Baru untuk WNI",
      "kode_formulir": "F-1.02~F-1.06"
    },
    "persyaratan": [
      {
        "id": 1,
        "nama_dokumen": "Buku nikah/kutipan akta perkawinan atau kutipan akta perceraian",
        "deskripsi": null,
        "is_wajib": true,
        "catatan": null,
        "urutan": 1
      },
      {
        "id": 2,
        "nama_dokumen": "Surat keterangan pindah/surat keterangan datang",
        "deskripsi": null,
        "is_wajib": true,
        "catatan": "Bagi penduduk pindah",
        "urutan": 2
      }
    ]
  }
}
```

---

### **5. Update Tabel `pengajuan` dan `dokumen_upload`**

Tabel `pengajuan` sudah OK, tapi tabel `dokumen_upload` perlu tambah kolom untuk identifikasi persyaratan mana yang diupload:

```sql
ALTER TABLE dokumen_upload 
ADD COLUMN persyaratan_id BIGINT NULL AFTER pengajuan_id,
ADD FOREIGN KEY (persyaratan_id) REFERENCES persyaratan(id) ON DELETE SET NULL;
```

Jadi nanti saat admin lihat pengajuan, bisa tahu: "File ini untuk persyaratan nomor berapa".

---

## 📝 SEEDER DATA (Contoh Insert untuk Testing)

```php
// Seeder untuk tabel layanan
DB::table('layanan')->insert([
  // Kategori: Kartu Keluarga
  ['id' => 1, 'parent_id' => null, 'kode' => 'KK', 'nama' => 'Kartu Keluarga', 'kategori' => 'Kartu Keluarga', 'kode_formulir' => null, 'icon' => 'id-card'],
  ['id' => 2, 'parent_id' => 1, 'kode' => 'KK-BARU', 'nama' => 'Penerbitan KK Baru untuk WNI', 'kategori' => 'Kartu Keluarga', 'kode_formulir' => 'F-1.02~F-1.06'],
  ['id' => 3, 'parent_id' => 1, 'kode' => 'KK-UBAH', 'nama' => 'Penerbitan KK Karena Perubahan Data', 'kategori' => 'Kartu Keluarga', 'kode_formulir' => 'F-1.02~F-1.06'],
  ['id' => 4, 'parent_id' => 1, 'kode' => 'KK-HILANG', 'nama' => 'Penerbitan KK Karena Hilang/Rusak', 'kategori' => 'Kartu Keluarga', 'kode_formulir' => 'F-1.02'],
  
  // Kategori: Akta Kelahiran
  ['id' => 5, 'parent_id' => null, 'kode' => 'AK-LAHIR', 'nama' => 'Akta Kelahiran', 'kategori' => 'Akta Kelahiran', 'kode_formulir' => null, 'icon' => 'baby'],
  ['id' => 6, 'parent_id' => 5, 'kode' => 'AK-LAHIR-NORMAL', 'nama' => 'Penerbitan Akta Kelahiran Normal', 'kategori' => 'Akta Kelahiran', 'kode_formulir' => 'F-2.01a'],
  ['id' => 7, 'parent_id' => 5, 'kode' => 'AK-LAHIR-TEMUAN', 'nama' => 'Pencatatan Kelahiran Anak Temuan', 'kategori' => 'Akta Kelahiran', 'kode_formulir' => 'F-2.01a'],
  
  // Dst...
]);

// Seeder untuk tabel persyaratan (contoh untuk KK Baru)
DB::table('persyaratan')->insert([
  ['layanan_id' => 2, 'nama_dokumen' => 'Buku nikah/kutipan akta perkawinan atau kutipan akta perceraian', 'is_wajib' => true, 'urutan' => 1],
  ['layanan_id' => 2, 'nama_dokumen' => 'Surat keterangan pindah/surat keterangan datang bagi penduduk yang pindah dalam wilayah NKRI', 'is_wajib' => true, 'urutan' => 2, 'catatan' => 'Bagi penduduk pindah'],
]);
```

---

## ✅ CHECKLIST IMPLEMENTASI

### Phase 1: Database (1-2 hari)
- [ ] Create migration: tabel `persyaratan`
- [ ] Alter tabel `layanan`: tambah kolom `parent_id`, `kategori`, `kode_formulir`, `urutan`
- [ ] Alter tabel `dokumen_upload`: tambah kolom `persyaratan_id`
- [ ] Buat seeder data untuk 8 layanan + semua sub-layanan
- [ ] Buat seeder data untuk semua persyaratan (dari dokumen yang diupload)
- [ ] Test migration & seeder di local

### Phase 2: Backend API (2 hari)
- [ ] Endpoint: `GET /api/layanan` dengan hierarki (parent + sub)
- [ ] Endpoint: `GET /api/layanan/{id}/persyaratan`
- [ ] Update logic pengajuan: validasi jumlah file sesuai persyaratan wajib
- [ ] Update response detail pengajuan: include data persyaratan yang diupload

### Phase 3: Frontend — Flow Ajukan Layanan (3 hari)
- [ ] Step 1: Grid kategori layanan (8 card)
- [ ] Step 2: Pilih sub-layanan (conditional, jika ada)
- [ ] Step 3: Tampilan download formulir + list persyaratan
- [ ] Step 4: Form upload dengan dynamic input sesuai jumlah persyaratan
- [ ] Validasi: cek apakah semua persyaratan wajib sudah diupload
- [ ] Handle case: layanan tanpa sub-layanan (skip Step 2)

### Phase 4: Admin — Preview Persyaratan (1 hari)
- [ ] Di halaman "Detail Pengajuan", tampilkan list persyaratan
- [ ] Checklist: persyaratan mana yang sudah diupload
- [ ] Preview file per persyaratan

### Phase 5: Testing (1 hari)
- [ ] Test semua flow: dari pilih layanan sampai submit
- [ ] Test validasi: upload kurang dari persyaratan wajib
- [ ] Test semua 8 kategori layanan + sub-layanan
- [ ] Test admin: lihat persyaratan yang diupload

**Total estimasi: ~8-9 hari kerja**

---

## 🚨 CATATAN PENTING

1. **Kode Formulir Multi-Range**: Beberapa layanan pakai formulir multi (F-1.02 ~ F-1.06). Artinya petugas download **beberapa formulir sekaligus** atau formulir itu multi-halaman. Di UI, bisa pakai ZIP untuk download beberapa formulir sekaligus.

2. **Persyaratan "Bila Ada"**: Beberapa persyaratan punya catatan "bila ada" atau "jika orang asing". Set `is_wajib = false` untuk persyaratan ini, dan tampilkan label "Opsional" di UI.

3. **Surat Keterangan dari RT/RW**: Ini dokumen yang biasanya di-scan dari dokumen fisik (bukan template yang di-generate sistem). Jadi petugas harus minta ke RT/RW dulu, baru diupload.

4. **Pas Foto**: Untuk Akta Perkawinan, ada persyaratan "Pas foto berwarna suami dan istri". Ini bisa diupload sebagai 1 file (foto gabungan) atau 2 file terpisah. Sesuaikan dengan kebiasaan lapangan.

5. **Validasi Upload**: Sistem harus cek apakah jumlah file yang diupload = jumlah persyaratan wajib. Tapi flexible kalau ada persyaratan yang digabung jadi 1 file (misalnya: KTP ayah + KTP ibu dalam 1 PDF).

---

## 🎯 KESIMPULAN

Berdasarkan dokumen "Kebutuhan Formulir dan Persyaratan", sistem SILADUK perlu:

1. **Database hierarkis** untuk layanan (parent-child) dan persyaratan per layanan
2. **UI dinamis** yang menampilkan sub-layanan dan persyaratan sesuai pilihan petugas
3. **Validasi upload** yang cek kelengkapan berdasarkan persyaratan wajib
4. **Preview untuk admin** yang menunjukkan persyaratan mana yang sudah dipenuhi

Dengan struktur ini, sistem bisa handle kompleksitas 8 layanan dengan berbagai sub-layanan dan persyaratan yang berbeda-beda, tanpa hardcode di kode program.

---

**Selesai! Prompt ini siap untuk diimplementasikan ke sistem SILADUK.** 🚀
