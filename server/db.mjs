// SQLite database (Node built-in node:sqlite). File lives outside /dist and is never served.
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = process.env.GULLY_DATA_DIR || path.join(here, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(process.env.GULLY_DB || path.join(DATA_DIR, 'gully.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('super_admin','manager','staff')),
  active INTEGER NOT NULL DEFAULT 1, failed_logins INTEGER NOT NULL DEFAULT 0, locked_until INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), last_login TEXT
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  csrf TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL, ip TEXT, ua TEXT
);
CREATE TABLE IF NOT EXISTS password_resets (
  token_hash TEXT PRIMARY KEY, admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  group_key TEXT NOT NULL CHECK (group_key IN ('men','kids','accessories')),
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, sku TEXT UNIQUE NOT NULL, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '', category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  brand TEXT NOT NULL DEFAULT '', images TEXT NOT NULL DEFAULT '[]', main_image INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL CHECK (price >= 0), sale_price INTEGER CHECK (sale_price IS NULL OR sale_price >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5, tags TEXT NOT NULL DEFAULT '[]',
  fabric TEXT NOT NULL DEFAULT '', fit TEXT NOT NULL DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0, new_arrival INTEGER NOT NULL DEFAULT 0, best_seller INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  seo_title TEXT NOT NULL DEFAULT '', seo_description TEXT NOT NULL DEFAULT '', image_alt TEXT NOT NULL DEFAULT '',
  rating REAL NOT NULL DEFAULT 0, review_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS variants (
  id INTEGER PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL, color_name TEXT NOT NULL, color_hex TEXT NOT NULL DEFAULT '#000000',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0), UNIQUE (product_id, size, color_name)
);
CREATE TABLE IF NOT EXISTS inventory_log (
  id INTEGER PRIMARY KEY, variant_id INTEGER, product_id TEXT, delta INTEGER NOT NULL, stock_after INTEGER NOT NULL,
  reason TEXT NOT NULL, order_id INTEGER, admin_id INTEGER, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY, number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','returned','refunded')),
  customer_name TEXT NOT NULL, mobile TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', address TEXT NOT NULL,
  landmark TEXT NOT NULL DEFAULT '', city TEXT NOT NULL, state TEXT NOT NULL, pin_code TEXT NOT NULL, customer_notes TEXT NOT NULL DEFAULT '',
  subtotal INTEGER NOT NULL, discount INTEGER NOT NULL DEFAULT 0, delivery INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL,
  coupon_code TEXT, payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded')),
  stock_committed INTEGER NOT NULL DEFAULT 0, internal_notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT, variant_id INTEGER, name TEXT NOT NULL, sku TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL, color TEXT NOT NULL, unit_price INTEGER NOT NULL, qty INTEGER NOT NULL CHECK (qty > 0), image TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS order_history (
  id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT, to_status TEXT NOT NULL, admin_id INTEGER, admin_name TEXT, note TEXT NOT NULL DEFAULT '',
  at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS offers (
  id INTEGER PRIMARY KEY, code TEXT NOT NULL DEFAULT '', title TEXT NOT NULL, subtitle TEXT NOT NULL DEFAULT '',
  badge TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', link TEXT NOT NULL DEFAULT '',
  terms TEXT NOT NULL DEFAULT '[]', placements TEXT NOT NULL DEFAULT '["offers_page"]',
  target_group TEXT NOT NULL DEFAULT 'all', min_order INTEGER NOT NULL DEFAULT 0,
  starts_at TEXT, ends_at TEXT, active INTEGER NOT NULL DEFAULT 1, sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL, type TEXT NOT NULL CHECK (type IN ('percent','fixed')),
  value INTEGER NOT NULL CHECK (value > 0), min_order INTEGER NOT NULL DEFAULT 0,
  starts_at TEXT, expires_at TEXT, usage_limit INTEGER, used_count INTEGER NOT NULL DEFAULT 0,
  scope_type TEXT NOT NULL DEFAULT 'all' CHECK (scope_type IN ('all','group','category','product')),
  scope_ids TEXT NOT NULL DEFAULT '[]', active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS marquee_messages (
  id INTEGER PRIMARY KEY, text TEXT NOT NULL, link TEXT NOT NULL DEFAULT '', badge TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
  read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY, admin_id INTEGER, admin_email TEXT, action TEXT NOT NULL, entity TEXT, detail TEXT,
  ip TEXT, at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS customer_profiles (
  mobile TEXT PRIMARY KEY, notes TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','blocked')),
  marketing_consent INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_variants_product ON variants(product_id);
`);

/** Run fn inside an IMMEDIATE transaction (takes the write lock up front → no oversell races). */
export function tx(fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const r = fn(); db.exec('COMMIT'); return r; }
  catch (e) { try { db.exec('ROLLBACK'); } catch {} throw e; }
}

export const getSetting = (key, fallback = null) => {
  const r = db.prepare('SELECT value FROM settings WHERE key=?').get(key);
  return r ? JSON.parse(r.value) : fallback;
};
export const setSetting = (key, value) =>
  db.prepare(`INSERT INTO settings(key,value,updated_at) VALUES(?,?,datetime('now'))
              ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')`).run(key, JSON.stringify(value));

export const notify = (type, title, body = '') =>
  db.prepare('INSERT INTO notifications(type,title,body) VALUES(?,?,?)').run(type, title, body);
