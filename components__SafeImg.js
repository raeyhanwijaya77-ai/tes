'use client';
import { useEffect, useRef, useState } from 'react';
export default function SafeImg({ src, alt = '' }) {
  const [bad, setBad] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    setBad(false);
    const t = setTimeout(() => {
      const el = ref.current;
      if (el && el.complete && el.naturalWidth === 0) setBad(true);
    }, 2500);
    return () => clearTimeout(t);
  }, [src]);
  if (!src || bad) return <div className="ph"><i>🎮</i>Foto tidak tersedia</div>;
  return <img ref={ref} src={src} alt={alt} decoding="async" onLoad={() => setBad(false)} onError={() => setBad(true)} />;
}
