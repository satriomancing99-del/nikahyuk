# DESAIN MIGRASI AUTHENTICATION: Supabase Auth ke Cloudflare Worker & D1
**Project:** NikahYuk! Digital Invitation App
**Role:** Senior Full-Stack Engineer

Dokumen ini berisi rancangan arsitektur untuk memindahkan sistem autentikasi dari **Supabase Auth** ke sistem mandiri berbasis **Cloudflare Workers** dan **Cloudflare D1**.

---

## 1. Audit Alur Autentikasi Supabase Saat Ini

Berdasarkan pemeriksaan codebase, aplikasi menggunakan Supabase Auth untuk:
*   **Email & Password:** Pendaftaran (`signUp`) dan Masuk (`signInWithPassword`) pada file `Login.tsx` dan `Register.tsx`.
*   **OAuth (Google):** Metode masuk sosial menggunakan `signInWithOAuth` di tombol login.
*   **Session Management:** State session dikelola oleh `supabase.auth.getSession()` dan didengarkan secara real-time via listener `supabase.auth.onAuthStateChange` pada `authStore.ts`.
*   **Database Sync:** Pengguna baru disinkronkan secara otomatis ke tabel `public.profiles` melalui trigger basis data PostgreSQL `handle_new_user()` saat berhasil mendaftar.

---

## 2. Perbandingan Pendekatan Autentikasi D1

Kami mengevaluasi tiga opsi utama untuk menggantikan Supabase Auth:

### Opsi A: Better Auth (Sangat Direkomendasikan)
Kerangka kerja (framework) autentikasi modern berbasis TypeScript yang dirancang untuk Edge runtime (Cloudflare Workers) dengan D1 adapter bawaan.
*   **Kelebihan:** Keamanan out-of-the-box (CSRF protection, session management), mendukung OAuth, Email/Password, verifikasi email, reset sandi, dan integrasi mudah dengan React.
*   **Kekurangan:** Menambahkan pustaka dependensi baru pada Worker API.

### Opsi B: Custom Session Cookie (Mandiri)
Membangun sistem auth JWT/Session sendiri di dalam Worker menggunakan Web Crypto API dan menyimpan session di tabel D1.
*   **Kelebihan:** Kontrol penuh 100% tanpa dependensi pihak ketiga, ukuran bundel Worker sangat kecil.
*   **Kekurangan:** Harus memprogram manual fitur keamanan seperti hashing, CSRF tokens, rate limiting login, email token verification, dsb.

### Opsi C: Penyedia Auth Eksternal (Clerk / Kinde)
Memindahkan autentikasi ke SaaS pihak ketiga, namun data profil tetap sinkron di D1.
*   **Kelebihan:** Paling aman, fitur sangat lengkap (MFA, passwordless, social login), zero-maintenance.
*   **Kekurangan:** Tidak self-hosted di D1 Anda, dan ada limitasi free tier (10k MAU).

---

## 3. Tambahan Skema D1 SQLite

Untuk mendukung Opsi A atau B (auth mandiri di D1), kita perlu menambahkan tabel-tabel berikut ke skema D1:

```sql
-- 1. Tabel Tambahan untuk Kredensial User (auth_users)
CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY, -- UUID/Kunci unik buatan Worker
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Hashed password (Bcrypt/Argon2id)
  email_verified INTEGER CHECK(email_verified IN (0, 1)) DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. Tabel Pengelolaan Sesi (sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, -- Session Token Hashed
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  expired_at TEXT NOT NULL, -- ISO Date String kedaluwarsa sesi
  user_agent TEXT,
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 3. Tabel Token Reset Sandi & Verifikasi Email (auth_tokens)
CREATE TABLE IF NOT EXISTS auth_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  type TEXT CHECK(type IN ('email_verification', 'password_reset')) NOT NULL,
  token_hash TEXT NOT NULL,
  expired_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Buat index untuk kecepatan pencarian token dan session
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_hash ON auth_tokens(token_hash);
```

---

## 4. Penjelasan Mekanisme Teknis

### A. Cara Hash Password
Cloudflare Workers berjalan di V8 Isolates (bukan Node.js lengkap), sehingga modul C++ seperti `bcrypt` biasa tidak dapat berjalan. Kita akan menggunakan:
1.  **Web Crypto API (PBKDF2):** Menggunakan algoritma bawaan browser/Workers yang sangat cepat dan aman.
2.  **bcryptjs atau Scrypt WASM:** Jika ingin kompatibilitas penuh dengan password lama Supabase.

### B. Cara Migrasi User dari Supabase Auth
1.  Ekspor data pengguna Supabase Auth (tabel `auth.users`) melalui SQL Editor Supabase ke format CSV/JSON:
    ```sql
    SELECT id, email, encrypted_password FROM auth.users;
    ```
2.  Impor data tersebut ke tabel `auth_users` di Cloudflare D1.
3.  **Apakah password lama bisa dipindahkan?**
    **BISA.** Supabase Auth menggunakan algoritma **bcrypt** (`$2a$` atau `$2y$`). Dengan menggunakan library verifikasi bcrypt (seperti `bcryptjs` atau WebAssembly bcrypt) di Cloudflare Workers, backend baru Anda dapat langsung mencocokkan password yang diketik user dengan hash bcrypt lama dari Supabase. **User tidak perlu dipaksa reset password!**

### C. Alur Pembuatan & Manajemen Sesi (Session Cookie)
1.  **Pembuatan Sesi:** Saat login sukses, Worker membuat token acak panjang (misal: 64 karakter via `crypto.getRandomValues()`).
2.  **Penyimpanan Sesi:** Token di-hash (SHA-256) lalu disimpan ke tabel `sessions` D1 bersama ID user dan waktu kedaluwarsa (misal: 30 hari).
3.  **Cookie HttpOnly:** Token mentah dikirimkan kembali ke browser melalui header `Set-Cookie` dengan opsi keamanan ketat:
    ```
    Set-Cookie: session_token=<token_mentah>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000
    ```

### D. Alur Logout
1.  Browser mengirimkan request ke `POST /api/auth/logout`.
2.  Worker membaca cookie `session_token`, meng-hash nilainya, lalu menghapus baris session yang cocok dari tabel `sessions` D1.
3.  Worker mengembalikan header pembersihan cookie:
    ```
    Set-Cookie: session_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
    ```

### E. Proteksi Halaman Dashboard & Endpoint Write
*   **Dashboard Protection (Client-side):**
    Saat inisialisasi aplikasi, React frontend memanggil `GET /api/auth/me`. Jika API merespon `200 OK` beserta data profil, user diizinkan masuk. Jika `401 Unauthorized`, router React mengalihkan paksa pengguna ke `/login`.
*   **API Endpoint Write Protection (Server-side):**
    Setiap request `POST`, `PUT`, `DELETE` ke API Worker wajib melewati middleware autentikasi:
    1.  Membaca cookie `session_token`.
    2.  Mengecek validitas token di tabel `sessions` D1.
    3.  Mencegah serangan CSRF dengan memvalidasi header `Origin` atau `Referer` cocok dengan daftar domain putih kita.

---

## 5. Analisis Risiko Keamanan

1.  **Session Hijacking:** Jika terdapat celah *Cross-Site Scripting (XSS)* di frontend, penyerang bisa menyuntikkan script. Namun, karena cookie diset sebagai `HttpOnly`, script jahat **tidak bisa membaca cookie sesi** lewat `document.cookie`.
2.  **CSRF (Cross-Site Request Forgery):** Penyerang memicu request dari situs pihak ketiga. Risiko ini diredam dengan parameter `SameSite=Lax` atau `SameSite=Strict` pada cookie, serta verifikasi CORS Origin di Worker API.
3.  **D1 Read Overhead:** Setiap request membutuhkan query ke D1 untuk memvalidasi token sesi.
    *   *Solusi:* Token sesi yang valid dapat di-cache sementara di **Cloudflare KV** dengan waktu kedaluwarsa singkat (misal: 5 menit) untuk mempercepat verifikasi tanpa membebani kuota D1 read.
