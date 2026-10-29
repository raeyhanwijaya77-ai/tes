import { sql, init } from '@/lib/db';
import { getUser, isAdmin } from '@/lib/auth';
export async function GET(req) {
  if (!isAdmin(await getUser())) return Response.json({}, { status: 403 });
  try {
    await init();
    const sp = new URL(req.url).searchParams;
    const type = (sp.get('type') || '').slice(0, 30);
    const q = '%' + (sp.get('q') || '').toLowerCase().slice(0, 40) + '%';
    if (Math.random() < 0.05) await sql`delete from activity where created < now()-interval '90 days'`;
    const rows = await sql`select id,user_id,username,type,detail,ip,created from activity where (${type}='' or type=${type}) and (lower(username) like ${q} or lower(detail) like ${q}) order by id desc limit 100`;
    const [s] = await sql`select count(distinct user_id) filter (where user_id is not null and created::date=current_date)::int as aktif_hari, count(distinct user_id) filter (where user_id is not null and created>now()-interval '15 minutes')::int as aktif_15, count(*) filter (where type='login_gagal' and created::date=current_date)::int as gagal, count(*) filter (where type='buat_pesanan' and created::date=current_date)::int as pesanan, count(*) filter (where type='lihat_akun' and created::date=current_date)::int as lihat from activity`;
    return Response.json({ rows, stat: s });
  } catch { return Response.json({ rows: [], stat: {} }); }
}
