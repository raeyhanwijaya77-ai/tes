import { sql, init } from '@/lib/db';
import { getUser, checkPw, hashPw } from '@/lib/auth';
export async function POST(req) {
  try {
    const u = await getUser();
    if (!u) return Response.json({ error: 'Silakan masuk dulu' }, { status: 401 });
    const { old, password } = await req.json();
    if (!password || password.length < 6) return Response.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 });
    await init();
    const [r] = await sql`select pass from users where id=${u.id}`;
    if (!r || !checkPw(String(old || ''), r.pass)) return Response.json({ error: 'Password lama salah' }, { status: 400 });
    await sql`update users set pass=${hashPw(password)} where id=${u.id}`;
    return Response.json({ ok: 1 });
  } catch (x) {
    return Response.json({ error: 'Server error: ' + (x?.message || x) }, { status: 500 });
  }
}
