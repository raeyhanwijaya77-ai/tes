import './globals.css';
import { getUser, ADMIN } from '@/lib/auth';
import { sql } from '@/lib/db';
import { settleAuctions } from '@/lib/auction';
import Splash from '@/components/Splash';
import NavDrawer from '@/components/NavDrawer';
import Progress from '@/components/Progress';
import Tracker from '@/components/Tracker';
import { LiveStrip } from '@/components/LiveStats';
export const metadata = { title: 'Toko Akun Rehan — Akun Roblox Premium', description: 'Jual akun Roblox, bayar QRIS, lelang akun, akun langsung dikirim otomatis.' };
const WA = process.env.NEXT_PUBLIC_WA_ADMIN || '6282319319768';
const STOK = 'https://whatsapp.com/channel/0029VbCOpsZ2UPB9asft7t05';
const TESTI = 'https://whatsapp.com/channel/0029Vb8X3IUDp2Q8pNBKI40L';
const boot = "try{var d=document.documentElement,t=localStorage.getItem('theme');if(t)d.dataset.theme=t;if(sessionStorage.getItem('sp'))d.classList.add('seen')}catch(e){}";
export default async function RootLayout({ children }) {
  const u = await getUser();
  let user = null, pay = null;
  try {
    await settleAuctions();
    if (u) {
      const [me] = await sql`select username,email,role,avatar from users where id=${u.id}`;
      if (me) {
        const owner = me.role === 'admin_rehan' || me.email === ADMIN;
        user = { name: me.username || String(me.email || '').split('@')[0], avatar: me.avatar || '', owner, staff: owner };
        const [p] = await sql`select id from orders where user_id=${u.id} and kind='auction' and status='pending' order by created desc limit 1`;
        pay = p?.id || null;
      }
    }
  } catch {}
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Exo+2:wght@400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <div className="bgfx" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <Splash />
        <Progress />
        <Tracker />
        <NavDrawer user={user} pay={pay} stok={STOK} />
        <LiveStrip />
        {children}
        <a className="wa" href={`https://wa.me/${WA}`} target="_blank">Chat Admin</a>
      </body>
    </html>
  );
}
