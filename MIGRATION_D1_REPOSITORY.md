# DATA ACCESS LAYER: Cloudflare D1 Repositories
**Project:** NikahYuk! Digital Invitation App
**Role:** Senior Full-Stack Engineer

Dokumen ini mendokumentasikan desain **Data Access Layer (Repository Pattern)** yang digunakan untuk mengakses basis data **Cloudflare D1 (SQLite)** secara aman, terpusat, dan terstruktur tanpa mengotori komponen UI.

---

## 1. Lokasi Berkas & Modul

*   [worker/src/db/repositories.ts](file:///c:/Users/Alif/Downloads/nikahyuk-main/worker/src/db/repositories.ts): File utama yang berisi tipe data (interfaces), validasi input, dan kelas-kelas repository (`UserRepository`, `InvitationRepository`, `GuestRepository`, `RsvpRepository`).

---

## 2. Kelas & Metode Repository Yang Diimplementasikan

Setiap repository membutuhkan instansiasi `D1Database` pada constructor-nya:

### A. `UserRepository`
Bertanggung jawab atas entitas profil pengguna.
*   `findUserById(id: string): Promise<Profile | null>`
    *   Mencari pengguna berdasarkan ID unik.
*   `findUserByEmail(email: string): Promise<Profile | null>`
    *   Mencari pengguna berdasarkan email (memiliki validasi format email).
*   `createUser(data: CreateProfilePayload): Promise<Profile>`
    *   Menyisipkan user baru ke tabel `profiles` menggunakan klausul `RETURNING *` untuk mengambil baris data yang baru dibuat.

### B. `InvitationRepository`
Bertanggung jawab atas entitas utama undangan pernikahan.
*   `createInvitation(data: CreateInvitationPayload): Promise<Invitation>`
    *   Membuat undangan pernikahan baru (memiliki validasi format slug).
*   `findInvitationBySlug(slug: string): Promise<Invitation | null>`
    *   Mencari detail undangan berdasarkan alamat slug url unik (akses publik).
*   `findInvitationsByUserId(userId: string): Promise<Invitation[]>`
    *   Mencari seluruh undangan milik pengguna yang sedang login (akses dashboard privat).

### C. `GuestRepository`
Bertanggung jawab atas pengelolaan data tamu undangan.
*   `createGuest(data: CreateGuestPayload): Promise<Guest>`
    *   Membuat tamu undangan baru dan men-generate ID / parameter pendukung.
*   `listGuestsByInvitationId(invitationId: string): Promise<Guest[]>`
    *   Mengembalikan daftar seluruh tamu pada suatu undangan pernikahan yang terurut berdasarkan nama (`A-Z`).

### D. `RsvpRepository`
Bertanggung jawab atas pencatatan konfirmasi kehadiran tamu.
*   `createRsvp(data: CreateRsvpPayload): Promise<Rsvp>`
    *   Menyimpan data konfirmasi RSVP tamu ke database.
*   `listRsvpsByInvitationId(invitationId: string): Promise<Rsvp[]>`
    *   Mengembalikan daftar ucapan/kehadiran tamu terurut dari yang terbaru.

---

## 3. Keamanan & Integritas Query (Anti SQL Injection)

Seluruh repository diimplementasikan dengan mematuhi aturan penulisan query aman:
1.  **Prepared Statements & Bind Parameters:** Tidak ada penyusunan query SQL menggunakan string interpolation (`${input}`) untuk parameter dinamis yang dikirimkan oleh pengguna. Seluruh input disuntikkan secara aman menggunakan placeholder tanda tanya (`?`) dan fungsi `.bind()` bawaan D1.
    *   *Contoh:*
        ```typescript
        this.db.prepare("SELECT * FROM profiles WHERE email = ?").bind(email)
        ```
2.  **Validasi Input:**
    *   **Email:** Diverifikasi menggunakan regex standar (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) sebelum dikirim ke database.
    *   **Slug:** Diverifikasi hanya boleh mengandung huruf kecil, angka, dan tanda strip (`/^[a-z0-9-]+$/`) untuk mencegah manipulasi URL atau karakter aneh yang merusak navigasi web.

---

## 4. Endpoint Pengujian Integrasi (Unit Testing)

Untuk mempermudah pengujian fungsionalitas repository secara langsung di runtime Cloudflare Worker tanpa menghubungkannya ke antarmuka UI React terlebih dahulu, dibuat endpoint pengujian khusus:

*   **Endpoint:** `GET /api/test-repositories`
*   **Cara Pengujian Lokal:**
    1. Jalankan worker secara lokal:
       ```bash
       npm run dev:worker
       ```
    2. Panggil API test menggunakan browser atau Postman:
       ```
       http://localhost:8787/api/test-repositories
       ```
*   **Logika Pengujian:**
    Endpoint ini akan menginstansiasi seluruh kelas repository, menjalankan query pencarian, melakukan insert data tamu baru, dan insert data RSVP baru secara simultan dalam satu transaksi lokal D1. Jika seluruhnya sukses, endpoint akan membalas dengan status `"success"` dan payload data uji cobanya.
