'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
export default function Faq({ items = [] }) {
  const [o, setO] = useState(0);
  return (
    <div className="faq">
      {items.map(([q, a], i) => (
        <div key={i} className={'fq' + (o === i ? ' on' : '')}>
          <button type="button" onClick={() => setO(o === i ? -1 : i)}><span>{q}</span><i>{o === i ? '−' : '+'}</i></button>
          <AnimatePresence initial={false}>
            {o === i && (
              <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                <p>{a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
