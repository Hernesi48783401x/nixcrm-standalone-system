import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'nixcrm.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS resellers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT,
    total_quota INTEGER NOT NULL DEFAULT 0,
    used_quota INTEGER NOT NULL DEFAULT 0,
    days_mode TEXT NOT NULL DEFAULT 'fixed' CHECK(days_mode IN ('fixed', 'range')),
    days_fixed INTEGER,
    days_min INTEGER,
    days_max INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reseller_id INTEGER NOT NULL,
    license_id TEXT NOT NULL UNIQUE,
    student_name TEXT NOT NULL,
    hardware_id TEXT NOT NULL,
    days_validity INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    expires_at INTEGER NOT NULL,
    hash TEXT NOT NULL,
    hmac_signature TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '11.0',
    license_type TEXT NOT NULL DEFAULT 'PRO MAX',
    FOREIGN KEY (reseller_id) REFERENCES resellers(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_resellers_username ON resellers(username);
  CREATE INDEX IF NOT EXISTS idx_licenses_reseller ON licenses(reseller_id);
  CREATE INDEX IF NOT EXISTS idx_licenses_created ON licenses(created_at DESC);
`);

console.log(`[Database] Initialized at ${DB_PATH}`);

export default db;
