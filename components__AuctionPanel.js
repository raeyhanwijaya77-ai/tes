'use client';
import { useEffect, useState } from 'react';
const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const fmt = (s) => {
  s = Math.max(0, Math.floor(s));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return (d ? d + 'h ' : '') + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0');
};
export default function AuctionPanel({ id, fee = 0 }) {
  const [s, setS] = useState(null);
  const [secs, setSecs] = useState(0);
  const [amt, setAmt] = useState('');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  async function load() {
    try {
      const r = await fetch('/api/auction/' + id, { cache: 'no-store' });
      const d = await r.json();
      if (d.fixed) { location.reload(); return; }
      if (d.ok) { setS(d); setSecs(d.left); }
    } catch {}
  }
  useEffect(() => { load(); const t = setInterval(load, 4000); return () => clearInterval(t); }, [id]);
  useEffect(() => { const t = setInterval(() => setSecs((n) => Math.max(0, n - 1)), 1000); return () => clearInterval(t); }, []);
  async function bid(v) {
    setMsg(''); setOk(false);
    const n = parseInt(v);
    if (!n) return setMsg('Isi nominal bid');
    setBusy(true);
    try {
      const r = await fetch('/api/bid', { method: 'POST', body: JSON.stringify({ accountId: id, amount: n }) });
      if (r.status === 401) { location.href = '/login'; return; }
      const d = await r.json().catch(() => ({}));
      if (r.ok) { setOk(true); setMsg('Bid kamu masuk: ' + rp(n)); setAmt(''); load(); } else setMsg(d.error || 'Bid gagal');
    } catch { setMsg('Koneksi gagal'); }
    setBusy(false);
  }
  if (!s) return <p className="mut">Memuat lelang…</p>;
  const ended = s.ended || secs <= 0;
  const q = [s.min, s.min + s.step, s.min + s.step * 2];
  return (
    <div className="auc">
      <div className="aucTop">
        <div><small className="mut">{s.top ? 'Bid tertinggi' : 'Harga awal'}</small><div className="aucPrice">{rp(s.top || s.start)}</div></div>
        <div style={{ textAlign: 'right' }}><small className="mut">{ended ? 'Status' : 'Sisa waktu'}</small><div className="aucTime">{ended ? 'SELESAI' : fmt(secs)}</div></div>
      </div>
      {!ended && s.topMine && <p className="gold">Kamu sedang memimpin lelang ini.</p>}
      {!ended && (
        <>
          <p className="mut" style={{ margin: '8px 0' }}>Bid minimum {rp(s.min)} (kelipatan naik {rp(s.step)}). Bid di 2 menit terakhir memperpanjang waktu 2 menit.</p>
          <div className="chips">{q.map((v) => <button type="button" key={v} className="chip" onClick={() => setAmt(String(v))}>{rp(v)}</button>)}</div>
          <div className="vrow">
            <input type="number" inputMode="numeric" placeholder="Nominal bid (Rp)" value={amt} onChange={(e) => setAmt(e.target.value)} />
            <button type="button" className="btn" disabled={busy} onClick={() => bid(amt)}>{busy ? '…' : 'Bid'}</button>
          </div>
          <p className={ok ? 'gold' : 'err'}>{msg}</p>
          <p className="mut" style={{ fontSize: 13 }}>Pemenang otomatis mendapat QRIS sebesar bid tertinggi{fee ? ' + biaya layanan ' + rp(fee) : ''}.</p>
        </>
      )}
      {ended && (
        <div className="next" style={{ marginTop: 10 }}>
          {s.winnerMine ? (
            <>
              <b>Selamat, kamu pemenang lelang!</b>
              <p className="mut" style={{ margin: '6px 0 10px' }}>QRIS pembayaran sudah dibuat otomatis untukmu.</p>
              <a className="btn" href={'/order/' + s.orderId}>{s.orderStatus === 'paid' ? 'Lihat akun' : 'Cetak QRIS dan bayar'}</a>
            </>
          ) : s.top ? <p>Lelang selesai. Pemenang menawar {rp(s.top)}.</p> : <p>Lelang selesai tanpa penawar.</p>}
        </div>
      )}
      <div className="bidl">
        <b>Riwayat bid</b>
        {!s.bids.length && <p className="mut">Belum ada bid. Jadilah yang pertama.</p>}
        {s.bids.map((b, i) => (
          <div key={i} className={'bidr' + (i === 0 ? ' top' : '')}><span>{b.mine ? 'Kamu' : b.u}</span><b>{rp(b.a)}</b></div>
        ))}
      </div>
    </div>
  );
}
