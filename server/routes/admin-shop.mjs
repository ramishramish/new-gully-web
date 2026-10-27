import { randomBytes } from 'node:crypto';
import { db, tx } from '../db.mjs';
import { route, bad, HttpError } from '../http.mjs';
import { audit, can } from '../auth.mjs';
import { adjustStock, toPublicProduct } from '../catalog.mjs';
import { safeUrl, str, int, bool, dateOrNull, oneOf } from '../validate.mjs';

const J = (s, d = []) => { try { return JSON.parse(s); } catch { return d; } };
const all = (sql, ...a) => db.prepare(sql).all(...a);
const one = (sql, ...a) => db.prepare(sql).get(...a);
const slugify = (s) => String(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'item';
const csvCell = (v) => { v = v == null ? '' : String(v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };
const toCsv = (rows) => rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
const csvRes = (ctx, name, rows) => { ctx.raw = { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"` }, body: '\ufeff' + toCsv(rows) }; };
function parseCsv(text) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some((x) => x !== '')) rows.push(row); row = []; }
    else cur += c;
  }
  row.push(cur); if (row.some((x) => x !== '')) rows.push(row);
  return rows;
}

// ================================================================= categories
route('GET', '/api/admin/categories', { perm: 'products.read' }, () => ({
  categories: all(`SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id=c.id) AS product_count FROM categories c ORDER BY sort,id`) }));
function catBody(b) {
  return { name: str(b.name, 80, { req: true, label: 'Name' }), group_key: oneOf(b.group, ['men', 'kids', 'accessories'], 'Group'),
    description: str(b.description, 500), image: str(b.image, 500) && safeUrl(b.image, { label: 'Image' }), active: bool(b.active ?? true) };
}
route('POST', '/api/admin/categories', { perm: 'products.write' }, (ctx) => {
  const c = catBody(ctx.body); let slug = slugify(`${c.group_key}-${c.name}`), n = 1;
  while (one('SELECT 1 FROM categories WHERE slug=?', slug)) slug = `${slugify(`${c.group_key}-${c.name}`)}-${++n}`;
  const sort = (one('SELECT MAX(sort) m FROM categories').m ?? -1) + 1;
  const r = db.prepare('INSERT INTO categories(slug,name,group_key,description,image,sort,active) VALUES(?,?,?,?,?,?,?)').run(slug, c.name, c.group_key, c.description, c.image, sort, c.active);
  audit(ctx.admin, 'category_created', 'category', slug, ctx.ip); return { id: Number(r.lastInsertRowid), slug };
});
route('PUT', '/api/admin/categories/reorder', { perm: 'products.write' }, (ctx) => {
  if (!Array.isArray(ctx.body.ids)) throw bad('ids required');
  tx(() => ctx.body.ids.forEach((id, i) => db.prepare('UPDATE categories SET sort=? WHERE id=?').run(i, Number(id))));
});
route('PUT', '/api/admin/categories/:id', { perm: 'products.write' }, (ctx) => {
  // slug is intentionally stable: it is the storefront's filter key, so renaming never breaks existing links/products
  const c = catBody(ctx.body);
  if (!db.prepare('UPDATE categories SET name=?,group_key=?,description=?,image=?,active=? WHERE id=?').run(c.name, c.group_key, c.description, c.image, c.active, Number(ctx.params.id)).changes) throw new HttpError(404, 'Not found');
  audit(ctx.admin, 'category_updated', 'category', ctx.params.id, ctx.ip);
});
route('DELETE', '/api/admin/categories/:id', { perm: 'products.delete' }, (ctx) => {
  const n = one('SELECT COUNT(*) c FROM products WHERE category_id=?', Number(ctx.params.id)).c;
  if (n) throw bad(`${n} product(s) still use this category. Move them first, or deactivate the category instead.`);
  db.prepare('DELETE FROM categories WHERE id=?').run(Number(ctx.params.id)); audit(ctx.admin, 'category_deleted', 'category', ctx.params.id, ctx.ip);
});

// ================================================================= products
const SORTS = { date: 'p.created_at', updated: 'p.updated_at', name: 'p.name COLLATE NOCASE', price: 'COALESCE(p.sale_price,p.price)', stock: 'stock' };
const listSql = `SELECT p.id,p.sku,p.slug,p.name,p.price,p.sale_price,p.status,p.featured,p.new_arrival,p.best_seller,p.images,p.main_image,p.low_stock_threshold,
  p.created_at,p.updated_at,c.name AS category_name, COALESCE((SELECT SUM(stock) FROM variants v WHERE v.product_id=p.id),0) AS stock FROM products p LEFT JOIN categories c ON c.id=p.category_id`;
route('GET', '/api/admin/products', { perm: 'products.read' }, ({ query: q }) => {
  const w = [], a = [];
  if (q.q) { w.push('(p.name LIKE ? OR p.sku LIKE ?)'); a.push(`%${q.q}%`, `%${q.q}%`); }
  if (q.status && q.status !== 'all') { w.push('p.status=?'); a.push(q.status); } else if (!q.status) w.push("p.status<>'archived'");
  if (q.category) { w.push('p.category_id=?'); a.push(Number(q.category)); }
  let rows = all(`${listSql} ${w.length ? 'WHERE ' + w.join(' AND ') : ''} ORDER BY ${SORTS[q.sort] || SORTS.date} ${q.dir === 'asc' ? 'ASC' : 'DESC'}`, ...a);
  if (q.stock === 'out') rows = rows.filter((r) => r.stock === 0);
  else if (q.stock === 'low') rows = rows.filter((r) => r.stock > 0 && r.stock <= r.low_stock_threshold);
  else if (q.stock === 'in') rows = rows.filter((r) => r.stock > r.low_stock_threshold);
  return { products: rows.map((r) => ({ ...r, images: J(r.images) })) };
});
route('GET', '/api/admin/products/export.csv', { perm: 'products.read' }, (ctx) => {
  const rows = all(`SELECT p.*, c.slug cat FROM products p LEFT JOIN categories c ON c.id=p.category_id ORDER BY p.created_at`);
  csvRes(ctx, 'products.csv', [['sku','name','category_slug','price','sale_price','status','sizes','colors','stock_per_variant','description'],
    ...rows.map((p) => { const v = all('SELECT * FROM variants WHERE product_id=?', p.id);
      return [p.sku, p.name, p.cat, p.price, p.sale_price ?? '', p.status, [...new Set(v.map((x) => x.size))].join('|'),
        [...new Map(v.map((x) => [x.color_name, x.color_hex])).entries()].map(([n, h]) => `${n}:${h}`).join('|'), v[0]?.stock ?? 0, p.description]; })]);
});
route('GET', '/api/admin/products/:id', { perm: 'products.read' }, ({ params }) => {
  const p = one('SELECT * FROM products WHERE id=?', params.id); if (!p) throw new HttpError(404, 'Product not found');
  return { product: { ...p, images: J(p.images), tags: J(p.tags) }, variants: all('SELECT * FROM variants WHERE product_id=? ORDER BY id', p.id),
    preview: toPublicProduct(p) };
});

function readProduct(b, existing) {
  const price = int(b.price, { max: 1_000_000, label: 'Price' });
  const sale = b.salePrice === null || b.salePrice === '' || b.salePrice === undefined ? null : int(b.salePrice, { max: 1_000_000, label: 'Sale price' });
  if (sale !== null && sale >= price) throw bad('Sale price must be lower than the regular price.');
  const images = Array.isArray(b.images) ? b.images.map((u) => safeUrl(u, { allowEmpty: false, label: 'Image' })) : [];
  if (images.length > 12) throw bad('Maximum 12 images.');
  if (images.some((u) => !/^(\/uploads\/|https:\/\/)/.test(u))) throw bad('Images must be uploaded files or https URLs.');
  const category = b.categoryId ? one('SELECT id FROM categories WHERE id=?', Number(b.categoryId)) : null;
  if (!category) throw bad('Please choose a category.');
  const sku = str(b.sku, 40, { req: true, label: 'SKU' }); if (!/^[A-Za-z0-9._-]+$/.test(sku)) throw bad('SKU may only contain letters, numbers, dot, dash, underscore.');
  const variants = Array.isArray(b.variants) ? b.variants : [];
  if (variants.length > 200) throw bad('Too many size/colour combinations.');
  const seen = new Set();
  const vs = variants.map((v) => {
    const size = str(v.size, 12, { req: true, label: 'Size' }), color = str(v.colorName, 40, { req: true, label: 'Colour' });
    const hex = /^#[0-9a-f]{6}$/i.test(v.colorHex) ? v.colorHex : '#000000';
    if (seen.has(size + '|' + color)) throw bad(`Duplicate variant ${size}/${color}.`); seen.add(size + '|' + color);
    return { size, color, hex, stock: int(v.stock, { max: 100000, label: 'Stock' }) };
  });
  const status = oneOf(b.status || 'draft', ['draft', 'published', 'archived'], 'Status');
  if (status === 'published' && !vs.length) throw bad('Add at least one size/colour before publishing.');
  return {
    sku, name: str(b.name, 150, { req: true, label: 'Name' }), description: str(b.description, 5000), category_id: category.id, brand: str(b.brand, 80),
    images: JSON.stringify(images), main_image: Math.min(Math.max(int(b.mainImage ?? 0, { max: 50, label: 'Main image' }), 0), Math.max(images.length - 1, 0)),
    price, sale_price: sale, low_stock_threshold: int(b.lowStockThreshold ?? 5, { max: 10000, label: 'Low-stock threshold' }),
    tags: JSON.stringify((Array.isArray(b.tags) ? b.tags : []).slice(0, 20).map((t) => str(t, 30))), fabric: str(b.fabric, 120), fit: str(b.fit, 80),
    featured: bool(b.featured), new_arrival: bool(b.newArrival), best_seller: bool(b.bestSeller), status,
    seo_title: str(b.seoTitle, 70), seo_description: str(b.seoDescription, 170), image_alt: str(b.imageAlt, 150), vs, slugWanted: b.slug ? slugify(b.slug) : null,
  };
}
function writeVariants(productId, vs, adminId, reason) {
  const existing = all('SELECT * FROM variants WHERE product_id=?', productId);
  const keep = new Set();
  for (const v of vs) {
    const cur = existing.find((e) => e.size === v.size && e.color_name === v.color);
    if (cur) { keep.add(cur.id); db.prepare('UPDATE variants SET color_hex=? WHERE id=?').run(v.hex, cur.id); if (v.stock !== cur.stock) adjustStock(cur.id, v.stock - cur.stock, reason, { adminId }); }
    else { const r = db.prepare('INSERT INTO variants(product_id,size,color_name,color_hex,stock) VALUES(?,?,?,?,0)').run(productId, v.size, v.color, v.hex); keep.add(Number(r.lastInsertRowid)); if (v.stock) adjustStock(Number(r.lastInsertRowid), v.stock, reason, { adminId }); }
  }
  for (const e of existing) if (!keep.has(e.id)) { if (e.stock) adjustStock(e.id, -e.stock, 'Variant removed', { adminId }); db.prepare('DELETE FROM variants WHERE id=?').run(e.id); }
}
route('POST', '/api/admin/products', { perm: 'products.write' }, (ctx) => {
  const p = readProduct(ctx.body);
  return tx(() => {
    let slug = p.slugWanted || slugify(p.name), n = 1; const base = slug;
    while (one('SELECT 1 FROM products WHERE slug=? OR id=?', slug, slug)) slug = `${base}-${++n}`;
    db.prepare(`INSERT INTO products(id,sku,slug,name,description,category_id,brand,images,main_image,price,sale_price,low_stock_threshold,tags,fabric,fit,
      featured,new_arrival,best_seller,status,seo_title,seo_description,image_alt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(slug, p.sku, slug, p.name, p.description, p.category_id, p.brand, p.images, p.main_image, p.price, p.sale_price, p.low_stock_threshold, p.tags, p.fabric, p.fit,
        p.featured, p.new_arrival, p.best_seller, p.status, p.seo_title, p.seo_description, p.image_alt);
    writeVariants(slug, p.vs, ctx.admin.id, 'Initial stock (product created)');
    audit(ctx.admin, 'product_created', 'product', slug, ctx.ip); return { id: slug };
  });
});
route('PUT', '/api/admin/products/:id', { perm: 'products.write' }, (ctx) => {
  const cur = one('SELECT * FROM products WHERE id=?', ctx.params.id); if (!cur) throw new HttpError(404, 'Product not found');
  const p = readProduct(ctx.body);
  return tx(() => {
    let slug = cur.slug;
    if (p.slugWanted && p.slugWanted !== cur.slug) { if (one('SELECT 1 FROM products WHERE slug=? AND id<>?', p.slugWanted, cur.id)) throw bad('That URL slug is already used.'); slug = p.slugWanted; }
    db.prepare(`UPDATE products SET sku=?,slug=?,name=?,description=?,category_id=?,brand=?,images=?,main_image=?,price=?,sale_price=?,low_stock_threshold=?,tags=?,fabric=?,fit=?,
      featured=?,new_arrival=?,best_seller=?,status=?,seo_title=?,seo_description=?,image_alt=?,updated_at=datetime('now') WHERE id=?`)
      .run(p.sku, slug, p.name, p.description, p.category_id, p.brand, p.images, p.main_image, p.price, p.sale_price, p.low_stock_threshold, p.tags, p.fabric, p.fit,
        p.featured, p.new_arrival, p.best_seller, p.status, p.seo_title, p.seo_description, p.image_alt, cur.id);
    writeVariants(cur.id, p.vs, ctx.admin.id, 'Edited in product form');
    audit(ctx.admin, 'product_updated', 'product', cur.id, ctx.ip); return { id: cur.id };
  });
});
route('POST', '/api/admin/products/:id/status', { perm: 'products.write' }, (ctx) => {
  const s = oneOf(ctx.body.status, ['draft', 'published', 'archived'], 'Status');
  if (!db.prepare("UPDATE products SET status=?, updated_at=datetime('now') WHERE id=?").run(s, ctx.params.id).changes) throw new HttpError(404, 'Not found');
  audit(ctx.admin, 'product_status', 'product', `${ctx.params.id} → ${s}`, ctx.ip);
});
route('POST', '/api/admin/products/:id/duplicate', { perm: 'products.write' }, (ctx) => tx(() => {
  const p = one('SELECT * FROM products WHERE id=?', ctx.params.id); if (!p) throw new HttpError(404, 'Not found');
  let n = 1, slug = `${p.slug}-copy`, sku = `${p.sku}-COPY`;
  while (one('SELECT 1 FROM products WHERE slug=? OR id=? OR sku=?', slug, slug, sku)) { n++; slug = `${p.slug}-copy-${n}`; sku = `${p.sku}-COPY${n}`; }
  db.prepare(`INSERT INTO products(id,sku,slug,name,description,category_id,brand,images,main_image,price,sale_price,low_stock_threshold,tags,fabric,fit,status,seo_title,seo_description,image_alt)
    SELECT ?,?,?,name||' (Copy)',description,category_id,brand,images,main_image,price,sale_price,low_stock_threshold,tags,fabric,fit,'draft',seo_title,seo_description,image_alt FROM products WHERE id=?`).run(slug, sku, slug, p.id);
  for (const v of all('SELECT * FROM variants WHERE product_id=?', p.id)) db.prepare('INSERT INTO variants(product_id,size,color_name,color_hex,stock) VALUES(?,?,?,?,0)').run(slug, v.size, v.color_name, v.color_hex);
  audit(ctx.admin, 'product_duplicated', 'product', `${p.id} → ${slug}`, ctx.ip); return { id: slug };
}));
// "Delete" archives (hides it from the shop) – order history keeps its own snapshot either way.
route('DELETE', '/api/admin/products/:id', { perm: 'products.delete' }, (ctx) => {
  const p = one('SELECT id FROM products WHERE id=?', ctx.params.id); if (!p) throw new HttpError(404, 'Not found');
  if (ctx.query.permanent === '1') { db.prepare('DELETE FROM products WHERE id=?').run(p.id); audit(ctx.admin, 'product_deleted', 'product', p.id, ctx.ip); return { deleted: true }; }
  db.prepare("UPDATE products SET status='archived', updated_at=datetime('now') WHERE id=?").run(p.id); audit(ctx.admin, 'product_archived', 'product', p.id, ctx.ip); return { archived: true };
});
route('POST', '/api/admin/products/import', { perm: 'products.write', maxBody: 3_000_000 }, (ctx) => {
  const rows = parseCsv(String(ctx.body.csv || '')); if (rows.length < 2) throw bad('CSV is empty.');
  const h = rows[0].map((x) => x.trim().toLowerCase()); const col = (r, n) => (r[h.indexOf(n)] ?? '').trim();
  for (const need of ['sku', 'name', 'category_slug', 'price']) if (!h.includes(need)) throw bad(`Missing column: ${need}`);
  const result = { created: 0, updated: 0, errors: [] };
  rows.slice(1).forEach((r, i) => {
    try {
      const cat = one('SELECT id FROM categories WHERE slug=?', col(r, 'category_slug')); if (!cat) throw bad(`unknown category "${col(r, 'category_slug')}"`);
      const sizes = col(r, 'sizes').split('|').filter(Boolean), colors = col(r, 'colors').split('|').filter(Boolean).map((c) => { const [n, hx] = c.split(':'); return { n: n.trim(), h: hx || '#000000' }; });
      const stock = int(col(r, 'stock_per_variant') || 0, { max: 100000, label: 'stock' });
      const body = { sku: col(r, 'sku'), name: col(r, 'name'), categoryId: cat.id, price: col(r, 'price'), salePrice: col(r, 'sale_price') || null,
        status: col(r, 'status') || 'draft', description: col(r, 'description'),
        variants: sizes.flatMap((s) => (colors.length ? colors : [{ n: 'Default', h: '#000000' }]).map((c) => ({ size: s, colorName: c.n, colorHex: c.h, stock }))) };
      const p = readProduct(body); const ex = one('SELECT id FROM products WHERE sku=?', p.sku);
      tx(() => {
        if (ex) { db.prepare("UPDATE products SET name=?,description=?,category_id=?,price=?,sale_price=?,status=?,updated_at=datetime('now') WHERE id=?").run(p.name, p.description, p.category_id, p.price, p.sale_price, p.status, ex.id); writeVariants(ex.id, p.vs, ctx.admin.id, 'CSV import'); result.updated++; }
        else { let slug = slugify(p.name), n = 1; const b = slug; while (one('SELECT 1 FROM products WHERE slug=? OR id=?', slug, slug)) slug = `${b}-${++n}`;
          db.prepare('INSERT INTO products(id,sku,slug,name,description,category_id,price,sale_price,status) VALUES(?,?,?,?,?,?,?,?,?)').run(slug, p.sku, slug, p.name, p.description, p.category_id, p.price, p.sale_price, p.status);
          writeVariants(slug, p.vs, ctx.admin.id, 'CSV import'); result.created++; }
      });
    } catch (e) { result.errors.push(`Row ${i + 2}: ${e.message}`); }
  });
  audit(ctx.admin, 'products_imported', 'product', JSON.stringify({ c: result.created, u: result.updated }), ctx.ip); return result;
});

// ================================================================= inventory
route('GET', '/api/admin/inventory', { perm: 'products.read' }, ({ query: q }) => {
  let rows = all(`SELECT v.id,v.product_id,v.size,v.color_name,v.color_hex,v.stock,p.name,p.sku,p.slug,p.status,p.low_stock_threshold
    FROM variants v JOIN products p ON p.id=v.product_id WHERE p.status<>'archived' ${q.q ? 'AND (p.name LIKE ? OR p.sku LIKE ?)' : ''} ORDER BY p.name,v.id`, ...(q.q ? [`%${q.q}%`, `%${q.q}%`] : []));
  if (q.filter === 'out') rows = rows.filter((r) => r.stock === 0); else if (q.filter === 'low') rows = rows.filter((r) => r.stock > 0 && r.stock <= r.low_stock_threshold); else if (q.filter === 'in') rows = rows.filter((r) => r.stock > r.low_stock_threshold);
  return { items: rows };
});
route('POST', '/api/admin/inventory/adjust', { perm: 'inventory.write' }, (ctx) => {
  const reason = str(ctx.body.reason, 200, { req: true, label: 'Reason' });
  const vid = int(ctx.body.variantId, { label: 'Variant' }); const v = one('SELECT * FROM variants WHERE id=?', vid); if (!v) throw new HttpError(404, 'Variant not found');
  const delta = ctx.body.setTo !== undefined ? int(ctx.body.setTo, { max: 100000, label: 'New stock' }) - v.stock : int(ctx.body.delta, { min: -100000, max: 100000, label: 'Change' });
  if (!delta) throw bad('No change to apply.');
  const stock = tx(() => adjustStock(vid, delta, `Manual: ${reason}`, { adminId: ctx.admin.id }));
  audit(ctx.admin, 'stock_adjusted', 'variant', `${vid} ${delta > 0 ? '+' : ''}${delta} (${reason})`, ctx.ip); return { stock };
});
route('GET', '/api/admin/inventory/history', { perm: 'products.read' }, ({ query: q }) => ({
  history: all(`SELECT l.*, p.name AS product_name, v.size, v.color_name, a.name AS admin_name, o.number AS order_number FROM inventory_log l
    LEFT JOIN products p ON p.id=l.product_id LEFT JOIN variants v ON v.id=l.variant_id LEFT JOIN admins a ON a.id=l.admin_id LEFT JOIN orders o ON o.id=l.order_id
    ${q.productId ? 'WHERE l.product_id=?' : ''} ORDER BY l.id DESC LIMIT 300`, ...(q.productId ? [q.productId] : [])) }));

// ================================================================= orders
const FLOW = { pending: ['confirmed', 'cancelled'], confirmed: ['processing', 'cancelled'], processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'], delivered: ['returned'], returned: ['refunded'], cancelled: ['refunded'], refunded: [] };
const SENSITIVE = ['cancelled', 'returned', 'refunded'];
function orderWhere(q) {
  const w = [], a = [];
  if (q.q) { w.push('(o.number LIKE ? OR o.customer_name LIKE ? OR o.mobile LIKE ?)'); a.push(`%${q.q}%`, `%${q.q}%`, `%${q.q}%`); }
  if (q.status && q.status !== 'all') { w.push('o.status=?'); a.push(q.status); }
  if (q.from) { w.push("date(o.created_at,'+330 minutes')>=?"); a.push(q.from); }
  if (q.to) { w.push("date(o.created_at,'+330 minutes')<=?"); a.push(q.to); }
  return [w.length ? 'WHERE ' + w.join(' AND ') : '', a];
}
route('GET', '/api/admin/orders', { perm: 'orders.read' }, ({ query: q }) => {
  const [w, a] = orderWhere(q); const page = Math.max(1, Number(q.page) || 1);
  const total = one(`SELECT COUNT(*) c FROM orders o ${w}`, ...a).c;
  return { total, page, orders: all(`SELECT o.id,o.number,o.status,o.customer_name,o.mobile,o.total,o.payment_status,o.payment_method,o.created_at,
    (SELECT SUM(qty) FROM order_items WHERE order_id=o.id) AS items FROM orders o ${w} ORDER BY o.id DESC LIMIT 25 OFFSET ?`, ...a, (page - 1) * 25) };
});
route('GET', '/api/admin/orders/export.csv', { perm: 'reports.export' }, (ctx) => {
  const [w, a] = orderWhere(ctx.query);
  csvRes(ctx, 'orders.csv', [['order_number','date','status','payment_status','customer','mobile','city','items','subtotal','discount','delivery','total','coupon'],
    ...all(`SELECT o.*, (SELECT SUM(qty) FROM order_items WHERE order_id=o.id) items FROM orders o ${w} ORDER BY o.id`, ...a)
      .map((o) => [o.number, o.created_at, o.status, o.payment_status, o.customer_name, o.mobile, o.city, o.items, o.subtotal, o.discount, o.delivery, o.total, o.coupon_code || ''])]);
  audit(ctx.admin, 'orders_exported', 'order', '', ctx.ip);
});
const orderFull = (id) => { const o = one('SELECT * FROM orders WHERE id=?', id); if (!o) throw new HttpError(404, 'Order not found');
  return { order: o, items: all('SELECT * FROM order_items WHERE order_id=?', id), history: all('SELECT * FROM order_history WHERE order_id=? ORDER BY id', id) }; };
route('GET', '/api/admin/orders/:id', { perm: 'orders.read' }, ({ params }) => orderFull(Number(params.id)));
route('POST', '/api/admin/orders/:id/status', { perm: 'orders.update' }, (ctx) => tx(() => {
  const o = one('SELECT * FROM orders WHERE id=?', Number(ctx.params.id)); if (!o) throw new HttpError(404, 'Order not found');
  const to = oneOf(ctx.body.status, Object.keys(FLOW), 'Status');
  if (!FLOW[o.status].includes(to)) throw bad(`An order that is ${o.status} cannot move to ${to}.`);
  if (SENSITIVE.includes(to) && !can(ctx.admin, 'orders.cancel_refund')) throw new HttpError(403, 'Only a Manager or Super Admin can cancel, return or refund orders.');
  const note = str(ctx.body.note, 300);
  if (SENSITIVE.includes(to) && !note) throw bad('Please add a note explaining the reason.');
  let restock = false;
  if ((to === 'cancelled' || to === 'returned') && o.stock_committed && ctx.body.restock !== false) {
    for (const it of all('SELECT * FROM order_items WHERE order_id=?', o.id)) if (it.variant_id && one('SELECT 1 FROM variants WHERE id=?', it.variant_id)) adjustStock(it.variant_id, it.qty, `Order ${o.number} ${to}`, { orderId: o.id, adminId: ctx.admin.id });
    restock = true;
  }
  if ((to === 'cancelled' || to === 'returned') && o.stock_committed && o.coupon_code && to === 'cancelled') db.prepare('UPDATE coupons SET used_count=MAX(0,used_count-1) WHERE code=?').run(o.coupon_code);
  let pay = o.payment_status; if (to === 'refunded' && pay === 'paid') pay = 'refunded';
  db.prepare("UPDATE orders SET status=?, payment_status=?, stock_committed=?, updated_at=datetime('now') WHERE id=?").run(to, pay, restock ? 0 : o.stock_committed, o.id);
  db.prepare('INSERT INTO order_history(order_id,from_status,to_status,admin_id,admin_name,note) VALUES(?,?,?,?,?,?)').run(o.id, o.status, to, ctx.admin.id, ctx.admin.name, note + (restock ? ' (stock restored)' : ''));
  audit(ctx.admin, 'order_status', 'order', `${o.number}: ${o.status} → ${to}`, ctx.ip); return orderFull(o.id);
}));
route('POST', '/api/admin/orders/:id/payment', { perm: 'orders.cancel_refund' }, (ctx) => tx(() => {
  // No payment gateway is configured, so this is a *manual* confirmation (e.g. cash received on delivery / UPI seen in bank). A reference is mandatory and logged.
  const o = one('SELECT * FROM orders WHERE id=?', Number(ctx.params.id)); if (!o) throw new HttpError(404, 'Order not found');
  if (o.payment_status !== 'unpaid') throw bad('Payment status already set.');
  const ref = str(ctx.body.reference, 200, { req: true, label: 'Payment reference' });
  db.prepare("UPDATE orders SET payment_status='paid', updated_at=datetime('now') WHERE id=?").run(o.id);
  db.prepare('INSERT INTO order_history(order_id,from_status,to_status,admin_id,admin_name,note) VALUES(?,?,?,?,?,?)').run(o.id, o.status, o.status, ctx.admin.id, ctx.admin.name, `Payment manually confirmed: ${ref}`);
  audit(ctx.admin, 'order_paid_manual', 'order', `${o.number}: ${ref}`, ctx.ip); return orderFull(o.id);
}));
route('POST', '/api/admin/orders/:id/notes', { perm: 'orders.update' }, (ctx) => {
  db.prepare("UPDATE orders SET internal_notes=?, updated_at=datetime('now') WHERE id=?").run(str(ctx.body.notes, 2000), Number(ctx.params.id));
});
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
route('GET', '/api/admin/orders/:id/invoice', { perm: 'orders.read' }, (ctx) => {
  const { order: o, items } = orderFull(Number(ctx.params.id)); const st = JSON.parse(one("SELECT value FROM settings WHERE key='store'")?.value || '{}');
  const nonce = randomBytes(12).toString('hex'); const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
  ctx.raw = { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src 'self'` },
    body: `<!doctype html><meta charset="utf-8"><title>Invoice ${esc(o.number)}</title><style>body{font-family:Georgia,serif;max-width:760px;margin:30px auto;color:#281A14}h1{letter-spacing:.2em;margin:0}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border-bottom:1px solid #C49C4C;padding:8px;text-align:left}td.r,th.r{text-align:right}.t{font-weight:bold}@media print{button{display:none}}</style>
<button id="p">Print</button><h1>${esc(st.name || 'NEW GULLY')}</h1><div>${esc(st.location || '')}${st.phone ? ' · ' + esc(st.phone) : ''}</div><hr>
<h2>Invoice ${esc(o.number)}</h2><div>${esc(o.created_at)} UTC · Status: ${esc(o.status)} · Payment: ${esc(o.payment_status)} (${esc(o.payment_method)})</div>
<p><b>${esc(o.customer_name)}</b><br>${esc(o.address)}${o.landmark ? ', ' + esc(o.landmark) : ''}<br>${esc(o.city)}, ${esc(o.state)} ${esc(o.pin_code)}<br>${esc(o.mobile)}</p>
<table><tr><th>Item</th><th>SKU</th><th>Size/Colour</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Total</th></tr>${items.map((i) => `<tr><td>${esc(i.name)}</td><td>${esc(i.sku)}</td><td>${esc(i.size)} / ${esc(i.color)}</td><td class="r">${i.qty}</td><td class="r">${inr(i.unit_price)}</td><td class="r">${inr(i.unit_price * i.qty)}</td></tr>`).join('')}</table>
<table style="width:300px;margin-left:auto"><tr><td>Subtotal</td><td class="r">${inr(o.subtotal)}</td></tr>${o.discount ? `<tr><td>Discount ${esc(o.coupon_code || '')}</td><td class="r">−${inr(o.discount)}</td></tr>` : ''}<tr><td>Delivery</td><td class="r">${inr(o.delivery)}</td></tr><tr class="t"><td>Total</td><td class="r">${inr(o.total)}</td></tr></table>
<script nonce="${nonce}">document.getElementById('p').onclick=function(){window.print()}</script>` };
});

// ================================================================= offers / coupons / marquee
const PLACES = ['home', 'offers_page', 'product_page', 'cart', 'marquee'];
function offerBody(b) {
  const places = (Array.isArray(b.placements) ? b.placements : []).map((p) => oneOf(p, PLACES, 'Placement'));
  const s = dateOrNull(b.startsAt, 'Start date'), e = dateOrNull(b.endsAt, 'End date'); if (s && e && e < s) throw bad('End date is before the start date.');
  return [str(b.code, 24).toUpperCase(), str(b.title, 120, { req: true, label: 'Title' }), str(b.subtitle, 200), str(b.badge, 40), str(b.description, 600), safeUrl(b.link, { label: 'Link' }),
    JSON.stringify((Array.isArray(b.terms) ? b.terms : []).slice(0, 10).map((t) => str(t, 200))), JSON.stringify(places), oneOf(b.targetGroup || 'all', ['all', 'men', 'kids', 'accessories'], 'Target'),
    int(b.minOrder ?? 0, { max: 1_000_000, label: 'Minimum order' }), s, e, bool(b.active ?? true)];
}
const OCOLS = 'code,title,subtitle,badge,description,link,terms,placements,target_group,min_order,starts_at,ends_at,active';
route('GET', '/api/admin/offers', { perm: 'offers.write' }, () => ({ offers: all('SELECT * FROM offers ORDER BY sort,id').map((o) => ({ ...o, terms: J(o.terms), placements: J(o.placements) })) }));
route('POST', '/api/admin/offers', { perm: 'offers.write' }, (ctx) => { const r = db.prepare(`INSERT INTO offers(${OCOLS}) VALUES(${OCOLS.split(',').map(() => '?').join(',')})`).run(...offerBody(ctx.body)); audit(ctx.admin, 'offer_created', 'offer', ctx.body.title, ctx.ip); return { id: Number(r.lastInsertRowid) }; });
route('PUT', '/api/admin/offers/:id', { perm: 'offers.write' }, (ctx) => { db.prepare(`UPDATE offers SET ${OCOLS.split(',').map((c) => c + '=?').join(',')} WHERE id=?`).run(...offerBody(ctx.body), Number(ctx.params.id)); audit(ctx.admin, 'offer_updated', 'offer', ctx.params.id, ctx.ip); });
route('DELETE', '/api/admin/offers/:id', { perm: 'offers.write' }, (ctx) => { db.prepare('DELETE FROM offers WHERE id=?').run(Number(ctx.params.id)); audit(ctx.admin, 'offer_deleted', 'offer', ctx.params.id, ctx.ip); });

function couponBody(b) {
  const code = str(b.code, 24, { req: true, label: 'Code' }).toUpperCase(); if (!/^[A-Z0-9_-]{3,24}$/.test(code)) throw bad('Code must be 3–24 letters/numbers/dash/underscore.');
  const type = oneOf(b.type, ['percent', 'fixed'], 'Type'); const value = int(b.value, { min: 1, max: type === 'percent' ? 100 : 1_000_000, label: 'Discount value' });
  const scope = oneOf(b.scopeType || 'all', ['all', 'group', 'category', 'product'], 'Scope'); const ids = (Array.isArray(b.scopeIds) ? b.scopeIds : []).map((x) => str(x, 80));
  if (scope !== 'all' && !ids.length) throw bad('Choose at least one eligible group/category/product.');
  const s = dateOrNull(b.startsAt, 'Start date'), e = dateOrNull(b.expiresAt, 'Expiry date'); if (s && e && e < s) throw bad('Expiry is before the start.');
  return [code, type, value, int(b.minOrder ?? 0, { max: 1_000_000, label: 'Minimum order' }), s, e, int(b.usageLimit, { min: 1, max: 1_000_000, label: 'Usage limit', req: false }), scope, JSON.stringify(scope === 'all' ? [] : ids), bool(b.active ?? true)];
}
const CCOLS = 'code,type,value,min_order,starts_at,expires_at,usage_limit,scope_type,scope_ids,active';
route('GET', '/api/admin/coupons', { perm: 'offers.write' }, () => ({ coupons: all('SELECT * FROM coupons ORDER BY id DESC').map((c) => ({ ...c, scope_ids: J(c.scope_ids) })) }));
route('POST', '/api/admin/coupons', { perm: 'offers.write' }, (ctx) => { const r = db.prepare(`INSERT INTO coupons(${CCOLS}) VALUES(${CCOLS.split(',').map(() => '?').join(',')})`).run(...couponBody(ctx.body)); audit(ctx.admin, 'coupon_created', 'coupon', ctx.body.code, ctx.ip); return { id: Number(r.lastInsertRowid) }; });
route('PUT', '/api/admin/coupons/:id', { perm: 'offers.write' }, (ctx) => { db.prepare(`UPDATE coupons SET ${CCOLS.split(',').map((c) => c + '=?').join(',')} WHERE id=?`).run(...couponBody(ctx.body), Number(ctx.params.id)); audit(ctx.admin, 'coupon_updated', 'coupon', ctx.params.id, ctx.ip); });
route('DELETE', '/api/admin/coupons/:id', { perm: 'offers.write' }, (ctx) => { db.prepare('DELETE FROM coupons WHERE id=?').run(Number(ctx.params.id)); audit(ctx.admin, 'coupon_deleted', 'coupon', ctx.params.id, ctx.ip); });

import { getSetting, setSetting } from '../db.mjs';
route('GET', '/api/admin/marquee', { perm: 'offers.write' }, () => ({ settings: getSetting('marquee', { enabled: true, speed: 40, direction: 'left' }), messages: all('SELECT * FROM marquee_messages ORDER BY sort,id') }));
route('PUT', '/api/admin/marquee', { perm: 'offers.write' }, (ctx) => tx(() => {
  const s = { enabled: !!ctx.body.enabled, speed: int(ctx.body.speed, { min: 10, max: 120, label: 'Speed (seconds)' }), direction: oneOf(ctx.body.direction, ['left', 'right'], 'Direction') };
  const msgs = Array.isArray(ctx.body.messages) ? ctx.body.messages.slice(0, 30) : []; setSetting('marquee', s); db.exec('DELETE FROM marquee_messages');
  msgs.forEach((m, i) => db.prepare('INSERT INTO marquee_messages(text,link,badge,sort,active) VALUES(?,?,?,?,?)').run(str(m.text, 200, { req: true, label: 'Marquee text' }), safeUrl(m.link, { label: 'Link' }), str(m.badge, 30), i, bool(m.active ?? true)));
  audit(ctx.admin, 'marquee_updated', 'marquee', `${msgs.length} messages`, ctx.ip);
}));

// ================================================================= customers (derived from orders; there are no customer accounts yet)
const custSql = `SELECT o.mobile, MAX(o.customer_name) AS name, MAX(o.email) AS email, MAX(o.city) AS city, COUNT(*) AS orders,
  SUM(CASE WHEN o.status='delivered' THEN o.total ELSE 0 END) AS completed_total, MAX(o.created_at) AS last_order,
  COALESCE(p.status,'active') AS account_status, COALESCE(p.marketing_consent,0) AS marketing_consent FROM orders o LEFT JOIN customer_profiles p ON p.mobile=o.mobile`;
route('GET', '/api/admin/customers', { perm: 'customers.read' }, ({ query: q }) => ({ customers: all(`${custSql} ${q.q ? 'WHERE o.customer_name LIKE ? OR o.mobile LIKE ? OR o.email LIKE ?' : ''} GROUP BY o.mobile ORDER BY last_order DESC`, ...(q.q ? Array(3).fill(`%${q.q}%`) : [])) }));
route('GET', '/api/admin/customers/export.csv', { perm: 'customers.export' }, (ctx) => {
  csvRes(ctx, 'customers.csv', [['name', 'mobile', 'email', 'city', 'orders', 'completed_purchases_inr', 'last_order', 'marketing_consent'],
    ...all(`${custSql} GROUP BY o.mobile`).map((c) => [c.name, c.mobile, c.marketing_consent ? c.email : '', c.city, c.orders, c.completed_total, c.last_order, c.marketing_consent ? 'yes' : 'no'])]);
  audit(ctx.admin, 'customers_exported', 'customer', '', ctx.ip);
});
route('GET', '/api/admin/customers/:mobile', { perm: 'customers.read' }, (ctx) => { const params = ctx.params; return ({
  customer: one(`${custSql} WHERE o.mobile=? GROUP BY o.mobile`, params.mobile) || (() => { throw new HttpError(404, 'Customer not found'); })(),
  notes: can(ctx.admin, 'orders.cancel_refund') ? one('SELECT notes FROM customer_profiles WHERE mobile=?', ctx.params.mobile)?.notes ?? '' : null, // restricted: Manager+ only
  orders: all('SELECT id,number,status,total,created_at FROM orders WHERE mobile=? ORDER BY id DESC', params.mobile) }); });
route('PUT', '/api/admin/customers/:mobile', { perm: 'customers.read' }, (ctx) => {
  if (!can(ctx.admin, 'orders.cancel_refund')) throw new HttpError(403, 'Only a Manager or Super Admin can edit customer notes/status.');
  db.prepare(`INSERT INTO customer_profiles(mobile,notes,status,marketing_consent,updated_at) VALUES(?,?,?,?,datetime('now'))
    ON CONFLICT(mobile) DO UPDATE SET notes=excluded.notes,status=excluded.status,marketing_consent=excluded.marketing_consent,updated_at=datetime('now')`)
    .run(ctx.params.mobile, str(ctx.body.notes, 2000), oneOf(ctx.body.status || 'active', ['active', 'blocked'], 'Status'), bool(ctx.body.marketingConsent));
  audit(ctx.admin, 'customer_updated', 'customer', ctx.params.mobile, ctx.ip);
});

// ================================================================= dashboard & analytics (real data only)
const VALID = `o.status IN ('confirmed','processing','shipped','delivered')`;
function dateRange(q) {
  const ist = (d) => new Date(d.getTime() + 330 * 60000).toISOString().slice(0, 10);
  const now = new Date(); let from, to = ist(now);
  if (q.from && q.to) { from = dateOrNull(q.from); to = dateOrNull(q.to); }
  else { const days = { today: 1, '7d': 7, '30d': 30, '90d': 90 }[q.range] || 30; from = ist(new Date(now.getTime() - (days - 1) * 86400000)); }
  const span = Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1;
  const pTo = ist(new Date(Date.parse(from) - 86400000)), pFrom = ist(new Date(Date.parse(from) - span * 86400000));
  return { from, to, pFrom, pTo };
}
const D = "date(o.created_at,'+330 minutes')";
function money(from, to) {
  const g = one(`SELECT COALESCE(SUM(o.subtotal),0) gross, COALESCE(SUM(o.discount),0) discounts, COUNT(*) orders FROM orders o WHERE ${VALID} AND ${D} BETWEEN ? AND ?`, from, to);
  const refunds = one(`SELECT COALESCE(SUM(o.total),0) r FROM orders o WHERE o.status IN ('refunded','returned') AND ${D} BETWEEN ? AND ?`, from, to).r;
  const paid = one(`SELECT COALESCE(SUM(o.total),0) p FROM orders o WHERE o.payment_status='paid' AND ${D} BETWEEN ? AND ?`, from, to).p;
  return { gross: g.gross, discounts: g.discounts, refunds, net: g.gross - g.discounts - refunds, orders: g.orders, verifiedPaid: paid };
}
route('GET', '/api/admin/dashboard', { perm: 'orders.read' }, (ctx) => {
  const r = dateRange(ctx.query); const money_ok = can(ctx.admin, 'analytics.read'); const today = new Date().toISOString().slice(0, 10);
  const stock = all(`SELECT p.id, p.low_stock_threshold t, COALESCE(SUM(v.stock),0) s FROM products p LEFT JOIN variants v ON v.product_id=p.id WHERE p.status='published' GROUP BY p.id`);
  const out = { range: r,
    counts: { products: one("SELECT COUNT(*) c FROM products WHERE status<>'archived'").c, published: one("SELECT COUNT(*) c FROM products WHERE status='published'").c, drafts: one("SELECT COUNT(*) c FROM products WHERE status='draft'").c,
      orders: one(`SELECT COUNT(*) c FROM orders o WHERE ${D} BETWEEN ? AND ?`, r.from, r.to).c, pending: one("SELECT COUNT(*) c FROM orders WHERE status='pending'").c,
      completed: one(`SELECT COUNT(*) c FROM orders o WHERE status='delivered' AND ${D} BETWEEN ? AND ?`, r.from, r.to).c,
      customers: one('SELECT COUNT(DISTINCT mobile) c FROM orders').c, lowStock: stock.filter((x) => x.s > 0 && x.s <= x.t).length, outOfStock: stock.filter((x) => x.s === 0).length,
      activeOffers: one('SELECT COUNT(*) c FROM offers WHERE active=1 AND (starts_at IS NULL OR starts_at<=?) AND (ends_at IS NULL OR ends_at>=?)', today, today).c },
    traffic: { configured: false }, // no analytics provider is integrated; we never fabricate visit numbers
    inventoryByCategory: all(`SELECT COALESCE(c.name,'Uncategorised') name, COALESCE(SUM(v.stock),0) stock FROM products p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN variants v ON v.product_id=p.id WHERE p.status<>'archived' GROUP BY c.id ORDER BY stock DESC`),
    ordersSeries: all(`SELECT ${D} d, COUNT(*) orders FROM orders o WHERE ${D} BETWEEN ? AND ? GROUP BY d ORDER BY d`, r.from, r.to),
    bestSellers: all(`SELECT i.name, SUM(i.qty) qty FROM order_items i JOIN orders o ON o.id=i.order_id WHERE ${VALID} AND ${D} BETWEEN ? AND ? GROUP BY i.name ORDER BY qty DESC LIMIT 8`, r.from, r.to) };
  if (money_ok) Object.assign(out, { sales: money(r.from, r.to), previous: money(r.pFrom, r.pTo),
    salesSeries: all(`SELECT ${D} d, SUM(o.subtotal-o.discount) sales FROM orders o WHERE ${VALID} AND ${D} BETWEEN ? AND ? GROUP BY d ORDER BY d`, r.from, r.to),
    categoryPerformance: all(`SELECT COALESCE(c.name,'Uncategorised') name, SUM(i.qty) units, SUM(i.qty*i.unit_price) revenue FROM order_items i JOIN orders o ON o.id=i.order_id LEFT JOIN products p ON p.id=i.product_id LEFT JOIN categories c ON c.id=p.category_id WHERE ${VALID} AND ${D} BETWEEN ? AND ? GROUP BY c.id ORDER BY revenue DESC`, r.from, r.to),
    discountUsage: all(`SELECT o.coupon_code code, COUNT(*) uses, SUM(o.discount) total FROM orders o WHERE o.coupon_code IS NOT NULL AND ${VALID} AND ${D} BETWEEN ? AND ? GROUP BY o.coupon_code ORDER BY uses DESC`, r.from, r.to) });
  return out;
});
route('GET', '/api/admin/reports/sales.csv', { perm: 'reports.export' }, (ctx) => {
  const r = dateRange(ctx.query);
  csvRes(ctx, `sales-${r.from}_to_${r.to}.csv`, [['date', 'orders', 'gross_sales', 'discounts', 'net_sales_before_refunds'],
    ...all(`SELECT ${D} d, COUNT(*) n, SUM(o.subtotal) g, SUM(o.discount) x FROM orders o WHERE ${VALID} AND ${D} BETWEEN ? AND ? GROUP BY d ORDER BY d`, r.from, r.to).map((x) => [x.d, x.n, x.g, x.x, x.g - x.x])]);
  audit(ctx.admin, 'report_exported', 'sales', `${r.from}..${r.to}`, ctx.ip);
});
