'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
const W = ['Premium', 'Siap Pakai', 'Terpercaya', 'Otomatis'];
export default function Rotator() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((n) => (n + 1) % W.length), 2200); return () => clearInterval(t); }, []);
  return (
    <span className="rot">
      <AnimatePresence mode="wait">
        <motion.span key={i} style={{ display: 'block' }} initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -22, opacity: 0 }} transition={{ duration: 0.3 }}>{W[i]}</motion.span>
      </AnimatePresence>
    </span>
  );
}
