import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Badge, Empty, ErrorBox, Field, PageHead, Spinner, inr, istDate, msg, statusTone, useAdmin, useLoad } from '../ui';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'];
const FLOW: Record<string, string[]> = { pending: ['confirmed', 'cancelled'], confirmed: ['processing', 'cancelled'], processing: ['shipped', 'cancelled'], shipped: ['delivered', 'returned'], delivered: ['returned'], returned: ['refunded'], cancelled: ['refunded'], refunded: [] };

export const Orders: React.FC = () => {
  const { call, can } = useAdmin();
  const [sp, setSp] = useSearchParams(); const nav = useNavigate();
  const q = sp.get('q') || '', status = sp.get('status') || '', from = sp.get('from') || '', to = sp.get('to') || '', page = sp.get('page') || '1';
  const setF = (k: string, v: string) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n, { replace: true }); };
  const qs = new URLSearchParams({ ...(q && { q }), ...(status && { status }), ...(from && { from }), ...(to && { to }), page }).toString();
  const { data, error, loading, reload } = useLoad(() => call('GET', `/api/admin/orders?${qs}`), [qs]);
  return (
    <>
      <PageHead title="Orders">{can('reports.export') && <a className="a-btn" href={`/api/admin/orders/export.csv?${qs}`}>Export CSV</a>}</PageHead>
      <div className="a-card">
        <div className="a-card-h" style={{ gap: 8 }}>
          <input className="a-input" style={{ maxWidth: 240 }} placeholder="Order no., name or phone" defaultValue={q} onKeyDown={(e) => e.key === 'Enter' && setF('q', (e.target as HTMLInputElement).value)} aria-label="Search orders" />
          <select className="a-select" style={{ width: 140 }} value={status} onChange={(e) => setF('status', e.target.value)} aria-label="Status"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <input className="a-input" type="date" style={{ width: 150 }} value={from} onChange={(e) => setF('from', e.target.value)} aria-label="From date" />
          <input className="a-input" type="date" style={{ width: 150 }} value={to} onChange={(e) => setF('to', e.target.value)} aria-label="To date" />
        </div>
        {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} retry={reload} /> : !data?.orders.length ? <Empty>No orders found.</Empty> : (
          <div className="a-scroll"><table className="a-table"><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>
            {data.orders.map((o: any) => <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => nav(`/admin/orders/${o.id}`)}>
              <td><Link to={`/admin/orders/${o.id}`} style={{ fontWeight: 700 }}>{o.number}</Link></td><td>{istDate(o.created_at)}</td><td>{o.customer_name}<div style={{ fontSize: 11, color: 'var(--muted)' }}>{o.mobile}</div></td>
              <td>{o.items}</td><td><b>{inr(o.total)}</b></td><td><Badge tone={o.payment_status === 'paid' ? 'ok' : 'muted'}>{o.payment_status}</Badge></td><td><Badge tone={statusTone(o.status)}>{o.status}</Badge></td></tr>)}
          </tbody></table></div>)}
        {data && data.total > 25 && <div className="a-card-h"><span>{data.total} orders</span><div style={{ display: 'flex', gap: 6 }}>
          <button className="a-btn sm" disabled={Number(page) <= 1} onClick={() => setF('page', String(Number(page) - 1))}>← Prev</button>
          <button className="a-btn sm" disabled={Number(page) * 25 >= data.total} onClick={() => setF('page', String(Number(page) + 1))}>Next →</button></div></div>}
      </div>
    </>
  );
};

export const OrderDetail: React.FC = () => {
  const { id } = useParams(); const { call, can, toast } = useAdmin();
  const { data, error, loading, reload } = useLoad(() => call('GET', `/api/admin/orders/${id}`), [id]);
  const [note, setNote] = useState(''); const [restock, setRestock] = useState(true); const [notes, setNotes] = useState<string | null>(null); const [ref, setRef] = useState('');
  if (loading && !data) return <Spinner />; if (error) return <ErrorBox error={error} retry={reload} />; if (!data) return null;
  const { order: o, items, history } = data;
  const run = async (fn: () => Promise<any>, ok: string) => { try { await fn(); toast(ok); setNote(''); setRef(''); reload(); } catch (e) { toast(msg(e), true); } };
  const next = FLOW[o.status] || [];
  const sensitive = (s: string) => ['cancelled', 'returned', 'refunded'].includes(s);

  return (
    <>
      <PageHead title={`Order ${o.number}`} sub={istDate(o.created_at)}>
        <Link className="a-btn" to="/admin/orders">← Orders</Link>
        <a className="a-btn" href={`/api/admin/orders/${o.id}/invoice`} target="_blank" rel="noreferrer">Print invoice</a>
      </PageHead>
      <div className="a-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', alignItems: 'start' }}>
        <div className="a-grid">
          <div className="a-card"><div className="a-card-h"><h3 style={{ margin: 0, fontSize: 16 }}>Items</h3><span><Badge tone={statusTone(o.status)}>{o.status}</Badge> <Badge tone={o.payment_status === 'paid' ? 'ok' : 'muted'}>payment: {o.payment_status}</Badge></span></div>
            <div className="a-scroll"><table className="a-table"><thead><tr><th></th><th>Product</th><th>Size/Colour</th><th>Qty</th><th>Price</th></tr></thead><tbody>
              {items.map((i: any) => <tr key={i.id}><td style={{ width: 50 }}>{i.image && <img src={i.image} alt="" style={{ width: 40, height: 50, objectFit: 'cover' }} />}</td><td><b>{i.name}</b><div style={{ fontSize: 11, color: 'var(--muted)' }}>{i.sku}</div></td><td>{i.size} / {i.color}</td><td>{i.qty}</td><td>{inr(i.unit_price * i.qty)}</td></tr>)}
            </tbody></table></div>
            <div className="a-card-b" style={{ textAlign: 'right' }}>Subtotal {inr(o.subtotal)}{o.discount ? <><br />Discount ({o.coupon_code}) −{inr(o.discount)}</> : null}<br />Delivery {inr(o.delivery)}<br /><b style={{ fontSize: 18 }}>Total {inr(o.total)}</b><div className="a-hint">Payment method chosen: {o.payment_method}</div></div></div>
          <div className="a-card"><div className="a-card-h"><h3 style={{ margin: 0, fontSize: 16 }}>History</h3></div><div className="a-card-b">
            {history.map((h: any) => <div key={h.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--line)' }}><b>{h.from_status ? `${h.from_status} → ${h.to_status}` : `Order ${h.to_status}`}</b> <span style={{ color: 'var(--muted)', fontSize: 12 }}>· {h.admin_name || 'System'} · {istDate(h.at)}</span>{h.note && <div style={{ fontSize: 13 }}>{h.note}</div>}</div>)}</div></div>
        </div>
        <div className="a-grid">
          <div className="a-card a-card-b"><h3 style={{ marginTop: 0, fontSize: 16 }}>Delivery details (as entered by customer)</h3>
            <b>{o.customer_name}</b><br />{o.address}{o.landmark && <>, {o.landmark}</>}<br />{o.city}, {o.state} – {o.pin_code}<br />📞 <a href={`tel:${o.mobile}`}>{o.mobile}</a>{o.email && <><br />✉ {o.email}</>}{o.customer_notes && <p style={{ marginBottom: 0 }}><i>Customer note:</i> {o.customer_notes}</p>}</div>
          {can('orders.update') && next.length > 0 && <div className="a-card a-card-b a-grid"><h3 style={{ margin: 0, fontSize: 16 }}>Update status</h3>
            <Field label="Note (required for cancel / return / refund)"><input className="a-input" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
            {['returned', 'cancelled'].some((s) => next.includes(s)) && <label><input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} /> Put items back in stock if cancelled/returned</label>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{next.map((s) => <button key={s} className={`a-btn ${sensitive(s) ? 'danger' : 'primary'}`} disabled={sensitive(s) && !can('orders.cancel_refund')} title={sensitive(s) && !can('orders.cancel_refund') ? 'Manager or Super Admin only' : ''}
              onClick={() => run(() => call('POST', `/api/admin/orders/${o.id}/status`, { status: s, note, restock }), `Order ${s}`)}>Mark {s}</button>)}</div></div>}
          {can('orders.cancel_refund') && o.payment_status === 'unpaid' && <div className="a-card a-card-b a-grid"><h3 style={{ margin: 0, fontSize: 16 }}>Payment</h3>
            <div className="a-hint">No online payment gateway is connected, so orders stay “unpaid” until you confirm money was actually received (e.g. cash on delivery, or a UPI payment you verified).</div>
            <input className="a-input" placeholder="Reference (e.g. COD cash received by courier, UPI ref 1234)" value={ref} onChange={(e) => setRef(e.target.value)} />
            <button className="a-btn" disabled={!ref.trim()} onClick={() => run(() => call('POST', `/api/admin/orders/${o.id}/payment`, { reference: ref }), 'Marked as paid')}>Confirm payment received</button></div>}
          <div className="a-card a-card-b a-grid"><h3 style={{ margin: 0, fontSize: 16 }}>Internal notes</h3>
            <textarea className="a-textarea" value={notes ?? o.internal_notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only visible to staff" />
            {can('orders.update') && <button className="a-btn" onClick={() => run(() => call('POST', `/api/admin/orders/${o.id}/notes`, { notes: notes ?? o.internal_notes }), 'Notes saved')}>Save notes</button>}</div>
        </div>
      </div>
    </>
  );
};
