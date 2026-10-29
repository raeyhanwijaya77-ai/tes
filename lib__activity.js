import { sql } from './db';
export async function logAct(type, o = {}) {
  try {
    const { user, detail = '', req, dedupe = 0 } = o;
    let uid = user?.id || null, name = user?.username || user?.email || '';
    if (uid && !user?.username) {
      const [m] = await sql`select username,email from users where id=${uid}`;
      name = m?.username || m?.email || name;
    }
    const ip = req ? String(req.headers.get('x-forwarded-for') || '').split(',')[0].trim() : '';
    const d = String(detail).slice(0, 200);
    if (dedupe > 0 && uid) {
      await sql`insert into activity(user_id,username,type,detail,ip) select ${uid}::int,${name}::text,${type}::text,${d}::text,${ip}::text where not exists (select 1 from activity where user_id=${uid}::int and type=${type}::text and detail=${d}::text and created>now()-make_interval(mins => ${dedupe}::int))`;
    } else {
      await sql`insert into activity(user_id,username,type,detail,ip) values(${uid},${name},${type},${d},${ip})`;
    }
  } catch {}
}
