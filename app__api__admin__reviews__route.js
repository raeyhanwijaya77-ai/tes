import { sql, init } from '@/lib/db';
import { getUser, isAdmin } from '@/lib/auth';
const no = () => Response.json({ error: 'forbidden' }, { status: 403 });
export async function GET() {
  if (!isAdmin(await getUser())) return no();
  await init();
  return Response.json(await sql`select r.id,r.rating,r.body,r.photo,r.reply,r.hidden,r.created,u.username,a.title from reviews r left join users u on u.id=r.user_id left join accounts a on a.id=r.account_id order by r.id desc limit 100`);
}
export async function PATCH(req) {
  if (!isAdmin(await getUser())) return no();
  await init();
  const { id, reply, hidden } = await req.json();
  if (!id) return Response.json({ error: 'id kosong' }, { status: 400 });
  if (reply !== undefined) await sql`update reviews set reply=${String(reply).slice(0, 300)} where id=${id}`;
  if (hidden !== undefined) await sql`update reviews set hidden=${!!hidden} where id=${id}`;
  return Response.json({ ok: 1 });
}
export async function DELETE(req) {
  if (!isAdmin(await getUser())) return no();
  await init();
  const id = new URL(req.url).searchParams.get('id');
  await sql`delete from reviews where id=${id}`;
  return Response.json({ ok: 1 });
}
