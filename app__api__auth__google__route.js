import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { googleOn, siteOrigin } from '@/lib/google';
export async function GET(req) {
  const o = siteOrigin(req);
  if (!googleOn()) return NextResponse.redirect(o + '/login?e=google_off');
  const state = crypto.randomBytes(16).toString('hex');
  const q = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${o}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  const res = NextResponse.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + q.toString());
  res.cookies.set('gstate', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 600 });
  return res;
}
