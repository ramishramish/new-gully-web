import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { db, getSetting, setSetting } from '../db.mjs';
import { route, bad, HttpError, parseCookies } from '../http.mjs';
import * as A from '../auth.mjs';
import { safeUrl, str, int, oneOf, bool } from '../validate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const UPLOAD_DIR = process.env.GULLY_UPLOADS || path.join(root, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const cookie = (token, maxAge) => `${A.COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE ? '; Secure' : ''}`;
const me = (a) => ({ id: a.id, email: a.email, name: a.name, role: a.role, permissions: A.ROLE_PERMS[a.role] });

// ------------------------------------------------------------ auth
route('POST', '/api/admin/auth/login', { public: true, limit: { key: 'login', max: 15, windowMs: 15 * 60_000 } }, (ctx) => {
  const r = A.authenticate(ctx.body.email, ctx.body.password);
  if (!r.ok) {
    A.audit(null, 'login_failed', 'admin', String(ctx.body.email || '').slice(0, 100), ctx.ip);
    if (r.lockedNow) db.prepare(`INSERT INTO notifications(type,title,body) VALUES('security','Admin account locked',?)`).run(`Too many failed logins for ${r.admin.email}.`);
    throw new HttpError(401, r.locked ? 'Account temporarily locked. Try again in 15 minutes.' : 'Invalid email or password.');
  }
  const { token, csrf } = A.createSession(r.admin.id, ctx.ip, ctx.req.headers['user-agent']);
  ctx.setCookie.push(cookie(token, 12 * 3600));
  A.audit(r.admin, 'login', 'admin', '', ctx.ip);
  return { admin: me(r.admin), csrf };
});
route('POST', '/api/admin/auth/logout', {}, (ctx) => {
  A.destroySession(ctx.sessionToken); ctx.setCookie.push(cookie('', 0)); A.audit(ctx.admin, 'logout', 'admin', '', ctx.ip);
});
route('GET', '/api/admin/me', {}, (ctx) => ({ admin: me(ctx.admin), csrf: ctx.csrf }));

route('POST', '/api/admin/auth/forgot', { public: true, limit: { key: 'forgot', max: 5, windowMs: 60 * 60_000 } }, (ctx) => {
  const a = db.prepare('SELECT * FROM admins WHERE email=? AND active=1').get(String(ctx.body.email || '').trim().toLowerCase());
  if (a) {
    const token = A.createResetToken(a.id);
    const base = process.env.PUBLIC_URL || `http://${ctx.req.headers.host}`;
    // No email provider is configured by default. Deliver via server log until SMTP/email is wired in.
    console.log(`\n[PASSWORD RESET] ${a.email}\n  ${base}/admin/reset?token=${token}\n  (valid 1 hour, single use)\n`);
    A.audit(a, 'password_reset_requested', 'admin', '', ctx.ip);
  }
  return { ok: true, message: 'If that email belongs to an administrator, a reset link has been issued.' };
});
route('POST', '/api/admin/auth/reset', { public: true, limit: { key: 'reset', max: 10, windowMs: 60 * 60_000 } }, (ctx) => {
  const problem = A.passwordProblem(ctx.body.password); if (problem) throw bad(problem);
  const id = A.consumeResetToken(ctx.body.token);
  if (!id) throw bad('This reset link is invalid or has expired.');
  db.prepare('UPDATE admins SET password_hash=?, failed_logins=0, locked_until=NULL WHERE id=?').run(A.hashPassword(ctx.body.password), id);
  A.destroyAllSessions(id); A.audit({ id }, 'password_reset_completed', 'admin', '', ctx.ip);
});
route('POST', '/api/admin/auth/change-password', {}, (ctx) => {
  const a = db.prepare('SELECT * FROM admins WHERE id=?').get(ctx.admin.id);
  if (!A.verifyPassword(String(ctx.body.current || ''), a.password_hash)) throw bad('Current password is incorrect.');
  const problem = A.passwordProblem(ctx.body.password); if (problem) throw bad(problem);
  db.prepare('UPDATE admins SET password_hash=? WHERE id=?').run(A.hashPassword(ctx.body.password), a.id);
  db.prepare('DELETE FROM sessions WHERE admin_id=? AND token_hash<>?').run(a.id, crypto.createHash('sha256').update(ctx.sessionToken).digest('hex'));
  A.audit(ctx.admin, 'password_changed', 'admin', '', ctx.ip);
});

// ------------------------------------------------------------ administrators (Super Admin only)
const ROLES = ['super_admin', 'manager', 'staff'];
route('GET', '/api/admin/admins', { perm: 'admins.manage' }, () => ({ admins: db.prepare('SELECT id,email,name,role,active,last_login,created_at FROM admins ORDER BY id').all() }));
route('POST', '/api/admin/admins', { perm: 'admins.manage' }, (ctx) => {
  const email = str(ctx.body.email, 120, { req: true, label: 'Email' }).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw bad('Invalid email.');
  const problem = A.passwordProblem(ctx.body.password); if (problem) throw bad(problem);
  const r = db.prepare('INSERT INTO admins(email,name,password_hash,role) VALUES(?,?,?,?)')
    .run(email, str(ctx.body.name, 80, { req: true, label: 'Name' }), A.hashPassword(ctx.body.password), oneOf(ctx.body.role, ROLES, 'Role'));
  A.audit(ctx.admin, 'admin_created', 'admin', `${email} (${ctx.body.role})`, ctx.ip);
  return { id: Number(r.lastInsertRowid) };
});
route('PATCH', '/api/admin/admins/:id', { perm: 'admins.manage' }, (ctx) => {
  const id = Number(ctx.params.id), t = db.prepare('SELECT * FROM admins WHERE id=?').get(id);
  if (!t) throw new HttpError(404, 'Administrator not found');
  const role = ctx.body.role !== undefined ? oneOf(ctx.body.role, ROLES, 'Role') : t.role;
  const active = ctx.body.active !== undefined ? bool(ctx.body.active) : t.active;
  const supers = db.prepare(`SELECT COUNT(*) c FROM admins WHERE role='super_admin' AND active=1 AND id<>?`).get(id).c;
  if (t.role === 'super_admin' && (role !== 'super_admin' || !active) && supers === 0) throw bad('You cannot demote or disable the last active Super Admin.');
  if (id === ctx.admin.id && !active) throw bad('You cannot disable your own account.');
  db.prepare('UPDATE admins SET role=?, active=?, name=? WHERE id=?').run(role, active, str(ctx.body.name ?? t.name, 80, { req: true, label: 'Name' }), id);
  if (ctx.body.password) { const p = A.passwordProblem(ctx.body.password); if (p) throw bad(p); db.prepare('UPDATE admins SET password_hash=? WHERE id=?').run(A.hashPassword(ctx.body.password), id); }
  if (!active || role !== t.role || ctx.body.password) A.destroyAllSessions(id);
  A.audit(ctx.admin, 'admin_updated', 'admin', `${t.email} → role=${role} active=${active}`, ctx.ip);
});
route('GET', '/api/admin/audit', { perm: 'admins.manage' }, () => ({ log: db.prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT 200').all() }));

// ------------------------------------------------------------ uploads (validated by file signature, never trusting extension/MIME)
const SIGS = [['jpg', [0xff, 0xd8, 0xff]], ['png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]], ['gif', [0x47, 0x49, 0x46, 0x38]]];
function sniff(buf) {
  for (const [ext, sig] of SIGS) if (sig.every((b, i) => buf[i] === b)) return ext;
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}
route('POST', '/api/admin/uploads', { perm: 'products.write', maxBody: 8_000_000 }, (ctx) => {
  const raw = String(ctx.body.data || '').replace(/^data:[^;]+;base64,/, '');
  const buf = Buffer.from(raw, 'base64');
  if (!buf.length) throw bad('No image data received.');
  if (buf.length > 5 * 1024 * 1024) throw bad('Image is larger than 5 MB.');
  const ext = sniff(buf);
  if (!ext) throw bad('Only JPG, PNG, WebP or GIF images are allowed.');
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  A.audit(ctx.admin, 'upload', 'image', name, ctx.ip);
  return { url: `/uploads/${name}` };
});

// ------------------------------------------------------------ settings
const STORE_STR = ['name','tagline','location','phone','whatsapp','email','hoursWeekdays','hoursWeekends','hoursNote','mapsLabel','deliveryEstimate','supportInfo'];
const STORE_URL = ['mapsSearchUrl','mapsDirectionsUrl','instagram','facebook','youtube','x'];
route('GET', '/api/admin/settings/store', { perm: 'settings.write' }, () => ({ store: getSetting('store', {}) }));
route('PUT', '/api/admin/settings/store', { perm: 'settings.write' }, (ctx) => {
  const cur = getSetting('store', {}), b = ctx.body, next = { ...cur };
  for (const k of STORE_STR) if (b[k] !== undefined) next[k] = str(b[k], 300, { label: k });
  for (const k of STORE_URL) if (b[k] !== undefined) next[k] = safeUrl(b[k], { label: k });
  if (b.mapsEmbedUrl !== undefined) {
    const u = safeUrl(b.mapsEmbedUrl, { label: 'Maps embed URL' });
    if (u && !/^https:\/\/(www\.)?(google\.com\/maps|maps\.google\.com)\//.test(u)) throw bad('Maps embed must be a Google Maps https URL.');
    next.mapsEmbedUrl = u;
  }
  if (b.whatsapp !== undefined && next.whatsapp && !/^\d{10,15}$/.test(String(next.whatsapp).replace(/[\s+-]/g, ''))) throw bad('WhatsApp number must be 10–15 digits (with country code).');
  if (b.freeDeliveryThreshold !== undefined) next.freeDeliveryThreshold = int(b.freeDeliveryThreshold, { max: 1_000_000, label: 'Free delivery threshold' });
  if (b.deliveryCharge !== undefined) next.deliveryCharge = int(b.deliveryCharge, { max: 100_000, label: 'Delivery charge' });
  if (b.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(next.email)) throw bad('Invalid contact email.');
  setSetting('store', next); A.audit(ctx.admin, 'settings_updated', 'store', Object.keys(b).join(','), ctx.ip);
  return { store: next };
});

// ------------------------------------------------------------ notifications
route('GET', '/api/admin/notifications', { perm: 'notifications.read' }, () => ({
  notifications: db.prepare('SELECT * FROM notifications ORDER BY id DESC LIMIT 100').all(),
  unread: db.prepare('SELECT COUNT(*) c FROM notifications WHERE read=0').get().c }));
route('POST', '/api/admin/notifications/read', { perm: 'notifications.read' }, (ctx) => {
  if (ctx.body.id) db.prepare('UPDATE notifications SET read=1 WHERE id=?').run(Number(ctx.body.id)); else db.exec('UPDATE notifications SET read=1');
});
