'use client';
import { useState } from 'react';
const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
export default function Buy({ id, price = 0, fee = 0 }) {
  const [l, setL] = useState(false), [e, setE] = useState('');
  const [code, setCode] = useState(''), [v, setV] = useState(null), [vm, setVm] = useState(''), [vb, setVb] = useState(false);
  async function pakai() {
    setVm(''); setV(null);
    const c = code.trim();
    if (!c) return setVm('Masukkan kode voucher');
    setVb(true);
    try {
      const r = await fetch('/api/voucher', { method: 'POST', body: JSON.stringify({ code: c, accountId: id }) });
      if (r.status === 401) { location.href = '/login'; return; }
      const d = await r.json().catch(() => ({}));
      if (r.ok) setV(d); else setVm(d.error || 'Voucher tidak valid');
    } catch { setVm('Koneksi gagal'); }
    setVb(false);
  }
  async function go() {
    setL(true); setE('');
    try {
      const r = await fetch('/api/order', { method: 'POST', body: JSON.stringify({ accountId: id, voucher: v ? v.code : '' }) });
      if (r.status === 401) return (location.href = '/login');
      const d = await r.json().catch(() => ({}));
      if (d.id) location.href = '/order/' + d.id; else { setE(d.error || 'Gagal membuat pesanan'); setL(false); }
    } catch { setE('Koneksi gagal, coba lagi'); setL(false); }
  }
  const base = v ? v.final : price;
  return (
    <>
      <div className="vrow">
        <input placeholder="Punya kode voucher?" value={code} onChange={(x) => { setCode(x.target.value.toUpperCase()); setV(null); }} autoCapitalize="characters" />
        <button type="button" className="btn o sm" onClick={pakai} disabled={vb}>{vb ? '…' : 'Pakai'}</button>
      </div>
      {vm && <p className="err">{vm}</p>}
      {v && <p className="gold" style={{ marginBottom: 8 }}>Voucher {v.code} aktif, hemat {rp(v.discount)} ({v.label})</p>}
      <div className="sum">
        <div><span>Harga akun</span><b>{rp(price)}</b></div>
        {v && <div><span>Voucher</span><b className="gold">-{rp(v.discount)}</b></div>}
        {fee > 0 && <div><span>Biaya layanan QRIS</span><b>{rp(fee)}</b></div>}
        <div className="tot"><span>Total bayar</span><b>{rp(base + fee)}</b></div>
      </div>
      <button className="btn" style={{ width: '100%' }} disabled={l} onClick={go}>{l ? 'Memproses…' : 'Beli Sekarang'}</button>
      <p className="err">{e}</p>
    </>
  );
}
