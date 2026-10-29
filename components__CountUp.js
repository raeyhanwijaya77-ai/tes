'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
export default function CountUp({ to = 0 }) {
  const ref = useRef(null);
  const inV = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inV) return;
    let raf, t0;
    const step = (t) => {
      if (t0 === undefined) t0 = t;
      const p = Math.min(1, (t - t0) / 900);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inV, to]);
  return <span ref={ref}>{v.toLocaleString('id-ID')}</span>;
}
