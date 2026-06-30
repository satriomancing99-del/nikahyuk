-- Migration: 0001_initial_schema.sql
-- Description: Initial schema setup for Cloudflare D1 (SQLite)

-- 1. Table: profiles (Users/Profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Clerk UID / Custom Auth UID
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT CHECK(role IN ('super_admin', 'customer')) DEFAULT 'customer',
  active_package_id TEXT, -- Foreign Key resolved to packages(id)
  package_expired_at TEXT, -- ISO Date String
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. Table: packages
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  features TEXT, -- JSON String (SQLite does not have native JSONB)
  active_period INTEGER NOT NULL, -- in days
  status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Resolve profiles -> packages foreign key constraint
-- SQLite supports adding foreign keys during table creation, so we define it in profiles table creation or reference it later.
-- Since packages table is referenced in profiles, we create packages table first, or let SQLite process it (SQLite does not enforce FKs unless enabled).
-- To maintain clean dependency ordering, we define profiles after packages. However, since Clerk user creation can happen before they choose a package,
-- we allow active_package_id to be NULL.

-- 3. Table: templates (Themes)
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT,
  price REAL NOT NULL,
  thumbnail_url TEXT,
  preview_url TEXT,
  status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
  jsx_code TEXT, -- React template code
  created_by TEXT, -- Admin/Contributor ID (profiles(id))
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 4. Table: invitations
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id TEXT REFERENCES templates(id),
  slug TEXT UNIQUE NOT NULL,
  groom_name TEXT,
  bride_name TEXT,
  groom_parent TEXT,
  bride_parent TEXT,
  quote TEXT,
  love_story TEXT,
  music_url TEXT,
  thumbnail_url TEXT,
  status TEXT CHECK(status IN ('draft', 'published', 'expired')) DEFAULT 'draft',
  expired_at TEXT, -- ISO Date String
  greeting_text TEXT, -- WhatsApp greeting message template
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 5. Table: events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  date TEXT, -- YYYY-MM-DD
  start_time TEXT, -- HH:MM
  end_time TEXT,
  location_name TEXT,
  address TEXT,
  google_maps_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 6. Table: guests
CREATE TABLE IF NOT EXISTS guests (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  guest_code TEXT UNIQUE NOT NULL,
  personal_link TEXT,
  qr_code_value TEXT,
  sent_status TEXT CHECK(sent_status IN ('not_sent', 'sent', 'failed')) DEFAULT 'not_sent',
  opened_at TEXT, -- ISO Date String
  rsvp_status TEXT CHECK(rsvp_status IN ('not_confirmed', 'attending', 'declined')) DEFAULT 'not_confirmed',
  checkin_status TEXT CHECK(checkin_status IN ('not_checked_in', 'checked_in')) DEFAULT 'not_checked_in',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 7. Table: rsvps
CREATE TABLE IF NOT EXISTS rsvps (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id TEXT REFERENCES guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  attendance_status TEXT CHECK(attendance_status IN ('attending', 'declined')) NOT NULL,
  total_guest INTEGER DEFAULT 1,
  message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 8. Table: wishes
CREATE TABLE IF NOT EXISTS wishes (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 9. Table: gifts
CREATE TABLE IF NOT EXISTS gifts (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  type TEXT CHECK(type IN ('bank_transfer', 'ewallet', 'gift_address')),
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  ewallet_name TEXT,
  address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 10. Table: media
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  type TEXT CHECK(type IN ('image', 'video')) DEFAULT 'image',
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 11. Table: checkins
CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  checked_in_at TEXT DEFAULT (datetime('now')),
  checked_in_by TEXT REFERENCES profiles(id),
  status TEXT DEFAULT 'checked_in'
);

-- 12. Table: promos
CREATE TABLE IF NOT EXISTS promos (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed')) DEFAULT 'percentage',
  discount_value REAL NOT NULL,
  min_transaction REAL DEFAULT 0,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
  expired_at TEXT, -- ISO Date String
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 13. Table: transactions (Orders/Payments)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id TEXT REFERENCES packages(id),
  invitation_id TEXT REFERENCES invitations(id) ON DELETE SET NULL,
  amount REAL NOT NULL,
  original_amount REAL,
  promo_code TEXT,
  discount_amount REAL DEFAULT 0,
  payment_status TEXT CHECK(payment_status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
  proof_url TEXT,
  activated_at TEXT, -- ISO Date String
  expired_at TEXT, -- ISO Date String
  created_at TEXT DEFAULT (datetime('now'))
);

-- 14. Table: music_library
CREATE TABLE IF NOT EXISTS music_library (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT DEFAULT 'Unknown',
  url TEXT NOT NULL,
  is_private INTEGER CHECK(is_private IN (0, 1)) DEFAULT 0, -- Boolean 0 (false) or 1 (true)
  created_by TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 15. Table: system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL, -- JSON String
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for search optimization, sorting, and relations
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_templates_slug ON templates(slug);
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON invitations(slug);
CREATE INDEX IF NOT EXISTS idx_invitations_user ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON invitations(created_at);
CREATE INDEX IF NOT EXISTS idx_events_invitation ON events(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guests_code ON guests(guest_code);
CREATE INDEX IF NOT EXISTS idx_guests_invitation ON guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation ON rsvps(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at);
CREATE INDEX IF NOT EXISTS idx_wishes_invitation ON wishes(invitation_id);
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at);
CREATE INDEX IF NOT EXISTS idx_gifts_invitation ON gifts(invitation_id);
CREATE INDEX IF NOT EXISTS idx_media_invitation ON media(invitation_id);
CREATE INDEX IF NOT EXISTS idx_checkins_invitation ON checkins(invitation_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_promos_code ON promos(code);
CREATE INDEX IF NOT EXISTS idx_music_library_creator ON music_library(created_by);
