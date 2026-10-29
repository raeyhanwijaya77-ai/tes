import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql, init } from '@/lib/db';
import { setSession, hashPw, isAdmin } from '@/lib/auth';
import { googleOn, siteOrigin } from '@/lib/google';
import { logAct } from '@/lib/activity';
export async function GET(req) {
  const o = siteOrigin(req);
  const go = (p) => NextResponse.redirect(o + p);
  try {
    if (!googleOn()) return go('/login?e=google_off');
    const u = new URL(req.url);
    const code = u.searchParams.get('code');
    const state = u.searchParams.get('state');
    const jar = await cookies();
    const saved = jar.get('gstate')?.value;
    jar.delete('gstate');
    if (u.searchParams.get('error')) return go('/login?e=google_cancel');
    if (!code || !state || state !== saved) return go('/login?e=google_state');
    const tr = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: `${o}/api/auth/google/callback`, grant_type: 'authorization_code' }),
    });
    const tk = await tr.json();
    if (!tk.access_token) return go('/login?e=google_token');
    const g = await (await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: 'Bearer ' + tk.access_token } })).json();
    const email = String(g.email || '').toLowerCase().trim();
    if (!email || g.email_verified === false) return go('/login?e=google_email');
    await init();
    let [row] = await sql`select * from users where email=${email}`;
    const fresh = !row;
    if (!row) {
      let base = email.split('@')[0].replace(/[^a-z0-9_.]/g, '_').slice(0, 14);
      if (base.length < 3) base = 'user_' + base;
      if (base.startsWith('admin')) base = 'user_' + base.slice(0, 9);
      for (let i = 0; i < 6 && !row; i++) {
        const un = i === 0 ? base : (base + '_' + crypto.randomInt(100, 9999)).slice(0, 20);
        const r = await sql`insert into users(email,pass,username,role) values(${email},${hashPw(crypto.randomBytes(24).toString('hex'))},${un},'user') on conflict do nothing returning id,email,username,role`;
        row = r[0];
      }
      if (!row) [row] = await sql`select * from users where email=${email}`;
    }
    if (!row) return go('/login?e=google_fail');
    await setSession(row);
    await logAct(fresh ? 'daftar_google' : 'login_google', { user: row, req });
    return go(isAdmin(row) ? '/admin' : '/');
  } catch {
    return go('/login?e=google_fail');
  }
}
