import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Badge, Empty, ErrorBox, LineChart, PageHead, Spinner, inr, useAdmin, useLoad } from '../ui';

type Range = 'today' | '7d' | '30d' | '90d' | 'custom';
const RANGES: [Range, string][] = [['today', 'Today'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['90d', 'Last 90 days'], ['custom', 'Custom']];
const pct = (cur: number, prev: number) => (prev ? `${cur >= prev ? '▲' : '▼'} ${Math.abs(Math.round(((cur - prev) / prev) * 100))}% vs previous period` : prev === 0 && cur > 0 ? 'No sales in previous period' : '—');

export const Dashboard: React.FC = () => {
  const { call, can } = useAdmin();
  const [range, setRange] = useState<Range>('30d');
  const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const qs = range === 'custom' && from && to ? `from=${from}&to=${to}` : `range=${range === 'custom' ? '30d' : range}`;
  const { data: d, error, loading, reload } = useLoad(() => call('GET', `/api/admin/dashboard?${qs}`), [qs]);
  const money = can('analytics.read');

  return (
    <>
      <PageHead title="Dashboard" sub={d ? `${d.range.from} → ${d.range.to} (India time)` : ''}>
        <select className="a-select" style={{ width: 160 }} value={range} onChange={(e) => setRange(e.target.value as Range)} aria-label="Date range">{RANGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        {range === 'custom' && <><input className="a-input" type="date" style={{ width: 150 }} value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From" /><input className="a-input" type="date" style={{ width: 150 }} value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" /></>}
        {can('reports.export') && <a className="a-btn" href={`/api/admin/reports/sales.csv?${qs}`}>Export sales CSV</a>}
      </PageHead>
      {loading && !d ? <Spinner /> : error ? <ErrorBox error={error} retry={reload} /> : d && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="a-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>
            {([
              ['Total products', d.counts.products], ['Published', d.counts.published], ['Drafts', d.counts.drafts], ['Orders (period)', d.counts.orders],
              ['Pending orders', d.counts.pending, d.counts.pending ? '/admin/orders?status=pending' : ''], ['Completed (period)', d.counts.completed], ['Customers', d.counts.customers],
              ['Low stock', d.counts.lowStock, '/admin/inventory?filter=low'], ['Out of stock', d.counts.outOfStock, '/admin/inventory?filter=out'], ['Active offers', d.counts.activeOffers],
            ] as [string, number, string?][]).map(([l, v, link]) => (
              <div key={l} className="a-card a-stat"><b>{v}</b><span>{l}</span>{link ? <Link to={link} style={{ fontSize: 12, color: 'var(--brand)' }}>View →</Link> : null}</div>))}
            <div className="a-card a-stat"><b>—</b><span>Website visits</span><small style={{ color: 'var(--muted)' }}>No analytics service is connected, so no visitor numbers are shown.</small></div>
          </div>

          {money && d.sales && (
            <div className="a-card">
              <div className="a-card-h"><h3 style={{ margin: 0 }}>Sales summary</h3><Badge tone="muted">Counts confirmed → delivered orders</Badge></div>
              <div className="a-card-b a-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
                <div><div className="a-label">Gross sales</div><b style={{ fontSize: 22 }}>{inr(d.sales.gross)}</b></div>
                <div><div className="a-label">Discounts</div><b style={{ fontSize: 22 }}>−{inr(d.sales.discounts)}</b></div>
                <div><div className="a-label">Refunds / returns</div><b style={{ fontSize: 22 }}>−{inr(d.sales.refunds)}</b></div>
                <div><div className="a-label">Net sales</div><b style={{ fontSize: 22, color: 'var(--ok)' }}>{inr(d.sales.net)}</b><div className="a-hint">{pct(d.sales.net, d.previous.net)}</div></div>
                <div><div className="a-label">Payment confirmed</div><b style={{ fontSize: 22 }}>{inr(d.sales.verifiedPaid)}</b><div className="a-hint">Only orders you marked as paid</div></div>
              </div>
            </div>)}

          <div className="a-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
            {money && <div className="a-card"><div className="a-card-h"><h3 style={{ margin: 0, fontSize: 16 }}>Sales over time</h3></div><div className="a-card-b"><LineChart data={(d.salesSeries || []).map((x: any) => ({ label: x.d.slice(5), value: x.sales }))} format={inr} /></div></div>}
            <div className="a-card"><div className="a-card-h"><h3 style={{ margin: 0, fontSize: 16 }}>Orders over time</h3></div><div className="a-card-b"><LineChart data={d.ordersSeries.map((x: any) => ({ label: x.d.slice(5), value: x.orders }))} /></div></div>
            <div className="a-card"><div className="a-card-h"><h3 style={{ margin: 0, fontSize: 16 }}>Best-selling products</h3></div><div className="a-card-b"><BarChart horizontal data={d.bestSellers.map((x: any) => ({ label: x.name, value: x.qty }))} format={(n) => `${n} sold`} /></div></div>
            {money && <div className="a-card"><div className="a-card-h"><h3 style={{ margin: 0, fontSize: 16 }}>Category performance</h3></div><div className="a-card-b"><BarChart horizontal data={(d.categoryPerformance || []).map((x: any) => ({ label: x.name, value: x.revenue }))} format={inr} /></div></div>}
            <div className="a-card"><div className="a-card-h"><h3 style={{ margin: 0, fontSize: 16 }}>Inventory by category (units)</h3></div><div className="a-card-b"><BarChart horizontal data={d.inventoryByCategory.map((x: any) => ({ label: x.name, value: x.stock }))} /></div></div>
            {money && <div className="a-card"><div className="a-card-h"><h3 style={{ margin: 0, fontSize: 16 }}>Discount usage</h3></div><div className="a-card-b">{d.discountUsage?.length ? <table className="a-table"><thead><tr><th>Code</th><th>Uses</th><th>Given</th></tr></thead><tbody>{d.discountUsage.map((x: any) => <tr key={x.code}><td><b>{x.code}</b></td><td>{x.uses}</td><td>{inr(x.total)}</td></tr>)}</tbody></table> : <Empty>No coupons used in this period.</Empty>}</div></div>}
          </div>
        </div>)}
    </>
  );
};
