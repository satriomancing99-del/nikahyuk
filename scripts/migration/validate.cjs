// scripts/migration/validate.cjs
// Validates data counts and relationship constraints between Supabase (JSON files) and Cloudflare D1 (local SQLite)

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dataDir = path.join(__dirname, 'data');

const TABLES = ['profiles', 'invitations', 'guests', 'rsvps'];

function getLocalD1RowCount(table) {
  try {
    // Run wrangler command in non-interactive mode using --json flag to query row count
    const cmd = `npx wrangler d1 execute nikah-yuk --local --json -c worker/wrangler.toml --command="SELECT COUNT(*) AS count FROM ${table}"`;
    const output = execSync(cmd, { env: { ...process.env, CI: 'true' }, encoding: 'utf-8' });
    
    // Parse wrangler json output
    const jsonOutput = JSON.parse(output.trim());
    if (jsonOutput && jsonOutput[0] && jsonOutput[0].results && jsonOutput[0].results[0]) {
      return jsonOutput[0].results[0].count;
    }
    return 0;
  } catch (error) {
    console.error(`Gagal mengambil data baris untuk tabel D1 "${table}":`, error.message);
    return -1;
  }
}

function runValidation() {
  console.log("=== MEMULAI VALIDASI MIGRASI DATA ===");

  let hasErrors = false;

  // 1. Validate Row Counts
  for (const table of TABLES) {
    const transformedPath = path.join(dataDir, `${table}_transformed.json`);
    if (!fs.existsSync(transformedPath)) {
      console.log(`Berkas ${table}_transformed.json tidak ditemukan, melewati validasi jumlah data.`);
      continue;
    }

    const exportedData = JSON.parse(fs.readFileSync(transformedPath, 'utf-8'));
    const expectedCount = exportedData.length;
    const actualCount = getLocalD1RowCount(table);

    if (actualCount === -1) {
      hasErrors = true;
      continue;
    }

    console.log(`Tabel: "${table}"`);
    console.log(`  - Ekspektasi (Supabase JSON): ${expectedCount} baris`);
    console.log(`  - Riil (Local D1 Database)  : ${actualCount} baris`);

    if (expectedCount !== actualCount) {
      console.log(`  [X] PERBEDAAN TERDETEKSI: Jumlah baris data tidak cocok!`);
      hasErrors = true;
    } else {
      console.log(`  [V] Cocok.`);
    }
  }

  // 2. Validate Relationship integrity (sample check)
  console.log("\nMemeriksa sampel hubungan relasi (Profile -> Invitation -> Guest)...");
  try {
    const cmd = `npx wrangler d1 execute nikah-yuk --local --json -c worker/wrangler.toml --command="SELECT p.id as p_id, i.id as i_id, g.id as g_id FROM guests g JOIN invitations i ON g.invitation_id = i.id JOIN profiles p ON i.user_id = p.id LIMIT 1"`;
    const output = execSync(cmd, { env: { ...process.env, CI: 'true' }, encoding: 'utf-8' });
    
    const jsonOutput = JSON.parse(output.trim());
    if (jsonOutput && jsonOutput[0] && jsonOutput[0].results && jsonOutput[0].results[0]) {
      const row = jsonOutput[0].results[0];
      console.log(`  [V] Struktur relasi data lokal D1 valid.`);
      console.log(`      (Sample key check: Profile ID=${row.p_id.substring(0,6)}..., Invitation ID=${row.i_id.substring(0,6)}..., Guest ID=${row.g_id.substring(0,6)}...)`);
    } else {
      console.log("  [X] Peringatan: Tidak ditemukan data relasi yang utuh di database lokal.");
    }
  } catch (error) {
    console.error("  [X] Gagal menjalankan query relasi:", error.message);
    hasErrors = true;
  }

  console.log("\n=== VALIDASI SELESAI ===");
  if (hasErrors) {
    console.log("Hasil: Terdapat perbedaan data atau kendala koneksi database.");
  } else {
    console.log("Hasil: Sukses. Semua jumlah baris data cocok dengan Supabase!");
  }
}

runValidation();
