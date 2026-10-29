import crypto from 'node:crypto';
import { sql, init } from './db';
import { notifySale, notifyConflict } from './discord';
import { logAct } from './activity';
const B = 'https://ariespay.web.id/api/v1';
export async function creds() {
  await init();
  const r = await sql`select k,v from meta where k in ('ap_mid','ap_key')`;
  const m = Object.fromEntries(r.map((x) => [x.k, x.v]));
  return { mid: m.ap_mid || process.env.ARIESPAY_MERCHANT_ID || '', key: m.ap_key || process.env.ARIESPAY_SECRET_KEY || '' };
}
const hdr = (c) => ({ 'Content-Type': 'application/json', 'x-merchant-id': c.mid, 'x-secret-key': c.key });
export async function createQris(reffId, amount, mins = 15) {
  const c = await creds();
  if (!c.mid || !c.key) return null;
  const r = await fetch(`${B}/order`, {
    method: 'POST', headers: hdr(c),
    body: JSON.stringify({ reff_id: reffId, amount, kode_channel: 'QRIS', customer_name: 'Pembeli', expired_ts: Math.floor(Date.now() / 1000) + (mins + 1) * 60 }),
  });
  const d = await r.json().catch(() => ({}));
  return d?.data?.qr_string || null;
}
export async function isPaid(o) {
  const c = await creds();
  if (!c.mid || !c.key) return false;
  try {
    const u = new URL(`${B}/check-order`);
    u.search = new URLSearchParams({ ref_id: o.id });
    const d = await (await fetch(u, { headers: hdr(c) })).json();
    return String(d?.data?.status || '').toLowerCase() === 'success';
  } catch { return false; }
}
export const sigOk = (body, key) => {
  const mid = body?.data?.merchant_id || '';
  const exp = crypto.createHash('md5').update(`${mid}:${key}:${body?.reff_id}`).digest('hex');
  return !!key && String(body?.signature || '').toLowerCase() === exp;
};
export async function finalize(o) {
  const [a] = await sql`select status,buyer_id from accounts where id=${o.account_id}`;
  const taken = !!a && a.status === 'sold' && a.buyer_id !== o.user_id;
  const r = await sql`update orders set status=${taken ? 'refund' : 'paid'} where id=${o.id} and status in ('pending','expired','cancelled') returning id`;
  if (!r.length) return;
  if (taken) { await notifyConflict(o); return; }
  await sql`update accounts set status='sold',buyer_id=${o.user_id} where id=${o.account_id}`;
  await logAct('bayar_lunas', { user: { id: o.user_id }, detail: `${o.id} Rp ${o.amount}` });
  await notifySale(o);
}
