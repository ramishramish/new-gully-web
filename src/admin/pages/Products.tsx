import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Badge, Confirm, Empty, ErrorBox, Field, Modal, PageHead, Spinner, Tabs, inr, msg, statusTone, useAdmin, useLoad } from '../ui';

// ================================================================= list
export const Products: React.FC = () => {
  const { call, can, toast } = useAdmin();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [tab, setTab] = useState<'products' | 'categories'>('products');
  const q = sp.get('q') || '', status = sp.get('status') || '', stock = sp.get('stock') || '', cat = sp.get('category') || '', sort = sp.get('sort') || 'date', dir = sp.get('dir') || 'desc';
  const setF = (k: string, v: string) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }); };
  const qs = new URLSearchParams({ ...(q && { q }), ...(status && { status }), ...(stock && { stock }), ...(cat && { category: cat }), sort, dir }).toString();
  const { data, error, loading, reload } = useLoad(() => call('GET', `/api/admin/products?${qs}`), [qs]);
  const cats = useLoad(() => call('GET', '/api/admin/categories'), []);
  const fileRef = useRef<HTMLInputElement>(null);

  const act = async (fn: () => Promise<any>, ok: string) => { try { await fn(); toast(ok); reload(); } catch (e) { toast(msg(e), true); } };
  const importCsv = async (f: File) => {
    try {
      const r = await call('POST', '/api/admin/products/import', { csv: await f.text() });
      toast(`Import done: ${r.created} created, ${r.updated} updated${r.errors.length ? `, ${r.errors.length} problems` : ''}`, !!r.errors.length);
      if (r.errors.length) window.alert(r.errors.slice(0, 15).join('\n'));
      reload();
    } catch (e) { toast(msg(e), true); }
  };

  return (
    <>
      <PageHead title="Products" sub="Everything published here appears on the storefront straight away.">
        {can('products.write') && <>
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); e.target.value = ''; }} />
          <button className="a-btn" onClick={() => fileRef.current?.click()}>Import CSV</button>
          <a className="a-btn" href="/api/admin/products/export.csv">Export CSV</a>
          <Link className="a-btn primary" to="/admin/products/new">+ Add product</Link></>}
      </PageHead>
      <Tabs tabs={[['products', 'Products'], ['categories', 'Categories']]} value={tab} onChange={setTab} />
      {tab === 'categories' ? <Categories /> : (
        <div className="a-card">
          <div className="a-card-h" style={{ gap: 8 }}>
            <input className="a-input" style={{ maxWidth: 240 }} placeholder="Search name or SKU" defaultValue={q} onKeyDown={(e) => e.key === 'Enter' && setF('q', (e.target as HTMLInputElement).value)} aria-label="Search products" />
            <select className="a-select" style={{ width: 140 }} value={status} onChange={(e) => setF('status', e.target.value)} aria-label="Status"><option value="">Active (not archived)</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option><option value="all">All</option></select>
            <select className="a-select" style={{ width: 150 }} value={cat} onChange={(e) => setF('category', e.target.value)} aria-label="Category"><option value="">All categories</option>{cats.data?.categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select className="a-select" style={{ width: 130 }} value={stock} onChange={(e) => setF('stock', e.target.value)} aria-label="Stock"><option value="">Any stock</option><option value="in">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select>
            <select className="a-select" style={{ width: 130 }} value={sort} onChange={(e) => setF('sort', e.target.value)} aria-label="Sort by"><option value="date">Newest</option><option value="updated">Recently edited</option><option value="name">Name</option><option value="price">Price</option><option value="stock">Stock</option></select>
            <button className="a-btn" onClick={() => setF('dir', dir === 'asc' ? 'desc' : 'asc')} aria-label="Toggle sort direction">{dir === 'asc' ? '↑ Asc' : '↓ Desc'}</button>
          </div>
          {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} retry={reload} /> : !data?.products.length ? <Empty>No products match. {can('products.write') && <Link to="/admin/products/new" style={{ color: 'var(--brand)' }}>Add your first product</Link>}</Empty> : (
            <div className="a-scroll"><table className="a-table"><thead><tr><th></th><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody>
              {data.products.map((p: any) => (
                <tr key={p.id}>
                  <td style={{ width: 54 }}>{p.images[0] ? <img src={p.images[p.main_image] || p.images[0]} alt="" style={{ width: 44, height: 54, objectFit: 'cover', borderRadius: 3 }} /> : <div className="a-skel" style={{ width: 44, height: 54 }} />}</td>
                  <td><Link to={`/admin/products/${p.id}`} style={{ fontWeight: 700 }}>{p.name}</Link><div style={{ fontSize: 11, color: 'var(--muted)' }}>{[p.featured && 'Featured', p.new_arrival && 'New', p.best_seller && 'Best-seller'].filter(Boolean).join(' · ')}</div></td>
                  <td>{p.sku}</td><td>{p.category_name || '—'}</td>
                  <td>{p.sale_price != null ? <><b>{inr(p.sale_price)}</b> <s style={{ color: 'var(--muted)' }}>{inr(p.price)}</s></> : inr(p.price)}</td>
                  <td>{p.stock === 0 ? <Badge tone="bad">Out</Badge> : p.stock <= p.low_stock_threshold ? <Badge tone="warn">Low · {p.stock}</Badge> : p.stock}</td>
                  <td><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="a-btn sm" onClick={() => nav(`/admin/products/${p.id}`)}>Edit</button>{' '}
                    {can('products.write') && <>
                      <button className="a-btn sm" onClick={() => act(() => call('POST', `/api/admin/products/${p.id}/status`, { status: p.status === 'published' ? 'draft' : 'published' }), p.status === 'published' ? 'Unpublished' : 'Published')}>{p.status === 'published' ? 'Unpublish' : 'Publish'}</button>{' '}
                      <button className="a-btn sm" onClick={() => act(async () => { const r = await call('POST', `/api/admin/products/${p.id}/duplicate`); nav(`/admin/products/${r.id}`); }, 'Duplicated as draft')}>Duplicate</button></>}{' '}
                    {can('products.delete') && p.status !== 'archived' && <button className="a-btn sm danger" onClick={() => Confirm(`Archive “${p.name}”? It disappears from the shop; past orders keep their details.`) && act(() => call('DELETE', `/api/admin/products/${p.id}`), 'Archived')}>Archive</button>}
                  </td>
                </tr>))}
            </tbody></table></div>)}
        </div>)}
    </>
  );
};

// ================================================================= categories
const Categories: React.FC = () => {
  const { call, can, toast } = useAdmin();
  const { data, error, loading, reload } = useLoad(() => call('GET', '/api/admin/categories'), []);
  const [edit, setEdit] = useState<any | null>(null);
  const move = async (i: number, d: number) => {
    const ids = data.categories.map((c: any) => c.id); const j = i + d; if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]]; try { await call('PUT', '/api/admin/categories/reorder', { ids }); reload(); } catch (e) { toast(msg(e), true); }
  };
  const save = async () => {
    try { edit.id ? await call('PUT', `/api/admin/categories/${edit.id}`, edit) : await call('POST', '/api/admin/categories', edit); toast('Category saved'); setEdit(null); reload(); } catch (e) { toast(msg(e), true); }
  };
  return (
    <div className="a-card">
      <div className="a-card-h"><span style={{ color: 'var(--muted)' }}>Order here controls the order on the storefront.</span>{can('products.write') && <button className="a-btn primary" onClick={() => setEdit({ name: '', group: 'men', description: '', active: true })}>+ Add category</button>}</div>
      {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} retry={reload} /> : (
        <div className="a-scroll"><table className="a-table"><thead><tr><th>Order</th><th>Name</th><th>Section</th><th>Products</th><th>Status</th><th></th></tr></thead><tbody>
          {data.categories.map((c: any, i: number) => (
            <tr key={c.id}><td style={{ whiteSpace: 'nowrap' }}>{can('products.write') && <><button className="a-btn sm" onClick={() => move(i, -1)} aria-label="Move up">↑</button> <button className="a-btn sm" onClick={() => move(i, 1)} aria-label="Move down">↓</button></>}</td>
              <td><b>{c.name}</b></td><td>{c.group_key}</td><td>{c.product_count}</td><td>{c.active ? <Badge tone="ok">Active</Badge> : <Badge>Hidden</Badge>}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{can('products.write') && <button className="a-btn sm" onClick={() => setEdit({ id: c.id, name: c.name, group: c.group_key, description: c.description, image: c.image, active: !!c.active })}>Rename / edit</button>}{' '}
                {can('products.delete') && <button className="a-btn sm danger" onClick={async () => { if (!Confirm(`Delete category “${c.name}”?`)) return; try { await call('DELETE', `/api/admin/categories/${c.id}`); toast('Deleted'); reload(); } catch (e) { toast(msg(e), true); } }}>Delete</button>}</td></tr>))}
        </tbody></table></div>)}
      {edit && <Modal title={edit.id ? 'Edit category' : 'New category'} onClose={() => setEdit(null)}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Field label="Name"><input className="a-input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
          <Field label="Section"><select className="a-select" value={edit.group} onChange={(e) => setEdit({ ...edit, group: e.target.value })}><option value="men">Men’s</option><option value="kids">Kids’</option><option value="accessories">Accessories</option></select></Field>
          <Field label="Description"><textarea className="a-textarea" value={edit.description || ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
          <label><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Active</label>
          <button className="a-btn primary" onClick={save}>Save category</button>
        </div></Modal>}
    </div>
  );
};

// ================================================================= editor
interface Form {
  name: string; sku: string; slug: string; description: string; categoryId: number | ''; brand: string; images: string[]; mainImage: number;
  price: string; salePrice: string; lowStockThreshold: string; tags: string; fabric: string; fit: string; featured: boolean; newArrival: boolean; bestSeller: boolean;
  status: 'draft' | 'published' | 'archived'; seoTitle: string; seoDescription: string; imageAlt: string;
}
const blank: Form = { name: '', sku: '', slug: '', description: '', categoryId: '', brand: '', images: [], mainImage: 0, price: '', salePrice: '', lowStockThreshold: '5', tags: '', fabric: '', fit: '', featured: false, newArrival: false, bestSeller: false, status: 'draft', seoTitle: '', seoDescription: '', imageAlt: '' };

/** Shrinks big phone photos in the browser (max 1600px, re-encoded as WebP/JPEG) before upload. */
async function shrink(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) throw new Error('Only JPG, PNG, WebP or GIF images are allowed.');
  if (file.size > 12 * 1024 * 1024) throw new Error('Image is too large (max 12 MB).');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Could not read that image.')); i.src = url; });
    const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    let out = c.toDataURL('image/webp', 0.85); if (!out.startsWith('data:image/webp')) out = c.toDataURL('image/jpeg', 0.88);
    return out;
  } finally { URL.revokeObjectURL(url); }
}

export const ProductEditor: React.FC = () => {
  const { id } = useParams(); const isNew = !id;
  const { call, can, toast } = useAdmin(); const nav = useNavigate();
  const [f, setF] = useState<Form>(blank);
  const [sizes, setSizes] = useState('S, M, L, XL');
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([{ name: 'Default', hex: '#281A14' }]);
  const [stock, setStock] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false); const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false); const [urlInput, setUrlInput] = useState('');
  const cats = useLoad(() => call('GET', '/api/admin/categories'), []);
  const writable = can('products.write');

  useEffect(() => {
    if (isNew) return;
    call('GET', `/api/admin/products/${id}`).then(({ product: p, variants }) => {
      setF({ name: p.name, sku: p.sku, slug: p.slug, description: p.description, categoryId: p.category_id ?? '', brand: p.brand, images: p.images, mainImage: p.main_image,
        price: String(p.price), salePrice: p.sale_price != null ? String(p.sale_price) : '', lowStockThreshold: String(p.low_stock_threshold), tags: (p.tags || []).join(', '),
        fabric: p.fabric, fit: p.fit, featured: !!p.featured, newArrival: !!p.new_arrival, bestSeller: !!p.best_seller, status: p.status, seoTitle: p.seo_title, seoDescription: p.seo_description, imageAlt: p.image_alt });
      setSizes([...new Set(variants.map((v: any) => v.size))].join(', '));
      const cs: { name: string; hex: string }[] = []; variants.forEach((v: any) => { if (!cs.some((c) => c.name === v.color_name)) cs.push({ name: v.color_name, hex: v.color_hex }); });
      setColors(cs.length ? cs : [{ name: 'Default', hex: '#281A14' }]);
      setStock(Object.fromEntries(variants.map((v: any) => [`${v.size}|${v.color_name}`, v.stock])));
    }).catch((e) => toast(msg(e), true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const sizeList = [...new Set(sizes.split(',').map((s) => s.trim()).filter(Boolean))];
  const price = Number(f.price) || 0, sale = f.salePrice === '' ? null : Number(f.salePrice);
  const discountPct = sale != null && price ? Math.round(((price - sale) / price) * 100) : 0;
  const totalStock = sizeList.reduce((s, z) => s + colors.reduce((t, c) => t + (stock[`${z}|${c.name}`] || 0), 0), 0);

  const upload = async (files: FileList | null) => {
    if (!files) return; setUploading(true);
    try { const urls: string[] = []; for (const file of Array.from(files)) { const data = await shrink(file); urls.push((await call('POST', '/api/admin/uploads', { data })).url); } set('images', [...f.images, ...urls]); toast(`${urls.length} image(s) uploaded`); }
    catch (e) { toast(msg(e), true); } finally { setUploading(false); }
  };
  const moveImg = (i: number, d: number) => { const a = [...f.images]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setF({ ...f, images: a, mainImage: f.mainImage === i ? j : f.mainImage === j ? i : f.mainImage }); };

  const save = async (status?: Form['status']) => {
    setBusy(true);
    try {
      const body = { ...f, status: status || f.status, tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean), salePrice: f.salePrice === '' ? null : f.salePrice,
        variants: sizeList.flatMap((size) => colors.filter((c) => c.name.trim()).map((c) => ({ size, colorName: c.name.trim(), colorHex: c.hex, stock: stock[`${size}|${c.name}`] || 0 }))) };
      const r = await call(isNew ? 'POST' : 'PUT', isNew ? '/api/admin/products' : `/api/admin/products/${id}`, body);
      toast(status === 'published' ? 'Published — it is live on the storefront' : 'Saved'); if (isNew) nav(`/admin/products/${r.id}`, { replace: true }); else if (status) set('status', status);
    } catch (e) { toast(msg(e), true); } finally { setBusy(false); }
  };

  const cur = cats.data?.categories.find((c: any) => c.id === f.categoryId);
  return (
    <>
      <PageHead title={isNew ? 'New product' : f.name || 'Edit product'} sub={isNew ? '' : `SKU ${f.sku}`}>
        <Link className="a-btn" to="/admin/products">← Back</Link>
        <button className="a-btn" onClick={() => setPreview(true)}>Preview</button>
        {writable && <>
          <button className="a-btn" disabled={busy} onClick={() => save('draft')}>Save as draft</button>
          <button className="a-btn primary" disabled={busy} onClick={() => save('published')}>{busy ? 'Saving…' : 'Publish'}</button>
          <button className="a-btn" disabled={busy} onClick={() => save()}>Save changes</button></>}
      </PageHead>
      {!writable && <div className="a-card a-card-b" style={{ marginBottom: 12 }}>You have read-only access to products. Stock can be adjusted from Inventory.</div>}
      <fieldset disabled={!writable} style={{ border: 0, padding: 0, margin: 0 }}>
        <div className="a-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', alignItems: 'start' }}>
          <div className="a-grid">
            <div className="a-card a-card-b a-grid">
              <Field label="Product name"><input className="a-input" value={f.name} onChange={(e) => set('name', e.target.value)} maxLength={150} /></Field>
              <div className="a-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <Field label="SKU (unique)"><input className="a-input" value={f.sku} onChange={(e) => set('sku', e.target.value)} placeholder="NG-MEN-020" /></Field>
                <Field label="URL slug" hint="Used in the product link"><input className="a-input" value={f.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto from name" /></Field>
              </div>
              <Field label="Description"><textarea className="a-textarea" style={{ minHeight: 130 }} value={f.description} onChange={(e) => set('description', e.target.value)} /></Field>
              <div className="a-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <Field label="Category / subcategory"><select className="a-select" value={f.categoryId} onChange={(e) => set('categoryId', Number(e.target.value))}><option value="">Choose…</option>{cats.data?.categories.map((c: any) => <option key={c.id} value={c.id}>{c.group_key} › {c.name}</option>)}</select></Field>
                <Field label="Brand (optional)"><input className="a-input" value={f.brand} onChange={(e) => set('brand', e.target.value)} /></Field>
                <Field label="Fabric"><input className="a-input" value={f.fabric} onChange={(e) => set('fabric', e.target.value)} /></Field>
                <Field label="Fit"><input className="a-input" value={f.fit} onChange={(e) => set('fit', e.target.value)} /></Field>
              </div>
              <Field label="Tags" hint="Comma separated"><input className="a-input" value={f.tags} onChange={(e) => set('tags', e.target.value)} /></Field>
            </div>

            <div className="a-card"><div className="a-card-h"><h3 style={{ margin: 0, fontSize: 16 }}>Images</h3><label className="a-btn sm" style={{ cursor: 'pointer' }}>{uploading ? 'Uploading…' : '+ Upload from device'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ''; }} /></label></div>
              <div className="a-card-b">
                {!f.images.length ? <Empty>No images yet. Upload JPG, PNG or WebP (resized automatically).</Empty> : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
                    {f.images.map((src, i) => (
                      <div key={src + i} style={{ border: `2px solid ${f.mainImage === i ? 'var(--gold)' : 'var(--line)'}`, borderRadius: 4, padding: 4 }}>
                        <img src={src} alt={f.imageAlt || f.name} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 2 }} />
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 4 }}>
                          <button className="a-btn sm" onClick={() => moveImg(i, -1)} aria-label="Move earlier">←</button><button className="a-btn sm" onClick={() => moveImg(i, 1)} aria-label="Move later">→</button>
                          <button className="a-btn sm" onClick={() => set('mainImage', i)} disabled={f.mainImage === i}>{f.mainImage === i ? 'Main ★' : 'Main'}</button>
                          <button className="a-btn sm danger" onClick={() => setF({ ...f, images: f.images.filter((_, k) => k !== i), mainImage: Math.max(0, f.mainImage >= i && f.mainImage > 0 ? f.mainImage - 1 : f.mainImage) })} aria-label="Remove">✕</button>
                        </div></div>))}
                  </div>)}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><input className="a-input" placeholder="…or paste an https:// image link" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} /><button className="a-btn" onClick={() => { if (/^https:\/\//.test(urlInput.trim())) { set('images', [...f.images, urlInput.trim()]); setUrlInput(''); } else toast('Link must start with https://', true); }}>Add</button></div>
              </div></div>

            <div className="a-card"><div className="a-card-h"><h3 style={{ margin: 0, fontSize: 16 }}>Sizes, colours &amp; stock</h3><Badge tone="muted">{totalStock} units total</Badge></div>
              <div className="a-card-b a-grid">
                <Field label="Sizes" hint="Comma separated, e.g. S, M, L or 30, 32, 34 or 2-3Y, 4-5Y"><input className="a-input" value={sizes} onChange={(e) => setSizes(e.target.value)} /></Field>
                <div><span className="a-label">Colours</span>
                  {colors.map((c, i) => (<div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <input type="color" value={c.hex} onChange={(e) => setColors(colors.map((x, k) => (k === i ? { ...x, hex: e.target.value } : x)))} aria-label="Colour swatch" style={{ width: 42, height: 38 }} />
                    <input className="a-input" value={c.name} onChange={(e) => { const old = c.name; const nn = e.target.value; setColors(colors.map((x, k) => (k === i ? { ...x, name: nn } : x))); setStock((s) => Object.fromEntries(Object.entries(s).map(([k, v]) => [k.endsWith(`|${old}`) ? `${k.slice(0, -old.length - 1)}|${nn}` : k, v]))); }} placeholder="Colour name" />
                    {colors.length > 1 && <button className="a-btn sm danger" onClick={() => setColors(colors.filter((_, k) => k !== i))} aria-label="Remove colour">✕</button>}</div>))}
                  <button className="a-btn sm" onClick={() => setColors([...colors, { name: '', hex: '#888888' }])}>+ Colour</button></div>
                {!!sizeList.length && <div className="a-scroll"><table className="a-table"><thead><tr><th>Stock</th>{colors.map((c) => <th key={c.name}><span style={{ display: 'inline-block', width: 10, height: 10, background: c.hex, border: '1px solid var(--line)', marginRight: 5 }} />{c.name || '—'}</th>)}</tr></thead>
                  <tbody>{sizeList.map((z) => <tr key={z}><td><b>{z}</b></td>{colors.map((c) => <td key={c.name}><input className="a-input" type="number" min={0} style={{ width: 80 }} value={stock[`${z}|${c.name}`] ?? 0} onChange={(e) => setStock({ ...stock, [`${z}|${c.name}`]: Math.max(0, Number(e.target.value) || 0) })} aria-label={`Stock ${z} ${c.name}`} /></td>)}</tr>)}</tbody></table></div>}
                <div className="a-hint">Changing stock here is logged in Inventory history. Use Inventory → Adjust for reasons like “damaged” or “restock”.</div>
              </div></div>
          </div>

          <div className="a-grid">
            <div className="a-card a-card-b a-grid">
              <div className="a-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <Field label="Price (₹)"><input className="a-input" type="number" min={0} value={f.price} onChange={(e) => set('price', e.target.value)} /></Field>
                <Field label="Sale price (₹)" hint="Leave empty for no sale"><input className="a-input" type="number" min={0} value={f.salePrice} onChange={(e) => set('salePrice', e.target.value)} /></Field>
                <Field label="Discount %" hint="Fills the sale price"><input className="a-input" type="number" min={0} max={99} value={discountPct || ''} onChange={(e) => { const d = Number(e.target.value); set('salePrice', d > 0 && price ? String(Math.round(price * (1 - d / 100))) : ''); }} /></Field>
                <Field label="Low-stock alert at"><input className="a-input" type="number" min={0} value={f.lowStockThreshold} onChange={(e) => set('lowStockThreshold', e.target.value)} /></Field>
              </div>
              <label><input type="checkbox" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured product</label>
              <label><input type="checkbox" checked={f.newArrival} onChange={(e) => set('newArrival', e.target.checked)} /> New arrival</label>
              <label><input type="checkbox" checked={f.bestSeller} onChange={(e) => set('bestSeller', e.target.checked)} /> Best-seller</label>
              <Field label="Status"><select className="a-select" value={f.status} onChange={(e) => set('status', e.target.value as Form['status'])}><option value="draft">Draft (hidden)</option><option value="published">Published (live)</option><option value="archived">Archived</option></select></Field>
            </div>
            <div className="a-card a-card-b a-grid">
              <h3 style={{ margin: 0, fontSize: 16 }}>SEO</h3>
              <Field label="SEO title" hint={`${f.seoTitle.length}/70`}><input className="a-input" maxLength={70} value={f.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} /></Field>
              <Field label="Meta description" hint={`${f.seoDescription.length}/170`}><textarea className="a-textarea" maxLength={170} value={f.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} /></Field>
              <Field label="Image alt text"><input className="a-input" value={f.imageAlt} onChange={(e) => set('imageAlt', e.target.value)} /></Field>
            </div>
            {!isNew && !!id && <div className="a-card a-card-b"><a className="a-btn" href={`/product/${f.slug}`} target="_blank" rel="noreferrer">Open on storefront ↗</a><div className="a-hint">Drafts are not visible publicly.</div></div>}
          </div>
        </div>
      </fieldset>

      {preview && <Modal title="Preview (how it will look)" onClose={() => setPreview(false)}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
          <div>{f.images.length ? <img src={f.images[f.mainImage] || f.images[0]} alt={f.imageAlt || f.name} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 4 }} /> : <Empty>No image</Empty>}</div>
          <div><div style={{ fontSize: 11, letterSpacing: '.1em', color: 'var(--muted)' }}>{cur?.name}</div><h2 style={{ margin: '4px 0' }}>{f.name || 'Untitled product'}</h2>
            <div style={{ fontSize: 20 }}>{sale != null && sale < price ? <><b>{inr(sale)}</b> <s style={{ color: 'var(--muted)', fontSize: 14 }}>{inr(price)}</s> <Badge tone="ok">{discountPct}% OFF</Badge></> : <b>{inr(price)}</b>}</div>
            <p style={{ color: 'var(--muted)' }}>{f.description}</p>
            <div>{sizeList.map((s) => <span key={s} className="a-badge muted" style={{ marginRight: 4 }}>{s}</span>)}</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 5 }}>{colors.map((c) => <span key={c.name} title={c.name} style={{ width: 20, height: 20, borderRadius: 99, background: c.hex, border: '1px solid var(--line)' }} />)}</div>
            <p className="a-hint">Status: {f.status}. {totalStock === 0 ? 'Out of stock — customers cannot order it.' : `${totalStock} in stock.`}</p></div>
        </div></Modal>}
    </>
  );
};
