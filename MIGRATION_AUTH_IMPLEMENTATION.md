# IMPLEMENTASI AUTENTIKASI MANDIRI (Cloudflare D1 & Workers)
**Project:** NikahYuk! Digital Invitation App
**Role:** Senior Full-Stack Engineer

Dokumen ini mendokumentasikan hasil implementasi sistem autentikasi mandiri berbasis **Cloudflare Workers** dan **Cloudflare D1** sesuai dengan rancangan yang telah disetujui di `MIGRATION_AUTH_DESIGN.md`.

Sistem ini didesain berdampingan dengan Supabase Auth melalui mekanisme **Feature Flag** untuk memastikan transisi berjalan aman tanpa risiko mematikan sistem lama.

---

## 1. Migrasi Skema Basis Data D1

Tabel autentikasi ditambahkan melalui file migrasi kedua:
*   **File Migrasi:** [worker/migrations/0002_auth_schema.sql](file:///c:/Users/Alif/Downloads/nikahyuk-main/worker/migrations/0002_auth_schema.sql)
*   **Tabel Dibuat:**
    *   `auth_users`: Menyimpan kredensial user, email unik, dan bcrypt `password_hash`.
    *   `sessions`: Menyimpan token sesi hashed (SHA-256) untuk validasi sesi aktif di database, beserta IP, User Agent, dan waktu kedaluwarsa.
    *   `auth_tokens`: Untuk menampung token verifikasi email dan reset password di masa depan.
*   **Penerapan Lokal:** Skema telah sukses diterapkan ke database lokal D1 (`nikah-yuk`).

---

## 2. Implementasi Backend API Worker (`index.ts`)

Seluruh logika autentikasi mandiri ditambahkan di [worker/src/index.ts](file:///c:/Users/Alif/Downloads/nikahyuk-main/worker/src/index.ts):

1.  **POST /api/auth/register:**
    *   Menerima `email`, `password`, `name`, dan `phone`.
    *   Melakukan enkripsi password menggunakan **`bcryptjs`** dengan tingkat kompleksitas 10 salt rounds (kompatibel penuh dengan enkripsi Supabase).
    *   Membuat data kredensial di tabel `auth_users` dan profil publik di tabel `profiles` secara berurutan dalam database.
2.  **POST /api/auth/login:**
    *   **Rate Limiting:** Menggunakan Cloudflare KV (key `ratelimit:login:<ip>`) untuk membatasi percobaan login maksimal **5 kali per menit** per alamat IP. Melebihi batas akan mengembalikan status `429 Too Many Requests`.
    *   **Timing Attack Protection:** Jika akun email tidak ditemukan, sistem tetap menjalankan fungsi komparasi bcrypt palsu (*dummy bcrypt check*) agar pelaku serangan brute force tidak dapat menebak keberadaan email lewat perbedaan waktu respon API.
    *   **Generic Error Message:** Kegagalan login hanya mengembalikan pesan umum: `"Email atau password salah"`.
    *   **Secure Session Cookie:** Menghasilkan token acak 64 karakter, menyimpannya secara terenkripsi (SHA-256) di tabel `sessions`, dan menetapkannya di browser lewat header cookie `Set-Cookie` dengan opsi keamanan maksimal: `HttpOnly; Secure; SameSite=Lax; Path=/`.
3.  **POST /api/auth/logout:**
    *   Menghapus baris sesi yang cocok dari tabel `sessions` D1 berdasarkan hash dari token cookie.
    *   Mengembalikan header untuk langsung menghapus cookie sesi di browser client (`Max-Age=0`).
4.  **GET /api/auth/me:**
    *   Membaca session cookie, mencocokkan hash token ke database D1, dan mengecek masa kedaluwarsa (30 hari).
    *   Mengembalikan status autentikasi `{ authenticated: true, user: profile }` jika sesi valid, atau membersihkan cookie jika tidak valid.

---

## 3. Integrasi Frontend & Feature Flag (`USE_D1_AUTH`)

Untuk meminimalkan risiko transisi, dipasang sistem **Feature Flag**:

1.  **Definisi Flag:** Ditentukan melalui variabel lingkungan `VITE_USE_D1_AUTH`.
2.  **Integrasi di [src/stores/authStore.ts](file:///c:/Users/Alif/Downloads/nikahyuk-main/src/stores/authStore.ts):**
    *   Jika `VITE_USE_D1_AUTH=true`, maka inisialisasi aplikasi (`initialize`), login (`signIn`), registrasi (`signUp`), dan logout (`signOut`) akan mengarah ke API Cloudflare Worker menggunakan method `fetch()` dengan opsi `credentials: 'include'`.
    *   Jika `VITE_USE_D1_AUTH=false` (atau tidak didefinisikan), aplikasi **tetap berjalan 100% menggunakan Supabase Auth** seperti sedia kala.
3.  **Pembaruan Halaman Form:** Berkas [src/pages/Login.tsx](file:///c:/Users/Alif/Downloads/nikahyuk-main/src/pages/Login.tsx) dan [src/pages/Register.tsx](file:///c:/Users/Alif/Downloads/nikahyuk-main/src/pages/Register.tsx) dimodifikasi agar memanggil fungsi abstrak `signIn` dan `signUp` dari `useAuthStore` alih-alih memanggil Supabase client secara langsung.

---

## 4. Cara Melakukan Pengujian Auth Baru Secara Lokal

Untuk mengaktifkan dan menguji sistem autentikasi D1 baru di komputer Anda secara lokal:

1.  Buka berkas konfigurasi `.env` Anda di root folder proyek (atau buat jika belum ada).
2.  Tambahkan baris berikut untuk menyalakan feature flag D1 Auth secara lokal:
    ```env
    VITE_USE_D1_AUTH=true
    VITE_CLOUDFLARE_WORKER_API_URL="http://localhost:8787"
    ```
3.  Pastikan D1 local database dan Worker Anda sedang menyala:
    ```bash
    npm run dev:worker
    ```
4.  Jalankan frontend Vite Anda:
    ```bash
    npm run dev
    ```
5.  Buka web browser dan lakukan uji coba pendaftaran akun baru, login, dashboard, serta logout.
6.  *Jika ingin mematikan D1 Auth dan kembali ke Supabase Auth, cukup ubah nilai `VITE_USE_D1_AUTH=false` pada file `.env` dan muat ulang halaman browser.*
