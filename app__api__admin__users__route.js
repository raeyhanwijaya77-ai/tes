import crypto from 'node:crypto';
import { sql, init } from '@/lib/db';
import { getUser, isAdmin, hashPw } from '@/lib/auth';
import { logAct } from '@/lib/activity';
const no = () => Response.json({ error: 'forbidden' }, { status: 403 });
export async function GET() {
  if (!isAdmin(await getUser())) return no();
  await init();
  return Response.json(await sql`select u.id,u.username,u.email,u.role,(select max(created) from activity a where a.user_id=u.id) as last_seen,(select count(*)::int from orders o where o.user_id=u.id and o.status='paid') as orders,(select coalesce(sum(o.amount-coalesce(o.fee,0)),0)::int from orders o where o.user_id=u.id and o.status='paid') as spent from users u order by u.id desc limit 300`);
}
export async function POST(req) {
  if (!isAdmin(await getUser())) return no();
  await init();
  const { id } = await req.json();
  const [t] = await sql`select role from users where id=${id}`;
  if (!t) return Response.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
  if (t.role === 'admin_rehan') return Response.json({ error: 'Password admin diganti lewat menu Pengaturan' }, { status: 400 });
  const alpha = 'abcdefghjkmnpqrstuvwxyz23456789';
  const pw = Array.from({ length: 8 }, () => alpha[crypto.randomInt(alpha.length)]).join('');
  await sql`update users set pass=${hashPw(pw)} where id=${id}`;
  await logAct('admin_reset_pw', { user: { id }, detail: 'oleh admin' });
  return Response.json({ ok: 1, password: pw });
}
