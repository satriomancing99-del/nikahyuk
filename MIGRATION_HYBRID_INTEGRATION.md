# MIGRATION HYBRID INTEGRATION
**Project:** NikahYuk! Digital Invitation App
**Role:** Senior Full-Stack Engineer

Dokumen ini mencatat bukti keberhasilan implementasi integrasi aplikasi frontend (Vercel) dengan backend baru (Cloudflare Worker API) secara **hybrid**. 

Layanan autentikasi (`supabase.auth`) dan tabel sekunder masih berjalan di Supabase, sementara data pembacaan undangan publik dan penulisan RSVP telah diarahkan untuk memprioritaskan Cloudflare D1 dengan sistem **Fallback Otomatis** ke Supabase jika terjadi kendala jaringan atau kegagalan API Cloudflare.

---

## 1. Environment Variable Yang Ditambahkan

Untuk menghubungkan frontend dengan Worker API, variabel lingkungan berikut perlu ditambahkan di Vercel Dashboard / `.env` lokal:
*   `VITE_CLOUDFLARE_WORKER_API_URL`: Alamat URL Worker API Anda (contoh lokal: `http://localhost:8787` atau production: `https://nikah-yuk-api.username.workers.dev`).
*   `VITE_CLOUDFLARE_WORKER_SECRET`: Token rahasia (`APP_SECRET`) yang dikirimkan di header `X-App-Secret` untuk otorisasi write/admin (tidak bocor ke client-side console).

---

## 2. Berkas Yang Dibuat & Dimodifikasi

### A. [NEW] [src/lib/cloudflare-api.ts](file:///c:/Users/Alif/Downloads/nikahyuk-main/src/lib/cloudflare-api.ts)
Modul pembungkus (wrapper) HTTP Fetch untuk berkomunikasi dengan Cloudflare Worker API.
*   **Fitur Proteksi Timeout:** Menggunakan `AbortController` dengan batas waktu **5000ms**. Jika API Cloudflare tidak merespon dalam 5 detik, request otomatis di-abort untuk mencegah halaman web menggantung, lalu memicu error agar fallback Supabase berjalan.
*   **Fitur Logging:** Ditambahkan `console.log("[Cloudflare API]", ...)` yang hanya aktif di lingkungan development (`import.meta.env.DEV`) tanpa mencetak rahasia token.
*   **Fallback Error Handling:** Semua error jaringan atau HTTP error dibungkus dengan pesan kesalahan yang ramah pengguna.

### B. [MODIFY] [src/pages/PublicInvitation.tsx](file:///c:/Users/Alif/Downloads/nikahyuk-main/src/pages/PublicInvitation.tsx)
1.  **Pengalihan Query Undangan Utama (Baris 370-390):**
    *   Sistem melakukan *dynamic import* terhadap `cloudflareApi` dan mencoba mengambil data undangan menggunakan `cloudflareApi.getInvitationBySlug(invitationSlug)`.
    *   Jika gagal (karena server Cloudflare D1 belum aktif, timeout 5s, atau error 500), sistem secara otomatis melakukan `catch` dan **mengalihkan query ke Supabase** (`supabase.from('invitations').select().eq('slug', invitationSlug)`) sebagai cadangan aktif.
2.  **Pengalihan Pengiriman RSVP (Baris 670-700):**
    *   Saat tamu mengisi form RSVP, data dikirim terlebih dahulu ke Cloudflare D1 melalui `cloudflareApi.submitRsvp()`.
    *   Jika pengiriman ke Cloudflare gagal, sistem mencetak warning di console dan langsung menyimpan data RSVP tersebut ke database **Supabase** sebagai cadangan agar konfirmasi kehadiran pengantin tidak hilang.

---

## 3. Hasil Pengujian Typecheck & Build

Seluruh perubahan kode telah divalidasi dan lolos pengecekan:
*   **Script Typecheck:** `npm run lint` (`tsc --noEmit`) -> **PASSED (SUKSES Tanpa Error)**
*   **Script Build:** `npm run build` (`vite build`) -> **SUCCESS (SUKSES Kompilasi)**

---

## 4. Keuntungan Konfigurasi Hybrid Ini

1.  **Risiko Nol:** Halaman undangan pernikahan publik Anda tetap berfungsi normal bahkan jika backend Cloudflare D1 Anda mengalami *downtime* atau belum dikonfigurasi dengan benar di production, karena adanya *automatic fallback* ke Supabase.
2.  **Type-Safe:** Seluruh request API dan response dipetakan secara type-safe menggunakan TypeScript interface.
3.  **Performance-optimized:** Integrasi didesain asinkronus (menghindari blocking thread utama) dengan penanganan timeout yang sigap.
