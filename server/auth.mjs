import crypto from 'node:crypto';
import { db } from './db.mjs';

// ---------- password hashing (scrypt, per-user salt, constant-time compare) ----------
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$${salt.toString('hex')}$${key.toString('hex')}`;
}
export function verifyPassword(pw, stored) {
  try {
    const [, N, saltHex, keyHex] = stored.split('$');
    const key = crypto.scryptSync(pw, Buffer.from(saltHex, 'hex'), 64, { N: Number(N), r: 8, p: 1 });
    return crypto.timingSafeEqual(key, Buffer.from(keyHex, 'hex'));
  } catch { return false; }
}
// A fixed dummy hash so login timing doesn't reveal whether an email exists.
const DUMMY = hashPassword('dummy-password-for-timing');
export function passwordProblem(pw) {
  if (typeof pw !== 'string' || pw.length < 10) return 'Password must be at least 10 characters.';
  if (pw.length > 200) return 'Password is too long.';
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) return 'Password needs upper-case, lower-case and a number.';
  return null;
}

// ---------- RBAC ----------
const ALL = ['products.read','products.write','products.delete','inventory.write','orders.read','orders.update',
  'orders.cancel_refund','offers.write','customers.read','customers.export','content.write','settings.write',
  'analytics.read','reports.export','admins.manage','notifications.read'];
export const ROLE_PERMS = {
  super_admin: ALL,
  manager: ['products.read','products.write','products.delete','inventory.write','orders.read','orders.update',
    'orders.cancel_refund','offers.write','customers.read','content.write','analytics.read','reports.export','notifications.read'],
  staff: ['products.read','inventory.write','orders.read','orders.update','notifications.read'],
};
export const can = (admin, perm) => !!admin && ROLE_PERMS[admin.role]?.includes(perm);

// ---------- sessions ----------
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const IDLE_MS = 2 * 60 * 60 * 1000;       // 2h sliding
const ABSOLUTE_MS = 12 * 60 * 60 * 1000;  // 12h hard cap
export const COOKIE = 'gully_admin';

export function createSession(adminId, ip, ua) {
  const token = crypto.randomBytes(32).toString('base64url');
  const csrf = crypto.randomBytes(24).toString('base64url');
  const now = Date.now();
  db.prepare('INSERT INTO sessions(token_hash,admin_id,csrf,expires_at,created_at,ip,ua) VALUES(?,?,?,?,?,?,?)')
    .run(sha(token), adminId, csrf, now + IDLE_MS, now, ip, (ua || '').slice(0, 200));
  return { token, csrf };
}
export function getSession(token) {
  if (!token) return null;
  const s = db.prepare(`SELECT s.*, a.email, a.name, a.role, a.active FROM sessions s JOIN admins a ON a.id=s.admin_id WHERE s.token_hash=?`).get(sha(token));
  if (!s) return null;
  const now = Date.now();
  if (!s.active || s.expires_at < now || s.created_at + ABSOLUTE_MS < now) { destroySession(token); return null; }
  db.prepare('UPDATE sessions SET expires_at=? WHERE token_hash=?').run(Math.min(now + IDLE_MS, s.created_at + ABSOLUTE_MS), sha(token));
  return { csrf: s.csrf, admin: { id: s.admin_id, email: s.email, name: s.name, role: s.role } };
}
export const destroySession = (token) => token && db.prepare('DELETE FROM sessions WHERE token_hash=?').run(sha(token));
export const destroyAllSessions = (adminId) => db.prepare('DELETE FROM sessions WHERE admin_id=?').run(adminId);
export const purgeExpired = () => { db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now()); db.prepare('DELETE FROM password_resets WHERE expires_at < ?').run(Date.now()); };

export function authenticate(email, password) {
  const a = db.prepare('SELECT * FROM admins WHERE email=?').get(String(email || '').trim().toLowerCase());
  if (!a) { verifyPassword(password || '', DUMMY); return { ok: false }; }
  if (a.locked_until && a.locked_until > Date.now()) return { ok: false, locked: true };
  const good = verifyPassword(password || '', a.password_hash);
  if (!good || !a.active) {
    const fails = a.failed_logins + 1;
    db.prepare('UPDATE admins SET failed_logins=?, locked_until=? WHERE id=?').run(fails >= 5 ? 0 : fails, fails >= 5 ? Date.now() + 15 * 60 * 1000 : null, a.id);
    return { ok: false, lockedNow: fails >= 5, admin: a };
  }
  db.prepare(`UPDATE admins SET failed_logins=0, locked_until=NULL, last_login=datetime('now') WHERE id=?`).run(a.id);
  return { ok: true, admin: a };
}

// ---------- simple in-memory rate limiter ----------
const buckets = new Map();
export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const b = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (b.length >= max) { buckets.set(key, b); return false; }
  b.push(now); buckets.set(key, b); return true;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of buckets) if (!v.some((t) => now - t < 3600e3)) buckets.delete(k); }, 600e3).unref();

export function createResetToken(adminId) {
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('DELETE FROM password_resets WHERE admin_id=?').run(adminId);
  db.prepare('INSERT INTO password_resets(token_hash,admin_id,expires_at) VALUES(?,?,?)').run(sha(token), adminId, Date.now() + 60 * 60 * 1000);
  return token;
}
export function consumeResetToken(token) {
  const r = db.prepare('SELECT * FROM password_resets WHERE token_hash=? AND used=0 AND expires_at>?').get(sha(String(token || '')), Date.now());
  if (!r) return null;
  db.prepare('UPDATE password_resets SET used=1 WHERE token_hash=?').run(r.token_hash);
  return r.admin_id;
}
export const audit = (admin, action, entity = '', detail = '', ip = '') =>
  db.prepare('INSERT INTO audit_log(admin_id,admin_email,action,entity,detail,ip) VALUES(?,?,?,?,?,?)')
    .run(admin?.id ?? null, admin?.email ?? null, action, entity, typeof detail === 'string' ? detail : JSON.stringify(detail), ip);
