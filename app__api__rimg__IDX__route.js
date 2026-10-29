import { sql, init } from '@/lib/db';
export async function GET(_, { params }) {
  try {
    const { id } = await params;
    await init();
    const [r] = await sql`select photo from reviews where id=${id} and not hidden`;
    const img = String(r?.photo || '');
    if (img.startsWith('http')) return Response.redirect(img, 302);
    const m = /^data:(image\/[a-z+]+);base64,(.+)$/.exec(img);
    if (!m) return new Response('not found', { status: 404 });
    return new Response(Buffer.from(m[2], 'base64'), { headers: { 'Content-Type': m[1], 'Cache-Control': 'public, max-age=600' } });
  } catch { return new Response('error', { status: 500 }); }
}
