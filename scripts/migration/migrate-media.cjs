// scripts/migration/migrate-media.cjs
// Automated media migration from Supabase Storage to Cloudflare R2 via Worker API.
// Updates URL references in D1 (local or remote).
// Usage: node scripts/migration/migrate-media.cjs [--remote]

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

const isRemote = process.argv.includes('--remote');
const targetDb = isRemote ? 'remote' : 'local';
const wranglerFlags = isRemote ? '--remote' : '--local';

// Setup Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Error: Silakan siapkan variabel lingkungan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env");
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

// Setup Worker API details
const workerApiUrl = process.env.VITE_CLOUDFLARE_WORKER_API_URL || 'http://localhost:8787';
const appSecret = process.env.VITE_CLOUDFLARE_WORKER_SECRET || 'nikahyuksecretprod2026';

console.log(`=== MEMULAI MIGRASI MEDIA KE CLOUDFLARE R2 (${targetDb.toUpperCase()}) ===`);
console.log(`Worker API URL: ${workerApiUrl}`);

// Helper to run query in D1
function executeD1Query(query) {
  try {
    const escapedQuery = query.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const cmd = `npx wrangler d1 execute nikah-yuk ${wranglerFlags} --json -c worker/wrangler.toml --command="${escapedQuery}"`;
    const output = execSync(cmd, { env: { ...process.env, CI: 'true' }, encoding: 'utf-8' });
    const jsonOutput = JSON.parse(output.trim());
    return jsonOutput[0]?.results || [];
  } catch (error) {
    console.error(`Gagal menjalankan D1 query: ${query}`);
    console.error(error.message);
    return [];
  }
}

// Helper to parse Supabase URL to extract Bucket & Path
// Format: https://xxxx.supabase.co/storage/v1/object/public/bucket-name/folder/file.png
function parseSupabaseUrl(urlStr) {
  if (!urlStr || !urlStr.includes('.supabase.co/storage/v1/object/public/')) {
    return null;
  }
  try {
    const url = new URL(urlStr);
    const pathParts = url.pathname.replace('/storage/v1/object/public/', '').split('/');
    const bucket = pathParts[0];
    const filePath = pathParts.slice(1).join('/');
    return { bucket, path: filePath };
  } catch (e) {
    return null;
  }
}

// Helper to upload file buffer to Worker API
async function uploadToR2(bucket, filePath, fileBuffer, mimeType) {
  const targetPath = `${bucket}/${filePath}`;
  const formData = new FormData();
  
  // Convert Buffer to Blob for fetch compatibility
  const blob = new Blob([fileBuffer], { type: mimeType });
  formData.append('file', blob, path.basename(filePath));
  formData.append('path', targetPath);

  const headers = {};
  if (appSecret) {
    headers['X-App-Secret'] = appSecret;
  }

  const res = await fetch(`${workerApiUrl}/api/media/upload`, {
    method: 'POST',
    headers: headers,
    body: formData
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Worker upload failed: ${res.status} - ${errText}`);
  }

  const json = await res.json();
  return json.url;
}

async function migrateUrl(oldUrl) {
  const parsed = parseSupabaseUrl(oldUrl);
  if (!parsed) {
    return null; // Not a Supabase URL, skip
  }

  const { bucket, path: filePath } = parsed;
  console.log(`  - Mengunduh dari Supabase: ${bucket}/${filePath}`);

  // 1. Download from Supabase
  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from(bucket)
    .download(filePath);

  if (downloadError) {
    throw new Error(`Gagal mengunduh berkas ${bucket}/${filePath}: ${downloadError.message}`);
  }

  // 2. Convert Blob to Buffer
  const arrayBuffer = await fileBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 3. Upload to R2 via Worker API
  console.log(`  - Mengunggah ke Cloudflare R2...`);
  const r2Url = await uploadToR2(bucket, filePath, buffer, fileBlob.type);
  console.log(`  - SUKSES R2 URL: ${r2Url}`);
  
  return r2Url;
}

async function startMigration() {
  let migratedCount = 0;

  try {
    // === 1. Migrate templates table (thumbnail_url) ===
    console.log("\n1. Memeriksa tabel 'templates'...");
    const templates = executeD1Query("SELECT id, thumbnail_url FROM templates WHERE thumbnail_url IS NOT NULL");
    for (const t of templates) {
      if (parseSupabaseUrl(t.thumbnail_url)) {
        console.log(`Memindahkan template thumbnail ID: ${t.id}`);
        try {
          const newUrl = await migrateUrl(t.thumbnail_url);
          if (newUrl) {
            executeD1Query(`UPDATE templates SET thumbnail_url = '${newUrl}' WHERE id = '${t.id}'`);
            migratedCount++;
          }
        } catch (e) {
          console.error(`Gagal memindahkan template ${t.id}:`, e.message);
        }
      }
    }

    // === 2. Migrate invitations table (thumbnail_url, music_url) ===
    console.log("\n2. Memeriksa tabel 'invitations'...");
    const invitations = executeD1Query("SELECT id, thumbnail_url, music_url FROM invitations");
    for (const inv of invitations) {
      if (inv.thumbnail_url && parseSupabaseUrl(inv.thumbnail_url)) {
        console.log(`Memindahkan invitation thumbnail ID: ${inv.id}`);
        try {
          const newUrl = await migrateUrl(inv.thumbnail_url);
          if (newUrl) {
            executeD1Query(`UPDATE invitations SET thumbnail_url = '${newUrl}' WHERE id = '${inv.id}'`);
            migratedCount++;
          }
        } catch (e) {
          console.error(`Gagal memindahkan invitation thumbnail ${inv.id}:`, e.message);
        }
      }

      if (inv.music_url && parseSupabaseUrl(inv.music_url)) {
        console.log(`Memindahkan invitation music ID: ${inv.id}`);
        try {
          const newUrl = await migrateUrl(inv.music_url);
          if (newUrl) {
            executeD1Query(`UPDATE invitations SET music_url = '${newUrl}' WHERE id = '${inv.id}'`);
            migratedCount++;
          }
        } catch (e) {
          console.error(`Gagal memindahkan invitation music ${inv.id}:`, e.message);
        }
      }
    }

    // === 3. Migrate media table (url) ===
    console.log("\n3. Memeriksa tabel 'media'...");
    const mediaItems = executeD1Query("SELECT id, url FROM media WHERE url IS NOT NULL");
    for (const m of mediaItems) {
      if (parseSupabaseUrl(m.url)) {
        console.log(`Memindahkan gallery photo ID: ${m.id}`);
        try {
          const newUrl = await migrateUrl(m.url);
          if (newUrl) {
            executeD1Query(`UPDATE media SET url = '${newUrl}' WHERE id = '${m.id}'`);
            migratedCount++;
          }
        } catch (e) {
          console.error(`Gagal memindahkan media ${m.id}:`, e.message);
        }
      }
    }

    // === 4. Migrate transactions table (proof_url) ===
    console.log("\n4. Memeriksa tabel 'transactions'...");
    const transactions = executeD1Query("SELECT id, proof_url FROM transactions WHERE proof_url IS NOT NULL");
    for (const tx of transactions) {
      if (parseSupabaseUrl(tx.proof_url)) {
        console.log(`Memindahkan transaction proof ID: ${tx.id}`);
        try {
          const newUrl = await migrateUrl(tx.proof_url);
          if (newUrl) {
            executeD1Query(`UPDATE transactions SET proof_url = '${newUrl}' WHERE id = '${tx.id}'`);
            migratedCount++;
          }
        } catch (e) {
          console.error(`Gagal memindahkan transaction proof ${tx.id}:`, e.message);
        }
      }
    }

    console.log(`\n=== MIGRASI SELESAI ===`);
    console.log(`Berhasil memindahkan ${migratedCount} file media ke Cloudflare R2.`);

  } catch (error) {
    console.error("Terjadi error saat menjalankan migrasi:", error.message || error);
  }
}

startMigration();
