import { sql, init } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { isPaid, finalize } from '@/lib/payment';
import { logAct } from '@/lib/activity';
export async function POST(_, { params }) {
  try {
    const { id } = await params;
    const u = await getUser();
    if (!u) return Response.json({ error: 'Silakan masuk dulu' }, { status: 401 });
    await init();
    const [o] = await sql`select * from orders where id=${id} and user_id=${u.id}`;
    if (!o) return Response.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    if (o.status === 'paid') return Response.json({ error: 'Pesanan sudah dibayar', paid: true }, { status: 409 });
    if (o.status !== 'pending') return Response.json({ ok: 1 });
    if (await isPaid(o)) {
      await finalize(o);
      return Response.json({ error: 'Pembayaran sudah masuk, pesanan tidak bisa dibatalkan', paid: true }, { status: 409 });
    }
    await sql`update orders set status='cancelled' where id=${o.id} and status='pending'`;
    await sql`update accounts set status='available',reserved_at=null where id=${o.account_id} and status='reserved' and buyer_id=${u.id}`;
    await logAct('batal_pesanan', { user: u, detail: o.id, req: _ });
    return Response.json({ ok: 1 });
  } catch (x) {
    return Response.json({ error: 'Server error: ' + (x?.message || x) }, { status: 500 });
  }
}
