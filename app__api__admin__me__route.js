import { sql, init } from '@/lib/db';
import { getStaff } from '@/lib/auth';
import { normPhone } from '@/lib/phone';
export async function POST(req) {
  const me = await getStaff();
  if (!me) return Response.json({ error: 'forbidden' }, { status: 403 });
  await init();
  const { phone } = await req.json();
  const n = normPhone(phone);
  if (!n) return Response.json({ error: 'Nomor WhatsApp tidak valid. Contoh: 0812xxxxxxx' }, { status: 400 });
  await sql`update users set phone=${n} where id=${me.id}`;
  return Response.json({ ok: 1, phone: n });
}
