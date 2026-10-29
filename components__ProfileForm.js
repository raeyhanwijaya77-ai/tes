'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/Avatar';
function cropSquare(file, size = 160) {
  return new Promise(async (resolve, reject) => {
    try {
      let src, w, h;
      try { src = await createImageBitmap(file); w = src.width; h = src.height; }
      catch {
        src = await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = URL.createObjectURL(file); });
        w = src.naturalWidth; h = src.naturalHeight;
      }
      const m = Math.min(w, h);
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      c.getContext('2d').drawImage(src, (w - m) / 2, (h - m) / 2, m, m, 0, 0, size, size);
      resolve(c.toDataURL('image/jpeg', 0.8));
    } catch (e) { reject(e); }
  });
}
export default function ProfileForm({ username = '', avatar = '', notify = true }) {
  const router = useRouter();
  const [un, setUn] = useState(username);
  const [av, setAv] = useState(avatar);
  const [nt, setNt] = useState(!!notify);
  const [m, setM] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  async function post(body) {
    setBusy(true); setM('');
    try {
      const r = await fetch('/api/profile', { method: 'POST', body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      setOk(r.ok); setM(r.ok ? 'Tersimpan' : d.error || 'Gagal menyimpan');
      if (r.ok) router.refresh();
      setBusy(false);
      return r.ok;
    } catch { setOk(false); setM('Koneksi gagal'); setBusy(false); return false; }
  }
  async function pick(e) {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const data = await cropSquare(f);
      if (await post({ avatar: data })) setAv(data);
    } catch { setOk(false); setM('Foto tidak bisa diproses, coba foto lain'); }
  }
  return (
    <div>
      <div className="pfav">
        <Avatar src={av} name={un} size={96} />
        <div>
          <label className="btn o sm" style={{ cursor: 'pointer' }}>Ganti foto<input type="file" accept="image/*" style={{ display: 'none' }} onChange={pick} /></label>
          {av && <button type="button" className="btn red sm" style={{ marginLeft: 8 }} disabled={busy} onClick={async () => { if (await post({ avatar: '' })) setAv(''); }}>Hapus</button>}
        </div>
      </div>
      <label className="l">Username</label>
      <input value={un} onChange={(e) => setUn(e.target.value)} autoCapitalize="none" />
      <button type="button" className="btn" disabled={busy || un.trim() === username} onClick={() => post({ username: un })}>Simpan username</button>
      <label className="chk"><input type="checkbox" checked={nt} onChange={async (e) => { const v = e.target.checked; setNt(v); await post({ notify: v }); }} /> Terima info voucher dan promo lewat email</label>
      <p className={ok ? 'gold' : 'err'} style={{ marginTop: 8 }}>{m}</p>
    </div>
  );
}
