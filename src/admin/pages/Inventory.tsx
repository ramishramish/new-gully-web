import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, Empty, ErrorBox, Field, Modal, PageHead, Spinner, Tabs, istDate, msg, useAdmin, useLoad } from '../ui';

export const Inventory: React.FC = () => {
  const { call, can, toast } = useAdmin();
  const [sp, setSp] = useSearchParams();
  const filter = (sp.get('filter') || 'all') as 'all' | 'in' | 'low' | 'out';
  const q = sp.get('q') || '';
  const [tab, setTab] = useState<'stock' | 'history'>('stock');
  const { data, error, loading, reload } = useLoad(() => call('GET', `/api/admin/inventory?filter=${filter}&q=${encodeURIComponent(q)}`), [filter, q]);
  const hist = useLoad(() => (tab === 'history' ? call('GET', '/api/admin/inventory/history') : Promise.resolve(null)), [tab]);
  const [adj, setAdj] = useState<any | null>(null);
  const [mode, setMode] = useState<'delta' | 'set'>('delta'); const [val, setVal] = useState('0'); const [reason, setReason] = useState('');

  const submit = async () => {
    try {
      await call('POST', '/api/admin/inventory/adjust', { variantId: adj.id, reason, ...(mode === 'delta' ? { delta: Number(val) } : { setTo: Number(val) }) });
      toast('Stock updated'); setAdj(null); setReason(''); setVal('0'); reload();
    } catch (e) { toast(msg(e), true); }
  };
  return (
    <>
      <PageHead title="Inventory" sub="Stock is tracked per size and colour. Orders reserve stock automatically; cancellations and returns restore it." />
      <Tabs tabs={[['stock', 'Stock levels'], ['history', 'History']]} value={tab} onChange={setTab} />
      {tab === 'history' ? (
        <div className="a-card">{hist.loading ? <Spinner /> : hist.error ? <ErrorBox error={hist.error} retry={hist.reload} /> : !hist.data?.history.length ? <Empty>No stock movements yet.</Empty> :
          <div className="a-scroll"><table className="a-table"><thead><tr><th>When</th><th>Product</th><th>Variant</th><th>Change</th><th>After</th><th>Reason</th><th>By</th></tr></thead><tbody>
            {hist.data.history.map((h: any) => <tr key={h.id}><td>{istDate(h.created_at)}</td><td>{h.product_name || '—'}</td><td>{h.size ? `${h.size} / ${h.color_name}` : '—'}</td>
              <td style={{ color: h.delta < 0 ? 'var(--bad)' : 'var(--ok)', fontWeight: 700 }}>{h.delta > 0 ? '+' : ''}{h.delta}</td><td>{h.stock_after}</td><td>{h.reason}{h.order_number ? ` (${h.order_number})` : ''}</td><td>{h.admin_name || 'System'}</td></tr>)}
          </tbody></table></div>}</div>
      ) : (
        <div className="a-card">
          <div className="a-card-h">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{(['all', 'in', 'low', 'out'] as const).map((k) => <button key={k} className={`a-btn sm ${filter === k ? 'primary' : ''}`} onClick={() => { const n = new URLSearchParams(sp); n.set('filter', k); setSp(n, { replace: true }); }}>{{ all: 'All', in: 'In stock', low: 'Low stock', out: 'Out of stock' }[k]}</button>)}</div>
            <input className="a-input" style={{ maxWidth: 240 }} placeholder="Search name or SKU" defaultValue={q} onKeyDown={(e) => { if (e.key === 'Enter') { const n = new URLSearchParams(sp); n.set('q', (e.target as HTMLInputElement).value); setSp(n, { replace: true }); } }} aria-label="Search inventory" />
          </div>
          {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} retry={reload} /> : !data?.items.length ? <Empty>Nothing in this view.</Empty> :
            <div className="a-scroll"><table className="a-table"><thead><tr><th>Product</th><th>SKU</th><th>Size</th><th>Colour</th><th>Stock</th><th></th></tr></thead><tbody>
              {data.items.map((v: any) => <tr key={v.id}><td><b>{v.name}</b> {v.status !== 'published' && <Badge tone="warn">{v.status}</Badge>}</td><td>{v.sku}</td><td>{v.size}</td>
                <td><span style={{ display: 'inline-block', width: 10, height: 10, background: v.color_hex, border: '1px solid var(--line)', marginRight: 5 }} />{v.color_name}</td>
                <td>{v.stock === 0 ? <Badge tone="bad">Out</Badge> : v.stock <= v.low_stock_threshold ? <Badge tone="warn">Low · {v.stock}</Badge> : <b>{v.stock}</b>}</td>
                <td>{can('inventory.write') && <button className="a-btn sm" onClick={() => setAdj(v)}>Adjust</button>}</td></tr>)}
            </tbody></table></div>}
        </div>)}
      {adj && <Modal title={`Adjust stock — ${adj.name} (${adj.size} / ${adj.color_name})`} onClose={() => setAdj(null)}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>Current stock: <b>{adj.stock}</b></div>
          <div style={{ display: 'flex', gap: 12 }}><label><input type="radio" checked={mode === 'delta'} onChange={() => setMode('delta')} /> Add / remove</label><label><input type="radio" checked={mode === 'set'} onChange={() => setMode('set')} /> Set exact count</label></div>
          <Field label={mode === 'delta' ? 'Change (use a minus to remove)' : 'New stock count'}><input className="a-input" type="number" value={val} onChange={(e) => setVal(e.target.value)} /></Field>
          <Field label="Reason (required)"><select className="a-select" value={reason} onChange={(e) => setReason(e.target.value)}><option value="">Choose or type below…</option>{['New stock received', 'Stock count correction', 'Damaged / defective', 'Lost / theft', 'In-store sale', 'Customer return'].map((r) => <option key={r}>{r}</option>)}</select></Field>
          <input className="a-input" placeholder="Or write your own reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button className="a-btn primary" disabled={!reason.trim()} onClick={submit}>Save adjustment</button>
        </div></Modal>}
    </>
  );
};
