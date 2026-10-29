import { sql, init } from '@/lib/db';
import { getStaff } from '@/lib/auth';
import { normPhone } from '@/lib/phone';
const no = () => Response.json({ error: 'forbidden' }, { status: 403 });
const bad = (m) => Response.json({ error: m }, { status: 400 });
const clean = (images) => (Array.isArray(images) ? images : []).filter((s) => typeof s === 'string' && /^(https?:\/\/|data:image\/)/.test(s)).slice(0, 8);
const mine = async (me, id) => {
  if (me.owner) return true;
  const [c] = await sql`select admin_id from accounts where id=${id}`;
  return !!c && c.admin_id === me.id;
};
export async function GET(req) {
  const me = await getStaff();
  if (!me) return no();
  await init();
  const one = new URL(req.url).searchParams.get('id');
  if (one) {
    if (!(await mine(me, one))) return no();
    const [r] = await sql`select * from accounts where id=${one}`;
    return Response.json(r || {});
  }
  const rows = me.owner
    ? await sql`select a.id,a.title,a.description,a.specs,a.price,a.username,a.password,a.status,a.wa,a.admin_id,a.kind,a.step,a.ends_at,a.auction_done,case when (a.images->>0) like 'data:%' then '/api/img/' || a.id::text else a.images->>0 end as cover,case when jsonb_typeof(a.images)='array' then jsonb_array_length(a.images) else 0 end as n, u.username as admin_name, (select max(amount)::int from bids b where b.account_id=a.id) as top_bid, (select count(*)::int from bids b where b.account_id=a.id) as bid_n, extract(epoch from (a.ends_at-now()))::int as left from accounts a left join users u on u.id=a.admin_id order by a.id desc`
    : await sql`select a.id,a.title,a.description,a.specs,a.price,a.username,a.password,a.status,a.wa,a.admin_id,a.kind,a.step,a.ends_at,a.auction_done,case when (a.images->>0) like 'data:%' then '/api/img/' || a.id::text else a.images->>0 end as cover,case when jsonb_typeof(a.images)='array' then jsonb_array_length(a.images) else 0 end as n, u.username as admin_name, (select max(amount)::int from bids b where b.account_id=a.id) as top_bid, (select count(*)::int from bids b where b.account_id=a.id) as bid_n, extract(epoch from (a.ends_at-now()))::int as left from accounts a left join users u on u.id=a.admin_id where a.admin_id=${me.id} order by a.id desc`;
  return Response.json(rows);
}
export async function POST(req) {
  const me = await getStaff();
  if (!me) return no();
  await init();
  const { title, description, specs, price, images, username, password, wa, kind, mins, step, ends } = await req.json();
  const imgs = clean(images);
  const p = parseInt(price);
  const kd = kind === 'auction' ? 'auction' : 'fixed';
  const mn = Math.min(20160, Math.max(5, parseInt(mins) || 60));
  const sp = Math.max(1000, parseInt(step) || 1000);
  let endIso = null;
  if (kd === 'auction' && ends) {
    const ee = new Date(ends);
    const ms = ee.getTime() - Date.now();
    if (isNaN(ee) || ms < 4 * 60000 || ms > 30 * 86400000) return bad('Waktu berakhir harus antara 5 menit sampai 30 hari dari sekarang');
    endIso = ee.toISOString();
  }
  if (!title || !p || p < 1 || !username || !password) return bad('Lengkapi judul, harga, username, dan password akun');
  if (wa && String(wa).trim() && !normPhone(wa)) return bad('Nomor WhatsApp tidak valid. Contoh: 0812xxxxxxx');
  const phone = normPhone(wa) || normPhone(me.phone);
  if (!phone && !me.owner) return bad('Isi nomor WhatsApp admin untuk stok ini sebelum upload');
  if (!imgs.length) return bad('Tambahkan minimal 1 foto');
  if (normPhone(wa) && !normPhone(me.phone)) await sql`update users set phone=${normPhone(wa)} where id=${me.id}`;
  await sql`insert into accounts(title,description,specs,price,images,username,password,wa,admin_id,kind,step,ends_at) values(${title},${description || ''},${specs || ''},${p},${JSON.stringify(imgs)}::jsonb,${username},${password},${phone || ''},${me.id},${kd}::text,${sp}::int,case when ${kd}::text='auction' then coalesce(${endIso}::timestamptz, now()+make_interval(mins => ${mn}::int)) else null end)`;
  return Response.json({ ok: 1 });
}
export async function PUT(req) {
  const me = await getStaff();
  if (!me) return no();
  await init();
  const { id, title, description, specs, price, images, username, password, status, wa } = await req.json();
  if (!id || !(await mine(me, id))) return no();
  const imgs = clean(images);
  const p = parseInt(price);
  if (!title || !p || p < 1 || !username || !password) return bad('Lengkapi judul, harga, username, dan password akun');
  if (wa && String(wa).trim() && !normPhone(wa)) return bad('Nomor WhatsApp tidak valid. Contoh: 0812xxxxxxx');
  if (!imgs.length) return bad('Tambahkan minimal 1 foto');
  const phone = normPhone(wa);
  const st = ['available', 'reserved', 'sold'].includes(status) ? status : null;
  await sql`update accounts set title=${title},description=${description || ''},specs=${specs || ''},price=${p},images=${JSON.stringify(imgs)}::jsonb,username=${username},password=${password},wa=coalesce(nullif(${phone}::text,''),wa),status=coalesce(${st}::text,status),reserved_at=case when ${st}::text='available' then null else reserved_at end where id=${id}`;
  return Response.json({ ok: 1 });
}
export async function PATCH(req) {
  const me = await getStaff();
  if (!me) return no();
  await init();
  const { id, status, action } = await req.json();
  if (action === 'end_now') {
    if (!id || !(await mine(me, id))) return no();
    await sql`update accounts set ends_at=now() where id=${id} and kind='auction' and auction_done=false`;
    return Response.json({ ok: 1 });
  }
  if (!id || !['available', 'reserved', 'sold'].includes(status)) return bad('Status tidak valid');
  if (!(await mine(me, id))) return no();
  await sql`update accounts set status=${status}::text,reserved_at=case when ${status}::text='available' then null else reserved_at end where id=${id}`;
  return Response.json({ ok: 1 });
}
export async function DELETE(req) {
  const me = await getStaff();
  if (!me) return no();
  await init();
  const id = new URL(req.url).searchParams.get('id');
  if (!(await mine(me, id))) return no();
  const [cur] = await sql`select status from accounts where id=${id}`;
  if (cur?.status === 'sold') return bad('Akun yang sudah terjual tidak bisa dihapus karena dipakai di riwayat pembeli. Ubah statusnya lewat Edit jika perlu.');
  await sql`delete from accounts where id=${id}`;
  return Response.json({ ok: 1 });
}
