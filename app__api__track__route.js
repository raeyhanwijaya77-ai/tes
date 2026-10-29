import { sql, init } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { settleAuctions } from '@/lib/auction';
export async function POST(req) {
  try {
    const b = await req.json();
    const vid = String(b?.vid || '');
    if (!/^[a-z0-9]{8,40}$/.test(vid)) return Response.json({ ok: 0 });
    await init();
    const u = await getUser();
    const uid = u?.id || null;
    const p = String(b?.path || '/').slice(0, 120);
    await sql`insert into visitors(vid,user_id,path) values(${vid},${uid},${p}) on conflict(vid) do update set last_seen=now(),path=${p},user_id=coalesce(${uid}::int,visitors.user_id)`;
    if (!b?.hb) await sql`insert into pageviews(vid,path) values(${vid},${p})`;
    if (b?.hb) await settleAuctions();
    return Response.json({ ok: 1 });
  } catch { return Response.json({ ok: 0 }); }
}
