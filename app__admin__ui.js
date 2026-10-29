'use client';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import SafeImg from '@/components/SafeImg';
import PwOtp from '@/components/PwOtp';

const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const NAV = [['dash', 'Dashboard', 'grid'], ['akun', 'Akun', 'list'], ['promo', 'Promo', 'tag'], ['bayar', 'Bayar', 'card'], ['user', 'Pengguna', 'user'], ['testi', 'Testi', 'star'], ['set', 'Atur', 'shield']];
const TITLE = { dash: 'Dashboard', akun: 'Akun', promo: 'Voucher dan Siaran', bayar: 'Pembayaran dan Notifikasi', user: 'Pengguna', testi: 'Testimoni', set: 'Pengaturan' };
const ICONS = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  plus: <path d="M12 5v14M5 12h14" />,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  pulse: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  crown: <path d="M3 8l4 4 5-7 5 7 4-4v10H3z" />,
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  tag: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1" /></>,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
};
const Ic = ({ n }) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICONS[n]}</svg>;

function CountUp({ to, money }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, t0;
    const step = (t) => {
      if (t0 === undefined) t0 = t;
      const p = Math.min(1, (t - t0) / 700);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{money ? rp(v) : v}</>;
}

async function shrink(file, max = 1100) {
  let src, w, h;
  try { src = await createImageBitmap(file); w = src.width; h = src.height; }
  catch {
    src = await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = URL.createObjectURL(file); });
    w = src.naturalWidth; h = src.naturalHeight;
  }
  const k = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * k); c.height = Math.round(h * k);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.8));
  if (!blob) throw new Error('gagal');
  return blob;
}
const toData = (blob) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });

function Sub({ tabs, value, onChange }) {
  return <div className="chips" style={{ marginBottom: 14 }}>{tabs.map(([k, l]) => <button key={k} type="button" className={'chip' + (value === k ? ' on' : '')} onClick={() => onChange(k)}>{l}</button>)}</div>;
}

export default function Admin({ me }) {
  const [tab, setTab] = useState('dash');
  const [editing, setEditing] = useState(null);
  const [watch, setWatch] = useState('');
  const [sa, setSa] = useState('list'), [sp, setSp] = useState('voucher'), [su, setSu] = useState('users');
  const [list, setList] = useState([]);
  const [toast, setToast] = useState('');
  const load = async () => { try { const d = await (await fetch('/api/admin/accounts')).json(); setList(Array.isArray(d) ? d : []); } catch {} };
  useEffect(() => { load(); }, []);
  const say = (m) => { setToast(m); setTimeout(() => setToast(''), 2600); };
  const openEdit = async (a) => { try { const d = await (await fetch('/api/admin/accounts?id=' + a.id)).json(); if (d && d.id) setEditing(d); } catch {} };
  const st = useMemo(() => {
    const sold = list.filter((a) => a.status === 'sold');
    return { total: list.length, ready: list.filter((a) => a.status === 'available').length, sold: sold.length, rev: sold.reduce((s, a) => s + a.price, 0) };
  }, [list]);
  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand"><span className="mark">⚙</span>Panel Admin</div>
        <div className="adm-nav">
          {NAV.map(([k, label, ic]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setEditing(null); setWatch(''); setTab(k); }}>{tab === k && <motion.span layoutId="pill" className="pillbg" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}<Ic n={ic} /><span>{label}</span></button>
          ))}
        </div>
        <div className="adm-foot">Masuk sebagai<br /><b>{me.username}</b><br />♛ Sang Penguasa<br /><a href="/profil" className="go">Foto profil dan akun</a></div>
      </aside>
      <main className="adm-main">
        <div className="adm-top">
          <div><h1>{tab === 'dash' ? <>Halo, {me.username} <span className="wave">👋</span></> : tab === 'akun' && editing ? 'Edit Akun' : TITLE[tab]}</h1><small><span className="modechip">ADMIN MODE</span></small></div>
          <div className="adm-act">
            <ThemeToggle />
            <a href="/" className="btn o sm">Lihat toko</a>
            <a href="/api/logout" className="btn red sm">Keluar</a>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab + (editing ? 'e' : '')} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === 'dash' && <Dash st={st} list={list} go={setTab} />}
            {tab === 'akun' && (editing
              ? <Form key={editing.id} me={me} init={editing} done={() => { setEditing(null); load(); }} cancel={() => setEditing(null)} say={say} />
              : <>
                  <Sub tabs={[['list', 'Daftar akun'], ['tambah', 'Tambah akun']]} value={sa} onChange={setSa} />
                  {sa === 'list' ? <Akun list={list} reload={load} say={say} onEdit={openEdit} /> : <Form me={me} done={() => { load(); setSa('list'); }} say={say} />}
                </>)}
            {tab === 'promo' && (
              <>
                <Sub tabs={[['voucher', 'Voucher'], ['siaran', 'Siaran email']]} value={sp} onChange={setSp} />
                {sp === 'voucher' ? <Voucher say={say} /> : <Siaran say={say} />}
              </>
            )}
            {tab === 'bayar' && <><Pay say={say} /><Discord say={say} /></>}
            {tab === 'user' && (
              <>
                <Sub tabs={[['users', 'Daftar pengguna'], ['act', 'Aktivitas']]} value={su} onChange={setSu} />
                {su === 'users' ? <Users say={say} onWatch={(u) => { setWatch(u.username || u.email); setSu('act'); }} /> : <Act key={watch} initQ={watch} />}
              </>
            )}
            {tab === 'testi' && <Testi say={say} />}
            {tab === 'set' && <Sett me={me} say={say} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <AnimatePresence>
        {toast && <motion.div className="toast" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{toast}</motion.div>}
      </AnimatePresence>
    </div>
  );
}

function Dash({ st, list, go }) {
  const [sx, setSx] = useState(null);
  useEffect(() => {
    const load = () => fetch('/api/admin/stats').then((r) => r.json()).then(setSx).catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);
  const days = sx?.days || [];
  const mx = Math.max(1, ...days.map((d) => d.rev));
  const cards = [['Total akun', st.total, false, 'list'], ['Tersedia', st.ready, false, 'grid'], ['Terjual', st.sold, false, 'shield'], ['Pendapatan bersih', sx?.total ?? st.rev, true, 'card']];
  const pct = st.total ? Math.round((st.sold / st.total) * 100) : 0;
  return (
    <>
      <div className="stats">
        {cards.map(([l, v, m, ic], i) => (
          <motion.div key={l} className="stat" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <span className="ico"><Ic n={ic} /></span><div><small>{l}</small><b><CountUp to={v} money={m} /></b></div>
          </motion.div>
        ))}
      </div>
      {sx?.visit && (
        <div className="c2">
          <h3><span className="live" /> Pengunjung toko</h3>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', marginBottom: 12 }}>
            {[['Online sekarang', sx.visit.online], ['User login online', sx.visit.online_user], ['Pengunjung hari ini', sx.visit.today], ['Total kunjungan', sx.visit.views], ['Pengunjung unik', sx.visit.visitors]].map(([l, v]) => (
              <div className="stat" key={l}><div><small>{l}</small><b><CountUp to={v || 0} /></b></div></div>
            ))}
          </div>
          {sx.onl?.length > 0 && <p className="mut">Sedang online: {sx.onl.map((u) => (u.username || u.email) + ' (' + u.path + ')').join(', ')}</p>}
        </div>
      )}
      {days.length > 0 && (
        <div className="c2">
          <h3>Penjualan 7 hari terakhir</h3>
          <div className="chart">
            {days.map((d, i) => (
              <div className="col" key={i} title={rp(d.rev)}>
                <div className="bw"><motion.i initial={{ height: 0 }} animate={{ height: Math.max(3, (d.rev / mx) * 100) + '%' }} transition={{ duration: 0.6, delay: i * 0.05 }} /></div>
                <small>{d.label}</small>
              </div>
            ))}
          </div>
          <small className="mut">Total {rp(days.reduce((s, d) => s + d.rev, 0))} dari {days.reduce((s, d) => s + d.n, 0)} pesanan lunas</small>
        </div>
      )}
      {sx?.recent?.length > 0 && (
        <div className="c2">
          <h3>Pesanan lunas terbaru</h3>
          <div className="tblw">
            <table className="tbl">
              <thead><tr><th>Akun</th><th>Pembeli</th><th>Nominal</th></tr></thead>
              <tbody>{sx.recent.map((o) => <tr key={o.id}><td><b>{o.title || '-'}</b></td><td>{o.username || o.email || '-'}</td><td className="gold"><b>{rp(o.amount)}</b></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function Table({ rows, onDel, onEdit, onStatus, onEnd }) {
  if (!rows.length) return <p className="mut">Belum ada akun.</p>;
  return (
    <div className="tblw">
      <table className="tbl">
        <thead><tr><th>Akun</th><th>Harga</th><th>Status</th>{(onDel || onEdit || onStatus) && <th></th>}</tr></thead>
        <tbody>
          {rows.map((a, i) => (
            <motion.tr key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.03 }}>
              <td><div className="tcell"><div className="tth"><SafeImg src={a.cover} alt="" /></div><div><b>{a.title}</b>{!a.n && <span className="pill bad" style={{ marginLeft: 6 }}>Foto kosong</span>}<small className="mut" style={{ display: 'block' }}>{a.kind === 'auction' ? 'LELANG · ' + (a.top_bid ? 'bid Rp ' + a.top_bid.toLocaleString('id-ID') : 'belum ada bid') + ' · ' + (a.auction_done ? 'selesai' : a.left > 0 ? 'sisa ' + Math.floor(a.left / 3600) + ' jam ' + Math.floor((a.left % 3600) / 60) + ' mnt' : 'berakhir') : 'STORE'}{a.admin_name ? ' · oleh ' + a.admin_name : ''}{a.wa ? ' · WA ' + a.wa : ''}</small></div></div></td>
              <td className="gold"><b>{rp(a.price)}</b></td>
              <td><span className={'pill ' + a.status}>{a.status === 'available' ? 'Tersedia' : a.status === 'sold' ? 'Terjual' : 'Ditahan'}</span></td>
              {(onDel || onEdit || onStatus) && <td><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{onEnd && a.kind === 'auction' && !a.auction_done && <button className="btn o sm" onClick={() => onEnd(a)}>Akhiri lelang</button>}{onStatus && a.kind !== 'auction' && <button className="btn o sm" onClick={() => onStatus(a, a.status === 'sold' ? 'available' : 'sold')}>{a.status === 'sold' ? 'Aktifkan lagi' : 'Tandai habis'}</button>}{onEdit && <button className="btn o sm" onClick={() => onEdit(a)}>Edit</button>}{onDel && <button className="btn red sm" onClick={() => onDel(a)}>Hapus</button>}</div></td>}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StokSet({ say }) {
  const [h, setH] = useState('15');
  useEffect(() => { fetch('/api/admin/settings').then((r) => r.json()).then((d) => { if (d.hold) setH(String(d.hold)); }).catch(() => {}); }, []);
  async function save() {
    const r = await fetch('/api/admin/settings', { method: 'POST', body: JSON.stringify({ hold: h }) });
    const d = await r.json().catch(() => ({}));
    say(r.ok ? 'Pengaturan stok tersimpan' : d.error || 'Gagal menyimpan');
  }
  return (
    <div className="c2">
      <h3>Pengaturan stok</h3>
      <p className="mut" style={{ marginBottom: 10 }}>Akun yang sedang dibayar ditahan beberapa menit. Kalau pembeli tidak jadi bayar, stok otomatis kembali tersedia. Akun yang sudah dibeli langsung hilang dari toko.</p>
      <label className="l">Lama tahan stok (menit, 5 sampai 120)</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="number" min="5" max="120" value={h} onChange={(e) => setH(e.target.value)} style={{ maxWidth: 140, margin: '6px 0' }} />
        <button className="btn" onClick={save}>Simpan</button>
      </div>
    </div>
  );
}

function Akun({ list, reload, say, onEdit }) {
  async function endNow(a) {
    if (!confirm('Akhiri lelang ini sekarang? Bid tertinggi langsung menang.')) return;
    await fetch('/api/admin/accounts', { method: 'PATCH', body: JSON.stringify({ id: a.id, action: 'end_now' }) });
    say('Lelang diakhiri'); reload();
  }
  async function setStatus(a, status) {
    await fetch('/api/admin/accounts', { method: 'PATCH', body: JSON.stringify({ id: a.id, status }) });
    say('Status stok diubah'); reload();
  }
  const [q, setQ] = useState(''), [f, setF] = useState('all');
  async function del(a) {
    if (!confirm('Hapus akun "' + a.title + '"?')) return;
    await fetch('/api/admin/accounts?id=' + a.id, { method: 'DELETE' });
    say('Akun dihapus'); reload();
  }
  const rows = list.filter((a) => (f === 'all' || a.status === f) && a.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
    <StokSet say={say} />
    <div className="c2">
      <input placeholder="Cari akun…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips">
        {[['all', 'Semua'], ['available', 'Tersedia'], ['reserved', 'Ditahan'], ['sold', 'Terjual']].map(([k, l]) => (
          <button key={k} type="button" className={'chip' + (f === k ? ' on' : '')} onClick={() => setF(k)}>{l}</button>
        ))}
      </div>
      <Table rows={rows} onDel={del} onEdit={onEdit} onStatus={setStatus} onEnd={endNow} />
    </div>
    </>
  );
}

function Form({ init, done, say, cancel, me }) {
  const edit = !!init;
  const [f, setF] = useState({ title: init?.title || '', price: init?.price || '', description: init?.description || '', specs: init?.specs || '', username: init?.username || '', password: init?.password || '', status: init?.status || 'available', wa: init?.wa || me?.phone || '', kind: init?.kind || 'fixed', mins: '1440', step: '1000', ends: '' });
  const [photos, setPhotos] = useState((init?.images || []).map((u) => ({ id: Math.random().toString(36).slice(2), preview: u, status: 'ok', url: u })));
  const [busy, setB] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function pick(e) {
    const files = [...e.target.files].slice(0, Math.max(0, 8 - photos.length));
    e.target.value = '';
    for (const file of files) {
      const id = Math.random().toString(36).slice(2);
      setPhotos((p) => [...p, { id, preview: URL.createObjectURL(file), status: 'up' }]);
      try {
        const blob = await shrink(file);
        let url = null;
        try {
          const fd = new FormData();
          fd.append('file', new File([blob], 'foto.jpg', { type: 'image/jpeg' }));
          const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
          url = (await r.json()).url || null;
        } catch {}
        if (!url) url = await toData(blob);
        setPhotos((p) => p.map((x) => (x.id === id ? { ...x, status: 'ok', url } : x)));
      } catch {
        setPhotos((p) => p.map((x) => (x.id === id ? { ...x, status: 'err' } : x)));
      }
    }
  }
  async function save(ev) {
    ev.preventDefault();
    if (!photos.length) return say('Tambahkan minimal 1 foto');
    if (photos.some((x) => x.status === 'up')) return say('Tunggu foto selesai diproses');
    if (photos.some((x) => x.status === 'err')) return say('Hapus foto yang gagal dulu');
    setB(true);
    try {
      const body = { ...f, images: photos.map((x) => x.url) };
      if (!edit && f.kind === 'auction' && f.ends) body.ends = new Date(f.ends).toISOString();
      if (edit) body.id = init.id;
      const r = await fetch('/api/admin/accounts', { method: edit ? 'PUT' : 'POST', body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { say(edit ? 'Perubahan tersimpan' : 'Akun tersimpan'); done(); } else say(d.error || 'Gagal menyimpan');
    } catch { say('Koneksi gagal'); }
    setB(false);
  }
  return (
    <form className="c2" onSubmit={save}>
      <div className="fg">
        <div className="full"><label className="l">Judul akun</label><input placeholder="Contoh: Akun Lv 100 + Limited" value={f.title} onChange={set('title')} required /></div>
        <div><label className="l">{f.kind === 'auction' ? 'Harga awal lelang (Rp)' : 'Harga (Rp)'}</label><input type="number" inputMode="numeric" placeholder="50000" value={f.price} onChange={set('price')} required /></div>
        {!edit && (
          <div className="full"><label className="l">Jenis produk</label>
            <div className="chips"><button type="button" className={'chip' + (f.kind === 'fixed' ? ' on' : '')} onClick={() => setF({ ...f, kind: 'fixed' })}>Store (harga tetap)</button><button type="button" className={'chip' + (f.kind === 'auction' ? ' on' : '')} onClick={() => setF({ ...f, kind: 'auction' })}>Lelang</button></div>
          </div>
        )}
        {!edit && f.kind === 'auction' && (
          <>
            <div><label className="l">Kelipatan bid (Rp)</label><input type="number" inputMode="numeric" value={f.step} onChange={set('step')} /></div>
            <div><label className="l">Lama lelang</label>
              <select value={f.mins} onChange={set('mins')}>{[['30', '30 menit'], ['60', '1 jam'], ['180', '3 jam'], ['360', '6 jam'], ['720', '12 jam'], ['1440', '1 hari'], ['4320', '3 hari'], ['10080', '7 hari']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </div>
            <div className="full"><label className="l">Atau tentukan waktu habis (opsional, mengalahkan lama lelang)</label><input type="datetime-local" value={f.ends} onChange={set('ends')} /></div>
          </>
        )}
        {edit ? (
          <div><label className="l">Status stok</label>
            <select value={f.status} onChange={set('status')}><option value="available">Tersedia</option><option value="reserved">Ditahan</option><option value="sold">Terjual</option></select>
          </div>
        ) : <div />}
        <div className="full"><label className="l">Spesifikasi akun (satu per baris)</label><textarea rows="4" placeholder={'Level 100\nRobux 5.000\nItem limited 3'} value={f.specs} onChange={set('specs')} /></div>
        <div className="full"><label className="l">Deskripsi (opsional)</label><textarea rows="3" value={f.description} onChange={set('description')} /></div>
        <div><label className="l">Username akun Roblox</label><input value={f.username} onChange={set('username')} required /></div>
        <div><label className="l">Password akun Roblox</label><input value={f.password} onChange={set('password')} required /></div>
      </div>
      <label className="l">Nomor WhatsApp admin untuk stok ini</label>
      <input inputMode="tel" placeholder="0812xxxxxxxx" value={f.wa} onChange={set('wa')} />
      <p className="mut" style={{ marginBottom: 12, fontSize: 13 }}>Isi dulu sebelum pilih foto. Setelah pembeli membayar, mereka langsung diarahkan ke WhatsApp ini.</p>
      <label className="l">Foto akun dan spesifikasi ({photos.length}/8)</label>
      <label className="drop">
        <b>Ketuk untuk pilih foto</b><small>Otomatis dikecilkan. Bisa pilih beberapa foto.</small>
        <input type="file" accept="image/*" multiple onChange={pick} />
      </label>
      {photos.length > 0 && (
        <div className="pv">
          {photos.map((x) => (
            <div className="pvi" key={x.id}>
              <img src={x.preview} alt="" />
              {x.status === 'up' && <div className="spin" />}
              <span className={'st ' + x.status}>{x.status === 'ok' ? 'Siap' : x.status === 'err' ? 'Gagal' : 'Proses'}</span>
              <button type="button" className="x" onClick={() => setPhotos((p) => p.filter((y) => y.id !== x.id))}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" disabled={busy}>{busy ? 'Menyimpan…' : edit ? 'Simpan Perubahan' : 'Simpan Akun'}</button>
        {edit && <button type="button" className="btn o" onClick={cancel}>Batal</button>}
      </div>
    </form>
  );
}

function Users({ say, onWatch }) {
  const [rows, setRows] = useState([]), [q, setQ] = useState(''), [res, setRes] = useState(null);
  useEffect(() => { fetch('/api/admin/users').then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : [])).catch(() => {}); }, []);
  async function reset(u) {
    if (!confirm('Buat password sementara untuk ' + (u.username || u.email) + '?')) return;
    try {
      const r = await fetch('/api/admin/users', { method: 'POST', body: JSON.stringify({ id: u.id }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) setRes({ who: u.username || u.email, pw: d.password }); else say(d.error || 'Gagal membuat password');
    } catch { say('Koneksi gagal'); }
  }
  const copy = async () => { try { await navigator.clipboard.writeText(res.pw); say('Password disalin'); } catch { say('Salin manual'); } };
  const list = rows.filter((u) => u.role !== 'admin_rehan' && ((u.username || '') + ' ' + u.email).toLowerCase().includes(q.toLowerCase()));
  const ago = (t) => { if (!t) return 'belum ada'; const m = Math.floor((Date.now() - new Date(t).getTime()) / 60000); return m < 1 ? 'baru saja' : m < 60 ? m + ' mnt lalu' : m < 1440 ? Math.floor(m / 60) + ' jam lalu' : Math.floor(m / 1440) + ' hari lalu'; };
  return (
    <>
      {res && (
        <div className="c2">
          <h3>Password sementara untuk {res.who}</h3>
          <div className="cred"><b>{res.pw}</b></div>
          <p className="mut" style={{ marginBottom: 10 }}>Kirim ke pembeli lewat WhatsApp. Setelah masuk, pembeli bisa menggantinya di menu Profil.</p>
          <div style={{ display: 'flex', gap: 8 }}><button className="btn sm" onClick={copy}>Salin</button><button className="btn o sm" onClick={() => setRes(null)}>Tutup</button></div>
        </div>
      )}
      <div className="c2">
        <input placeholder="Cari username atau Gmail…" value={q} onChange={(e) => setQ(e.target.value)} />
        {!list.length ? <p className="mut">Belum ada pembeli terdaftar.</p> : (
          <div className="tblw">
            <table className="tbl" style={{ minWidth: 700 }}>
              <thead><tr><th>Username</th><th>Gmail</th><th>Terakhir aktif</th><th>Pesanan</th><th>Belanja</th><th></th></tr></thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id}>
                    <td><b>{u.username || '-'}</b></td><td>{u.email}</td><td>{ago(u.last_seen)}</td><td>{u.orders}</td><td className="gold">{rp(u.spent)}</td>
                    <td><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><button className="btn o sm" onClick={() => onWatch(u)}>Pantau</button><button className="btn o sm" onClick={() => reset(u)}>Reset password</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

const ACT = { login: ['Login', 'info'], login_gagal: ['Login gagal', 'bad'], daftar: ['Daftar', 'available'], login_google: ['Login Google', 'info'], daftar_google: ['Daftar Google', 'available'], lihat_akun: ['Lihat akun', 'sold'], buat_pesanan: ['Buat pesanan', 'reserved'], batal_pesanan: ['Batal pesanan', 'sold'], bayar_lunas: ['Bayar lunas', 'available'], voucher_ok: ['Voucher dipakai', 'info'], voucher_gagal: ['Voucher gagal', 'bad'], testimoni: ['Testimoni', 'available'], reset_password: ['Reset password', 'reserved'], admin_reset_pw: ['Reset oleh admin', 'reserved'] };
const FILT = [['', 'Semua'], ['login', 'Login'], ['login_gagal', 'Gagal'], ['lihat_akun', 'Lihat akun'], ['buat_pesanan', 'Pesanan'], ['bayar_lunas', 'Bayar'], ['daftar', 'Daftar']];
function Act({ initQ = '' }) {
  const [rows, setRows] = useState([]), [st, setSt] = useState({}), [q, setQ] = useState(initQ), [type, setType] = useState('');
  useEffect(() => {
    let on = true;
    const load = () => fetch('/api/admin/activity?type=' + encodeURIComponent(type) + '&q=' + encodeURIComponent(q)).then((r) => r.json()).then((d) => { if (on) { setRows(d.rows || []); setSt(d.stat || {}); } }).catch(() => {});
    load();
    const t = setInterval(load, 8000);
    return () => { on = false; clearInterval(t); };
  }, [q, type]);
  const cards = [['Aktif 15 menit', st.aktif_15], ['Aktif hari ini', st.aktif_hari], ['Lihat akun', st.lihat], ['Pesanan dibuat', st.pesanan], ['Login gagal', st.gagal]];
  return (
    <>
      <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
        {cards.map(([l, v]) => <div className="stat" key={l}><div><small>{l}</small><b>{v ?? 0}</b></div></div>)}
      </div>
      <div className="c2">
        <h3><span className="live" /> Aktivitas langsung <small className="mut">(diperbarui tiap 8 detik)</small></h3>
        <input placeholder="Cari pengguna atau detail…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="chips">{FILT.map(([k, l]) => <button key={k} type="button" className={'chip' + (type === k ? ' on' : '')} onClick={() => setType(k)}>{l}</button>)}</div>
        {!rows.length ? <p className="mut">Belum ada aktivitas.</p> : (
          <div className="tblw">
            <table className="tbl" style={{ minWidth: 640 }}>
              <thead><tr><th>Waktu</th><th>Pengguna</th><th>Aksi</th><th>Detail</th><th>IP</th></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const [lb, cl] = ACT[r.type] || [r.type, 'sold'];
                  return (
                    <tr key={r.id}>
                      <td className="mut">{new Date(r.created).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</td>
                      <td><b>{r.username || 'tamu'}</b></td>
                      <td><span className={'pill ' + cl}>{lb}</span></td>
                      <td>{r.detail}</td><td className="mut">{r.ip || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Testi({ say }) {
  const [rows, setRows] = useState([]);
  const [rep, setRep] = useState({});
  const load = () => fetch('/api/admin/reviews').then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : [])).catch(() => {});
  useEffect(() => { load(); }, []);
  async function act(body, msg) {
    const r = await fetch('/api/admin/reviews', { method: 'PATCH', body: JSON.stringify(body) });
    say(r.ok ? msg : 'Gagal'); load();
  }
  async function del(id) {
    if (!confirm('Hapus testimoni ini?')) return;
    await fetch('/api/admin/reviews?id=' + id, { method: 'DELETE' });
    say('Testimoni dihapus'); load();
  }
  if (!rows.length) return <div className="c2"><p className="mut">Belum ada testimoni dari pembeli.</p></div>;
  return (
    <>
      {rows.map((r) => (
        <div className="c2" key={r.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div><b>{r.username || 'Pembeli'}</b> <span className="gold">{'★'.repeat(r.rating)}</span><br /><small className="mut">{r.title || '-'}</small></div>
            <span className={'pill ' + (r.hidden ? 'sold' : 'available')}>{r.hidden ? 'Disembunyikan' : 'Tampil'}</span>
          </div>
          <p style={{ margin: '10px 0' }}>{r.body}</p>
          {r.photo && <img src={r.photo} alt="" style={{ maxWidth: 160, borderRadius: 12, marginBottom: 10, display: 'block' }} />}
          <input placeholder="Balasan admin (opsional)" defaultValue={r.reply || ''} onChange={(e) => setRep({ ...rep, [r.id]: e.target.value })} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn sm" onClick={() => act({ id: r.id, reply: rep[r.id] !== undefined ? rep[r.id] : r.reply || '' }, 'Balasan tersimpan')}>Simpan balasan</button>
            <button className="btn o sm" onClick={() => act({ id: r.id, hidden: !r.hidden }, r.hidden ? 'Testimoni ditampilkan' : 'Testimoni disembunyikan')}>{r.hidden ? 'Tampilkan' : 'Sembunyikan'}</button>
            <button className="btn red sm" onClick={() => del(r.id)}>Hapus</button>
          </div>
        </div>
      ))}
    </>
  );
}

function Discord({ say }) {
  const [url, setUrl] = useState(''), [on, setOn] = useState(false);
  useEffect(() => { fetch('/api/admin/discord').then((r) => r.json()).then((d) => setOn(!!d.on)).catch(() => {}); }, []);
  async function call(body, okMsg) {
    try {
      const r = await fetch('/api/admin/discord', { method: 'POST', body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      say(r.ok ? okMsg : d.error || 'Gagal');
      if (r.ok && typeof body.url === 'string') { setOn(!!body.url.trim()); setUrl(''); }
    } catch { say('Koneksi gagal'); }
  }
  return (
    <div className="c2">
      <h3>Notifikasi Discord</h3>
      <p className="mut" style={{ marginBottom: 10 }}>Setiap akun terjual, server Discord menerima laporan: akun, pembeli, nominal, stok tersisa, total terjual, dan total penghasilan. Ada peringatan saat stok tinggal 3 atau kurang, dan saat ada testimoni baru.</p>
      <label className="l">Webhook URL Discord {on ? '(aktif)' : ''}</label>
      <input type="password" placeholder={on ? 'Tersimpan. Isi lagi untuk mengganti' : 'https://discord.com/api/webhooks/...'} value={url} onChange={(e) => setUrl(e.target.value)} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => (url.trim() ? call({ url }, 'Webhook tersimpan') : say('Isi link webhook dulu'))}>Simpan</button>
        <button className="btn o" onClick={() => call({ action: 'test' }, 'Tes terkirim ke Discord')}>Tes kirim</button>
        <button className="btn o" onClick={() => call({ action: 'report' }, 'Laporan terkirim ke Discord')}>Kirim laporan</button>
        {on && <button className="btn red" onClick={() => call({ url: '' }, 'Webhook dihapus')}>Hapus</button>}
      </div>
      <p className="mut" style={{ marginTop: 10 }}>Cara membuat: di Discord buka Pengaturan Channel, Integrasi, Webhook, Webhook Baru, lalu salin URL webhook.</p>
    </div>
  );
}

function Voucher({ say }) {
  const blank = { code: '', kind: 'percent', value: '', max_uses: '0', expires: '', users: '' };
  const [rows, setRows] = useState([]);
  const [f, setF] = useState(blank);
  const load = () => fetch('/api/admin/vouchers').then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const rand = () => setF({ ...f, code: 'REHAN' + Math.random().toString(36).slice(2, 6).toUpperCase() });
  async function save(ev) {
    ev.preventDefault();
    const r = await fetch('/api/admin/vouchers', { method: 'POST', body: JSON.stringify(f) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { say('Voucher dibuat'); setF(blank); load(); } else say(d.error || 'Gagal membuat voucher');
  }
  async function toggle(v) {
    await fetch('/api/admin/vouchers', { method: 'PATCH', body: JSON.stringify({ id: v.id, active: !v.active }) });
    say(v.active ? 'Voucher dinonaktifkan' : 'Voucher diaktifkan'); load();
  }
  async function del(v) {
    if (!confirm('Hapus voucher ' + v.code + '?')) return;
    await fetch('/api/admin/vouchers?id=' + v.id, { method: 'DELETE' });
    say('Voucher dihapus'); load();
  }
  return (
    <>
      <form className="c2" onSubmit={save}>
        <h3>Buat voucher</h3>
        <p className="mut" style={{ marginBottom: 10 }}>Diskon tidak otomatis. Pembeli harus memasukkan kodenya di halaman akun.</p>
        <div className="fg">
          <div><label className="l">Kode voucher</label>
            <div style={{ display: 'flex', gap: 6 }}><input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="REHAN10" required /><button type="button" className="btn o sm" style={{ margin: '6px 0 12px' }} onClick={rand}>Acak</button></div>
          </div>
          <div><label className="l">Jenis potongan</label>
            <select value={f.kind} onChange={set('kind')}><option value="percent">Persen (%)</option><option value="amount">Nominal (Rp)</option></select>
          </div>
          <div><label className="l">{f.kind === 'percent' ? 'Besar diskon (%, maks 90)' : 'Besar diskon (Rp)'}</label><input type="number" inputMode="numeric" value={f.value} onChange={set('value')} required /></div>
          <div><label className="l">Kuota pemakaian (0 = tanpa batas)</label><input type="number" inputMode="numeric" value={f.max_uses} onChange={set('max_uses')} /></div>
          <div><label className="l">Berlaku sampai (opsional)</label><input type="date" value={f.expires} onChange={set('expires')} /></div>
          <div className="full"><label className="l">Khusus pengguna (opsional, satu per baris: username atau Gmail). Kosong berarti semua pengguna yang punya kode.</label>
            <textarea rows="3" placeholder={'rehan_01\nbudi@gmail.com'} value={f.users} onChange={set('users')} /></div>
        </div>
        <button className="btn">Simpan voucher</button>
      </form>
      <div className="c2">
        <h3>Daftar voucher</h3>
        {!rows.length ? <p className="mut">Belum ada voucher.</p> : (
          <div className="tblw">
            <table className="tbl" style={{ minWidth: 640 }}>
              <thead><tr><th>Kode</th><th>Potongan</th><th>Untuk</th><th>Terpakai</th><th>Hemat total</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.id}>
                    <td><b>{v.code}</b></td>
                    <td>{v.kind === 'percent' ? v.value + '%' : rp(v.value)}</td>
                    <td>{v.users ? v.users.split(',').length + ' pengguna' : 'Semua'}</td>
                    <td>{v.used}{v.max_uses > 0 ? ' / ' + v.max_uses : ''}</td>
                    <td className="gold">{rp(v.saved)}</td>
                    <td><span className={'pill ' + (v.active ? 'available' : 'sold')}>{v.active ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><button className="btn o sm" onClick={() => toggle(v)}>{v.active ? 'Nonaktifkan' : 'Aktifkan'}</button><button className="btn red sm" onClick={() => del(v)}>Hapus</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

const TPL = [['Voucher baru', 'Ada voucher baru untukmu!', 'Halo! Kami punya voucher baru. Pakai kodenya saat checkout sebelum kehabisan.'], ['Lelang baru', 'Lelang akun baru sudah dibuka', 'Halo! Ada lelang akun baru. Pasang bid tertinggimu sebelum waktu habis.'], ['Stok baru', 'Stok akun baru sudah masuk', 'Halo! Stok akun baru sudah tersedia di Store. Cek sekarang sebelum diambil orang lain.']];
function Siaran({ say }) {
  const [info, setInfo] = useState(null), [subject, setSubject] = useState(''), [message, setMessage] = useState(''), [voucher, setVoucher] = useState(''), [target, setTarget] = useState('all'), [busy, setBusy] = useState(false);
  const load = () => fetch('/api/admin/broadcast').then((r) => r.json()).then(setInfo).catch(() => {});
  useEffect(() => { load(); }, []);
  async function send(test) {
    const cnt = target === 'all' ? info?.total : target === 'buyers' ? info?.buyers : 'pengguna voucher';
    if (!test && !confirm('Kirim siaran ini ke ' + cnt + ' penerima?')) return;
    setBusy(true);
    try {
      const r = await fetch('/api/admin/broadcast', { method: 'POST', body: JSON.stringify({ subject, message, voucher, target, test }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { say(test ? 'Email tes dikirim ke emailmu' : 'Terkirim ke ' + d.sent + ' penerima'); if (!test) load(); } else say(d.error || 'Gagal mengirim');
    } catch { say('Koneksi gagal'); }
    setBusy(false);
  }
  return (
    <>
      <div className="c2">
        <h3>Siaran email ke pengguna</h3>
        <p className="mut" style={{ marginBottom: 10 }}>Kirim kabar voucher, lelang, atau stok baru ke Gmail pengguna yang terdaftar. Hari ini terkirim {info?.today ?? 0} dari batas aman {info?.limit ?? 450} penerima.</p>
        <div className="chips">{TPL.map(([n, sj, ms]) => <button key={n} type="button" className="chip" onClick={() => { setSubject(sj); setMessage(ms); }}>{n}</button>)}</div>
        <label className="l">Judul email</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} />
        <label className="l">Pesan</label>
        <textarea rows="5" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} />
        <div className="fg">
          <div><label className="l">Sisipkan voucher (opsional)</label>
            <select value={voucher} onChange={(e) => setVoucher(e.target.value)}>
              <option value="">Tanpa voucher</option>
              {(info?.vouchers || []).map((v) => <option key={v.code} value={v.code}>{v.code} · {v.kind === 'percent' ? v.value + '%' : rp(v.value)}{v.users ? ' · khusus' : ''}</option>)}
            </select>
          </div>
          <div><label className="l">Kirim ke</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="all">Semua pengguna ({info?.total ?? 0})</option>
              <option value="buyers">Yang pernah membeli ({info?.buyers ?? 0})</option>
              <option value="voucher">Khusus pengguna voucher terpilih</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn o" disabled={busy} onClick={() => send(true)}>Kirim tes ke emailku</button>
          <button className="btn" disabled={busy || subject.trim().length < 3 || message.trim().length < 5} onClick={() => send(false)}>{busy ? 'Mengirim…' : 'Kirim siaran'}</button>
        </div>
        <p className="mut" style={{ marginTop: 10, fontSize: 13 }}>Pengguna yang mematikan notifikasi di Profil tidak akan menerima siaran.</p>
      </div>
      {info?.history?.length > 0 && (
        <div className="c2">
          <h3>Riwayat siaran</h3>
          <div className="tblw"><table className="tbl" style={{ minWidth: 420 }}>
            <thead><tr><th>Judul</th><th>Penerima</th><th>Waktu</th></tr></thead>
            <tbody>{info.history.map((h) => <tr key={h.id}><td>{h.subject}</td><td>{h.sent}</td><td className="mut">{new Date(h.created).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td></tr>)}</tbody>
          </table></div>
        </div>
      )}
    </>
  );
}

function Pay({ say }) {
  const [mid, setMid] = useState(''), [key, setKey] = useState(''), [has, setHas] = useState(false), [fee, setFee] = useState('350'), [auc, setAuc] = useState('30'), [o, setO] = useState('');
  useEffect(() => {
    setO(location.origin);
    fetch('/api/admin/settings').then((r) => r.json()).then((d) => { setMid(d.mid || ''); setHas(!!d.hasKey); if (d.fee !== undefined) setFee(String(d.fee)); if (d.auc) setAuc(String(d.auc)); }).catch(() => {});
  }, []);
  async function save() {
    const r = await fetch('/api/admin/settings', { method: 'POST', body: JSON.stringify({ mid, key, fee, auc }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { if (key) setHas(true); setKey(''); say('Pembayaran tersimpan'); } else say(d.error || 'Gagal menyimpan');
  }
  const copy = async () => { try { await navigator.clipboard.writeText(o + '/api/webhook'); say('Webhook disalin'); } catch { say('Salin manual dari kotak'); } };
  const f = parseInt(fee) || 0;
  return (
    <div className="c2">
      <h3>AriesPay (QRIS)</h3>
      <label className="l">Merchant ID</label>
      <input placeholder="AP_M..." value={mid} onChange={(e) => setMid(e.target.value)} />
      <label className="l">Secret Key</label>
      <input type="password" placeholder={has ? 'Tersimpan. Isi lagi untuk mengganti' : 'sk_live_...'} value={key} onChange={(e) => setKey(e.target.value)} />
      <label className="l">Biaya layanan per transaksi (Rp)</label>
      <input type="number" inputMode="numeric" value={fee} onChange={(e) => setFee(e.target.value)} />
      <p className="mut" style={{ marginBottom: 10 }}>Biaya ini ditambahkan ke total QRIS pembeli supaya uang akun utuh. Contoh: akun Rp 25.000 menjadi QRIS Rp {(25000 + f).toLocaleString('id-ID')}.</p>
      <label className="l">Waktu bayar pemenang lelang (menit, 10 sampai 240)</label>
      <input type="number" inputMode="numeric" value={auc} onChange={(e) => setAuc(e.target.value)} />
      <label className="l">Webhook URL (tempel di dashboard AriesPay)</label>
      <input readOnly value={o + '/api/webhook'} onFocus={(e) => e.target.select()} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" onClick={save}>Simpan</button>
        <button className="btn o" onClick={copy}>Salin webhook</button>
      </div>
      <p className="mut" style={{ marginTop: 10 }}>Catatan: AriesPay menahan saldo masuk 24 jam sebelum bisa ditarik.</p>
    </div>
  );
}

function Sistem() {
  const [s, setS] = useState(null);
  useEffect(() => { fetch('/api/admin/system').then((r) => r.json()).then(setS).catch(() => {}); }, []);
  const items = s ? [
    ['Database', s.db, 'Terhubung', 'Tidak terhubung. Cek Neon di Vercel'],
    ['JWT login', true, s.jwt ? 'JWT_SECRET aktif' : 'Aktif (kunci turunan database). Disarankan isi JWT_SECRET di Vercel', ''],
    ['OTP email', s.otp, 'Aktif', 'Belum aktif. Isi GMAIL_USER dan GMAIL_APP_PASSWORD, pendaftaran butuh ini'],
    ['Login Google', s.google, 'Aktif', 'Belum aktif. Isi GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET'],
    ['Pembayaran AriesPay', s.pay, 'Merchant ID dan Secret Key terisi', 'Belum diisi di menu Bayar'],
    ['Notifikasi Discord', s.discord, 'Aktif', 'Belum diisi di menu Bayar'],
    ['Penyimpanan foto', s.blob, 'Vercel Blob aktif', 'Tanpa Blob, foto disimpan di database (tetap jalan)'],
  ] : [];
  return (
    <div className="c2">
      <h3>Status sistem</h3>
      {!s ? <p className="mut">Memeriksa…</p> : items.map(([n, ok, yes, no]) => (
        <div className="sys" key={n}><span className={'dot ' + (ok ? 'on' : 'off')} /><div><b>{n}</b><small className="mut">{ok ? yes : no}</small></div></div>
      ))}
    </div>
  );
}

function MyPhone({ me, say }) {
  const [p, setP] = useState(me.phone || '');
  async function save() {
    const r = await fetch('/api/admin/me', { method: 'POST', body: JSON.stringify({ phone: p }) });
    const d = await r.json().catch(() => ({}));
    say(r.ok ? 'Nomor WhatsApp tersimpan' : d.error || 'Gagal menyimpan');
  }
  return (
    <div className="c2">
      <h3>Nomor WhatsApp saya</h3>
      <p className="mut" style={{ marginBottom: 10 }}>Dipakai otomatis untuk stok yang kamu upload. Pembeli diarahkan ke nomor ini setelah membayar.</p>
      <input inputMode="tel" placeholder="0812xxxxxxxx" value={p} onChange={(e) => setP(e.target.value)} />
      <button className="btn" onClick={save}>Simpan nomor</button>
    </div>
  );
}

function Sett({ me, say }) {
  return (
    <>
      {me.owner && <Sistem />}
      <MyPhone me={me} say={say} />
      <div className="c2">
        <h3>Akun admin</h3>
        <p><span className="mut">Username:</span> <b>{me.username}</b></p>
        <p><span className="mut">Gmail:</span> <b>{me.email}</b></p>
        <p><span className="mut">Peran:</span> <b>{me.owner ? '♛ Sang Penguasa (owner)' : 'Admin'}</b></p>
        <p className="mut" style={{ marginTop: 8 }}>Ganti foto profil dan username di <a href="/profil" className="go">halaman Profil</a>.</p>
      </div>
      <div className="c2">
        <h3>Ganti sandi</h3>
        <PwOtp />
      </div>
    </>
  );
}
