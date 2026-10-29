import { sql, init } from '@/lib/db';
import { getUser, setSession, ADMIN } from '@/lib/auth';
const bad = (m, s = 400) => Response.json({ error: m }, { status: s });
export async function POST(req) {
  try {
    const u = await getUser();
    if (!u) return bad('Silakan masuk dulu', 401);
    await init();
    const b = await req.json();
    const [me] = await sql`select id,email,username,role from users where id=${u.id}`;
    if (!me) return bad('Akun tidak ditemukan', 404);
    const owner = me.role === 'admin_rehan' || me.email === ADMIN;
    if (b.username !== undefined) {
      const un = String(b.username || '').toLowerCase().trim().replace(/\s+/g, '_');
      if (!/^[a-z0-9_.]{3,20}$/.test(un)) return bad('Username 3 sampai 20 karakter: huruf, angka, titik, atau garis bawah');
      if (!owner && un.startsWith('admin')) return bad('Username tidak tersedia');
      const [dup] = await sql`select 1 from users where lower(username)=${un} and id<>${me.id}`;
      if (dup) return bad('Username sudah dipakai orang lain');
      await sql`update users set username=${un} where id=${me.id}`;
    }
    if (b.avatar !== undefined) {
      const a = String(b.avatar || '');
      if (a && !(a.startsWith('data:image/jpeg;base64,') && a.length < 90000)) return bad('Foto profil tidak valid atau terlalu besar');
      await sql`update users set avatar=${a} where id=${me.id}`;
    }
    if (b.notify !== undefined) await sql`update users set notify=${!!b.notify} where id=${me.id}`;
    const [row] = await sql`select id,email,username,role from users where id=${me.id}`;
    await setSession(row);
    return Response.json({ ok: 1, username: row.username });
  } catch (x) { return bad('Server error: ' + (x?.message || x), 500); }
}
