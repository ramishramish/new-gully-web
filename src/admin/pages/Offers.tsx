import React, { useState } from 'react';
import { Badge, Confirm, Empty, ErrorBox, Field, Modal, PageHead, Spinner, Tabs, inr, msg, useAdmin, useLoad } from '../ui';

const PLACES: [string, string][] = [['home', 'Homepage'], ['offers_page', 'Offers page'], ['product_page', 'Product pages'], ['cart', 'Cart'], ['marquee', 'Marquee']];
const today = () => new Date().toISOString().slice(0, 10);
const state = (s: string | null, e: string | null, active: number) => !active ? ['Inactive', 'muted'] as const : s && s > today() ? ['Scheduled', 'warn'] as const : e && e < today() ? ['Expired', 'bad'] as const : ['Live', 'ok'] as const;

export const Offers: React.FC = () => {
  const [tab, setTab] = useState<'offers' | 'coupons' | 'marquee'>('offers');
  return (<><PageHead title="Offers & Marquee" sub="Expired offers and coupons stop applying automatically on their end date." />
    <Tabs tabs={[['offers', 'Promotional offers'], ['coupons', 'Coupon codes'], ['marquee', 'Announcement marquee']]} value={tab} onChange={setTab} />
    {tab === 'offers' ? <OfferList /> : tab === 'coupons' ? <CouponList /> : <Marquee />}</>);
};

const OfferList: React.FC = () => {
  const { call, toast } = useAdmin();
  const { data, error, loading, reload } = useLoad(() => call('GET', '/api/admin/offers'), []);
  const [e, setE] = useState<any | null>(null);
  const blank = { title: '', subtitle: '', badge: '', description: '', link: '', code: '', terms: [], placements: ['offers_page'], targetGroup: 'all', minOrder: 0, startsAt: '', endsAt: '', active: true };
  const save = async () => { try { e.id ? await call('PUT', `/api/admin/offers/${e.id}`, e) : await call('POST', '/api/admin/offers', e); toast('Offer saved'); setE(null); reload(); } catch (x) { toast(msg(x), true); } };
  return (<div className="a-card"><div className="a-card-h"><span style={{ color: 'var(--muted)' }}>Banners shown on the storefront. The discount itself comes from a coupon code.</span><button className="a-btn primary" onClick={() => setE(blank)}>+ New offer</button></div>
    {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} retry={reload} /> : !data?.offers.length ? <Empty>No offers yet.</Empty> :
      <div className="a-scroll"><table className="a-table"><thead><tr><th>Offer</th><th>Code</th><th>Where</th><th>Dates</th><th>State</th><th></th></tr></thead><tbody>
        {data.offers.map((o: any) => { const [l, t] = state(o.starts_at, o.ends_at, o.active); return <tr key={o.id}><td><b>{o.title}</b><div style={{ fontSize: 11, color: 'var(--muted)' }}>{o.badge}</div></td><td>{o.code || '—'}</td><td>{o.placements.join(', ')}</td><td>{o.starts_at || '—'} → {o.ends_at || 'no end'}</td><td><Badge tone={t}>{l}</Badge></td>
          <td style={{ whiteSpace: 'nowrap' }}><button className="a-btn sm" onClick={() => setE({ id: o.id, title: o.title, subtitle: o.subtitle, badge: o.badge, description: o.description, link: o.link, code: o.code, terms: o.terms, placements: o.placements, targetGroup: o.target_group, minOrder: o.min_order, startsAt: o.starts_at || '', endsAt: o.ends_at || '', active: !!o.active })}>Edit</button>{' '}
            <button className="a-btn sm danger" onClick={async () => { if (!Confirm('Delete this offer?')) return; try { await call('DELETE', `/api/admin/offers/${o.id}`); reload(); } catch (x) { toast(msg(x), true); } }}>Delete</button></td></tr>; })}</tbody></table></div>}
    {e && <Modal wide title={e.id ? 'Edit offer' : 'New offer'} onClose={() => setE(null)}><div className="a-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
      <Field label="Title"><input className="a-input" value={e.title} onChange={(x) => setE({ ...e, title: x.target.value })} /></Field>
      <Field label="Badge text" hint="e.g. FLAT 20% OFF"><input className="a-input" value={e.badge} onChange={(x) => setE({ ...e, badge: x.target.value })} /></Field>
      <Field label="Subtitle"><input className="a-input" value={e.subtitle} onChange={(x) => setE({ ...e, subtitle: x.target.value })} /></Field>
      <Field label="Linked coupon code" hint="Shown to customers; create it under Coupon codes"><input className="a-input" value={e.code} onChange={(x) => setE({ ...e, code: x.target.value.toUpperCase() })} /></Field>
      <Field label="Link" hint="/mens, /offers or https://…"><input className="a-input" value={e.link} onChange={(x) => setE({ ...e, link: x.target.value })} /></Field>
      <Field label="Applies to"><select className="a-select" value={e.targetGroup} onChange={(x) => setE({ ...e, targetGroup: x.target.value })}><option value="all">Everything</option><option value="men">Men’s</option><option value="kids">Kids’</option><option value="accessories">Accessories</option></select></Field>
      <Field label="Starts (blank = now)"><input className="a-input" type="date" value={e.startsAt} onChange={(x) => setE({ ...e, startsAt: x.target.value })} /></Field>
      <Field label="Ends (blank = never)"><input className="a-input" type="date" value={e.endsAt} onChange={(x) => setE({ ...e, endsAt: x.target.value })} /></Field>
      <Field label="Minimum order (₹)"><input className="a-input" type="number" min={0} value={e.minOrder} onChange={(x) => setE({ ...e, minOrder: Number(x.target.value) })} /></Field>
      <Field label="Description" className="" ><textarea className="a-textarea" value={e.description} onChange={(x) => setE({ ...e, description: x.target.value })} /></Field>
      <Field label="Terms (one per line)"><textarea className="a-textarea" value={e.terms.join('\n')} onChange={(x) => setE({ ...e, terms: x.target.value.split('\n').filter(Boolean) })} /></Field>
      <div><span className="a-label">Show on</span>{PLACES.map(([k, l]) => <label key={k} style={{ display: 'block' }}><input type="checkbox" checked={e.placements.includes(k)} onChange={(x) => setE({ ...e, placements: x.target.checked ? [...e.placements, k] : e.placements.filter((p: string) => p !== k) })} /> {l}</label>)}<label style={{ display: 'block', marginTop: 8 }}><input type="checkbox" checked={e.active} onChange={(x) => setE({ ...e, active: x.target.checked })} /> Active</label></div>
    </div><div style={{ marginTop: 14 }}><button className="a-btn primary" onClick={save}>Save offer</button></div></Modal>}
  </div>);
};

const CouponList: React.FC = () => {
  const { call, toast } = useAdmin();
  const { data, error, loading, reload } = useLoad(() => call('GET', '/api/admin/coupons'), []);
  const cats = useLoad(() => call('GET', '/api/admin/categories'), []);
  const [e, setE] = useState<any | null>(null);
  const blank = { code: '', type: 'percent', value: 10, minOrder: 0, startsAt: '', expiresAt: '', usageLimit: '', scopeType: 'all', scopeIds: [], active: true };
  const save = async () => { try { const b = { ...e, usageLimit: e.usageLimit === '' ? null : Number(e.usageLimit) }; e.id ? await call('PUT', `/api/admin/coupons/${e.id}`, b) : await call('POST', '/api/admin/coupons', b); toast('Coupon saved'); setE(null); reload(); } catch (x) { toast(msg(x), true); } };
  return (<div className="a-card"><div className="a-card-h"><span style={{ color: 'var(--muted)' }}>Discounts are always calculated on the server from real prices.</span><button className="a-btn primary" onClick={() => setE(blank)}>+ New coupon</button></div>
    {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} retry={reload} /> : !data?.coupons.length ? <Empty>No coupons yet.</Empty> :
      <div className="a-scroll"><table className="a-table"><thead><tr><th>Code</th><th>Discount</th><th>Min order</th><th>Applies to</th><th>Used</th><th>Expires</th><th>State</th><th></th></tr></thead><tbody>
        {data.coupons.map((c: any) => { const [l, t] = state(c.starts_at, c.expires_at, c.active); const full = c.usage_limit != null && c.used_count >= c.usage_limit; return <tr key={c.id}><td><b style={{ fontFamily: 'monospace' }}>{c.code}</b></td><td>{c.type === 'percent' ? `${c.value}%` : inr(c.value)}</td><td>{inr(c.min_order)}</td><td>{c.scope_type}{c.scope_ids.length ? `: ${c.scope_ids.join(', ')}` : ''}</td><td>{c.used_count}{c.usage_limit != null ? ` / ${c.usage_limit}` : ''}</td><td>{c.expires_at || '—'}</td><td><Badge tone={full ? 'bad' : t}>{full ? 'Used up' : l}</Badge></td>
          <td style={{ whiteSpace: 'nowrap' }}><button className="a-btn sm" onClick={() => setE({ id: c.id, code: c.code, type: c.type, value: c.value, minOrder: c.min_order, startsAt: c.starts_at || '', expiresAt: c.expires_at || '', usageLimit: c.usage_limit ?? '', scopeType: c.scope_type, scopeIds: c.scope_ids, active: !!c.active })}>Edit</button>{' '}
            <button className="a-btn sm danger" onClick={async () => { if (!Confirm(`Delete ${c.code}?`)) return; try { await call('DELETE', `/api/admin/coupons/${c.id}`); reload(); } catch (x) { toast(msg(x), true); } }}>Delete</button></td></tr>; })}</tbody></table></div>}
    {e && <Modal title={e.id ? 'Edit coupon' : 'New coupon'} onClose={() => setE(null)}><div className="a-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <Field label="Code"><input className="a-input" value={e.code} onChange={(x) => setE({ ...e, code: x.target.value.toUpperCase() })} /></Field>
      <Field label="Type"><select className="a-select" value={e.type} onChange={(x) => setE({ ...e, type: x.target.value })}><option value="percent">Percentage</option><option value="fixed">Fixed ₹ amount</option></select></Field>
      <Field label={e.type === 'percent' ? 'Percent off' : 'Rupees off'}><input className="a-input" type="number" min={1} value={e.value} onChange={(x) => setE({ ...e, value: Number(x.target.value) })} /></Field>
      <Field label="Minimum order (₹)"><input className="a-input" type="number" min={0} value={e.minOrder} onChange={(x) => setE({ ...e, minOrder: Number(x.target.value) })} /></Field>
      <Field label="Starts"><input className="a-input" type="date" value={e.startsAt} onChange={(x) => setE({ ...e, startsAt: x.target.value })} /></Field>
      <Field label="Expires"><input className="a-input" type="date" value={e.expiresAt} onChange={(x) => setE({ ...e, expiresAt: x.target.value })} /></Field>
      <Field label="Usage limit" hint="Blank = unlimited"><input className="a-input" type="number" min={1} value={e.usageLimit} onChange={(x) => setE({ ...e, usageLimit: x.target.value })} /></Field>
      <Field label="Eligible items"><select className="a-select" value={e.scopeType} onChange={(x) => setE({ ...e, scopeType: x.target.value, scopeIds: [] })}><option value="all">Everything</option><option value="group">A section (men/kids/accessories)</option><option value="category">Specific categories</option><option value="product">Specific products (slugs)</option></select></Field>
      {e.scopeType === 'group' && <Field label="Sections">{['men', 'kids', 'accessories'].map((g) => <label key={g} style={{ display: 'block' }}><input type="checkbox" checked={e.scopeIds.includes(g)} onChange={(x) => setE({ ...e, scopeIds: x.target.checked ? [...e.scopeIds, g] : e.scopeIds.filter((i: string) => i !== g) })} /> {g}</label>)}</Field>}
      {e.scopeType === 'category' && <Field label="Categories"><div style={{ maxHeight: 140, overflow: 'auto' }}>{cats.data?.categories.map((c: any) => <label key={c.id} style={{ display: 'block' }}><input type="checkbox" checked={e.scopeIds.includes(c.slug)} onChange={(x) => setE({ ...e, scopeIds: x.target.checked ? [...e.scopeIds, c.slug] : e.scopeIds.filter((i: string) => i !== c.slug) })} /> {c.name}</label>)}</div></Field>}
      {e.scopeType === 'product' && <Field label="Product IDs" hint="Comma separated (the product’s URL slug)"><input className="a-input" value={e.scopeIds.join(', ')} onChange={(x) => setE({ ...e, scopeIds: x.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} /></Field>}
      <label><input type="checkbox" checked={e.active} onChange={(x) => setE({ ...e, active: x.target.checked })} /> Active</label>
    </div><div style={{ marginTop: 14 }}><button className="a-btn primary" onClick={save}>Save coupon</button></div></Modal>}
  </div>);
};

const Marquee: React.FC = () => {
  const { call, toast } = useAdmin();
  const { data, error, loading } = useLoad(() => call('GET', '/api/admin/marquee'), []);
  const [s, setS] = useState<any>(null); const [m, setM] = useState<any[] | null>(null);
  if (loading && !data) return <Spinner />; if (error) return <ErrorBox error={error} />; if (!data) return null;
  const st = s ?? data.settings, msgs = m ?? data.messages.map((x: any) => ({ text: x.text, link: x.link, badge: x.badge, active: !!x.active }));
  const upd = (i: number, k: string, v: any) => setM(msgs.map((x: any, j: number) => (i === j ? { ...x, [k]: v } : x)));
  const swap = (i: number, d: number) => { const a = [...msgs]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setM(a); };
  const save = async () => { try { await call('PUT', '/api/admin/marquee', { ...st, messages: msgs }); toast('Marquee saved — live on the storefront (refresh to see)'); } catch (x) { toast(msg(x), true); } };
  return (<div className="a-grid">
    <div className="a-card a-card-b a-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
      <label><input type="checkbox" checked={st.enabled} onChange={(e) => setS({ ...st, enabled: e.target.checked })} /> Marquee enabled</label>
      <Field label="Seconds per loop (lower = faster)"><input className="a-input" type="number" min={10} max={120} value={st.speed} onChange={(e) => setS({ ...st, speed: Number(e.target.value) })} /></Field>
      <Field label="Direction"><select className="a-select" value={st.direction} onChange={(e) => setS({ ...st, direction: e.target.value })}><option value="left">Right → Left</option><option value="right">Left → Right</option></select></Field></div>
    <div className="a-card"><div className="a-card-h"><h3 style={{ margin: 0, fontSize: 16 }}>Messages</h3><button className="a-btn sm" onClick={() => setM([...msgs, { text: '', link: '', badge: '', active: true }])}>+ Add message</button></div>
      <div className="a-card-b a-grid">{msgs.map((x: any, i: number) => <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 110px auto', gap: 6, alignItems: 'center' }}>
        <span><button className="a-btn sm" onClick={() => swap(i, -1)}>↑</button><button className="a-btn sm" onClick={() => swap(i, 1)}>↓</button></span>
        <input className="a-input" placeholder="Text" value={x.text} onChange={(e) => upd(i, 'text', e.target.value)} /><input className="a-input" placeholder="Link (optional)" value={x.link} onChange={(e) => upd(i, 'link', e.target.value)} />
        <input className="a-input" placeholder="Badge" value={x.badge} onChange={(e) => upd(i, 'badge', e.target.value)} />
        <span style={{ whiteSpace: 'nowrap' }}><label><input type="checkbox" checked={x.active} onChange={(e) => upd(i, 'active', e.target.checked)} /> on</label> <button className="a-btn sm danger" onClick={() => setM(msgs.filter((_: any, j: number) => j !== i))} aria-label="Remove">✕</button></span></div>)}
        <div><button className="a-btn primary" onClick={save}>Save marquee</button></div></div></div></div>);
};
