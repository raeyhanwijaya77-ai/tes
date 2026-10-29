'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
const WA = process.env.NEXT_PUBLIC_WA_ADMIN || '6282319319768';
const MSG = { google_off: 'Login Google belum diaktifkan.', google_cancel: 'Login Google dibatalkan.', google_state: 'Sesi login Google kedaluwarsa, coba lagi.' };
import Robot from '@/components/Robot';
import OtpBox from '@/components/OtpBox';
export default function Login() {
  const [m, setM] = useState('login');
  const [f, setF] = useState({ login: '', username: '', email: '', password: '', otp: '', confirm: '' });
  const [gg, setGg] = useState(false), [on, setOn] = useState(false), [show, setShow] = useState(false), [e, setE] = useState(''), [info, setI] = useState(''), [busy, setB] = useState(false), [cd, setCd] = useState(0), [sentOnce, setSentOnce] = useState(false), [sk, setSk] = useState(0);
  useEffect(() => {
    fetch('/api/auth').then((r) => r.json()).then((d) => { setOn(!!d.otp); setGg(!!d.google); }).catch(() => {});
    const c = new URLSearchParams(window.location.search).get('e');
    if (c) setE(MSG[c] || 'Login Google gagal, coba lagi.');
  }, []);
  const set = (k) => (x) => setF({ ...f, [k]: x.target.value });
  const call = (mode) => fetch('/api/auth', { method: 'POST', body: JSON.stringify({ ...f, mode }) })
    .then(async (r) => { let j = {}; try { j = await r.json(); } catch {} return { ...j, ok: r.ok, error: j.error || (r.ok ? '' : 'Server error ' + r.status) }; })
    .catch(() => ({ ok: false, error: 'Koneksi gagal, coba lagi' }));
  const fail = (msg) => { setE(msg); setSk((n) => n + 1); };
  const go = (to) => { setM(to); setE(''); setI(''); };
  useEffect(() => {
    if (cd <= 0) return;
    const t = setTimeout(() => setCd((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [cd]);
  async function kirim() {
    setE(''); setI('');
    const d = await call(m === 'forgot' ? 'forgot_send' : 'send');
    if (d.ok) { setI('Kode dikirim ke Gmail kamu. Cek juga folder Spam.'); setCd(60); setSentOnce(true); } else fail(d.error);
  }
  async function sub(ev) {
    ev.preventDefault(); setE(''); setI('');
    if (m === 'forgot' && f.password !== f.confirm) return fail('Konfirmasi password baru tidak sama');
    setB(true);
    const d = await call(m === 'forgot' ? 'forgot_reset' : m);
    setB(false);
    if (!d.ok) return fail(d.error);
    if (m === 'forgot') { setF({ ...f, password: '', otp: '' }); setM('login'); setI('Password berhasil diganti. Silakan masuk.'); return; }
    location.href = d.admin ? '/admin' : '/';
  }
  const pwField = (label) => (
    <>
      <label className="l">{label}</label>
      <div className="pw">
        <input type={show ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={f.password} onChange={set('password')} required />
        <button type="button" onClick={() => setShow(!show)}>{show ? 'Sembunyi' : 'Lihat'}</button>
      </div>
    </>
  );
  return (
    <motion.form className="box" onSubmit={sub} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="brand"><span className="mark"><Robot size={34} /></span>Toko Akun Rehan</div>
      <div className="tabs">
        <button type="button" className={m === 'login' ? 'on' : ''} onClick={() => go('login')}>Masuk</button>
        <button type="button" className={m === 'register' ? 'on' : ''} onClick={() => go('register')}>Daftar</button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={m} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
          {m === 'login' && (
            <>
              <label className="l">Username atau Gmail</label>
              <input placeholder="username atau nama@gmail.com" value={f.login} onChange={set('login')} autoCapitalize="none" required />
              {pwField('Password')}
              <p className="mut" style={{ cursor: 'pointer', fontSize: 14 }} onClick={() => go('forgot')}>Lupa password?</p>
            </>
          )}
          {m === 'register' && (
            <>
              <label className="l">Username</label>
              <input placeholder="contoh: rehan_01" value={f.username} onChange={set('username')} autoCapitalize="none" required />
              <label className="l">Gmail</label>
              <input type="email" placeholder="nama@gmail.com" value={f.email} onChange={set('email')} required />
              {true && (
                <>
                  <OtpBox value={f.otp} onChange={(v) => setF({ ...f, otp: v })} onResend={kirim} cd={cd} sent={sentOnce} />
                </>
              )}
              {pwField('Password')}
            </>
          )}
          {m === 'forgot' && (
            <>
              <h3 style={{ margin: '4px 0 6px' }}>Lupa password</h3>
              {on ? (
                <>
                  <label className="l">Username atau Gmail</label>
                  <input placeholder="username atau nama@gmail.com" value={f.login} onChange={set('login')} autoCapitalize="none" required />
                  <OtpBox value={f.otp} onChange={(v) => setF({ ...f, otp: v })} onResend={kirim} cd={cd} sent={sentOnce} />
                  {pwField('Password baru')}
                  <label className="l">Ulangi password baru</label>
                  <input type="password" placeholder="Ulangi password baru" value={f.confirm} onChange={set('confirm')} required />
                </>
              ) : (
                <>
                  <p className="mut" style={{ margin: '4px 0 10px' }}>Isi username atau Gmail kamu, lalu minta admin membuatkan password sementara lewat WhatsApp.</p>
                  <input placeholder="username atau nama@gmail.com" value={f.login} onChange={set('login')} autoCapitalize="none" />
                  <a className="btn" style={{ width: '100%', textAlign: 'center' }} target="_blank" href={`https://wa.me/${WA}?text=${encodeURIComponent('Halo admin, saya lupa password. Username/Gmail saya: ' + (f.login || '-') + '. Mohon dibuatkan password sementara.')}`}>Chat Admin untuk Reset</a>
                </>
              )}
              <p className="mut" style={{ cursor: 'pointer', fontSize: 14, marginTop: 8 }} onClick={() => go('login')}>Kembali ke halaman masuk</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      {m === 'register' && !on && <p className="err">Pendaftaran butuh OTP email, tetapi admin belum mengaktifkan email. Hubungi admin.</p>}
      <p className="gold">{info}</p>
      <p key={sk} className={'err' + (e ? ' shake' : '')}>{e}</p>
      {!(m === 'forgot' && !on) && (
        <button className="btn" style={{ width: '100%', marginTop: 8 }} disabled={busy || (m === 'register' && !on)}>
          {busy ? 'Memproses…' : m === 'login' ? 'Masuk' : m === 'register' ? 'Daftar Sekarang' : 'Atur Ulang Password'}
        </button>
      )}
      {gg && m !== 'forgot' && (
        <>
          <div className="or"><span>atau</span></div>
          <a className="gbtn" href="/api/auth/google">
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" /><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" /><path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" /><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" /></svg>
            Lanjut dengan Google
          </a>
        </>
      )}
    </motion.form>
  );
}
