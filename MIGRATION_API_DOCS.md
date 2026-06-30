# API ENDPOINT DOCUMENTATION (Cloudflare Worker D1 backend)
**Project:** NikahYuk! Digital Invitation App
**Role:** Senior Full-Stack Engineer

Dokumen ini mendokumentasikan routing API baru berbasis **Cloudflare Worker** yang mengakses database **Cloudflare D1** untuk data non-auth (Undangan, Tamu, dan RSVP).

---

## 1. Ikhtisar Keamanan & CORS

*   **CORS (Cross-Origin Resource Sharing):**
    Worker memvalidasi header `Origin` pada setiap request dan mengizinkan origin berikut:
    *   `https://nikah-yuk.com`
    *   `https://www.nikah-yuk.com`
    *   Domain lokal: `localhost:3000`, `localhost:3005`, `localhost:5173`.
    *   Domain preview Vercel (`*.vercel.app`).
*   **Otorisasi Admin / Write:**
    Endpoint bertanda **[PROTECTED]** membutuhkan pengiriman header khusus:
    *   Header Key: `X-App-Secret`
    *   Header Value: Harus sama dengan nilai `APP_SECRET` yang dikonfigurasi di Cloudflare Worker (`.dev.vars` lokal atau settings Cloudflare Dashboard).
*   **Endpoint Publik:**
    Endpoint bertanda **[PUBLIC]** dapat diakses bebas tanpa menyertakan header `X-App-Secret`.

---

## 2. Detail Endpoint & Contoh CURL (Testing Lokal)

*Catatan: Pastikan Worker lokal Anda sedang berjalan di `http://localhost:8787` (`npm run dev:worker`) saat menjalankan perintah pengujian di bawah.*

### A. GET /api/health [PUBLIC]
Mengecek status kesehatan server dan koneksi database D1.
*   **Contoh CURL:**
    ```bash
    curl http://localhost:8787/api/health
    ```
*   **Respon Sukses (200):**
    ```json
    {
      "status": "ok",
      "database": "connected",
      "now": "2026-06-30 06:05:00"
    }
    ```

---

### B. GET /api/invitations/:slug [PUBLIC]
Mengambil detail undangan digital publik berdasarkan alamat slug-nya.
*   **Contoh CURL:**
    ```bash
    curl http://localhost:8787/api/invitations/budi-ani
    ```
*   **Respon Sukses (200):**
    ```json
    {
      "id": "invitation_dummy_1",
      "user_id": "user_dummy_1",
      "slug": "budi-ani",
      "groom_name": "Budi Handoko",
      "bride_name": "Ani Lestari",
      "status": "published",
      "created_at": "2026-06-30 06:02:16"
    }
    ```

---

### C. GET /api/users/:userId/invitations [PROTECTED]
Mengambil seluruh undangan milik salah satu user terdaftar (untuk dashboard user).
*   **Contoh CURL:**
    ```bash
    curl -H "X-App-Secret: local-dummy-secret-12345" \
      http://localhost:8787/api/users/user_dummy_1/invitations
    ```
*   **Respon Sukses (200):**
    ```json
    [
      {
        "id": "invitation_dummy_1",
        "user_id": "user_dummy_1",
        "slug": "budi-ani",
        "groom_name": "Budi Handoko",
        "bride_name": "Ani Lestari",
        "status": "published"
      }
    ]
    ```

---

### D. POST /api/invitations [PROTECTED]
Membuat data undangan baru (Draft/Published).
*   **Input Validation:**
    *   `user_id`: wajib diisi (string).
    *   `slug`: wajib diisi (string, hanya huruf kecil, angka, dan strip).
*   **Contoh CURL:**
    ```bash
    curl -X POST \
      -H "Content-Type: application/json" \
      -H "X-App-Secret: local-dummy-secret-12345" \
      -d '{"user_id": "user_dummy_1", "slug": "dono-dini", "groom_name": "Dono", "bride_name": "Dini", "status": "draft"}' \
      http://localhost:8787/api/invitations
    ```
*   **Respon Sukses (201):**
    ```json
    {
      "id": "c1a67c4f-c085-45c1-92ab-41c6f932e65c",
      "user_id": "user_dummy_1",
      "slug": "dono-dini",
      "groom_name": "Dono",
      "bride_name": "Dini",
      "status": "draft",
      "created_at": "2026-06-30 06:05:40"
    }
    ```

---

### E. GET /api/invitations/:invitationId/guests [PROTECTED]
Mengambil semua data tamu undangan milik satu undangan digital tertentu (untuk dashboard pengelola tamu).
*   **Contoh CURL:**
    ```bash
    curl -H "X-App-Secret: local-dummy-secret-12345" \
      http://localhost:8787/api/invitations/invitation_dummy_1/guests
    ```
*   **Respon Sukses (200):**
    ```json
    [
      {
        "id": "guest_dummy_1",
        "invitation_id": "invitation_dummy_1",
        "name": "Bapak Ahmad",
        "guest_code": "BUDIANI-AHMAD",
        "rsvp_status": "not_confirmed"
      }
    ]
    ```

---

### F. POST /api/invitations/:invitationId/guests [PROTECTED]
Menambahkan tamu undangan baru.
*   **Input Validation:**
    *   `name`: wajib diisi (string tidak kosong).
    *   `guest_code`: wajib diisi (string).
*   **Contoh CURL:**
    ```bash
    curl -X POST \
      -H "Content-Type: application/json" \
      -H "X-App-Secret: local-dummy-secret-12345" \
      -d '{"name": "Bapak Doni Pratama", "guest_code": "BUDIANI-DONIP"}' \
      http://localhost:8787/api/invitations/invitation_dummy_1/guests
    ```

---

### G. POST /api/rsvp [PUBLIC]
Mengirimkan konfirmasi kehadiran RSVP oleh tamu undangan secara publik (dari halaman undangan).
*   **Input Validation:**
    *   `invitation_id`: wajib diisi (string).
    *   `guest_name`: wajib diisi (string).
    *   `attendance_status`: wajib diisi (harus bernilai `'attending'` atau `'declined'`).
*   **Contoh CURL:**
    ```bash
    curl -X POST \
      -H "Content-Type: application/json" \
      -d '{"invitation_id": "invitation_dummy_1", "guest_name": "Keluarga Handoyo", "attendance_status": "attending", "total_guest": 3, "message": "Selamat menempuh hidup baru!"}' \
      http://localhost:8787/api/rsvp
    ```
*   **Respon Sukses (201):**
    ```json
    {
      "id": "f5b6c7a8-1234-45c1-92ab-a1b2c3d4e5f6",
      "invitation_id": "invitation_dummy_1",
      "guest_name": "Keluarga Handoyo",
      "attendance_status": "attending",
      "total_guest": 3,
      "message": "Selamat menempuh hidup baru!",
      "created_at": "2026-06-30 06:05:45"
    }
    ```
