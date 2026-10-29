import { sql, init } from '@/lib/db';
import { creds, sigOk, finalize } from '@/lib/payment';
export async function POST(req) {
  try {
    await init();
    const b = await req.json();
    const c = await creds();
    if (!sigOk(b, c.key)) return Response.json({ error: 'Invalid signature' }, { status: 400 });
    if (String(b.status).toLowerCase() === 'success') {
      const [o] = await sql`select * from orders where id=${String(b.reff_id)}`;
      const paid = Number(b?.data?.total_dibayar);
      if (o && o.status !== 'paid' && o.status !== 'refund' && (!paid || paid >= o.amount)) await finalize(o);
    }
    return Response.json({ status: true });
  } catch { return Response.json({ error: 'server' }, { status: 500 }); }
}
