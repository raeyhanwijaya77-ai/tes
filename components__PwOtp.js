'use client';
import { useState } from 'react';
export default function PwOtp() {
  const [old, setOld] = useState(''), [pw, setPw] = useState(''), [cf, setCf] = useState('');
  const [m, setM] = useState(''), [ok, setOk] = useState(false), [busy, setB] = useState(false);
  async function save(ev) {
    ev.preventDefault(); setM(''); setOk(false);
    if (pw.length < 6) return setM('Sandi baru minimal 6 karakter');
    if (pw !== cf) return setM('Konfirmasi sandi baru tidak sama');
    setB(true);
    try {
      const r = await fetch('/api/profile/password', { method: 'POST', body: JSON.stringify({ old, password: pw }) });
      const d = await r.json().catch(() => ({}));
      setOk(r.ok); setM(r.ok ? 'Sandi berhasil diganti' : d.error || 'Gagal mengganti sandi');
      if (r.ok) { setOld(''); setPw(''); setCf(''); }
    } catch { setM('Koneksi gagal, coba lagi'); }
    setB(false);
  }
  return (
    <form onSubmit={save}>
      <label className="l">Sandi lama</label>
      <input type="password" placeholder="Sandi lama" value={old} onChange={(e) => setOld(e.target.value)} required />
      <label className="l">Sandi baru</label>
      <input type="password" placeholder="Minimal 6 karakter" value={pw} onChange={(e) => setPw(e.target.value)} required />
      <label className="l">Konfirmasi sandi baru</label>
      <input type="password" placeholder="Ulangi sandi baru" value={cf} onChange={(e) => setCf(e.target.value)} required />
      <p className={ok ? 'gold' : 'err'}>{m}</p>
      <button className="btn" disabled={busy} style={{ marginTop: 8 }}>{busy ? 'Menyimpan…' : 'Ganti sandi'}</button>
    </form>
  );
}
