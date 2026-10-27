import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Empty, ErrorBox, Field, Modal, PageHead, Spinner, inr, istDate, msg, statusTone, useAdmin, useLoad } from '../ui';

export const Customers: React.FC = () => {
  const { call, can, toast } = useAdmin();
  const [q, setQ] = useState(''); const [sel, setSel] = useState<string | null>(null);
  const { data, error, loading, reload } = useLoad(() => call('GET', `/api/admin/customers?q=${encodeURIComponent(q)}`), [q]);
  return (<>
    <PageHead title="Customers" sub="Built from orders — customers check out as guests, so there are no customer passwords stored.">{can('customers.export') && <a className="a-btn" href="/api/admin/customers/export.csv">Export CSV</a>}</PageHead>
    <div className="a-card"><div className="a-card-h"><input className="a-input" style={{ maxWidth: 280 }} placeholder="Search name, phone or email" defaultValue={q} onKeyDown={(e) => e.key === 'Enter' && setQ((e.target as HTMLInputElement).value)} aria-label="Search customers" /></div>
      {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} retry={reload} /> : !data?.customers.length ? <Empty>No customers yet — they appear after the first order.</Empty> :
        <div className="a-scroll"><table className="a-table"><thead><tr><th>Name</th><th>Phone</th><th>City</th><th>Orders</th><th>Completed purchases</th><th>Last order</th><th>Account</th></tr></thead><tbody>
          {data.customers.map((c: any) => <tr key={c.mobile} style={{ cursor: 'pointer' }} onClick={() => setSel(c.mobile)}><td><b>{c.name}</b></td><td>{c.mobile}</td><td>{c.city}</td><td>{c.orders}</td><td>{inr(c.completed_total)}</td><td>{istDate(c.last_order)}</td><td><Badge tone={c.account_status === 'blocked' ? 'bad' : 'ok'}>{c.account_status}</Badge></td></tr>)}</tbody></table></div>}
    </div>
    {sel && <Detail mobile={sel} onClose={() => { setSel(null); reload(); }} call={call} can={can} toast={toast} />}
  </>);
};

const Detail: React.FC<{ mobile: string; onClose: () => void; call: any; can: (p: string) => boolean; toast: (m: string, e?: boolean) => void }> = ({ mobile, onClose, call, can, toast }) => {
  const { data, loading } = useLoad<any>(() => call('GET', `/api/admin/customers/${encodeURIComponent(mobile)}`), [mobile]);
  const [notes, setNotes] = useState<string | null>(null); const [status, setStatus] = useState<string | null>(null); const [consent, setConsent] = useState<boolean | null>(null);
  const c = data?.customer; const manager = can('orders.cancel_refund');
  const save = async () => { try { await call('PUT', `/api/admin/customers/${encodeURIComponent(mobile)}`, { notes: notes ?? data.notes ?? '', status: status ?? c.account_status, marketingConsent: consent ?? !!c.marketing_consent }); toast('Saved'); onClose(); } catch (e) { toast(msg(e), true); } };
  return <Modal title={c?.name || 'Customer'} onClose={onClose} wide>{loading || !c ? <Spinner /> : <div className="a-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
    <div><div>📞 {c.mobile}</div>{c.email && <div>✉ {c.email}</div>}<div>{c.city}</div><p><b>{c.orders}</b> orders · <b>{inr(c.completed_total)}</b> completed purchases</p>
      <div className="a-label">Orders</div>{data.orders.map((o: any) => <div key={o.id} style={{ padding: '4px 0' }}><Link to={`/admin/orders/${o.id}`} style={{ fontWeight: 700 }}>{o.number}</Link> · {inr(o.total)} <Badge tone={statusTone(o.status)}>{o.status}</Badge></div>)}</div>
    <div className="a-grid">{manager ? <>
      <Field label="Private notes (Manager+ only)"><textarea className="a-textarea" value={notes ?? data.notes ?? ''} onChange={(e) => setNotes(e.target.value)} /></Field>
      <Field label="Online ordering"><select className="a-select" value={status ?? c.account_status} onChange={(e) => setStatus(e.target.value)}><option value="active">Active</option><option value="blocked">Blocked from placing online orders</option></select></Field>
      <label><input type="checkbox" checked={consent ?? !!c.marketing_consent} onChange={(e) => setConsent(e.target.checked)} /> Customer has agreed to marketing messages</label>
      <div className="a-hint">Only tick this if the customer actually consented. Email is excluded from exports without consent.</div>
      <button className="a-btn primary" onClick={save}>Save</button></> : <div className="a-hint">Notes and account status are restricted to Managers and Super Admins.</div>}</div></div>}</Modal>;
};
