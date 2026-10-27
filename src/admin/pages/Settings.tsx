import React, { useState } from 'react';
import { Badge, Empty, ErrorBox, Field, PageHead, ROLE_LABEL, Spinner, Tabs, istDate, msg, useAdmin, useLoad } from '../ui';

export const SettingsPage: React.FC = () => {
  const { can } = useAdmin();
  const [tab, setTab] = useState<'account' | 'store' | 'team' | 'audit'>(can('settings.write') ? 'store' : 'account');
  const tabs: ['account' | 'store' | 'team' | 'audit', string][] = [['account', 'My account']];
  if (can('settings.write')) tabs.unshift(['store', 'Store information']);
  if (can('admins.manage')) tabs.push(['team', 'Team & roles'], ['audit', 'Security log']);
  return <><PageHead title="Settings" /><Tabs tabs={tabs} value={tab} onChange={setTab} />{tab === 'store' ? <Store /> : tab === 'team' ? <Team /> : tab === 'audit' ? <Audit /> : <Account />}</>;
};

const STORE_FIELDS: [string, string, string?][] = [['name', 'Store name'], ['tagline', 'Tagline'], ['location', 'Address / location'], ['phone', 'Contact number', 'Leave blank until you have a real number — it is shown on the site'], ['whatsapp', 'WhatsApp number', 'Digits with country code, e.g. 91XXXXXXXXXX'],
  ['email', 'Contact email'], ['hoursWeekdays', 'Opening hours (weekdays)'], ['hoursWeekends', 'Opening hours (weekends)'], ['hoursNote', 'Opening hours note'], ['mapsLabel', 'Map label'], ['mapsEmbedUrl', 'Google Maps embed URL', 'Must be a https://maps.google.com or google.com/maps URL'],
  ['mapsDirectionsUrl', 'Directions link'], ['instagram', 'Instagram URL'], ['facebook', 'Facebook URL'], ['deliveryEstimate', 'Delivery estimate'], ['freeDeliveryThreshold', 'Free delivery above (₹)'], ['deliveryCharge', 'Delivery charge (₹)']];
const Store: React.FC = () => {
  const { call, toast } = useAdmin();
  const { data, error, loading } = useLoad(() => call('GET', '/api/admin/settings/store'), []);
  const [f, setF] = useState<any>(null);
  if (loading && !data) return <Spinner />; if (error) return <ErrorBox error={error} />; if (!data) return null;
  const v = f ?? data.store;
  return <div className="a-card a-card-b"><div className="a-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
    {STORE_FIELDS.map(([k, l, h]) => <Field key={k} label={l} hint={h}><input className="a-input" value={v[k] ?? ''} onChange={(e) => setF({ ...v, [k]: e.target.value })} /></Field>)}</div>
    <div className="a-hint" style={{ margin: '10px 0' }}>Established {v.established} · Currency {v.currency} (₹). Changes appear on the storefront after a page refresh.</div>
    <button className="a-btn primary" onClick={async () => { try { await call('PUT', '/api/admin/settings/store', v); toast('Store information saved'); } catch (e) { toast(msg(e), true); } }}>Save store information</button></div>;
};

const Team: React.FC = () => {
  const { call, toast, admin } = useAdmin();
  const { data, error, loading, reload } = useLoad(() => call('GET', '/api/admin/admins'), []);
  const [n, setN] = useState({ name: '', email: '', role: 'staff', password: '' });
  const act = async (fn: () => Promise<any>, ok: string) => { try { await fn(); toast(ok); reload(); } catch (e) { toast(msg(e), true); } };
  return <div className="a-grid"><div className="a-card">{loading && !data ? <Spinner /> : error ? <ErrorBox error={error} retry={reload} /> :
    <div className="a-scroll"><table className="a-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Last login</th><th>Status</th><th></th></tr></thead><tbody>
      {data.admins.map((a: any) => <tr key={a.id}><td><b>{a.name}</b></td><td>{a.email}</td><td><select className="a-select" style={{ width: 140 }} value={a.role} onChange={(e) => act(() => call('PATCH', `/api/admin/admins/${a.id}`, { role: e.target.value }), 'Role updated')}>{Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></td>
        <td>{a.last_login ? istDate(a.last_login) : 'never'}</td><td><Badge tone={a.active ? 'ok' : 'bad'}>{a.active ? 'active' : 'disabled'}</Badge></td>
        <td style={{ whiteSpace: 'nowrap' }}>{a.id !== admin.id && <button className="a-btn sm" onClick={() => act(() => call('PATCH', `/api/admin/admins/${a.id}`, { active: !a.active }), a.active ? 'Disabled' : 'Enabled')}>{a.active ? 'Disable' : 'Enable'}</button>}{' '}
          <button className="a-btn sm" onClick={() => { const p = window.prompt(`New password for ${a.email} (min 10 chars, upper+lower+number):`); if (p) act(() => call('PATCH', `/api/admin/admins/${a.id}`, { password: p }), 'Password reset; they were signed out'); }}>Set password</button></td></tr>)}
    </tbody></table></div>}</div>
    <div className="a-card a-card-b a-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}><h3 style={{ margin: 0, gridColumn: '1/-1', fontSize: 16 }}>Add administrator</h3>
      <Field label="Name"><input className="a-input" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} /></Field><Field label="Email"><input className="a-input" type="email" value={n.email} onChange={(e) => setN({ ...n, email: e.target.value })} /></Field>
      <Field label="Role"><select className="a-select" value={n.role} onChange={(e) => setN({ ...n, role: e.target.value })}>{Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
      <Field label="Temporary password"><input className="a-input" type="password" autoComplete="new-password" value={n.password} onChange={(e) => setN({ ...n, password: e.target.value })} /></Field>
      <div style={{ alignSelf: 'end' }}><button className="a-btn primary" onClick={() => act(async () => { await call('POST', '/api/admin/admins', n); setN({ name: '', email: '', role: 'staff', password: '' }); }, 'Administrator created')}>Create</button></div>
      <div className="a-hint" style={{ gridColumn: '1/-1' }}><b>Super Admin</b>: everything incl. team &amp; settings · <b>Manager</b>: products, inventory, orders, offers, customers, reports (no team/store settings) · <b>Staff</b>: view products, adjust stock, view/progress orders (no cancel/refund, no money reports).</div></div></div>;
};

const Audit: React.FC = () => {
  const { call } = useAdmin(); const { data, error, loading, reload } = useLoad(() => call('GET', '/api/admin/audit'), []);
  return <div className="a-card">{loading && !data ? <Spinner /> : error ? <ErrorBox error={error} retry={reload} /> : !data?.log.length ? <Empty>No activity yet.</Empty> :
    <div className="a-scroll"><table className="a-table"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Detail</th><th>IP</th></tr></thead><tbody>{data.log.map((l: any) => <tr key={l.id}><td>{istDate(l.at)}</td><td>{l.admin_email || '—'}</td><td><b>{l.action}</b></td><td style={{ maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.detail}</td><td>{l.ip}</td></tr>)}</tbody></table></div>}</div>;
};

const Account: React.FC = () => {
  const { call, toast, admin } = useAdmin(); const [cur, setCur] = useState(''); const [pw, setPw] = useState('');
  return <div className="a-card a-card-b a-grid" style={{ maxWidth: 420 }}><div><b>{admin.name}</b> · {admin.email} · <Badge tone="brand">{ROLE_LABEL[admin.role]}</Badge></div>
    <Field label="Current password"><input className="a-input" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
    <Field label="New password" hint="10+ characters with upper-case, lower-case and a number"><input className="a-input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
    <button className="a-btn primary" onClick={async () => { try { await call('POST', '/api/admin/auth/change-password', { current: cur, password: pw }); toast('Password changed; other sessions signed out'); setCur(''); setPw(''); } catch (e) { toast(msg(e), true); } }}>Change password</button></div>;
};
