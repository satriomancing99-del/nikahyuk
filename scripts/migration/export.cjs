// scripts/migration/export.cjs
// Exports all data from Supabase to local JSON files in scripts/migration/data/

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Check configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Error: Silakan siapkan variabel lingkungan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di file .env");
  process.exit(1);
}

// Dynamic import for ES modules or standard require of supabase-js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

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

// Paginated fetch helper
async function fetchAll(table) {
  let allData = [];
  let start = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(start, start + limit - 1);

    if (error) {
      throw new Error(`Gagal mengambil data dari tabel ${table}: ${error.message}`);
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allData.push(...data);
      if (data.length < limit) {
        hasMore = false;
      } else {
        start += limit;
      }
    }
  }
  return allData;
}

async function runExport() {
  console.log("=== MEMULAI EKSPOR DATA DARI SUPABASE ===");
  
  for (const table of TABLES) {
    try {
      console.log(`Mengekspor tabel "${table}"...`);
      const data = await fetchAll(table);
      
      const filePath = path.join(dataDir, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      
      console.log(`Tabel "${table}" berhasil diekspor. Jumlah baris: ${data.length}`);
    } catch (error) {
      console.error(`Gagal mengekspor tabel ${table}:`, error.message || error);
    }
  }
  
  console.log("\n=== EKSPOR DATA SELESAI ===");
  console.log(`Semua berkas data tersimpan di: ${dataDir}`);
}

runExport();
