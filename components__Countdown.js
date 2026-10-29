'use client';
import { useEffect, useState } from 'react';
const fmt = (s) => {
  s = Math.max(0, Math.floor(s));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return (d ? d + 'h ' : '') + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0');
};
export default function Countdown({ left = 0 }) {
  const [s, setS] = useState(left);
  useEffect(() => {
    setS(left);
    const t = setInterval(() => setS((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, [left]);
  return <span className="cd">{s > 0 ? fmt(s) : 'Selesai'}</span>;
}
