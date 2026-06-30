# RUNBOOK MIGRASI DATA: Supabase PostgreSQL ke Cloudflare D1
**Project:** NikahYuk! Digital Invitation App
**Role:** Senior Full-Stack Engineer

Dokumen ini menjelaskan tata cara eksekusi skrip migrasi data dari database **Supabase (PostgreSQL)** ke **Cloudflare D1 (SQLite)** secara aman, terkendali, dan teruji.

---

## 1. Daftar Skrip Migrasi

Semua skrip migrasi disimpan di direktori [scripts/migration/](file:///c:/Users/Alif/Downloads/nikahyuk-main/scripts/migration/):
1.  **[export.js](file:///c:/Users/Alif/Downloads/nikahyuk-main/scripts/migration/export.js):** Mengekspor 15 tabel dari Supabase secara paginasi (1000 baris/fetch) ke format raw JSON di folder [data/](file:///c:/Users/Alif/Downloads/nikahyuk-main/scripts/migration/data/).
2.  **[transform.js](file:///c:/Users/Alif/Downloads/nikahyuk-main/scripts/migration/transform.js):** Menyelaraskan struktur data (boolean -> integer, object -> json string) dan melakukan masking data sensitif (email & nomor telepon) pada visual logs.
3.  **[import.js](file:///c:/Users/Alif/Downloads/nikahyuk-main/scripts/migration/import.js):** Menyusun data hasil transformasi menjadi satu berkas SQL tunggal `import_seed.sql` sesuai urutan integritas foreign key.
4.  **[validate.js](file:///c:/Users/Alif/Downloads/nikahyuk-main/scripts/migration/validate.js):** Membandingkan jumlah baris data antara file hasil ekspor dengan database D1 (lokal/remote), serta menguji sampel integritas relasinya.

---

## 2. Instruksi Menjalankan Dry-Run (Lokal)

Langkah-langkah berikut aman dijalankan karena hanya memengaruhi **database emulator lokal** komputer Anda:

### Langkah A: Persiapan Environment
Pastikan Anda sudah menyalin berkas `.env` dan mengisi kunci layanan:
```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-secret"
```

### Langkah B: Ekspor Data dari Supabase
Jalankan perintah berikut untuk mengunduh data mentah:
```bash
node scripts/migration/export.js
```
*   Data tersimpan sebagai file `.json` di folder `scripts/migration/data/` (folder ini **terkecualikan** dari git commits demi keamanan data produksi).

### Langkah C: Jalankan Transformasi Data
Sesuaikan tipe data PostgreSQL ke SQLite:
```bash
node scripts/migration/transform.js
```
*   Perhatikan diagnostic log di konsol. Email dan nomor telepon yang tercetak akan disamarkan secara otomatis (contoh: `b***i@example.com` atau `0812***7890`).

### Langkah D: Buat Berkas SQL Import
Hasilkan perintah INSERT SQLite terurut:
```bash
node scripts/migration/import.js
```
*   Akan menghasilkan file baru: `scripts/migration/data/import_seed.sql`.

### Langkah E: Jalankan Impor ke D1 Lokal (Simulasi)
Terapkan data hasil ekspor ke database lokal D1:
```bash
$env:CI="true"; npx wrangler d1 execute nikah-yuk --local -c worker/wrangler.toml --file=scripts/migration/data/import_seed.sql
```

### Langkah F: Jalankan Skrip Validasi
Pastikan data masuk secara utuh dan relasinya benar:
```bash
node scripts/migration/validate.js
```
*   Skrip ini akan membandingkan jumlah baris data dan mencetak status kesesuaian.

---

## 3. Instruksi Menjalankan Migrasi Remote (Produksi)

> [!CAUTION]
> **ATURAN KESELAMATAN:** Jangan jalankan langkah ini ke remote database produksi tanpa persetujuan eksplisit!

Setelah seluruh langkah Dry-Run (Lokal) teruji sukses dan disetujui, migrasi remote dapat dilakukan dengan langkah berikut:

### Langkah A: Terapkan Skema Migrasi Baru ke Cloudflare Remote D1
```bash
$env:CI="true"; npx wrangler d1 migrations apply nikah-yuk --remote -c worker/wrangler.toml
```

### Langkah B: Jalankan Impor Berkas SQL ke Cloudflare Remote D1
```bash
$env:CI="true"; npx wrangler d1 execute nikah-yuk --remote -c worker/wrangler.toml --file=scripts/migration/data/import_seed.sql
```

### Langkah C: Jalankan Validasi Terhadap Database Remote
Ubah parameter dalam `validate.js` untuk mengarah ke `--remote` (atau buat salinan `validate_remote.js`) lalu jalankan untuk memastikan integritas data produksi Cloudflare D1 telah 100% cocok dengan data Supabase Anda.
