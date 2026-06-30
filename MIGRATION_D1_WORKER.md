# Cloudflare Worker API Setup for D1 Migration

Dokumen ini menjelaskan struktur, konfigurasi, dan cara menjalankan Cloudflare Worker yang berfungsi sebagai backend API perantara untuk mengakses database **Cloudflare D1 (nikah-yuk)**.

---

## 1. Struktur Folder Worker

Struktur berkas yang dibuat:
*   [worker/wrangler.toml](file:///c:/Users/Alif/Downloads/nikahyuk-main/worker/wrangler.toml): Konfigurasi Cloudflare Wrangler dan binding D1.
*   [worker/tsconfig.json](file:///c:/Users/Alif/Downloads/nikahyuk-main/worker/tsconfig.json): Konfigurasi TypeScript khusus untuk target runtime Cloudflare Workers.
*   [worker/src/index.ts](file:///c:/Users/Alif/Downloads/nikahyuk-main/worker/src/index.ts): Kode utama Worker, berisi routing `/api/health` dan konfigurasi CORS.

---

## 2. Langkah Konfigurasi & Persiapan

### A. Memperbarui ID Database D1
Buka file [worker/wrangler.toml](file:///c:/Users/Alif/Downloads/nikahyuk-main/worker/wrangler.toml) dan perbarui `database_id` dengan ID database riil milik Anda dari dashboard Cloudflare:
```toml
[[d1_databases]]
binding = "DB"
database_name = "nikah-yuk"
database_id = "bbf0ca71-beaf-417f-b6bb-6f49b48f8638"
```

---

## 3. Cara Menjalankan Worker Secara Lokal

Wrangler akan secara otomatis menyimulasikan database D1 secara lokal (*local SQLite emulation*) di komputer Anda tanpa mempengaruhi database produksi.

Jalankan perintah berikut di root folder proyek:
```bash
npm run dev:worker
```
*   Perintah ini akan menjalankan server lokal Worker pada alamat default: `http://localhost:8787`

---

## 4. Cara Menguji Endpoint `/api/health`

Setelah Worker berjalan secara lokal, Anda dapat memverifikasi koneksi database dengan membuka URL berikut di browser atau menggunakan curl:

```bash
curl http://localhost:8787/api/health
```

### Respon Sukses (Database Connected)
```json
{
  "status": "ok",
  "database": "connected",
  "now": "2026-06-30 05:56:00"
}
```

---

## 5. Cara Deploy ke Cloudflare (Production)

> [!WARNING]
> Jangan lakukan deployment sebelum mendapatkan persetujuan untuk memastikan konfigurasi database ID (`database_id`) sudah terisi dengan benar.

Setelah siap dan disetujui, Anda dapat men-deploy Worker ke Cloudflare menggunakan perintah:
```bash
npm run deploy:worker
```
