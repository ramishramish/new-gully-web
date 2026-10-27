import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, Boxes, ClipboardList, LayoutDashboard, LogOut, Menu, Moon, Package, Search, Settings, Sun, Tags, Users, Warehouse, X } from 'lucide-react';
import './admin.css';
import { Admin, AdminCtx, ROLE_LABEL, Badge, Field, api, istDate, msg } from './ui';
import { ApiError } from '../lib/api';
import { Dashboard } from './pages/Dashboard';
import { Products, ProductEditor } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Orders, OrderDetail } from './pages/Orders';
import { Offers } from './pages/Offers';
import { Customers } from './pages/Customers';
import { SettingsPage } from './pages/Settings';

const LOGO = '/images/new-gully-logo.png';

function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16 }}>
      <div className="a-card" style={{ width: '100%', maxWidth: 400, borderTop: '4px solid var(--gold)' }}>
        <div className="a-card-b">
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <img src={LOGO} alt="THE NEW GULLY" style={{ height: 64, margin: '0 auto 8px', objectFit: 'contain' }} />
            <div style={{ fontSize: 11, letterSpacing: '.2em', color: 'var(--muted)' }}>ADMIN · EST. 2016</div>
            <h1 style={{ fontSize: 22, margin: '10px 0 0' }}>{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (a: Admin, csrf: string) => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const r = await api('POST', '/api/admin/auth/login', { email, password }); onLogin(r.admin, r.csrf); } catch (x) { setErr(msg(x)); } finally { setBusy(false); }
  };
  return (
    <AuthShell title="Sign in">
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <Field label="Email"><input className="a-input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password"><input className="a-input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        {err && <div role="alert" style={{ color: 'var(--bad)' }}>{err}</div>}
        <button className="a-btn primary" disabled={busy} style={{ justifyContent: 'center' }}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <NavLink to="/admin/forgot" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Forgot password?</NavLink>
      </form>
    </AuthShell>
  );
}

function Forgot() {
  const [email, setEmail] = useState(''); const [done, setDone] = useState(''); const [err, setErr] = useState('');
  return (
    <AuthShell title="Reset password">
      {done ? <p>{done}</p> : (
        <form onSubmit={async (e) => { e.preventDefault(); try { setDone((await api('POST', '/api/admin/auth/forgot', { email })).message); } catch (x) { setErr(msg(x)); } }} style={{ display: 'grid', gap: 12 }}>
          <Field label="Admin email"><input className="a-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          {err && <div role="alert" style={{ color: 'var(--bad)' }}>{err}</div>}
          <button className="a-btn primary" style={{ justifyContent: 'center' }}>Send reset link</button>
          <div className="a-hint">Email delivery is not configured yet, so the link is written to the server log. The Super Admin can also set a new password under Settings → Team.</div>
        </form>)}
      <NavLink to="/admin/login" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: 'var(--muted)', fontSize: 13 }}>Back to sign in</NavLink>
    </AuthShell>
  );
}

function Reset() {
  const [sp] = useSearchParams(); const nav = useNavigate();
  const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [ok, setOk] = useState(false);
  return (
    <AuthShell title="Choose a new password">
      {ok ? <p>Password updated. <NavLink to="/admin/login" style={{ color: 'var(--brand)' }}>Sign in</NavLink></p> : (
        <form onSubmit={async (e) => { e.preventDefault(); try { await api('POST', '/api/admin/auth/reset', { token: sp.get('token'), password: pw }); setOk(true); setTimeout(() => nav('/admin/login'), 1500); } catch (x) { setErr(msg(x)); } }} style={{ display: 'grid', gap: 12 }}>
          <Field label="New password" hint="At least 10 characters with upper-case, lower-case and a number."><input className="a-input" type="password" autoComplete="new-password" required value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
          {err && <div role="alert" style={{ color: 'var(--bad)' }}>{err}</div>}
          <button className="a-btn primary" style={{ justifyContent: 'center' }}>Update password</button>
        </form>)}
    </AuthShell>
  );
}

const NAV: { to: string; label: string; icon: React.ReactNode; perm: string; end?: boolean }[] = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={17} />, perm: 'orders.read', end: true },
  { to: '/admin/products', label: 'Products', icon: <Package size={17} />, perm: 'products.read' },
  { to: '/admin/inventory', label: 'Inventory', icon: <Warehouse size={17} />, perm: 'products.read' },
  { to: '/admin/orders', label: 'Orders', icon: <ClipboardList size={17} />, perm: 'orders.read' },
  { to: '/admin/offers', label: 'Offers & Marquee', icon: <Tags size={17} />, perm: 'offers.write' },
  { to: '/admin/customers', label: 'Customers', icon: <Users size={17} />, perm: 'customers.read' },
  { to: '/admin/settings', label: 'Settings', icon: <Settings size={17} />, perm: 'orders.read' },
];

function Notifications() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ notifications: any[]; unread: number } | null>(null);
  const load = useCallback(() => api('GET', '/api/admin/notifications').then(setData).catch(() => { /* bell is non-critical */ }), []);
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);
  return <NotifInner open={open} setOpen={setOpen} data={data} reload={load} />;
}
function NotifInner({ open, setOpen, data, reload }: { open: boolean; setOpen: (b: boolean) => void; data: { notifications: any[]; unread: number } | null; reload: () => void }) {
  const ctx = React.useContext(AdminCtx)!;
  return (
    <div style={{ position: 'relative' }}>
      <button className="a-btn" aria-label={`Notifications (${data?.unread ?? 0} unread)`} onClick={() => setOpen(!open)} style={{ position: 'relative' }}>
        <Bell size={16} />{!!data?.unread && <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--bad)', color: '#fff', borderRadius: 99, fontSize: 10, padding: '1px 5px' }}>{data.unread}</span>}
      </button>
      {open && (
        <div className="a-card" style={{ position: 'absolute', right: 0, top: 44, width: 340, maxWidth: '90vw', zIndex: 60, maxHeight: '70vh', overflow: 'auto' }}>
          <div className="a-card-h"><b>Notifications</b>
            <button className="a-btn sm" onClick={async () => { await ctx.call('POST', '/api/admin/notifications/read', {}); reload(); }}>Mark all read</button></div>
          {!data?.notifications.length ? <div style={{ padding: 20, color: 'var(--muted)' }}>Nothing yet. New orders and low-stock alerts will appear here.</div> :
            data.notifications.map((n) => (
              <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', opacity: n.read ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><b style={{ fontSize: 13 }}>{n.title}</b>
                  {!n.read && <button className="a-btn sm" onClick={async () => { await ctx.call('POST', '/api/admin/notifications/read', { id: n.id }); reload(); }}>✓</button>}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{n.body} · {istDate(n.created_at)}</div>
              </div>))}
        </div>)}
    </div>
  );
}

function Shell({ admin, csrf, onSignOut }: { admin: Admin; csrf: string; onSignOut: () => void }) {
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('gully_admin_theme') === 'dark'; } catch { return false; } });
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');
  const [toasts, setToasts] = useState<{ id: number; text: string; err: boolean }[]>([]);
  const loc = useLocation(); const nav = useNavigate();
  useEffect(() => setMenu(false), [loc.pathname]);
  useEffect(() => { try { localStorage.setItem('gully_admin_theme', dark ? 'dark' : 'light'); } catch { /* private mode */ } }, [dark]);
  useEffect(() => { document.title = 'Admin · THE NEW GULLY'; const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex,nofollow'; document.head.appendChild(m); return () => { m.remove(); }; }, []);

  const toast = useCallback((text: string, err = false) => { const id = Date.now() + Math.random(); setToasts((t) => [...t, { id, text, err }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500); }, []);
  const ctx = useMemo(() => ({
    admin, csrf, can: (p: string) => admin.permissions.includes(p), toast, signOut: onSignOut,
    call: async (method: string, url: string, body?: unknown) => { try { return await api(method, url, body, csrf); } catch (e) { if (e instanceof ApiError && e.status === 401) onSignOut(); throw e; } },
  }), [admin, csrf, toast, onSignOut]);

  const items = NAV.filter((n) => ctx.can(n.perm));
  const search = (e: React.FormEvent) => { e.preventDefault(); if (!q.trim()) return; nav(/^NG-/i.test(q.trim()) ? `/admin/orders?q=${encodeURIComponent(q.trim())}` : `/admin/products?q=${encodeURIComponent(q.trim())}`); };

  const sidebar = (
    <nav className="a-side" style={{ width: 240, height: '100%', padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }} aria-label="Admin navigation">
      <div style={{ textAlign: 'center', padding: '6px 0 14px', borderBottom: '1px solid rgba(255,255,255,.1)', marginBottom: 10 }}>
        <img src={LOGO} alt="THE NEW GULLY" style={{ height: 54, margin: '0 auto', objectFit: 'contain', filter: 'brightness(1.1)' }} />
        <div style={{ fontSize: 10, letterSpacing: '.25em', color: '#C49C4C', marginTop: 4 }}>ADMIN PANEL</div>
      </div>
      {items.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `a-nav ${isActive ? 'active' : ''}`}>{n.icon}{n.label}</NavLink>)}
      <div style={{ flex: 1 }} />
      <a className="a-nav" href="/" target="_blank" rel="noreferrer"><Boxes size={17} />View storefront</a>
    </nav>
  );

  return (
    <AdminCtx.Provider value={ctx}>
      <div className={`admin-root ${dark ? 'dark' : ''}`}>
        <style>{`@media(min-width:1024px){.a-sidewrap{display:block!important}.a-main{margin-left:240px}.a-burger{display:none!important}}`}</style>
        <aside className="a-sidewrap a-noprint" style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 240, display: 'none', zIndex: 40 }}>{sidebar}</aside>
        {menu && <div className="a-modal-back" style={{ padding: 0, justifyContent: 'flex-start' }} onMouseDown={(e) => e.target === e.currentTarget && setMenu(false)}>
          <div style={{ height: '100vh' }}>{sidebar}</div></div>}
        <div className="a-main">
          <header className="a-noprint" style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--panel)', borderBottom: '1px solid var(--line)', padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="a-btn a-burger" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X size={16} /> : <Menu size={16} />}</button>
            <form onSubmit={search} style={{ flex: 1, maxWidth: 420, position: 'relative' }} role="search">
              <Search size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--muted)' }} />
              <input className="a-input" style={{ paddingLeft: 32 }} placeholder="Search products, or order number (NG-…)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
            </form>
            <div style={{ flex: 1 }} />
            <button className="a-btn" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
            <Notifications />
            <div style={{ textAlign: 'right', lineHeight: 1.2 }} className="hidden sm:block"><b style={{ fontSize: 13 }}>{admin.name}</b><br /><Badge tone="brand">{ROLE_LABEL[admin.role]}</Badge></div>
            <button className="a-btn" onClick={async () => { try { await api('POST', '/api/admin/auth/logout', {}, csrf); } catch { /* already out */ } onSignOut(); }} aria-label="Sign out"><LogOut size={16} /></button>
          </header>
          <main style={{ padding: 18, maxWidth: 1400, margin: '0 auto' }}>
            <Routes>
  <Route path="/admin" element={ctx.can('orders.read') ? <Dashboard /> : <Navigate to="/admin/products" />} />
  <Route path="/admin/products" element={<Products />} />
  <Route path="/admin/products/new" element={<ProductEditor />} />
  <Route path="/admin/products/:id" element={<ProductEditor />} />
  <Route path="/admin/inventory" element={<Inventory />} />
  <Route path="/admin/orders" element={<Orders />} />
  <Route path="/admin/orders/:id" element={<OrderDetail />} />
  <Route path="/admin/offers" element={ctx.can('offers.write') ? <Offers /> : <Navigate to="/admin" />} />
  <Route path="/admin/customers" element={ctx.can('customers.read') ? <Customers /> : <Navigate to="/admin" />} />
  <Route path="/admin/settings" element={<SettingsPage />} />
  <Route path="*" element={<div className="a-card a-card-b">Page not found.</div>} />
</Routes>
          </main>
        </div>
        <div className="a-toast" aria-live="polite">{toasts.map((t) => <div key={t.id} className={t.err ? 'err' : ''}>{t.text}</div>)}</div>
      </div>
    </AdminCtx.Provider>
  );
}

export default function AdminApp() {
  const [state, setState] = useState<{ loading: boolean; admin: Admin | null; csrf: string }>({ loading: true, admin: null, csrf: '' });
  const loc = useLocation(); const nav = useNavigate();
  useEffect(() => { api('GET', '/api/admin/me').then((r) => setState({ loading: false, admin: r.admin, csrf: r.csrf })).catch(() => setState({ loading: false, admin: null, csrf: '' })); }, []);
  const signOut = useCallback(() => { setState({ loading: false, admin: null, csrf: '' }); nav('/admin/login'); }, [nav]);
  const wrap = (el: React.ReactNode) => <div className="admin-root">{el}</div>;

  if (state.loading) return wrap(<div style={{ padding: 60, textAlign: 'center' }}>Loading…</div>);
  const p = loc.pathname.replace(/\/$/, '');
  if (!state.admin) {
    if (p === '/admin/forgot') return wrap(<Forgot />);
    if (p === '/admin/reset') return wrap(<Reset />);
    if (p !== '/admin/login') return <Navigate to="/admin/login" replace />; // unauthenticated → login
    return wrap(<Login onLogin={(a, c) => { setState({ loading: false, admin: a, csrf: c }); nav('/admin'); }} />);
  }
  if (p === '/admin/login' || p === '/admin/forgot') return <Navigate to="/admin" replace />;
  return <Shell admin={state.admin} csrf={state.csrf} onSignOut={signOut} />;
}
