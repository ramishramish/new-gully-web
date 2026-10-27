import fs from 'node:fs';
import path from 'node:path';
import { COOKIE, getSession, can, rateLimit } from './auth.mjs';

export class HttpError extends Error { constructor(status, message, extra) { super(message); this.status = status; this.extra = extra; } }
export const bad = (m, extra) => new HttpError(400, m, extra);

const routes = [];
/** route(method, '/api/x/:id', { perm?: 'products.write', public?: true, maxBody?: bytes }, handler(ctx)) */
export function route(method, pattern, opts, handler) {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:([a-zA-Z]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  routes.push({ method, re, keys, opts, handler });
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.woff2': 'font/woff2' };

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()', 'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://images.unsplash.com; frame-src https://maps.google.com https://www.google.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};

function parseCookies(h = '') { const o = {}; h.split(';').forEach((p) => { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); }); return o; }

async function readBody(req, max) {
  const chunks = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > max) throw new HttpError(413, 'Request body too large'); chunks.push(c); }
  if (!n) return {};
  if (!/application\/json/i.test(req.headers['content-type'] || '')) throw new HttpError(415, 'Content-Type must be application/json');
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new HttpError(400, 'Invalid JSON'); }
}

export function clientIp(req) { return (process.env.TRUST_PROXY ? String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() : '') || req.socket.remoteAddress || ''; }

export async function handleApi(req, res, url) {
  const send = (status, data, headers = {}) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...SECURITY_HEADERS, ...headers });
    res.end(JSON.stringify(data));
  };
  try {
    for (const r of routes) {
      if (r.method !== req.method) continue;
      const m = r.re.exec(url.pathname); if (!m) continue;
      const params = {}; r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      const ip = clientIp(req);
      const ctx = { req, res, url, params, ip, query: Object.fromEntries(url.searchParams), admin: null, body: {}, setCookie: [], send };
      if (!r.opts.public) {
        const cookies = parseCookies(req.headers.cookie);
        const sess = getSession(cookies[COOKIE]);
        if (!sess) throw new HttpError(401, 'Authentication required');
        if (req.method !== 'GET' && req.headers['x-csrf-token'] !== sess.csrf) throw new HttpError(403, 'Invalid CSRF token');
        ctx.admin = sess.admin; ctx.csrf = sess.csrf; ctx.sessionToken = cookies[COOKIE];
        if (r.opts.perm && !can(ctx.admin, r.opts.perm)) throw new HttpError(403, 'You do not have permission to do this');
      }
      if (r.opts.limit && !rateLimit(`${r.opts.limit.key}:${ip}`, r.opts.limit.max, r.opts.limit.windowMs)) throw new HttpError(429, 'Too many requests. Please try again later.');
      if (req.method !== 'GET' && req.method !== 'DELETE') ctx.body = await readBody(req, r.opts.maxBody || 1_000_000);
      const out = await r.handler(ctx);
      const headers = ctx.setCookie.length ? { 'Set-Cookie': ctx.setCookie } : {};
      if (ctx.raw) { res.writeHead(200, { ...SECURITY_HEADERS, 'Cache-Control': 'no-store', ...ctx.raw.headers, ...headers }); return res.end(ctx.raw.body); }
      return send(200, out ?? { ok: true }, headers);
    }
    throw new HttpError(404, 'Not found');
  } catch (e) {
    if (e instanceof HttpError) return send(e.status, { error: e.message, ...(e.extra || {}) });
    const m = String(e.message);
    if (/UNIQUE constraint/.test(m)) return send(409, { error: 'That value already exists (duplicate).' });
    if (/CHECK constraint|NOT NULL constraint|FOREIGN KEY/.test(m)) return send(400, { error: 'Invalid data.' });
    console.error('[api error]', req.method, url.pathname, e);
    return send(500, { error: 'Internal server error' });
  }
}

export function serveFile(res, file, extra = {}) {
  const ext = path.extname(file).toLowerCase();
  const stat = fs.statSync(file);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': stat.size, ...SECURITY_HEADERS, ...extra });
  fs.createReadStream(file).pipe(res);
}
export { parseCookies };
