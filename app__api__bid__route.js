import { sql, init } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { logAct } from '@/lib/activity';
import { settleAuctions } from '@/lib/auction';
const bad = (m, s = 400) => Response.json({ error: m }, { status: s });
export async function POST(req) {
  try {
    const u = await getUser();
    if (!u) return bad('Silakan masuk dulu', 401);
    await init();
    await settleAuctions(true);
    const { accountId, amount } = await req.json();
    const amt = parseInt(amount);
    if (!(amt >= 1000 && amt <= 100000000)) return bad('Nominal bid tidak valid');
    const [a] = await sql`select id,title,price,step,admin_id,kind,auction_done,ends_at from accounts where id=${accountId}`;
    if (!a || a.kind !== 'auction' || a.auction_done || new Date(a.ends_at) <= new Date()) return bad('Lelang sudah berakhir');
    if (a.admin_id === u.id) return bad('Kamu tidak bisa bid di stok milikmu sendiri');
    const r = await sql`insert into bids(account_id,user_id,amount) select ${a.id}::int,${u.id}::int,${amt}::int where ${amt}::int >= coalesce((select max(amount) from bids where account_id=${a.id}::int) + ${a.step}::int, ${a.price}::int) returning id`;
    if (!r.length) return bad('Ada bid yang lebih tinggi atau nominal kurang. Naikkan bidmu.');
    await sql`update accounts set ends_at=now()+interval '2 minutes' where id=${a.id} and ends_at<now()+interval '2 minutes'`;
    await logAct('bid', { user: u, detail: `${a.title} Rp ${amt}`, req });
    return Response.json({ ok: 1 });
  } catch (x) { return bad('Server error: ' + (x?.message || x), 500); }
}
