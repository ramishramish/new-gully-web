# THE NEW GULLY — Admin dashboard (Phase 1)

## First-time setup
```bash
npm install
npm run build                 # builds the storefront + admin into /dist
npm run create-admin          # interactive: creates YOUR Super Admin (nothing is pre-created)
npm start                     # http://localhost:8080  ·  admin at /admin
```
Requires **Node 22.13+** (uses the built-in `node:sqlite` — no extra database to install).
On first start the original catalogue (products, offers, marquee, store info, VINTAGE20 / GULLY10 coupons)
is imported into `server/data/gully.db`. Nothing from the old site is deleted.

Development: run `npm start` in one terminal and `npm run dev` in another (Vite proxies `/api` and `/uploads`).

## Environment variables (optional)
| Name | Purpose |
|---|---|
| `PORT` | default 8080 |
| `NODE_ENV=production` | marks the session cookie `Secure` (use behind HTTPS) |
| `PUBLIC_URL` | e.g. `https://newgully.com` — used in sitemap and reset links |
| `TRUST_PROXY=1` | read client IP from `X-Forwarded-For` (only behind a reverse proxy you control) |
| `GULLY_DATA_DIR`, `GULLY_UPLOADS` | where the DB and uploaded images live — **back these up** |

## Roles
- **Super Admin** — everything, incl. team, store settings, customer export, security log.
- **Manager** — products, inventory, orders (incl. cancel/return/refund), offers/coupons, customers, reports.
- **Staff** — view products, adjust stock (reason required), view and progress orders. No cancel/refund, no money figures.

All checks are enforced on the server (`server/auth.mjs`, `server/http.mjs`).

## Forgot password
No email provider is configured, so the reset link is printed in the **server console**. A Super Admin can also set a
password for anyone under Settings → Team. Wire up SMTP in `routes/admin-core.mjs` (`/auth/forgot`) when ready.

## Payments
No gateway is integrated. Checkout offers Cash-on-Delivery / store pickup. Orders stay **unpaid** until a Manager confirms
money was received (reference required, logged). Never store card data; add a gateway (e.g. Razorpay) with server-side
signature verification before marking anything paid automatically.

## Tests
```bash
TRUST_PROXY=1 GULLY_DB=/tmp/t.db PORT=8099 npm start &
GULLY_DB=/tmp/t.db ADMIN_EMAIL=owner@example.com ADMIN_NAME=Owner ADMIN_PASSWORD='Str0ngPassw0rd!' npm run create-admin
node test/api.test.mjs        # 38 checks: auth, RBAC, CSRF, overselling, price tampering, uploads, exports…
```
