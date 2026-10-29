import { sql, init } from '@/lib/db';
import { getUser, isAdmin } from '@/lib/auth';
const no = () => Response.json({ error: 'forbidden' }, { status: 403 });
const bad = (m) => Response.json({ error: m }, { status: 400 });
const put = (k, v) => sql`insert into meta(k,v) values(${k},${String(v)}) on conflict(k) do update set v=excluded.v`;
export async function GET() {
  if (!isAdmin(await getUser())) return no();
  await init();
  const r = await sql`select k,v from meta where k in ('ap_mid','ap_key','fee','hold_min','auc_pay')`;
  const m = Object.fromEntries(r.map((x) => [x.k, x.v]));
  return Response.json({ mid: m.ap_mid || '', hasKey: !!(m.ap_key || process.env.ARIESPAY_SECRET_KEY), fee: m.fee !== undefined ? parseInt(m.fee) : 350, hold: parseInt(m.hold_min) || 15, auc: parseInt(m.auc_pay) || 30 });
}
export async function POST(req) {
  if (!isAdmin(await getUser())) return no();
  await init();
  const { mid, key, fee, hold, auc } = await req.json();
  if (auc !== undefined) {
    const n = parseInt(auc);
    if (!(n >= 10 && n <= 240)) return bad('Waktu bayar lelang 10 sampai 240 menit');
    await put('auc_pay', n);
  }
  if (hold !== undefined) {
    const n = parseInt(hold);
    if (!(n >= 5 && n <= 120)) return bad('Isi 5 sampai 120 menit');
    await put('hold_min', n);
  }
  if (fee !== undefined) {
    const n = parseInt(fee);
    if (!(n >= 0 && n <= 5000)) return bad('Biaya layanan 0 sampai 5000');
    await put('fee', n);
  }
  if (mid && String(mid).trim()) await put('ap_mid', String(mid).trim());
  if (key && String(key).trim()) await put('ap_key', String(key).trim());
  return Response.json({ ok: 1 });
}
