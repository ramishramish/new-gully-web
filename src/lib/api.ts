export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export async function api<T = any>(method: string, url: string, body?: unknown, csrf?: string): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data: any = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) throw new ApiError(res.status, data?.error || `Request failed (${res.status})`);
  return data as T;
}

/** Cart lines in the only shape the server accepts: ids + choices, never prices. */
export const toServerItems = (cart: { product: { id: string }; selectedSize: string; selectedColor: { name: string }; quantity: number }[]) =>
  cart.map((i) => ({ productId: i.product.id, size: i.selectedSize, color: i.selectedColor.name, qty: i.quantity }));
