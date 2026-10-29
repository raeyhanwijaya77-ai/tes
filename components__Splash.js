'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Robot from '@/components/Robot';
const LINES = ['INISIALISASI SISTEM', 'MEMUAT STOK AKUN', 'MENGHUBUNGKAN QRIS', 'SIAP DIGUNAKAN'];
export default function Splash() {
  const [show, setShow] = useState(true);
  const [n, setN] = useState(0);
  const [p, setP] = useState(0);
  useEffect(() => {
    let seen = false;
    try { seen = !!sessionStorage.getItem('sp'); sessionStorage.setItem('sp', '1'); } catch {}
    if (seen) { setShow(false); return; }
    const a = setInterval(() => setN((x) => Math.min(LINES.length, x + 1)), 430);
    const b = setInterval(() => setP((x) => Math.min(100, x + 5)), 90);
    const t = setTimeout(() => setShow(false), 2000);
    return () => { clearInterval(a); clearInterval(b); clearTimeout(t); };
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div key="splash" className="splash" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          <div className="sc">
            <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }} transition={{ scale: { type: 'spring', stiffness: 200, damping: 14 }, y: { duration: 2.4, repeat: Infinity } }}>
              <Robot size={110} />
            </motion.div>
            <h1 className="glitch" data-text="TOKO AKUN REHAN">TOKO AKUN REHAN</h1>
            <div className="boot">
              {LINES.slice(0, n).map((l) => <div key={l}>&gt; {l} <i>OK</i></div>)}
            </div>
            <div className="sbar"><i style={{ width: p + '%' }} /></div>
            <small className="pct">{p}%</small>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
