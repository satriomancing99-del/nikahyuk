// scripts/migration/transform.cjs
// Translates PostgreSQL data structures to SQLite-compatible types.
// Masks sensitive data (emails, phones) in console logs.

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

// Safety verification: Check if raw data exists
if (!fs.existsSync(dataDir)) {
  console.error("Error: Folder data ekspor tidak ditemukan. Silakan jalankan export.cjs terlebih dahulu.");
  process.exit(1);
}

// Masking helpers for safety & logs
function maskEmail(email) {
  if (!email) return email;
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

function maskPhone(phone) {
  if (!phone) return phone;
  if (phone.length <= 6) return '***';
  return `${phone.substring(0, 4)}***${phone.substring(phone.length - 4)}`;
}

const TABLES = [
  'profiles',
  'packages',
  'templates',
  'invitations',
  'events',
  'guests',
  'rsvps',
  'wishes',
  'gifts',
  'media',
  'checkins',
  'promos',
  'transactions',
  'music_library',
  'system_settings'
];

function transformRow(table, row) {
  const newRow = { ...row };

  // 1. Transform booleans (true/false -> 1/0)
  for (const key in newRow) {
    if (typeof newRow[key] === 'boolean') {
      newRow[key] = newRow[key] ? 1 : 0;
    }
  }

  // 2. Transform JSON/JSONB fields (object/array -> JSON string)
  if (table === 'packages' && typeof newRow.features === 'object' && newRow.features !== null) {
    newRow.features = JSON.stringify(newRow.features);
  }
  if (table === 'system_settings' && typeof newRow.value === 'object' && newRow.value !== null) {
    newRow.value = JSON.stringify(newRow.value);
  }

  // Log sample data securely
  if (Math.random() < 0.05) { // 5% chance of log for diagnostic sampling
    if (table === 'profiles') {
      console.log(`[Diagnostic Log] Profile ID: ${row.id}, Email: ${maskEmail(row.email)}, Phone: ${maskPhone(row.phone)}`);
    } else if (table === 'guests') {
      console.log(`[Diagnostic Log] Guest ID: ${row.id}, Name: ${row.name}, Phone: ${maskPhone(row.phone)}, Code: ${row.guest_code}`);
    }
  }

  return newRow;
}

function runTransform() {
  console.log("=== MEMULAI TRANSFORMASI DATA KELUARAN ===");
  
  for (const table of TABLES) {
    const rawPath = path.join(dataDir, `${table}.json`);
    if (!fs.existsSync(rawPath)) {
      console.log(`Peringatan: File ${table}.json tidak ditemukan, melompati...`);
      continue;
    }

    try {
      console.log(`Mentransformasi data "${table}"...`);
      const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));
      
      const transformedData = rawData.map(row => transformRow(table, row));
      
      const transPath = path.join(dataDir, `${table}_transformed.json`);
      fs.writeFileSync(transPath, JSON.stringify(transformedData, null, 2), 'utf-8');
      
      console.log(`Tabel "${table}" berhasil ditransformasikan.`);
    } catch (error) {
      console.error(`Gagal mentransformasi tabel ${table}:`, error.message || error);
    }
  }
  
  console.log("\n=== TRANSFORMASI DATA SELESAI ===");
  console.log(`Semua berkas data hasil transformasi tersimpan di: ${dataDir}`);
}

runTransform();
