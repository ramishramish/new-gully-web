import { db, getSetting } from '../db.mjs';
import { route, bad } from '../http.mjs';
import { toPublicProduct, priceCart, placeOrder } from '../catalog.mjs';

const J = (s, d = []) => { try { return JSON.parse(s); } catch { return d; } };
const today = () => new Date().toISOString().slice(0, 10);

route('GET', '/api/public/bootstrap', { public: true }, () => {
  const t = today();
  const offers = db.prepare(`SELECT * FROM offers WHERE active=1 AND (starts_at IS NULL OR starts_at<=?) AND (ends_at IS NULL OR ends_at>=?) ORDER BY sort,id`).all(t, t)
    .map((o) => ({ id: String(o.id), code: o.code, title: o.title, subtitle: o.subtitle, discountBadge: o.badge, description: o.description,
      validUntil: o.ends_at || '', targetCategory: o.target_group, terms: J(o.terms), minOrderValue: o.min_order, link: o.link, placements: J(o.placements) }));
  const marquee = getSetting('marquee', { enabled: true, speed: 40, direction: 'left' });
  const messages = db.prepare('SELECT * FROM marquee_messages WHERE active=1 ORDER BY sort,id').all().map((m) => ({ id: String(m.id), text: m.text, link: m.link || undefined, badge: m.badge || undefined }));
  const categories = db.prepare('SELECT id,slug,name,group_key,sort FROM categories WHERE active=1 ORDER BY sort,id').all();
  return { store: getSetting('store', {}), marquee: { ...marquee, messages }, offers, categories };
});

route('GET', '/api/public/products', { public: true }, () => {
  const rows = db.prepare(`SELECT * FROM products WHERE status='published' ORDER BY created_at DESC, rowid DESC`).all();
  const cats = new Map(db.prepare('SELECT id,slug,group_key FROM categories').all().map((c) => [c.id, c]));
  const vs = new Map();
  for (const v of db.prepare('SELECT * FROM variants ORDER BY id').all()) (vs.get(v.product_id) || vs.set(v.product_id, []).get(v.product_id)).push(v);
  return { products: rows.map((p) => toPublicProduct(p, vs.get(p.id) || [], cats.get(p.category_id))) };
});

// Cart preview: the browser sends only ids/sizes/quantities; every price comes from the DB.
route('POST', '/api/public/cart/price', { public: true, limit: { key: 'price', max: 120, windowMs: 60_000 } }, ({ body }) => {
  const r = priceCart(body.items, body.couponCode);
  return { subtotal: r.subtotal, discount: r.discount, delivery: r.delivery, total: r.total, couponApplied: r.coupon?.code ?? null, couponMessage: r.couponMessage };
});

const clean = (v, max) => String(v ?? '').trim().slice(0, max);
route('POST', '/api/public/orders', { public: true, limit: { key: 'order', max: 10, windowMs: 10 * 60_000 } }, ({ body }) => {
  const c = body.customer || {};
  const customer = { fullName: clean(c.fullName, 100), mobile: clean(c.mobile, 20), email: clean(c.email, 120), address: clean(c.address, 300),
    landmark: clean(c.landmark, 100), city: clean(c.city, 80), state: clean(c.state, 80), pinCode: clean(c.pinCode, 6), notes: clean(c.notes, 500) };
  if (!customer.fullName) throw bad('Full name is required.');
  if (!/^[0-9+\s-]{10,15}$/.test(customer.mobile)) throw bad('Please provide a valid contact number.');
  if (customer.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) throw bad('Please provide a valid email.');
  if (!customer.address || !customer.city) throw bad('Address and city are required.');
  if (!/^\d{6}$/.test(customer.pinCode)) throw bad('Enter a valid 6-digit Indian PIN code.');
  const paymentMethod = ['cod', 'store-pickup'].includes(body.paymentMethod) ? body.paymentMethod : 'cod';
  return placeOrder({ customer, items: body.items, couponCode: body.couponCode, paymentMethod });
});
