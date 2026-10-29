'use client';
import { useState } from 'react';
import { createPortal } from 'react-dom';
export default function CopyLink({ id, className = 'cpy', label = '' }) {
  const [ok, setOk] = useState(false);
  async function copy(e) {
    e.preventDefault(); e.stopPropagation();
    const url = location.origin + '/akun/' + id;
    let done = false;
    try { await navigator.clipboard.writeText(url); done = true; } catch {}
    if (!done) {
      try {
        const t = document.createElement('textarea');
        t.value = url; t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select(); done = document.execCommand('copy'); document.body.removeChild(t);
      } catch {}
    }
    setOk(done ? true : 'err');
    setTimeout(() => setOk(false), 2200);
  }
  return (
    <>
      <button type="button" className={className} onClick={copy} aria-label="Salin link produk" title="Salin link">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" /></svg>
        {label}
      </button>
      {ok && createPortal(<span className="ctoast">{ok === true ? 'Link berhasil disalin!' : 'Gagal menyalin, salin manual dari alamat web'}</span>, document.body)}
    </>
  );
}
