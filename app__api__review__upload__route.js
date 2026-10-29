import { put } from '@vercel/blob';
import { sql, init } from '@/lib/db';
import { getUser } from '@/lib/auth';
export async function POST(req) {
  try {
    const u = await getUser();
    if (!u) return Response.json({ error: 'login' }, { status: 401 });
    await init();
    const [o] = await sql`select 1 from orders where user_id=${u.id} and status='paid' limit 1`;
    if (!o) return Response.json({ error: 'forbidden' }, { status: 403 });
    const f = (await req.formData()).get('file');
    if (!f || f.size > 1500000) return Response.json({ error: 'Foto terlalu besar' }, { status: 400 });
    const b = await put('testi/' + Date.now() + '-' + u.id + '.jpg', f, { access: 'public' });
    return Response.json({ url: b.url });
  } catch { return Response.json({ error: 'upload gagal' }, { status: 500 }); }
}
