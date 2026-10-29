import { sql, init, holdMin, auctionPayMin } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { isPaid, finalize, createQris } from '@/lib/payment';
export async function GET(_, { params }) {
  const { id } = await params;
  const u = await getUser();
  if (!u) return Response.json({}, { status: 401 });
  await init();
  const [o] = await sql`select *, extract(epoch from (now()-created))::int as age from orders where id=${id} and user_id=${u.id}`;
  if (!o) return Response.json({}, { status: 404 });
  const win = o.kind === 'auction' ? await auctionPayMin() : await holdMin();
  if ((o.status === 'pending' || o.status === 'expired') && (await isPaid(o))) {
    await finalize(o);
    const [n] = await sql`select status from orders where id=${o.id}`;
    o.status = n?.status || o.status;
  }
  if (o.status === 'pending' && !o.qr) {
    try {
      const qr = await createQris(o.id, o.amount, win);
      if (qr) { await sql`update orders set qr=${qr} where id=${o.id}`; o.qr = qr; }
    } catch {}
  }
  if (o.status === 'pending' && o.age > win * 60) {
    await sql`update orders set status='expired' where id=${o.id} and status='pending'`;
    if (o.kind === 'auction') await sql`update accounts set status='available',kind='fixed',reserved_at=null,buyer_id=null where id=${o.account_id} and status='reserved'`;
    else await sql`update accounts set status='available',reserved_at=null where id=${o.account_id} and status='reserved' and buyer_id=${u.id}`;
    o.status = 'expired';
  }
  let acc = null;
  if (o.status === 'paid') [acc] = await sql`select title,username,password from accounts where id=${o.account_id}`;
  const [ac] = await sql`select wa from accounts where id=${o.account_id}`;
  return Response.json({ wa: ac?.wa || '', id: o.id, kind: o.kind || 'fixed', status: o.status, qr: o.qr || '', amount: o.amount, discount: o.discount || 0, fee: o.fee || 0, voucher: o.voucher || '', left: Math.max(0, win * 60 - o.age), acc });
}
