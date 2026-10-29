import nodemailer from 'nodemailer';
import { sql, init } from '@/lib/db';
import { getStaff } from '@/lib/auth';
import { siteOrigin } from '@/lib/google';
import { broadcastHtml } from '@/lib/mail';
export const maxDuration = 60;
const LIMIT = 450;
const no = () => Response.json({ error: 'forbidden' }, { status: 403 });
const bad = (m) => Response.json({ error: m }, { status: 400 });
async function recipients(target, code) {
  if (target === 'buyers') return (await sql`select distinct u.email from users u join orders o on o.user_id=u.id and o.status='paid' where u.notify is not false and u.email<>''`).map((r) => r.email);
  if (target === 'voucher') {
    const [v] = await sql`select users from vouchers where code=${code || ''}`;
    const list = String(v?.users || '').split(',').map((x) => x.trim()).filter(Boolean);
    if (!list.length) return null;
    const all = await sql`select email,username from users where notify is not false and email<>''`;
    return all.filter((u) => list.includes(String(u.username || '').toLowerCase()) || list.includes(String(u.email).toLowerCase())).map((u) => u.email);
  }
  return (await sql`select email from users where notify is not false and email<>''`).map((r) => r.email);
}
export async function GET() {
  const me = await getStaff();
  if (!me) return no();
  await init();
  const [c] = await sql`select (select count(*) from users where notify is not false and email<>'')::int as total, (select count(distinct u.id) from users u join orders o on o.user_id=u.id and o.status='paid' where u.notify is not false)::int as buyers, (select coalesce(sum(sent),0) from broadcasts where created::date=current_date)::int as today`;
  const history = await sql`select id,subject,target,sent,created from broadcasts order by id desc limit 10`;
  const vouchers = await sql`select code,kind,value,users from vouchers where active order by id desc limit 50`;
  return Response.json({ ...c, limit: LIMIT, history, vouchers });
}
export async function POST(req) {
  const me = await getStaff();
  if (!me) return no();
  await init();
  const b = await req.json();
  const subject = String(b.subject || '').trim().slice(0, 120);
  const message = String(b.message || '').trim().slice(0, 2000);
  if (subject.length < 3 || message.length < 5) return bad('Isi judul dan pesan dulu');
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return bad('Email pengirim belum aktif. Isi GMAIL_USER dan GMAIL_APP_PASSWORD di Vercel');
  let v = null;
  if (b.voucher) {
    [v] = await sql`select code,kind,value,expires from vouchers where code=${String(b.voucher).toUpperCase()} and active`;
    if (!v) return bad('Voucher tidak ditemukan atau nonaktif');
  }
  const { html, text } = broadcastHtml({ subject, message, voucher: v, site: siteOrigin(req) });
  const t = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
  const from = `Toko Akun Rehan <${process.env.GMAIL_USER}>`;
  if (b.test) {
    try { await t.sendMail({ from, to: me.email, subject: '[TES] ' + subject, html, text }); return Response.json({ ok: 1, test: true }); }
    catch { return bad('Gagal kirim email. Cek GMAIL_USER dan GMAIL_APP_PASSWORD'); }
  }
  const target = ['all', 'buyers', 'voucher'].includes(b.target) ? b.target : 'all';
  const list = await recipients(target, v?.code);
  if (!list) return bad('Voucher itu tidak dibatasi untuk pengguna tertentu. Pilih target lain');
  const uniq = [...new Set(list)];
  if (!uniq.length) return bad('Tidak ada penerima untuk target ini');
  const [d] = await sql`select coalesce(sum(sent),0)::int as n from broadcasts where created::date=current_date`;
  if (d.n + uniq.length > LIMIT) return bad(`Batas aman Gmail ${LIMIT} penerima per hari. Hari ini sudah terkirim ${d.n}, penerima sekarang ${uniq.length}. Pilih target lebih kecil atau kirim besok`);
  let sent = 0;
  try {
    for (let i = 0; i < uniq.length; i += 40) {
      const chunk = uniq.slice(i, i + 40);
      await t.sendMail({ from, to: process.env.GMAIL_USER, bcc: chunk, subject, html, text });
      sent += chunk.length;
    }
  } catch {}
  await sql`insert into broadcasts(subject,body,target,voucher,sent,admin_id) values(${subject},${message},${target},${v?.code || ''},${sent},${me.id})`;
  if (!sent) return bad('Gagal mengirim. Cek email pengirim di Vercel');
  return Response.json({ ok: 1, sent, total: uniq.length });
}
