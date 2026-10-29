import { sql, init } from '@/lib/db';
import { getUser, isAdmin } from '@/lib/auth';
export async function GET() {
  if (!isAdmin(await getUser())) return Response.json({}, { status: 403 });
  try {
    await init();
    const days = await sql`select to_char(d,'DD/MM') as label, coalesce(c.n,0)::int as n, coalesce(c.rev,0)::int as rev from generate_series(current_date-6, current_date, interval '1 day') d left join (select created::date as day, count(*) as n, sum(amount-coalesce(fee,0)) as rev from orders where status='paid' group by 1) c on c.day=d::date order by d`;
    const recent = await sql`select o.id,o.amount,a.title,u.username,u.email from orders o left join accounts a on a.id=o.account_id left join users u on u.id=o.user_id where o.status='paid' order by o.created desc limit 8`;
    const [t] = await sql`select count(*)::int as n, coalesce(sum(amount-coalesce(fee,0)),0)::int as rev from orders where status='paid'`;
    const [v] = await sql`select count(*) filter (where last_seen>now()-interval '2 minutes')::int as online, count(*) filter (where last_seen>now()-interval '2 minutes' and user_id is not null)::int as online_user, count(*)::int as visitors from visitors`;
    const [pv] = await sql`select count(*)::int as views, count(distinct vid) filter (where created::date=current_date)::int as today from pageviews`;
    const onl = await sql`select u.username,u.email,v.path from visitors v join users u on u.id=v.user_id where v.last_seen>now()-interval '2 minutes' order by v.last_seen desc limit 12`;
    return Response.json({ days, recent, total: t.rev, orders: t.n, visit: { ...v, ...pv }, onl });
  } catch { return Response.json({ days: [], recent: [] }); }
}
