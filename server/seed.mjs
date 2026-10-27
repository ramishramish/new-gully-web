// One-time import of the ORIGINAL static catalogue (src/data/*.ts) into the database.
// Safe to re-run: it only seeds tables that are empty. Nothing is deleted.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { db, tx, setSetting, getSetting } from './db.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

function loadTs(rel) {
  const ts = require('typescript');
  const src = fs.readFileSync(path.join(root, rel), 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: 'ES2020' } }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(js, { module: mod, exports: mod.exports, require: () => ({}) });
  return mod.exports;
}

export function seedIfEmpty() {
  const empty = (t) => db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c === 0;
  const { ALL_PRODUCTS } = loadTs('src/data/products.ts');
  const { PROMOTIONAL_OFFERS } = loadTs('src/data/offers.ts');
  const { PROMOTIONAL_MESSAGES } = loadTs('src/data/marqueeMessages.ts');
  const { STORE_CONFIG } = loadTs('src/data/storeConfig.ts');
  const { MENS_SUBCATEGORIES, KIDS_SUBCATEGORIES } = loadTs('src/data/categories.ts');

  tx(() => {
    if (empty('categories')) {
      const ins = db.prepare('INSERT INTO categories(slug,name,group_key,sort) VALUES(?,?,?,?)');
      let n = 0;
      const rename = { trousers: 'Pants & Trousers' };
      MENS_SUBCATEGORIES.forEach((c) => ins.run(`men-${c.id}`, rename[c.id] || c.name, 'men', n++));
      KIDS_SUBCATEGORIES.forEach((c) => ins.run(`kids-${c.id}`, c.name, 'kids', n++));
      ins.run('accessories', 'Accessories', 'accessories', n++);
    }
    if (empty('products')) {
      const cat = (g, s) => db.prepare('SELECT id FROM categories WHERE slug=?').get(`${g}-${s}`)?.id ?? null;
      const insP = db.prepare(`INSERT INTO products(id,sku,slug,name,description,category_id,images,price,sale_price,fabric,fit,
        featured,new_arrival,best_seller,status,rating,review_count,tags,low_stock_threshold,image_alt)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'published', ?,?,?,?,?)`);
      const insV = db.prepare('INSERT INTO variants(product_id,size,color_name,color_hex,stock) VALUES(?,?,?,?,?)');
      const log = db.prepare(`INSERT INTO inventory_log(variant_id,product_id,delta,stock_after,reason) VALUES(?,?,?,?,'Initial import from original catalogue')`);
      let i = 0;
      for (const p of ALL_PRODUCTS) {
        i++;
        const hasSale = p.originalPrice && p.originalPrice > p.price;
        insP.run(p.id, `NG-${p.category.toUpperCase()}-${String(i).padStart(3, '0')}`, p.id, p.name, p.description,
          cat(p.category, p.subCategory), JSON.stringify(p.images),
          hasSale ? p.originalPrice : p.price, hasSale ? p.price : null, p.fabric || '', p.fit || '',
          p.isFeatured ? 1 : 0, p.isNewArrival ? 1 : 0, p.isTrending ? 1 : 0,
          p.rating || 0, p.reviewCount || 0, JSON.stringify([]), 5, p.name);
        const combos = p.sizes.length * p.colors.length;
        const total = p.inStock ? (p.stockCount ?? 20) : 0;
        let k = 0;
        for (const s of p.sizes) for (const c of p.colors) {
          const stock = Math.floor(total / combos) + (k < total % combos ? 1 : 0); k++;
          const r = insV.run(p.id, s, c.name, c.hex, stock);
          log.run(Number(r.lastInsertRowid), p.id, stock, stock);
        }
      }
    }
    if (empty('offers')) {
      const ins = db.prepare(`INSERT INTO offers(code,title,subtitle,badge,description,terms,target_group,min_order,ends_at,placements,sort)
        VALUES(?,?,?,?,?,?,?,?,?,?,?)`);
      PROMOTIONAL_OFFERS.forEach((o, n) => ins.run(o.code, o.title, o.subtitle, o.discountBadge, o.description,
        JSON.stringify(o.terms), o.targetCategory || 'all', o.minOrderValue || 0, o.validUntil, '["offers_page","home"]', n));
    }
    if (empty('coupons')) {
      const ins = db.prepare('INSERT INTO coupons(code,type,value,min_order,scope_type,scope_ids,expires_at) VALUES(?,?,?,?,?,?,?)');
      ins.run('VINTAGE20', 'percent', 20, 999, 'all', '[]', '2026-11-30');
      ins.run('GULLY10', 'percent', 10, 0, 'all', '[]', null);
      ins.run('MENSWEEK', 'percent', 20, 1200, 'group', '["men"]', '2026-11-15');
    }
    if (empty('marquee_messages')) {
      const ins = db.prepare('INSERT INTO marquee_messages(text,link,badge,sort) VALUES(?,?,?,?)');
      PROMOTIONAL_MESSAGES.forEach((m, n) => ins.run(m.text, m.link || '', m.badge || '', n));
    }
    if (!getSetting('marquee')) setSetting('marquee', { enabled: true, speed: 40, direction: 'left' });
    if (!getSetting('store')) {
      const c = STORE_CONFIG;
      setSetting('store', {
        name: c.name, tagline: c.tagline, established: c.established, location: c.location,
        currency: c.currency, currencySymbol: c.currencySymbol,
        // Original file only had placeholder numbers ("XXXXX"); we do NOT invent real ones.
        phone: '', whatsapp: '', email: c.email,
        hoursWeekdays: c.businessHours.weekdays, hoursWeekends: c.businessHours.weekends, hoursNote: c.businessHours.note,
        mapsSearchUrl: c.maps.searchUrl, mapsDirectionsUrl: c.maps.directionsUrl, mapsEmbedUrl: c.maps.embedUrl, mapsLabel: c.maps.placeLabel,
        instagram: c.social.instagram, facebook: c.social.facebook,
        freeDeliveryThreshold: c.delivery.freeDeliveryThreshold, deliveryCharge: c.delivery.standardDeliveryCharge,
        deliveryEstimate: c.delivery.estimatedDays,
      });
    }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { seedIfEmpty(); console.log('Seed complete.'); }
