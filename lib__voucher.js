import { sql } from './db';
export async function checkVoucher(raw, user, price) {
  const code = String(raw || '').trim().toUpperCase();
  if (!code) return { ok: false, error: 'Masukkan kode voucher' };
  const [v] = await sql`select * from vouchers where code=${code}`;
  if (!v || !v.active) return { ok: false, error: 'Kode voucher tidak ditemukan' };
  if (v.expires && new Date(v.expires) < new Date()) return { ok: false, error: 'Voucher sudah kedaluwarsa' };
  const [me] = await sql`select username,email from users where id=${user.id}`;
  const list = String(v.users || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (list.length && !list.includes(String(me?.username || '').toLowerCase()) && !list.includes(String(me?.email || '').toLowerCase())) return { ok: false, error: 'Voucher ini bukan untuk akunmu' };
  const [mine] = await sql`select 1 from orders where voucher=${code} and user_id=${user.id} and status='paid' limit 1`;
  if (mine) return { ok: false, error: 'Voucher ini sudah kamu pakai' };
  if (v.max_uses > 0) {
    const [c] = await sql`select count(*)::int as n from orders where voucher=${code} and (status='paid' or (status='pending' and created>now()-interval '30 minutes' and user_id<>${user.id}))`;
    if (c.n >= v.max_uses) return { ok: false, error: 'Kuota voucher sudah habis' };
  }
  let disc = v.kind === 'percent' ? Math.floor((price * v.value) / 100) : v.value;
  const final = Math.max(Math.min(price, 1000), price - disc);
  disc = price - final;
  if (disc <= 0) return { ok: false, error: 'Voucher tidak berlaku untuk harga ini' };
  return { ok: true, code, discount: disc, final, label: v.kind === 'percent' ? v.value + '%' : 'Rp ' + Number(v.value).toLocaleString('id-ID') };
}
