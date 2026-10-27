// Usage: npm run create-admin     (interactive; the password is never echoed nor stored in any file)
import readline from 'node:readline';
import { db } from './db.mjs';
import { hashPassword, passwordProblem } from './auth.mjs';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q, hidden = false) => new Promise((res) => {
  if (!hidden) return rl.question(q, res);
  const w = rl._writeToOutput; rl._writeToOutput = (s) => { if (s.includes(q)) w.call(rl, s); }; rl.question(q, (a) => { rl._writeToOutput = w; process.stdout.write('\n'); res(a); });
});
const email = (process.env.ADMIN_EMAIL || await ask('Admin email: ')).trim().toLowerCase();
const name = (process.env.ADMIN_NAME || await ask('Full name: ')).trim();
const role = (process.env.ADMIN_ROLE || (db.prepare('SELECT COUNT(*) c FROM admins').get().c ? await ask('Role (super_admin/manager/staff): ') : 'super_admin')).trim();
const pw = process.env.ADMIN_PASSWORD || await ask('Password (min 10 chars, upper+lower+number): ', true);
rl.close();
const problem = passwordProblem(pw);
if (problem || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !name || !['super_admin', 'manager', 'staff'].includes(role)) { console.error(problem || 'Invalid input.'); process.exit(1); }
db.prepare('INSERT INTO admins(email,name,password_hash,role) VALUES(?,?,?,?)').run(email, name, hashPassword(pw), role);
console.log(`Created ${role}: ${email}`);
