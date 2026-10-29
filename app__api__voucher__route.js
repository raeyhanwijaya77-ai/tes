import { sql, init } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { checkVoucher } from '@/lib/voucher';
import { getFee } from '@/lib/db';
import { logAct } from '@/lib/activity';
export async function POST(req) {
  try {
    const u = await getUser();
    if (!u) return Response.json({ error: 'Silakan masuk dulu' }, { status: 401 });
    await init();
    const { code, accountId } = await req.json();
    const [a] = await sql`select price from accounts where id=${accountId}`;
    if (!a) return Response.json({ error: 'Akun tidak ditemukan' }, { status: 404 });
    const v = await checkVoucher(code, u, a.price);
    if (!v.ok) { await logAct('voucher_gagal', { user: u, detail: String(code).slice(0, 30) + ': ' + v.error, req }); return Response.json({ error: v.error }, { status: 400 }); }
    await logAct('voucher_ok', { user: u, detail: v.code, req });
    return Response.json({ ok: 1, code: v.code, discount: v.discount, final: v.final, label: v.label, fee: await getFee() });
  } catch (x) { return Response.json({ error: 'Server error: ' + (x?.message || x) }, { status: 500 }); }
}
