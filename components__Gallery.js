'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SafeImg from '@/components/SafeImg';
export default function Gallery({ images = [], alt = '' }) {
  const list = images.length ? images : [''];
  const [i, setI] = useState(0);
  const go = (d) => setI((x) => (x + d + list.length) % list.length);
  return (
    <div className="gal1">
      <div className="frame big">
        <AnimatePresence mode="wait">
          <motion.div key={i} className="gslide" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}
            drag={list.length > 1 ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.4}
            onDragEnd={(_, info) => { if (info.offset.x < -50) go(1); else if (info.offset.x > 50) go(-1); }}>
            <SafeImg src={list[i]} alt={alt} />
          </motion.div>
        </AnimatePresence>
        {list.length > 1 && (
          <>
            <button type="button" className="gnav l" onClick={() => go(-1)} aria-label="Foto sebelumnya">‹</button>
            <button type="button" className="gnav r" onClick={() => go(1)} aria-label="Foto berikutnya">›</button>
            <span className="gcount">{i + 1}/{list.length}</span>
          </>
        )}
      </div>
      {list.length > 1 && <div className="dots">{list.map((_, k) => <button type="button" key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={'Foto ' + (k + 1)} />)}</div>}
    </div>
  );
}
