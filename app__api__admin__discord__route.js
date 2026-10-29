import { sql, init } from '@/lib/db';
import { getUser, isAdmin } from '@/lib/auth';
import { sendDiscord, sendReport } from '@/lib/discord';
const no = () => Response.json({ error: 'forbidden' }, { status: 403 });
const bad = (m) => Response.json({ error: m }, { status: 400 });
export async function GET() {
  if (!isAdmin(await getUser())) return no();
  await init();
  const [r] = await sql`select v from meta where k='discord_url'`;
  return Response.json({ on: !!r?.v || !!process.env.DISCORD_WEBHOOK_URL });
}
export async function POST(req) {
  if (!isAdmin(await getUser())) return no();
  await init();
  const { url, action } = await req.json();
  if (typeof url === 'string') {
    const t = url.trim();
    if (!t) await sql`delete from meta where k='discord_url'`;
    else if (!/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//.test(t)) return bad('Link webhook Discord tidak valid');
    else await sql`insert into meta(k,v) values('discord_url',${t}) on conflict(k) do update set v=excluded.v`;
  }
  if (action === 'test') {
    const ok = await sendDiscord({ content: '✅ Tes notifikasi dari Toko Akun Rehan berhasil.' });
    if (!ok) return bad('Gagal mengirim. Cek link webhook Discord');
  }
  if (action === 'report') {
    const ok = await sendReport();
    if (!ok) return bad('Gagal mengirim. Simpan link webhook Discord dulu');
  }
  return Response.json({ ok: 1 });
}
