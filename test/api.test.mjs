// End-to-end API tests (no framework needed).
//   1) TRUST_PROXY=1 GULLY_DB=/tmp/t.db PORT=8099 npm start   (TRUST_PROXY lets the test use distinct fake client IPs)
//   2) GULLY_DB=/tmp/t.db ADMIN_EMAIL=owner@example.com ADMIN_NAME=Owner ADMIN_PASSWORD='Str0ngPassw0rd!' npm run create-admin
//   3) BASE=http://localhost:8099 node test/api.test.mjs
import assert from 'node:assert/strict';
const BASE = process.env.BASE || 'http://localhost:8099';
let pass = 0;
const t = async (name, fn) => { try { await fn(); pass++; console.log('  ✓', name); } catch (e) { console.log('  ✗', name, '\n     ', e.message); process.exitCode = 1; } };

class Client {
  constructor() { this.cookie = ''; this.csrf = ''; }
  async req(method, url, body, { csrf = true, raw = false } = {}) {
    const r = await fetch(BASE + url, { method, headers: { 'x-forwarded-for': `10.${Math.floor(Math.random()*250)}.${Math.floor(Math.random()*250)}.${Math.floor(Math.random()*250)}`, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(this.cookie ? { cookie: this.cookie } : {}), ...(csrf && this.csrf ? { 'x-csrf-token': this.csrf } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.get('set-cookie'); if (sc) this.cookie = sc.split(';')[0];
    if (raw) return r;
    let j = null; try { j = await r.json(); } catch {}
    return { status: r.status, body: j, headers: r.headers };
  }
  async login(email, password) { const r = await this.req('POST', '/api/admin/auth/login', { email, password }); if (r.status === 200) this.csrf = r.body.csrf; return r; }
}
const anon = new Client(), sa = new Client(), mgr = new Client(), staff = new Client();
const PW = 'Str0ngPassw0rd!';
const item = (p, q = 1) => ({ productId: p.id, size: p.variants[0].size, color: p.variants[0].color, qty: q });
const cust = { fullName: 'Test Buyer', mobile: '9876543210', email: 'b@example.com', address: '1 Test Street', city: 'Malappuram', state: 'Kerala', pinCode: '676519' };

console.log('Auth & authorization');
await t('admin API rejects anonymous requests', async () => { for (const u of ['/api/admin/products', '/api/admin/orders', '/api/admin/customers', '/api/admin/dashboard', '/api/admin/admins']) assert.equal((await anon.req('GET', u)).status, 401, u); });
await t('wrong password gives a generic 401', async () => { const r = await anon.login('owner@example.com', 'nope'); assert.equal(r.status, 401); assert.equal(r.body.error, 'Invalid email or password.'); });
await t('super admin logs in; cookie is HttpOnly + SameSite=Strict', async () => {
  const r = await sa.req('POST', '/api/admin/auth/login', { email: 'owner@example.com', password: PW }, { raw: true });
  assert.equal(r.status, 200); const c = r.headers.get('set-cookie'); assert.match(c, /HttpOnly/); assert.match(c, /SameSite=Strict/);
  sa.csrf = (await r.json()).csrf;
});
await t('state-changing request without CSRF token is refused', async () => assert.equal((await sa.req('POST', '/api/admin/notifications/read', {}, { csrf: false })).status, 403));
await t('super admin creates manager + staff', async () => {
  assert.equal((await sa.req('POST', '/api/admin/admins', { email: 'mgr@example.com', name: 'Mgr', role: 'manager', password: PW })).status, 200);
  assert.equal((await sa.req('POST', '/api/admin/admins', { email: 'staff@example.com', name: 'Staff', role: 'staff', password: PW })).status, 200);
});
await t('weak password is rejected', async () => assert.equal((await sa.req('POST', '/api/admin/admins', { email: 'x@example.com', name: 'X', role: 'staff', password: 'short' })).status, 400));
await mgr.login('mgr@example.com', PW); await staff.login('staff@example.com', PW);
await t('staff cannot create products / manage admins / view customers / edit settings', async () => {
  assert.equal((await staff.req('POST', '/api/admin/products', {})).status, 403);
  assert.equal((await staff.req('GET', '/api/admin/admins')).status, 403);
  assert.equal((await staff.req('GET', '/api/admin/customers')).status, 403);
  assert.equal((await staff.req('PUT', '/api/admin/settings/store', {})).status, 403);
});
await t('manager cannot manage admins or store settings', async () => { assert.equal((await mgr.req('GET', '/api/admin/admins')).status, 403); assert.equal((await mgr.req('GET', '/api/admin/settings/store')).status, 403); });
await t('last super admin cannot be demoted', async () => { const me = (await sa.req('GET', '/api/admin/me')).body.admin; assert.equal((await sa.req('PATCH', `/api/admin/admins/${me.id}`, { role: 'manager' })).status, 400); });
await t('logout invalidates the session', async () => { const c = new Client(); await c.login('mgr@example.com', PW); await c.req('POST', '/api/admin/auth/logout', {}); assert.equal((await c.req('GET', '/api/admin/me')).status, 401); });
await t('password reset gives the same response for unknown and known emails', async () => {
  const a = await anon.req('POST', '/api/admin/auth/forgot', { email: 'ghost@example.com' }); const b = await anon.req('POST', '/api/admin/auth/forgot', { email: 'owner@example.com' });
  assert.deepEqual(a.body, b.body);
});

console.log('Catalogue & uploads');
const { products } = (await anon.req('GET', '/api/public/products')).body;
await t('public catalogue lists the seeded products with variants', () => { assert.ok(products.length >= 10); assert.ok(products[0].variants.length > 0); });
const cats = (await mgr.req('GET', '/api/admin/categories')).body.categories;
let newId;
await t('manager creates a draft product; it is NOT public', async () => {
  const r = await mgr.req('POST', '/api/admin/products', { name: 'Test Linen Kurta', sku: 'TEST-001', categoryId: cats[0].id, price: 1000, salePrice: 800, status: 'draft', variants: [{ size: 'M', colorName: 'Red', colorHex: '#ff0000', stock: 3 }] });
  assert.equal(r.status, 200, JSON.stringify(r.body)); newId = r.body.id;
  assert.ok(!(await anon.req('GET', '/api/public/products')).body.products.some((p) => p.id === newId));
});
await t('duplicate SKU rejected', async () => assert.equal((await mgr.req('POST', '/api/admin/products', { name: 'Dup', sku: 'TEST-001', categoryId: cats[0].id, price: 10, variants: [] })).status, 409));
await t('sale price must be lower than price', async () => assert.equal((await mgr.req('POST', '/api/admin/products', { name: 'Bad', sku: 'BAD-1', categoryId: cats[0].id, price: 100, salePrice: 150, variants: [] })).status, 400));
await t('publishing shows it on the public site with the discount computed', async () => {
  const cur = (await mgr.req('GET', `/api/admin/products/${newId}`)).body;
  const b = { ...cur.product, categoryId: cur.product.category_id, salePrice: cur.product.sale_price, status: 'published', variants: cur.variants.map((v) => ({ size: v.size, colorName: v.color_name, colorHex: v.color_hex, stock: v.stock })) };
  assert.equal((await mgr.req('PUT', `/api/admin/products/${newId}`, b)).status, 200);
  const p = (await anon.req('GET', '/api/public/products')).body.products.find((x) => x.id === newId);
  assert.equal(p.price, 800); assert.equal(p.originalPrice, 1000); assert.equal(p.discountPercentage, 20);
});
const png = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';
await t('valid image upload is accepted and served with the right type', async () => {
  const r = await mgr.req('POST', '/api/admin/uploads', { data: png }); assert.equal(r.status, 200, JSON.stringify(r.body));
  const f = await fetch(BASE + r.body.url); assert.equal(f.status, 200); assert.equal(f.headers.get('content-type'), 'image/jpeg');
});
await t('HTML / SVG / script disguised as an image is rejected', async () => {
  for (const d of ['<svg onload=alert(1)>', '<script>alert(1)</script>', 'not an image']) assert.equal((await mgr.req('POST', '/api/admin/uploads', { data: Buffer.from(d).toString('base64') })).status, 400);
});
await t('javascript: links are refused in offers', async () => assert.equal((await mgr.req('POST', '/api/admin/offers', { title: 'x', link: 'javascript:alert(1)' })).status, 400));

console.log('Orders, pricing & inventory');
const p0 = (await anon.req('GET', '/api/public/products')).body.products.find((x) => x.id === newId);
await t('a tampered browser price is ignored; the DB price is used', async () => {
  const r = await anon.req('POST', '/api/public/orders', { customer: cust, items: [{ ...item(p0), price: 1, unitPrice: 1 }], paymentMethod: 'cod' });
  assert.equal(r.status, 200, JSON.stringify(r.body)); assert.equal(r.body.subtotal, 800); assert.equal(r.body.delivery, 60); assert.equal(r.body.total, 860);
});
await t('stock was reserved (3 → 2)', async () => assert.equal((await mgr.req('GET', `/api/admin/products/${newId}`)).body.variants[0].stock, 2));
await t('overselling is refused (409) and changes nothing', async () => {
  assert.equal((await anon.req('POST', '/api/public/orders', { customer: cust, items: [item(p0, 5)] })).status, 409);
  assert.equal((await mgr.req('GET', `/api/admin/products/${newId}`)).body.variants[0].stock, 2);
});
await t('6 simultaneous orders for 2 remaining units: exactly 2 succeed', async () => {
  const rs = await Promise.all(Array.from({ length: 6 }, () => anon.req('POST', '/api/public/orders', { customer: cust, items: [item(p0, 1)] })));
  assert.equal(rs.filter((r) => r.status === 200).length, 2); assert.equal((await mgr.req('GET', `/api/admin/products/${newId}`)).body.variants[0].stock, 0);
});
const cheap = products.find((p) => p.price >= 999 && p.stockCount > 5 && p.id !== newId);
await t('coupon is applied server-side; fake coupon gives no discount', async () => {
  const ok = (await anon.req('POST', '/api/public/cart/price', { items: [item(cheap)], couponCode: 'gully10' })).body;
  assert.equal(ok.couponApplied, 'GULLY10'); assert.equal(ok.discount, Math.round(cheap.price * 0.1));
  const bad = (await anon.req('POST', '/api/public/cart/price', { items: [item(cheap)], couponCode: 'FREEMONEY' })).body; assert.equal(bad.discount, 0); assert.ok(bad.couponMessage);
});
await t('bad PIN code is rejected', async () => assert.equal((await anon.req('POST', '/api/public/orders', { customer: { ...cust, pinCode: '12' }, items: [item(cheap)] })).status, 400));
const stockOf = async (id) => (await anon.req('GET', '/api/public/products')).body.products.find((p) => p.id === id).stockCount;
let ord;
await t('order placed for the cancellation test reserves stock', async () => {
  const before = await stockOf(cheap.id);
  const r = await anon.req('POST', '/api/public/orders', { customer: cust, items: [item(cheap, 2)], couponCode: 'GULLY10' }); assert.equal(r.status, 200);
  ord = { ...r.body, before, id: (await mgr.req('GET', `/api/admin/orders?q=${r.body.number}`)).body.orders[0].id };
  assert.equal(before - (await stockOf(cheap.id)), 2);
});
await t('staff cannot cancel; invalid transition blocked; manager cancel restores stock and records who/when', async () => {
  assert.equal((await staff.req('POST', `/api/admin/orders/${ord.id}/status`, { status: 'cancelled', note: 'x' })).status, 403);
  assert.equal((await mgr.req('POST', `/api/admin/orders/${ord.id}/status`, { status: 'delivered' })).status, 400);
  const r = await mgr.req('POST', `/api/admin/orders/${ord.id}/status`, { status: 'cancelled', note: 'Customer requested' });
  assert.equal(r.status, 200); assert.equal(r.body.history.at(-1).admin_name, 'Mgr'); assert.equal(await stockOf(cheap.id), ord.before);
});
await t('cancelling twice cannot restore stock twice', async () => { assert.equal((await mgr.req('POST', `/api/admin/orders/${ord.id}/status`, { status: 'cancelled', note: 'again' })).status, 400); assert.equal(await stockOf(cheap.id), ord.before); });
await t('orders are never auto-marked paid; manual confirmation needs manager + reference', async () => {
  assert.equal((await mgr.req('GET', `/api/admin/orders/${ord.id}`)).body.order.payment_status, 'unpaid');
  assert.equal((await staff.req('POST', `/api/admin/orders/${ord.id}/payment`, { reference: 'cash' })).status, 403);
  assert.equal((await mgr.req('POST', `/api/admin/orders/${ord.id}/payment`, {})).status, 400);
});
await t('stock adjustment needs a reason and is logged', async () => {
  const v = (await mgr.req('GET', `/api/admin/products/${newId}`)).body.variants[0];
  assert.equal((await staff.req('POST', '/api/admin/inventory/adjust', { variantId: v.id, delta: 5 })).status, 400);
  assert.equal((await staff.req('POST', '/api/admin/inventory/adjust', { variantId: v.id, delta: 5, reason: 'Restock delivery' })).status, 200);
  assert.match((await mgr.req('GET', `/api/admin/inventory/history?productId=${newId}`)).body.history[0].reason, /Restock delivery/);
});
await t('archiving a product keeps historical order items intact', async () => {
  assert.equal((await mgr.req('DELETE', `/api/admin/products/${newId}`)).status, 200);
  const o = (await mgr.req('GET', '/api/admin/orders?q=NG-')).body.orders; assert.ok(o.length >= 3);
  const first = o.at(-1); assert.ok((await mgr.req('GET', `/api/admin/orders/${first.id}`)).body.items[0].name);
  assert.ok(!(await anon.req('GET', '/api/public/products')).body.products.some((p) => p.id === newId));
});

console.log('Reports, privacy & misc');
await t('dashboard uses real data; staff sees no money figures; traffic is not faked', async () => {
  const m = (await mgr.req('GET', '/api/admin/dashboard?range=30d')).body; assert.ok(m.sales); assert.equal(m.traffic.configured, false);
  assert.equal((await staff.req('GET', '/api/admin/dashboard')).body.sales, undefined);
});
await t('customer export is Super Admin only', async () => { assert.equal((await mgr.req('GET', '/api/admin/customers/export.csv')).status, 403); assert.equal((await sa.req('GET', '/api/admin/customers/export.csv', null, { raw: true })).status, 200); });
await t('CSV export neutralises spreadsheet-formula injection', async () => {
  await anon.req('POST', '/api/public/orders', { customer: { ...cust, fullName: '=HYPERLINK("http://evil")' }, items: [item(cheap)] });
  const txt = await (await sa.req('GET', '/api/admin/orders/export.csv', null, { raw: true })).text(); assert.ok(txt.includes("'=HYPERLINK")); assert.ok(!/,=HYPERLINK/.test(txt));
});
await t('invoice HTML escapes customer-supplied text', async () => {
  const id = (await sa.req('GET', '/api/admin/orders?q=Test')).body.orders[0].id;
  await anon.req('POST', '/api/public/orders', { customer: { ...cust, fullName: '<img src=x onerror=alert(1)>' }, items: [item(cheap)] });
  const oid = (await sa.req('GET', '/api/admin/orders?q=img')).body.orders[0].id;
  const h = await (await sa.req('GET', `/api/admin/orders/${oid}/invoice`, null, { raw: true })).text(); assert.ok(!h.includes('<img src=x')); assert.ok(h.includes('&lt;img')); void id;
});
await t('robots.txt blocks /admin; sitemap lists only published products', async () => {
  assert.match(await (await fetch(BASE + '/robots.txt')).text(), /Disallow: \/admin/);
  assert.ok(!(await (await fetch(BASE + '/sitemap.xml')).text()).includes(newId));
});
await t('security headers are present', async () => { const r = await fetch(BASE + '/api/public/bootstrap'); assert.equal(r.headers.get('x-frame-options'), 'DENY'); assert.match(r.headers.get('content-security-policy'), /default-src 'self'/); });
await t('account lockout after 5 bad passwords (run last)', async () => {
  const c = new Client(); for (let i = 0; i < 5; i++) await c.login('staff@example.com', 'bad');
  const r = await c.login('staff@example.com', PW); assert.equal(r.status, 401); assert.match(r.body.error, /locked/i);
});
console.log(`\n${pass} passed${process.exitCode ? ' — WITH FAILURES' : ''}`);
