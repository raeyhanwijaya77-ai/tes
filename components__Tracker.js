'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
export default function Tracker() {
  const path = usePathname();
  useEffect(() => {
    if (!path || path.startsWith('/admin')) return;
    let vid = '';
    try {
      vid = localStorage.getItem('vid') || '';
      if (!vid) { vid = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('vid', vid); }
    } catch { return; }
    const send = (hb) => fetch('/api/track', { method: 'POST', body: JSON.stringify({ vid, path, hb }), keepalive: true }).catch(() => {});
    send(false);
    const t = setInterval(() => { if (document.visibilityState === 'visible') send(true); }, 30000);
    return () => clearInterval(t);
  }, [path]);
  return null;
}
