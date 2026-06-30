-- Migration: 0002_auth_schema.sql
-- Description: Add authentication tables for self-hosted D1 auth

-- 1. Table: auth_users (Credential storage)
CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hash
  email_verified INTEGER CHECK(email_verified IN (0, 1)) DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. Table: sessions (HttpOnly session tracking)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, -- hashed session token
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  expired_at TEXT NOT NULL, -- ISO Date String
  user_agent TEXT,
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 3. Table: auth_tokens (Email verification / password resets)
CREATE TABLE IF NOT EXISTS auth_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  type TEXT CHECK(type IN ('email_verification', 'password_reset')) NOT NULL,
  token_hash TEXT NOT NULL,
  expired_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_hash ON auth_tokens(token_hash);
