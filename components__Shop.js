'use client';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
const SORT = [['new', 'Terbaru'], ['low', 'Termurah'], ['high', 'Termahal']];
export default function Shop({ items = [], wa = '' }) {
  const [q, setQ] = useState('');
  const [s, setS] = useState('new');
  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const a = items.filter((x) => words.every((w) => (x.hay || x.title.toLowerCase()).includes(w)));
    if (s === 'low') a.sort((x, y) => x.price - y.price);
    if (s === 'high') a.sort((x, y) => y.price - x.price);
    return a;
  }, [items, q, s]);
  if (!items.length) {
    return (
      <div className="empty">
        <h3>Stok sedang kosong</h3>
        <p>Hubungi admin untuk request akun yang kamu cari.</p>
        <a href={`https://wa.me/${wa}`} target="_blank" className="btn">Chat Admin</a>
      </div>
    );
  }
  return (
    <>
      <div className="shopbar">
        <form className="sform" onSubmit={(e) => { e.preventDefault(); document.activeElement?.blur?.(); }}>
          <input placeholder="Cari judul, deskripsi, atau spesifikasi (contoh: gg)" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && <button type="button" className="sx" onClick={() => setQ('')} aria-label="Hapus">×</button>}
          <button className="btn sm">Cari</button>
        </form>
        <div className="chips" style={{ margin: 0 }}>
          {SORT.map(([k, l]) => <button type="button" key={k} className={'chip' + (s === k ? ' on' : '')} onClick={() => setS(k)}>{l}</button>)}
        </div>
      </div>
      {!list.length ? (
        <div className="empty"><h3>Akun tidak ditemukan</h3><p>Coba kata kunci lain.</p></div>
      ) : (
        <div className="grid">
          <AnimatePresence mode="popLayout">
            {list.map((a, i) => (
              <motion.div layout key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04 }} whileHover={{ y: -6 }}>
                <ProductCard a={{ ...a, kind: 'fixed' }} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
