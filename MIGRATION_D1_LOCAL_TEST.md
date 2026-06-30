# MIGRATION LOCAL TEST REPORT (Cloudflare D1)
**Project:** NikahYuk! Digital Invitation App
**Role:** Senior Full-Stack Engineer
**Date:** 2026-06-30

Dokumen ini mencatat bukti keberhasilan eksekusi migrasi skema database SQLite D1 secara lokal, pengisian *seed data* dummy, dan pengujian query relasional antara tabel `profiles` (user), `invitations`, dan `guests`.

---

## 1. Eksekusi Migrasi D1 Lokal

*   **Perintah:**
    ```bash
    $env:CI="true"; npx wrangler d1 migrations apply nikah-yuk --local -c worker/wrangler.toml
    ```
*   **Status:** **SUKSES**
*   **Output Console:**
    ```
    Resource location: local 
    Migrations to be applied:
    ┌─────────────────────────┐
    │ name                    │
    ├─────────────────────────┤
    │ 0001_initial_schema.sql │
    └─────────────────────────┘
    ? About to apply 1 migration(s)
    Your database may not be available to serve requests during the migration, continue?
    🤖 Using fallback value in non-interactive context: yes
    🌀 Executing on local database nikah-yuk (bbf0ca71-beaf-417f-b6bb-6f49b48f8638) from ./worker\.wrangler\state\v3\d1:
    🚣 35 commands executed successfully.
    ┌─────────────────────────┬────────┐
    │ name                    │ status │
    ├─────────────────────────┼────────┤
    │ 0001_initial_schema.sql │ ✅     │
    └─────────────────────────┴────────┘
    ```

---

## 2. Pengisian Seed Data Lokal (Dummy Data)

*   **Berkas Seed:** [worker/src/seed.sql](file:///c:/Users/Alif/Downloads/nikahyuk-main/worker/src/seed.sql)
    *   Memasukkan 1 user profil dummy (`Budi Handoko`).
    *   Memasukkan 1 undangan pernikahan dummy (`budi-ani`).
    *   Memasukkan 2 tamu undangan dummy (`Bapak Ahmad`, `Ibu Siti`).
*   **Perintah:**
    ```bash
    $env:CI="true"; npx wrangler d1 execute nikah-yuk --local -c worker/wrangler.toml --file=worker/src/seed.sql
    ```
*   **Status:** **SUKSES**
*   **Output Console:**
    ```
    🌀 Executing on local database nikah-yuk (bbf0ca71-beaf-417f-b6bb-6f49b48f8638) from ./worker\.wrangler\state\v3\d1:
    🚣 3 commands executed successfully.
    [
      { "results": [], "success": true, "meta": { "duration": 1 } },
      { "results": [], "success": true, "meta": { "duration": 1 } },
      { "results": [], "success": true, "meta": { "duration": 0 } }
    ]
    ```

---

## 3. Hasil Pengujian Query Relasional (Select Join)

Untuk membuktikan relasi foreign key dan integritas tabel bekerja dengan baik, dilakukan query SELECT dengan join ketiga tabel.

*   **Perintah:**
    ```bash
    $env:CI="true"; npx wrangler d1 execute nikah-yuk --local -c worker/wrangler.toml --command="SELECT p.name AS user_name, i.slug AS invitation_slug, g.name AS guest_name, g.guest_code, g.rsvp_status FROM guests g JOIN invitations i ON g.invitation_id = i.id JOIN profiles p ON i.user_id = p.id"
    ```
*   **Status:** **SUKSES (DATA COCOK)**
*   **Hasil Query JSON:**
    ```json
    [
      {
        "results": [
          {
            "user_name": "Budi Handoko",
            "invitation_slug": "budi-ani",
            "guest_name": "Bapak Ahmad",
            "guest_code": "BUDIANI-AHMAD",
            "rsvp_status": "not_confirmed"
          },
          {
            "user_name": "Budi Handoko",
            "invitation_slug": "budi-ani",
            "guest_name": "Ibu Siti",
            "guest_code": "BUDIANI-SITI",
            "rsvp_status": "attending"
          }
        ],
        "success": true,
        "meta": {
          "duration": 1
        }
      }
    ]
    ```

---

## 4. Kesimpulan Pengujian Lokal

1. **Struktur Tabel Valid:** Seluruh tabel utama berhasil dibuat tanpa ada error sintaks SQLite.
2. **Relasi Foreign Key Berfungsi:** Hubungan `guests -> invitations -> profiles` terikat dan dapat diproses menggunakan `JOIN` dengan sempurna.
3. **Isolasi Database:** Pengujian berjalan 100% di lingkungan lokal komputer. Tidak ada perubahan atau deployment yang dikirim ke remote Cloudflare D1 (produksi).
