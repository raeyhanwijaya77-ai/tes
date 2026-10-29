import { put } from '@vercel/blob';
import { getStaff } from '@/lib/auth';
export async function POST(req) {
  if (!(await getStaff())) return Response.json({}, { status: 403 });
  const f = (await req.formData()).get('file');
  const b = await put('akun/' + Date.now() + '-' + f.name.replace(/[^\w.]/g, '_'), f, { access: 'public' });
  return Response.json({ url: b.url });
}
