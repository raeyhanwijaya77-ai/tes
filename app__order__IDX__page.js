'use client';
import { useEffect, useState, use } from 'react';
import { QRCodeSVG } from 'qrcode.react';
const WA = process.env.NEXT_PUBLIC_WA_ADMIN || '6282319319768';
const SEC = 10;
export default function Order({ params }) {
  const { id } = use(params);
  const [o, setO] = useState(null);
  const [left, setLeft] = useState(SEC);
  const [auto, setAuto] = useState(true);
  const [cp, setCp] = useState('');
  const [secs, setSecs] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    let t;
    const load = async () => {
      try {
        const r = await fetch('/api/order/' + id);
        if (r.status === 401) return (location.href = '/login');
        const d = await r.json();
        setO(d); setSecs(d.left || 0);
        if (d.status === 'pending') t = setTimeout(load, 4000);
      } catch { t = setTimeout(load, 6000); }
    };
    load();
    return () => clearTimeout(t);
  }, [id]);
  useEffect(() => {
    if (o?.status !== 'pending') return;
    const t = setInterval(() => setSecs((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, [o?.status]);
  const wa = o?.wa || WA;
  const paid = o?.status === 'paid' && !!o?.acc;
  const adm = `https://wa.me/${wa}?text=${encodeURIComponent('Halo admin, saya butuh bantuan untuk order ' + id + '.')}`;
  const link = paid ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo admin, saya sudah bayar order ${o.id} (${o.acc.title}). Mohon bantu amankan akun saya.`)}` : '';
  useEffect(() => {
    if (!paid || !auto) return;
    if (left <= 0) { window.location.href = link; return; }
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [paid, auto, left, link]);
  async function copy(text, k) {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCp(k); setTimeout(() => setCp(''), 1500);
  }
  function savePng() {
    try {
      const svg = document.querySelector('.qrw svg');
      if (!svg) return;
      const xml = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = 460; c.height = 460;
        const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, 460, 460); g.drawImage(img, 15, 15, 430, 430);
        const a = document.createElement('a');
        a.download = 'QRIS-' + id + '.png'; a.href = c.toDataURL('image/png'); a.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
    } catch {}
  }
  async function cancel() {
    if (!confirm('Batalkan pesanan ini? QRIS tidak boleh dibayar lagi.')) return;
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/order/' + id + '/cancel', { method: 'POST' });
      const d = await r.json().catch(() => ({}));
      if (r.ok) setO((x) => ({ ...x, status: 'cancelled' }));
      else if (d.paid) location.reload();
      else setMsg(d.error || 'Gagal membatalkan');
    } catch { setMsg('Koneksi gagal, coba lagi'); }
    setBusy(false);
  }
  if (!o) return <p className="w mut">Memuat…</p>;
  if (paid) {
    return (
      <div className="box">
        <div className="check" />
        <h2 className="gold" style={{ textAlign: 'center' }}>Pembayaran Berhasil</h2>
        <p className="mut" style={{ textAlign: 'center' }}>{o.acc.title}</p>
        <div className="cred">
          <div className="cr"><span>Username</span><b>{o.acc.username}</b><button type="button" className="btn o sm" onClick={() => copy(o.acc.username, 'u')}>{cp === 'u' ? 'Tersalin' : 'Salin'}</button></div>
          <div className="cr"><span>Password</span><b>{o.acc.password}</b><button type="button" className="btn o sm" onClick={() => copy(o.acc.password, 'p')}>{cp === 'p' ? 'Tersalin' : 'Salin'}</button></div>
        </div>
        <div className="next">
          <b>Langkah terakhir: amankan akun</b>
          <p className="mut">Salin dulu username dan password di atas, lalu chat admin agar akun segera diamankan.{auto ? ` WhatsApp admin otomatis terbuka dalam ${left} detik.` : ''}</p>
          {auto && <div className="cdbar"><i style={{ width: ((SEC - left) / SEC) * 100 + '%' }} /></div>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            <a className="btn" href={link} target="_blank">Chat Admin Sekarang</a>
            {auto && <button type="button" className="btn o sm" onClick={() => setAuto(false)}>Batalkan pengalihan</button>}
          </div>
        </div>
        <p className="mut" style={{ marginTop: 12, fontSize: 13 }}>Data akun tetap tersimpan di menu Pesanan.</p>
        <a href="/testimoni" className="btn o sm" style={{ marginTop: 8 }}>Beri rating dan testimoni</a>
      </div>
    );
  }
  if (o.status === 'cancelled' || o.status === 'expired') {
    return (
      <div className="box" style={{ textAlign: 'center' }}>
        <h2>{o.status === 'cancelled' ? 'Pesanan dibatalkan' : 'Waktu pembayaran habis'}</h2>
        <p className="mut" style={{ margin: '8px 0 16px' }}>
          {o.status === 'cancelled' ? 'Stok sudah kembali tersedia untuk pembeli lain.' : 'Jangan bayar QRIS ini lagi. Pilih akun dan buat pesanan baru. Kalau kamu sudah terlanjur membayar, hubungi admin.'}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/#stok" className="btn">Kembali ke toko</a>
          {o.status === 'expired' && <a href={adm} target="_blank" className="btn o">Chat Admin</a>}
        </div>
      </div>
    );
  }
  if (o.status === 'refund') {
    return (
      <div className="box" style={{ textAlign: 'center' }}>
        <h2>Pembayaran diterima</h2>
        <p className="mut" style={{ margin: '8px 0 16px' }}>Akun ini sudah dibeli orang lain sebelum pembayaranmu masuk. Admin akan membantu pengembalian dana atau akun pengganti.</p>
        <a href={adm} target="_blank" className="btn">Chat Admin</a>
      </div>
    );
  }
  const mm = String(Math.floor(secs / 60)).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0');
  return (
    <div className="box" style={{ textAlign: 'center' }}>
      <h2>Scan QRIS</h2>
      <p className="price" style={{ margin: '8px 0 6px' }}>Rp {o.amount.toLocaleString('id-ID')}</p>
      <div className="sum" style={{ textAlign: 'left', marginBottom: 14 }}>
        <div><span>Harga akun</span><b>Rp {(o.amount - (o.fee || 0) + (o.discount || 0)).toLocaleString('id-ID')}</b></div>
        {o.discount > 0 && <div><span>Voucher {o.voucher}</span><b className="gold">-Rp {o.discount.toLocaleString('id-ID')}</b></div>}
        {o.fee > 0 && <div><span>Biaya layanan QRIS</span><b>Rp {o.fee.toLocaleString('id-ID')}</b></div>}
      </div>
      {o.qr ? <div className="qrw" style={{ background: '#fff', padding: 14, borderRadius: 14, display: 'inline-block' }}><QRCodeSVG value={o.qr} size={230} /></div> : <p className="mut" style={{ margin: '14px 0' }}>QRIS sedang dibuat, tunggu sebentar…</p>}
      <p className="mut" style={{ marginTop: 14 }}>Bayar dalam <b className="gold">{mm}:{ss}</b>. Halaman diperbarui otomatis.<br />Order: {o.id}</p>
      <p className="err">{msg}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 }}>
        {o.qr && <button type="button" className="btn o sm" onClick={savePng}>Cetak / simpan QRIS</button>}
        <button type="button" className="btn red sm" disabled={busy} onClick={cancel}>{busy ? 'Membatalkan…' : 'Batalkan pesanan'}</button>
      </div>
    </div>
  );
}
