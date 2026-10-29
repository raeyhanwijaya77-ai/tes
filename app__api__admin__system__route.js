import { sql, init } from '@/lib/db';
import { getUser, isAdmin } from '@/lib/auth';
import { creds } from '@/lib/payment';
import { googleOn } from '@/lib/google';
export async function GET() {
  if (!isAdmin(await getUser())) return Response.json({}, { status: 403 });
  let db = false;
  try { await init(); await sql`select 1`; db = true; } catch {}
  let pay = false, discord = false;
  try { const c = await creds(); pay = !!(c.mid && c.key); const [d] = await sql`select v from meta where k='discord_url'`; discord = !!d?.v || !!process.env.DISCORD_WEBHOOK_URL; } catch {}
  return Response.json({
    db,
    jwt: !!process.env.JWT_SECRET,
    otp: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
    google: googleOn(),
    blob: !!process.env.BLOB_READ_WRITE_TOKEN,
    pay, discord,
  });
}
