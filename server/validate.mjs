import { bad } from './http.mjs';
/** Allow '', site-relative paths, http(s), mailto, tel. Rejects javascript:, data:, protocol-relative etc. */
export function safeUrl(u, { allowEmpty = true, label = 'URL' } = {}) {
  const s = String(u ?? '').trim();
  if (!s) { if (allowEmpty) return ''; throw bad(`${label} is required.`); }
  if (s.length > 500) throw bad(`${label} is too long.`);
  if (s.startsWith('/') && !s.startsWith('//') && !/[\s\\]/.test(s)) return s;
  try { const x = new URL(s); if (['http:', 'https:', 'mailto:', 'tel:'].includes(x.protocol)) return s; } catch {}
  throw bad(`${label} is not a safe link (use https://… or /path).`);
}
export const str = (v, max, { req = false, label = 'Field' } = {}) => {
  const s = String(v ?? '').trim();
  if (req && !s) throw bad(`${label} is required.`);
  if (s.length > max) throw bad(`${label} must be at most ${max} characters.`);
  return s;
};
export const int = (v, { min = 0, max = 10_000_000, label = 'Number', req = true } = {}) => {
  if ((v === null || v === undefined || v === '') && !req) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw bad(`${label} must be a whole number between ${min} and ${max}.`);
  return n;
};
export const bool = (v) => (v ? 1 : 0);
export const dateOrNull = (v, label = 'Date') => {
  if (v === null || v === undefined || v === '') return null;
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(v)) || isNaN(Date.parse(v))) throw bad(`${label} is invalid.`);
  return String(v).slice(0, 10);
};
export const oneOf = (v, list, label = 'Value') => { if (!list.includes(v)) throw bad(`${label} is invalid.`); return v; };
