import { sql, init } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { settleAuctions } from '@/lib/auction';
export async function GET(_, { params }) {
  try {
    const { id } = await params;
    await init();
    await settleAuctions();
    const u = await getUser();
    const [a] = await sql`select id,title,price,step,kind,auction_done,status,extract(epoch from (ends_at-now()))::int as left from accounts where id=${id}`;
    if (!a || a.kind !== 'auction') return Response.json({ ok: 0, fixed: true });
    const bids = await sql`select b.amount,b.user_id,u.username,extract(epoch from (now()-b.created))::int as ago from bids b left join users u on u.id=b.user_id where b.account_id=${id} order by b.amount desc, b.id asc limit 10`;
    const top = bids[0] || null;
    const ended = a.auction_done || a.left <= 0;
    let order = null;
    if (a.auction_done && top && u) {
      const [o] = await sql`select id,status from orders where account_id=${id} and kind='auction' and user_id=${u.id} order by created desc limit 1`;
      if (o) order = o;
    }
    const mask = (n) => (n ? String(n).slice(0, 2) + '***' : 'anon');
    return Response.json({
      ok: 1, ended, left: Math.max(0, a.left), start: a.price, step: a.step,
      top: top ? top.amount : 0, topMine: !!(u && top && top.user_id === u.id),
      min: top ? top.amount + a.step : a.price,
      bids: bids.map((b) => ({ u: mask(b.username), a: b.amount, ago: b.ago, mine: !!(u && b.user_id === u.id) })),
      winnerMine: !!(ended && order), orderId: order?.id || '', orderStatus: order?.status || '',
    });
  } catch { return Response.json({ ok: 0 }); }
}
