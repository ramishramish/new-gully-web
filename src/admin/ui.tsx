import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';

export interface Admin { id: number; email: string; name: string; role: 'super_admin' | 'manager' | 'staff'; permissions: string[] }
interface Ctx {
  admin: Admin; csrf: string; can: (p: string) => boolean;
  call: <T = any>(method: string, url: string, body?: unknown) => Promise<T>;
  toast: (msg: string, isError?: boolean) => void; signOut: () => void;
}
export const AdminCtx = createContext<Ctx | null>(null);
export const useAdmin = () => { const c = useContext(AdminCtx); if (!c) throw new Error('no admin ctx'); return c; };

export const inr = (n: number | null | undefined) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const istDate = (s: string) => new Date(s.replace(' ', 'T') + 'Z').toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
export const ROLE_LABEL = { super_admin: 'Super Admin', manager: 'Manager', staff: 'Staff' } as const;
export const msg = (e: unknown) => (e instanceof ApiError || e instanceof Error ? e.message : 'Something went wrong');

/** Loads data with loading + error states. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const { signOut } = useAdmin();
  useEffect(() => {
    let live = true; setLoading(true); setError(null);
    fn().then((d) => live && setData(d)).catch((e) => { if (!live) return; if (e instanceof ApiError && e.status === 401) signOut(); else setError(msg(e)); }).finally(() => live && setLoading(false));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, error, loading, reload: useCallback(() => setTick((t) => t + 1), []) };
}

export const Spinner: React.FC = () => <div className="a-skel" style={{ height: 120 }} aria-label="Loading" role="status" />;
export const ErrorBox: React.FC<{ error: string; retry?: () => void }> = ({ error, retry }) => (
  <div className="a-card a-card-b" role="alert" style={{ borderColor: 'var(--bad)' }}>
    <b style={{ color: 'var(--bad)' }}>Couldn’t load this.</b> <span>{error}</span> {retry && <button className="a-btn sm" onClick={retry} style={{ marginLeft: 8 }}>Retry</button>}
  </div>
);
export const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ padding: 36, textAlign: 'center', color: 'var(--muted)' }}>{children}</div>;
export const Badge: React.FC<{ tone?: 'ok' | 'warn' | 'bad' | 'muted' | 'brand'; children: React.ReactNode }> = ({ tone = 'muted', children }) => <span className={`a-badge ${tone}`}>{children}</span>;
export const statusTone = (s: string) => ({ pending: 'warn', confirmed: 'brand', processing: 'brand', shipped: 'brand', delivered: 'ok', cancelled: 'bad', returned: 'bad', refunded: 'bad', published: 'ok', draft: 'warn', archived: 'muted' } as const)[s as 'pending'] || 'muted';

export const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode; className?: string }> = ({ label, hint, children, className }) => (
  <label className={className} style={{ display: 'block' }}><span className="a-label">{label}</span>{children}{hint && <div className="a-hint">{hint}</div>}</label>
);

export const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({ title, onClose, children, wide }) => {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="a-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-card" role="dialog" aria-modal="true" aria-label={title} style={{ width: '100%', maxWidth: wide ? 900 : 560 }}>
        <div className="a-card-h"><h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3><button className="a-btn sm" onClick={onClose} aria-label="Close">✕</button></div>
        <div className="a-card-b">{children}</div>
      </div>
    </div>
  );
};

export const Confirm = (text: string) => window.confirm(text);

export const PageHead: React.FC<{ title: string; sub?: string; children?: React.ReactNode }> = ({ title, sub, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
    <div><h1 style={{ margin: 0, fontSize: 26 }}>{title}</h1>{sub && <div style={{ color: 'var(--muted)' }}>{sub}</div>}</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>
  </div>
);

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: [T, string][]; value: T; onChange: (t: T) => void }) {
  return <div className="a-tabs" role="tablist">{tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={value === k} className={`a-tab ${value === k ? 'on' : ''}`} onClick={() => onChange(k)}>{l}</button>)}</div>;
}

// ---------- tiny dependency-free SVG charts (real data only) ----------
export const BarChart: React.FC<{ data: { label: string; value: number }[]; format?: (n: number) => string; horizontal?: boolean }> = ({ data, format = (n) => String(n), horizontal }) => {
  if (!data.length) return <Empty>No data for this period yet.</Empty>;
  const max = Math.max(...data.map((d) => d.value), 1);
  if (horizontal) return (
    <div style={{ display: 'grid', gap: 8 }}>{data.map((d) => (
      <div key={d.label}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span>{d.label}</span><b>{format(d.value)}</b></div>
        <div style={{ background: 'var(--line)', height: 8, borderRadius: 4 }}><div style={{ width: `${(d.value / max) * 100}%`, background: 'var(--gold)', height: 8, borderRadius: 4 }} /></div></div>))}</div>);
  const w = 100 / data.length;
  return (
    <svg viewBox="0 0 400 170" width="100%" role="img" aria-label="Bar chart">
      {data.map((d, i) => { const h = (d.value / max) * 130; return (
        <g key={d.label}><title>{`${d.label}: ${format(d.value)}`}</title><rect x={i * w * 4 + 4} y={140 - h} width={Math.max(w * 4 - 8, 4)} height={h} fill="var(--gold)" rx={2} />
          {data.length <= 12 && <text x={i * w * 4 + w * 2} y={158} textAnchor="middle" fontSize="9" fill="var(--muted)">{d.label.slice(0, 8)}</text>}</g>); })}
      <text x={2} y={10} fontSize="9" fill="var(--muted)">{format(max)}</text>
    </svg>);
};
export const LineChart: React.FC<{ data: { label: string; value: number }[]; format?: (n: number) => string }> = ({ data, format = (n) => String(n) }) => {
  if (!data.length) return <Empty>No data for this period yet.</Empty>;
  const max = Math.max(...data.map((d) => d.value), 1), step = data.length > 1 ? 380 / (data.length - 1) : 0;
  const pts = data.map((d, i) => [10 + i * step, 140 - (d.value / max) * 120] as const);
  return (
    <svg viewBox="0 0 400 170" width="100%" role="img" aria-label="Line chart">
      <polyline fill="none" stroke="var(--brand)" strokeWidth="2" points={pts.map((p) => p.join(',')).join(' ')} />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="var(--gold)"><title>{`${data[i].label}: ${format(data[i].value)}`}</title></circle>)}
      <text x={2} y={10} fontSize="9" fill="var(--muted)">{format(max)}</text>
      <text x={10} y={162} fontSize="9" fill="var(--muted)">{data[0].label}</text><text x={390} y={162} textAnchor="end" fontSize="9" fill="var(--muted)">{data[data.length - 1].label}</text>
    </svg>);
};

export { api };
