'use client';
import { useEffect, useState } from 'react';
const Z = { online: 0, on_member: 0, visit: 0, visit_member: 0, sold: 0, stock: 0 };
let cache = null;
let timer = null;
const subs = new Set();
async function pull() {
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
  try {
    const r = await fetch('/api/live', { cache: 'no-store' });
    const d = await r.json();
    cache = d;
    subs.forEach((f) => f(d));
  } catch {}
}
function useLive() {
  const [d, setD] = useState(cache || Z);
  useEffect(() => {
    subs.add(setD);
    if (cache) setD(cache);
    if (!timer) { pull(); timer = setInterval(pull, 10000); }
    return () => { subs.delete(setD); if (!subs.size && timer) { clearInterval(timer); timer = null; } };
  }, []);
  return d;
}
const n = (v) => Number(v || 0).toLocaleString('id-ID');
export function LiveStrip() {
  const d = useLive();
  return (
    <div className="strip">
      <span><i className="live" />On Member <b>{n(d.on_member)}</b></span>
      <span>Online <b>{n(d.online)}</b></span>
      <span>Pengunjung <b>{n(d.visit)}</b></span>
      <span>Stok <b>{n(d.stock)}</b></span>
      <span>Terjual <b>{n(d.sold)}</b></span>
    </div>
  );
}
export function LivePanel() {
  const d = useLive();
  const items = [['Visit Member', d.visit_member, 'total member yang pernah berkunjung'], ['On Member', d.on_member, 'member online sekarang'], ['Akun Terjual', d.sold, 'total pesanan lunas'], ['Total Stok Akun Sekarang', d.stock, 'stok dan lelang tersedia'], ['Pengunjung', d.visit, 'total sejak toko dibuka'], ['User Aktif', d.online, 'online sekarang (semua)']];
  return (
    <div className="lv">
      {items.map(([t, v, s]) => (
        <div className="lvi" key={t}><small><i className="live" />{t}</small><b>{n(v)}</b><em>{s}</em></div>
      ))}
    </div>
  );
}
