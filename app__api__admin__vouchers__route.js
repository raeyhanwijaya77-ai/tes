import { sql, init } from '@/lib/db';
import { getUser, isAdmin } from '@/lib/auth';
const no = () => Response.json({ error: 'forbidden' }, { status: 403 });
const bad = (m) => Response.json({ error: m }, { status: 400 });
export async function GET() {
  if (!isAdmin(await getUser())) return no();
  await init();
  return Response.json(await sql`select v.*, (select count(*)::int from orders o where o.voucher=v.code and o.status='paid') as used, (select coalesce(sum(o.discount),0)::int from orders o where o.voucher=v.code and o.status='paid') as saved from vouchers v order by v.id desc`);
}
export async function POST(req) {
  if (!isAdmin(await getUser())) return no();
  await init();
  const b = await req.json();
  const code = String(b.code || '').trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,20}$/.test(code)) return bad('Kode 3 sampai 20 karakter: huruf, angka, - atau _');
  const kind = b.kind === 'amount' ? 'amount' : 'percent';
  const value = parseInt(b.value);
  if (!(value >= 1)) return bad('Isi nilai diskon');
  if (kind === 'percent' && value > 90) return bad('Diskon persen maksimal 90');
  const max = Math.max(0, parseInt(b.max_uses) || 0);
  let exp = null;
  if (b.expires) { const d = new Date(b.expires + 'T23:59:59+07:00'); if (isNaN(d)) return bad('Tanggal tidak valid'); exp = d.toISOString(); }
  const users = String(b.users || '').split(/[\n,;]+/).map((x) => x.trim().toLowerCase()).filter(Boolean).join(',');
  const r = await sql`insert into vouchers(code,kind,value,max_uses,expires,users) values(${code},${kind},${value},${max},${exp}::timestamptz,${users}) on conflict(code) do nothing returning id`;
  if (!r.length) return bad('Kode sudah ada');
  return Response.json({ ok: 1 });
}
export async function PATCH(req) {
  if (!isAdmin(await getUser())) return no();
  await init();
  const { id, active } = await req.json();
  await sql`update vouchers set active=${!!active} where id=${id}`;
  return Response.json({ ok: 1 });
}
export async function DELETE(req) {
  if (!isAdmin(await getUser())) return no();
  await init();
  const id = new URL(req.url).searchParams.get('id');
  await sql`delete from vouchers where id=${id}`;
  return Response.json({ ok: 1 });
}
