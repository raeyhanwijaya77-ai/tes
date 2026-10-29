'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { shrink, toData } from '@/components/shrink';
export default function ReviewForm({ orders = [] }) {
  const router = useRouter();
  const [oid, setOid] = useState(orders[0]?.id || '');
  const [star, setStar] = useState(5), [hov, setHov] = useState(0);
  const [body, setBody] = useState(''), [photo, setPhoto] = useState(null), [st, setSt] = useState('');
  const [busy, setB] = useState(false), [m, setM] = useState(''), [ok, setOk] = useState(false);
  async function pick(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setSt('up'); setPhoto({ preview: URL.createObjectURL(file) });
    try {
      const blob = await shrink(file, 900);
      let url = null;
      try {
        const fd = new FormData();
        fd.append('file', new File([blob], 'foto.jpg', { type: 'image/jpeg' }));
        const r = await fetch('/api/review/upload', { method: 'POST', body: fd });
        url = (await r.json()).url || null;
      } catch {}
      if (!url) url = await toData(blob);
      setPhoto((p) => ({ ...p, url })); setSt('ok');
    } catch { setSt('err'); }
  }
  async function send(ev) {
    ev.preventDefault(); setM(''); setOk(false);
    if (st === 'up') return setM('Tunggu foto selesai diproses');
    if (st === 'err') return setM('Foto gagal, hapus lalu pilih foto lain');
    setB(true);
    try {
      const r = await fetch('/api/review', { method: 'POST', body: JSON.stringify({ orderId: oid, rating: star, body, photo: photo?.url || '' }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { setOk(true); setM('Terima kasih, testimoni kamu sudah tampil!'); setBody(''); setPhoto(null); setSt(''); router.refresh(); }
      else setM(d.error || 'Gagal mengirim testimoni');
    } catch { setM('Koneksi gagal, coba lagi'); }
    setB(false);
  }
  const shown = hov || star;
  return (
    <form className="rvform" onSubmit={send}>
      <h3>Tulis testimoni</h3>
      {orders.length > 1 && (
        <select value={oid} onChange={(e) => setOid(e.target.value)}>
          {orders.map((o) => <option key={o.id} value={o.id}>{o.title || o.id}</option>)}
        </select>
      )}
      {orders.length === 1 && <p className="mut">Untuk pembelian: <b>{orders[0].title || orders[0].id}</b></p>}
      <div className="starpick" onMouseLeave={() => setHov(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button type="button" key={n} className={n <= shown ? 'on' : ''} whileTap={{ scale: 0.8 }} whileHover={{ scale: 1.2 }} onMouseEnter={() => setHov(n)} onClick={() => setStar(n)} aria-label={n + ' bintang'}>★</motion.button>
        ))}
      </div>
      <textarea rows="4" maxLength={500} placeholder="Ceritakan pengalaman belanjamu…" value={body} onChange={(e) => setBody(e.target.value)} required />
      <label className="drop" style={{ padding: 14 }}>
        <b>{photo ? 'Ganti foto' : 'Tambah foto (opsional)'}</b>
        <input type="file" accept="image/*" onChange={pick} />
      </label>
      {photo && (
        <div className="pv" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))' }}>
          <div className="pvi">
            <img src={photo.preview} alt="" />
            {st === 'up' && <div className="spin" />}
            <span className={'st ' + st}>{st === 'ok' ? 'Siap' : st === 'err' ? 'Gagal' : 'Proses'}</span>
            <button type="button" className="x" onClick={() => { setPhoto(null); setSt(''); }}>×</button>
          </div>
        </div>
      )}
      <p className={ok ? 'gold' : 'err'}>{m}</p>
      <button className="btn" disabled={busy || !oid}>{busy ? 'Mengirim…' : 'Kirim testimoni'}</button>
    </form>
  );
}
