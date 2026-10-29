import { sql, init, holdMin, getFee } from '@/lib/db';
import { logAct } from '@/lib/activity';
import { getUser } from '@/lib/auth';
import { createQris } from '@/lib/payment';
import { checkVoucher } from '@/lib/voucher';
export async function POST(req) {
  const u = await getUser();
  if (!u) return Response.json({ error: 'login' }, { status: 401 });
  await init();
  const { accountId, voucher } = await req.json();
  const hold = await holdMin();
  await sql`update accounts set status='available' where status='reserved' and kind='fixed' and reserved_at<now()-make_interval(mins => ${hold}::int)`;
  const [pn] = await sql`select count(*)::int as n from orders where user_id=${u.id} and status='pending' and created>now()-make_interval(mins => ${hold}::int)`;
  if (pn.n >= 2) return Response.json({ error: 'Kamu masih punya 2 pesanan yang menunggu pembayaran. Selesaikan atau batalkan dulu di menu Pesanan.' }, { status: 429 });
  const [a] = await sql`update accounts set status='reserved',reserved_at=now(),buyer_id=${u.id} where id=${accountId} and status='available' and kind='fixed' returning id,price`;
  if (!a) return Response.json({ error: 'Akun sudah tidak tersedia' }, { status: 409 });
  const fee = await getFee();
  let base = a.price, code = '', disc = 0;
  if (voucher) {
    const v = await checkVoucher(voucher, u, a.price);
    if (!v.ok) {
      await sql`update accounts set status='available',reserved_at=null where id=${a.id}`;
      return Response.json({ error: v.error }, { status: 400 });
    }
    base = v.final; code = v.code; disc = v.discount;
  }
  const amount = base + fee;
  const id = 'RBX' + Date.now() + Math.floor(Math.random() * 900 + 100);
  try {
    const qr = await createQris(id, amount, hold);
    if (!qr) throw 0;
    await sql`insert into orders(id,user_id,account_id,amount,qr,voucher,discount,fee) values(${id},${u.id},${a.id},${amount},${qr},${code},${disc},${fee})`;
    await logAct('buat_pesanan', { user: u, detail: `${id} akun #${a.id} Rp ${amount}`, req });
    return Response.json({ id });
  } catch {
    await sql`update accounts set status='available' where id=${a.id}`;
    return Response.json({ error: 'Gagal membuat pembayaran. Coba lagi, atau hubungi admin jika terus gagal.' }, { status: 502 });
  }
}
