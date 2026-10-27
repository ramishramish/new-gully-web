import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, getSetting } from './db.mjs';
import { handleApi, serveFile, SECURITY_HEADERS } from './http.mjs';
import { purgeExpired } from './auth.mjs';
import { seedIfEmpty } from './seed.mjs';
import './routes/public.mjs';
import { UPLOAD_DIR } from './routes/admin-core.mjs';
import './routes/admin-shop.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(root, 'dist');
const PORT = Number(process.env.PORT || 8080);
seedIfEmpty();
setInterval(purgeExpired, 10 * 60_000).unref();

const baseUrl = (req) => process.env.PUBLIC_URL || `http://${req.headers.host}`;
const xmlEsc = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

function sendText(res, type, body) { res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=300', ...SECURITY_HEADERS }); res.end(body); }

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }

    if (url.pathname === '/robots.txt')
      return sendText(res, 'text/plain; charset=utf-8', `User-agent: *\nDisallow: /admin\nDisallow: /api/\nDisallow: /cart\nDisallow: /checkout\nAllow: /\n\nSitemap: ${baseUrl(req)}/sitemap.xml\n`);
    if (url.pathname === '/sitemap.xml') {
      const b = baseUrl(req);
      const urls = ['/', '/mens', '/kids', '/offers', '/about', '/contact', ...db.prepare("SELECT slug FROM products WHERE status='published'").all().map((p) => `/product/${p.slug}`)];
      return sendText(res, 'application/xml; charset=utf-8', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${xmlEsc(b + u)}</loc></url>`).join('\n')}\n</urlset>`);
    }
    if (url.pathname.startsWith('/uploads/')) {
      const f = path.join(UPLOAD_DIR, path.basename(decodeURIComponent(url.pathname)));
      if (fs.existsSync(f) && fs.statSync(f).isFile()) return serveFile(res, f, { 'Cache-Control': 'public, max-age=31536000, immutable' });
      res.writeHead(404); return res.end();
    }
    // static build + SPA fallback (client router handles /admin/* too; data is protected server-side, not by hiding the route)
    let file = path.join(DIST, path.normalize(url.pathname).replace(/^(\.\.[/\\])+/, ''));
    if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return serveFile(res, file, { 'Cache-Control': url.pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache' });
    if (path.extname(url.pathname)) { res.writeHead(404); return res.end(); }
    return serveFile(res, path.join(DIST, 'index.html'), { 'Cache-Control': 'no-cache' });
  } catch (e) { console.error(e); res.writeHead(500); res.end('Server error'); }
});
server.listen(PORT, () => console.log(`NEW GULLY running on http://localhost:${PORT}  (admin: /admin)`));
