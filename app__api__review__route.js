import { sql, init } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { notifyReview } from '@/lib/discord';
import { logAct } from '@/lib/activity';
const bad = (m, s = 400) => Response.json({ error: m }, { status: s });
export async function POST(req) {
  try {
    const u = await getUser();
    if (!u) return bad('Silakan masuk dulu', 401);
    await init();
    const { orderId, rating, body, photo } = await req.json();
    const n = parseInt(rating);
    const text = String(body || '').trim();
    if (!(n >= 1 && n <= 5)) return bad('Pilih rating 1 sampai 5 bintang');
    if (text.length < 3 || text.length > 500) return bad('Testimoni 3 sampai 500 huruf');
    const [o] = await sql`select id,account_id from orders where id=${String(orderId)} and user_id=${u.id} and status='paid'`;
    if (!o) return bad('Hanya pembeli yang sudah membayar yang bisa menulis testimoni');
    const ph = typeof photo === 'string' && photo.length < 700000 && (/^https:\/\//.test(photo) || /^data:image\/jpeg;base64,/.test(photo)) ? photo : '';
    const r = await sql`insert into reviews(user_id,order_id,account_id,rating,body,photo) values(${u.id},${o.id},${o.account_id},${n},${text},${ph}) on conflict(order_id) do nothing returning id`;
    if (!r.length) return bad('Pesanan ini sudah diberi testimoni');
    const [me] = await sql`select username,email from users where id=${u.id}`;
    await logAct('testimoni', { user: u, detail: n + ' bintang', req });
    await notifyReview(me?.username || me?.email, n, text);
    return Response.json({ ok: 1 });
  } catch (x) { return bad('Server error: ' + (x?.message || x), 500); }
}
