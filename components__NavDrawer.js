'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import Robot from '@/components/Robot';
import Avatar from '@/components/Avatar';
export default function NavDrawer({ user = null, pay = null, stok = '' }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  const close = () => setOpen(false);
  const In = ({ href, ico, label }) => <Link href={href} className="dl" onClick={close}><span>{ico}</span>{label}</Link>;
  return (
    <>
      <nav>
        <div className="navl">
          <button type="button" className="burger" aria-label="Buka menu" onClick={() => setOpen(true)}><i /><i /><i /></button>
          <Link href="/" className="brand"><span className="mark"><Robot size={30} /></span><span className="bn">Toko Akun Rehan</span></Link>
        </div>
        <span className="navr">
          {pay && <Link href={'/order/' + pay} className="btn sm paybtn">💳 <b>Bayar lelang</b></Link>}
          {user && <Link href="/riwayat" className="nlink" title="Riwayat pesanan"><span>🧾</span><b>Pesanan</b></Link>}
          {user?.staff && <Link href="/admin" className="nlink adminl" title="Panel admin"><span>🛠</span><b>Admin</b></Link>}
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/profil" aria-label="Profil" title="Profil"><Avatar src={user.avatar} name={user.name} size={36} /></Link>
              <a href="/api/logout" className="nlink" title="Keluar"><span>⏻</span><b>Keluar</b></a>
            </>
          ) : <Link href="/login" className="btn sm">Masuk</Link>}
        </span>
      </nav>
      <AnimatePresence>
        {open && (
          <>
            <motion.div key="ov" className="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
            <motion.aside key="dr" className="drawer" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }}>
              <div className="dh">
                <Avatar src={user?.avatar} name={user ? user.name : '?'} size={44} />
                <div><b>{user ? user.name : 'Tamu'}</b><small className="mut">{user ? (user.owner ? '♛ Sang Penguasa' : user.staff ? 'Admin' : 'Pembeli') : 'Belum masuk'}</small></div>
                <button type="button" className="dx" onClick={close} aria-label="Tutup">×</button>
              </div>
              <div className="dt">Menu</div>
              <In href="/" ico="🏠" label="Home" />
              <In href="/lelang" ico="🔨" label="Lelang" />
              <In href="/store" ico="🛒" label="Store" />
              <In href="/testimoni" ico="⭐" label="Testimoni" />
              <In href="/peringkat" ico="🏆" label="Top rekor pembelian" />
              <a href={stok} target="_blank" className="dl" onClick={close}><span>📢</span>Saluran Stok</a>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
