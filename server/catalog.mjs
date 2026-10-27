import { db, tx, getSetting, notify } from './db.mjs';
import { bad, HttpError } from './http.mjs';

export const effectivePrice = (p) => (p.sale_price != null && p.sale_price < p.price ? p.sale_price : p.price);
const J = (s, d = []) => { try { return JSON.parse(s); } catch { return d; } };

export function variantsOf(productId) { return db.prepare('SELECT * FROM variants WHERE product_id=? ORDER BY id').all(productId); }

/** DB row -> the exact Product shape the existing storefront components already use. */
export function toPublicProduct(p, variants = variantsOf(p.id), catRow) {
  const cat = catRow ?? (p.category_id ? db.prepare('SELECT slug,group_key FROM categories WHERE id=?').get(p.category_id) : null);
  const images = J(p.images);
  const sizes = [...new Set(variants.map((v) => v.size))];
  const colors = []; for (const v of variants) if (!colors.some((c) => c.name === v.color_name)) colors.push({ name: v.color_name, hex: v.color_hex });
  const stock = variants.reduce((s, v) => s + v.stock, 0);
  const price = effectivePrice(p);
  const onSale = price < p.price;
  return {
    id: p.slug, name: p.name, price, originalPrice: onSale ? p.price : undefined,
    discountPercentage: onSale ? Math.round(((p.price - price) / p.price) * 100) : undefined,
    category: cat?.group_key ?? 'men', subCategory: (cat?.slug ?? '').replace(/^(men|kids)-/, ''),
    images, description: p.description, sizes, colors, inStock: stock > 0, stockCount: stock,
    fabric: p.fabric, fit: p.fit, isFeatured: !!p.featured, isNewArrival: !!p.new_arrival, isTrending: !!p.best_seller,
    isOffer: onSale, rating: p.rating, reviewCount: p.review_count, sku: p.sku, brand: p.brand, tags: J(p.tags), imageAlt: p.image_alt || p.name,
    seoTitle: p.seo_title, seoDescription: p.seo_description,
    variants: variants.map((v) => ({ size: v.size, color: v.color_name, stock: v.stock })),
  };
}

// ------------------------------------------------------------------ coupons
export function couponProblem(c, subtotal, lines) {
  const now = new Date().toISOString().slice(0, 10);
  if (!c || !c.active) return 'Invalid or expired promotional code.';
  if (c.starts_at && now < c.starts_at.slice(0, 10)) return 'This code is not active yet.';
  if (c.expires_at && now > c.expires_at.slice(0, 10)) return 'Invalid or expired promotional code.';
  if (c.usage_limit != null && c.used_count >= c.usage_limit) return 'This code has reached its usage limit.';
  if (subtotal < c.min_order) return `Minimum order of ₹${c.min_order.toLocaleString('en-IN')} required for ${c.code}.`;
  if (!eligibleSubtotal(c, lines)) return `${c.code} does not apply to the items in your cart.`;
  return null;
}
function eligibleSubtotal(c, lines) {
  const ids = J(c.scope_ids);
  return lines.filter((l) => c.scope_type === 'all' || (c.scope_type === 'group' && ids.includes(l.group)) ||
    (c.scope_type === 'category' && ids.includes(l.categorySlug)) || (c.scope_type === 'product' && ids.includes(l.productId)))
    .reduce((s, l) => s + l.unit * l.qty, 0);
}
export function couponDiscount(c, lines) {
  const base = eligibleSubtotal(c, lines);
  return Math.min(base, c.type === 'percent' ? Math.round((base * c.value) / 100) : c.value);
}

// ------------------------------------------------------------------ pricing (server is the only authority)
export function priceCart(items, couponCode) {
  if (!Array.isArray(items) || !items.length) throw bad('Your cart is empty.');
  if (items.length > 50) throw bad('Too many items in the cart.');
  const store = getSetting('store', {});
  const lines = [];
  for (const it of items) {
    const qty = Number(it.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) throw bad('Invalid quantity.');
    const p = db.prepare(`SELECT * FROM products WHERE (slug=? OR id=?) AND status='published'`).get(String(it.productId), String(it.productId));
    if (!p) throw new HttpError(409, `An item in your cart is no longer available.`);
    const v = db.prepare('SELECT * FROM variants WHERE product_id=? AND size=? AND color_name=?').get(p.id, String(it.size), String(it.color));
    if (!v) throw new HttpError(409, `${p.name}: selected size/colour is not available.`);
    const cat = p.category_id ? db.prepare('SELECT slug,group_key FROM categories WHERE id=?').get(p.category_id) : null;
    lines.push({ p, v, qty, unit: effectivePrice(p), productId: p.id, categorySlug: cat?.slug, group: cat?.group_key });
  }
  // merge duplicate variant lines so stock checks are exact
  const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);
  let discount = 0, coupon = null, couponMessage = null;
  if (couponCode) {
    coupon = db.prepare('SELECT * FROM coupons WHERE code=?').get(String(couponCode).trim().toUpperCase());
    couponMessage = couponProblem(coupon, subtotal, lines);
    if (couponMessage) coupon = null; else discount = couponDiscount(coupon, lines);
  }
  const free = Number(store.freeDeliveryThreshold ?? 999), fee = Number(store.deliveryCharge ?? 60);
  const delivery = subtotal - discount >= free ? 0 : fee;
  return { lines, subtotal, discount, delivery, total: subtotal - discount + delivery, coupon, couponMessage };
}

// ------------------------------------------------------------------ stock helpers
export function adjustStock(variantId, delta, reason, { orderId = null, adminId = null } = {}) {
  const v = db.prepare('SELECT * FROM variants WHERE id=?').get(variantId);
  if (!v) throw bad('Variant not found');
  const after = v.stock + delta;
  if (after < 0) throw new HttpError(409, `Insufficient stock for ${v.size}/${v.color_name}`);
  db.prepare('UPDATE variants SET stock=? WHERE id=?').run(after, variantId);
  db.prepare('INSERT INTO inventory_log(variant_id,product_id,delta,stock_after,reason,order_id,admin_id) VALUES(?,?,?,?,?,?,?)')
    .run(variantId, v.product_id, delta, after, reason, orderId, adminId);
  const p = db.prepare('SELECT name,low_stock_threshold FROM products WHERE id=?').get(v.product_id);
  if (delta < 0 && p) {
    const total = db.prepare('SELECT SUM(stock) s FROM variants WHERE product_id=?').get(v.product_id).s;
    if (total === 0) notify('out_of_stock', `Out of stock: ${p.name}`, 'All variants are sold out.');
    else if (after <= p.low_stock_threshold && v.stock > p.low_stock_threshold) notify('low_stock', `Low stock: ${p.name}`, `${v.size}/${v.color_name} down to ${after}.`);
  }
  return after;
}

export function placeOrder({ customer, items, couponCode, paymentMethod }) {
  return tx(() => {
    const blocked = db.prepare("SELECT 1 FROM customer_profiles WHERE mobile=? AND status='blocked'").get(customer.mobile);
    if (blocked) throw new HttpError(403, 'We are unable to process this order online. Please contact the store.');
    const priced = priceCart(items, couponCode);
    if (couponCode && priced.couponMessage) throw bad(priced.couponMessage);
    // aggregate quantity per variant, then reserve stock atomically
    const need = new Map();
    for (const l of priced.lines) need.set(l.v.id, (need.get(l.v.id) || 0) + l.qty);
    for (const [vid, q] of need) {
      const cur = db.prepare('SELECT stock FROM variants WHERE id=?').get(vid).stock;
      if (cur < q) { const l = priced.lines.find((x) => x.v.id === vid); throw new HttpError(409, `Sorry, only ${cur} left of ${l.p.name} (${l.v.size}, ${l.v.color_name}).`); }
    }
    if (priced.coupon) {
      const r = db.prepare('UPDATE coupons SET used_count=used_count+1 WHERE id=? AND (usage_limit IS NULL OR used_count<usage_limit)').run(priced.coupon.id);
      if (!r.changes) throw bad('This code has reached its usage limit.');
    }
    const r = db.prepare(`INSERT INTO orders(number,customer_name,mobile,email,address,landmark,city,state,pin_code,customer_notes,
      subtotal,discount,delivery,total,coupon_code,payment_method,stock_committed) VALUES('tmp',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`)
      .run(customer.fullName, customer.mobile, customer.email, customer.address, customer.landmark, customer.city, customer.state,
        customer.pinCode, customer.notes, priced.subtotal, priced.discount, priced.delivery, priced.total, priced.coupon?.code ?? null, paymentMethod);
    const id = Number(r.lastInsertRowid);
    const number = `NG-${new Date().getFullYear()}-${String(id).padStart(5, '0')}`;
    db.prepare('UPDATE orders SET number=? WHERE id=?').run(number, id);
    const insItem = db.prepare('INSERT INTO order_items(order_id,product_id,variant_id,name,sku,size,color,unit_price,qty,image) VALUES(?,?,?,?,?,?,?,?,?,?)');
    for (const l of priced.lines) {
      insItem.run(id, l.p.id, l.v.id, l.p.name, l.p.sku, l.v.size, l.v.color_name, l.unit, l.qty, J(l.p.images)[0] || '');
      adjustStock(l.v.id, -l.qty, `Order ${number} placed`, { orderId: id });
    }
    db.prepare(`INSERT INTO order_history(order_id,from_status,to_status,admin_name,note) VALUES(?,NULL,'pending','Customer','Order placed online')`).run(id);
    notify('new_order', `New order ${number}`, `${customer.fullName} · ₹${priced.total.toLocaleString('en-IN')}`);
    return { number, total: priced.total, subtotal: priced.subtotal, discount: priced.discount, delivery: priced.delivery };
  });
}
