# Catatan Perbedaan Skema Database: Supabase PostgreSQL vs Cloudflare D1 SQLite

Dokumen ini mendokumentasikan perbedaan teknis antara skema database **Supabase PostgreSQL** awal dan skema **Cloudflare D1 SQLite** hasil migrasi pada file [0001_initial_schema.sql](file:///c:/Users/Alif/Downloads/nikahyuk-main/worker/migrations/0001_initial_schema.sql).

---

## 1. Pemetaan Tipe Data (Data Type Mapping)

| Fitur / Tipe Data | Supabase (PostgreSQL) | Cloudflare D1 (SQLite) | Solusi & Penjelasan |
| :--- | :--- | :--- | :--- |
| **Identitas Unik (ID)** | `UUID` | `TEXT` | SQLite tidak mendukung tipe data `UUID` asli. Kita menyimpannya sebagai `TEXT`. Pembuatan nilai default menggunakan `uuid_generate_v4()` dipindahkan ke level kode JS/TS API Worker (misal: menggunakan `crypto.randomUUID()`). |
| **Tanggal & Waktu** | `TIMESTAMP WITH TIME ZONE` | `TEXT` | SQLite tidak memiliki tipe data tanggal bawaan. Kita menggunakan `TEXT` untuk menyimpan waktu dalam format ISO-8601 UTC. Default UTC didefinisikan menggunakan `DEFAULT (datetime('now'))`. |
| **Data JSON** | `JSONB` | `TEXT` | SQLite menyimpan JSON sebagai data `TEXT` biasa. Di level API, kita melakukan `JSON.stringify()` saat menulis dan `JSON.parse()` saat membaca. SQLite D1 juga menyediakan fungsi JSON bawaan seperti `json()` jika diperlukan dalam query. |
| **Boolean** | `BOOLEAN` (`true` / `false`) | `INTEGER` (`0` / `1`) | SQLite memetakan nilai boolean ke integer. Kita menggunakan `CHECK(column IN (0, 1))` untuk memastikan integritas data. |
| **Bilangan Pecahan** | `NUMERIC` | `REAL` | Nilai harga, diskon, atau jumlah pembayaran dipetakan ke tipe data `REAL` SQLite. |

---

## 2. Fitur Spesifik Basis Data & Strategi Migrasinya

### A. Pengganti Native ENUM
*   **Supabase:** Menggunakan tipe data enum PostgreSQL khusus atau check constraint.
*   **D1 SQLite:** Menggunakan Check Constraint pada kolom TEXT.
    *   *Contoh:* `role TEXT CHECK(role IN ('super_admin', 'customer')) DEFAULT 'customer'`.

### B. Pengganti Triggers (Database Triggers)
PostgreSQL trigger otomatis pada Supabase tidak dapat digunakan pada SQLite D1. Semua logika ini **dipindahkan ke level API (Cloudflare Worker)**:

1.  **Sinkronisasi Profil Baru (`handle_new_user`):**
    *   *Supabase:* Trigger memantau tabel `auth.users` dan menyalin profil baru ke `public.profiles`.
    *   *D1:* Ketika API Pendaftaran menerima akun baru dari Clerk (atau Auth Provider), API akan langsung menjalankan query `INSERT` profil ke tabel `profiles` di database D1 secara manual atau menggunakan webhook Clerk.
2.  **Pemberian Paket Langganan (`handle_transaction_approval`):**
    *   *Supabase:* Trigger memantau tabel `transactions`, saat status `payment_status` diubah menjadi `success`, trigger otomatis meng-update tanggal kedaluwarsa di `profiles` dan `invitations`.
    *   *D1:* Logika ini ditaruh di dalam endpoint `PATCH /api/transactions/:id` pada Worker. Saat admin mengubah status pembayaran ke `success`, API akan mengeksekusi *database transaction* (menggunakan D1 batch query) untuk memperbarui tabel `transactions`, `profiles`, dan `invitations` sekaligus dalam satu rangkaian proses.

### C. Row-Level Security (RLS) & Kebijakan Hak Akses
*   **Supabase:** Mengatur kebijakan keamanan langsung di level database (`CREATE POLICY ... USING (auth.uid() = id)`).
*   **D1 SQLite:** SQLite tidak memiliki konsep RLS. Keamanan dipindahkan sepenuhnya ke **layer API Worker**. API akan memvalidasi JSON Web Token (JWT) pengguna dari Header Authorization, mengekstrak `user_id`, dan menyisipkan filter ID tersebut pada query SQL secara manual:
    *   *Contoh:* `SELECT * FROM invitations WHERE user_id = ?` (menghindari parameter user_id dimanipulasi oleh client).

### D. Optimasi Indeks Query
Indeks untuk meningkatkan kecepatan pencarian data di SQLite D1 ditambahkan secara eksplisit pada kolom-kolom relasional dan pencarian utama:
*   Indeks email pada tabel `profiles`.
*   Indeks slug unik pada `templates` dan `invitations`.
*   Indeks foreign key relasi seperti `user_id` dan `invitation_id`.
*   Indeks kolom `created_at` untuk mempercepat sorting data transaksi, rsvp, dan wishes terbaru.
