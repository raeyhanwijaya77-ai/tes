import { sql, init } from '@/lib/db';
export async function GET() {
  try {
    await init();
    const [r] = await sql`select
      (select count(*) from visitors where last_seen>now()-interval '2 minutes')::int as online,
      (select count(*) from visitors where last_seen>now()-interval '2 minutes' and user_id is not null)::int as on_member,
      (select count(*) from visitors)::int as visit,
      (select count(distinct user_id) from visitors where user_id is not null)::int as visit_member,
      (select count(*) from orders where status='paid')::int as sold,
      (select count(*) from accounts where (kind='fixed' and status='available') or (kind='auction' and auction_done=false and ends_at>now()))::int as stock`;
    return Response.json(r, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ online: 0, on_member: 0, visit: 0, visit_member: 0, sold: 0, stock: 0 }); }
}
