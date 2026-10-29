export const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shell = (inner) => `<div style="background:#05070f;padding:24px 12px;font-family:Arial,Helvetica,sans-serif"><table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0a1022;border:1px solid #1b4f63;border-radius:8px"><tr><td style="padding:24px;color:#e8f6ff;font-size:15px;line-height:1.6"><div style="font-weight:800;letter-spacing:2px;color:#00e5ff;font-size:13px;margin-bottom:14px">TOKO AKUN REHAN</div>${inner}</td></tr></table></div>`;
export function otpHtml(code, title) {
  return shell(`
    <div style="font-size:20px;font-weight:700;margin-bottom:4px">${esc(title)}</div>
    <div style="color:#8aa3c0;margin-bottom:6px">Masukkan kode berikut di halaman toko:</div>
    <div style="margin:16px 0;padding:20px 8px;border:2px dashed #00e5ff;border-radius:8px;text-align:center;background:#06121c;font-family:'Courier New',monospace;font-weight:900;font-size:40px;letter-spacing:12px;color:#00e5ff">${esc(code)}</div>
    <div style="background:#2a1d05;border:1px solid #ffc400;border-radius:6px;padding:12px 14px;color:#ffd666;font-size:13px">
      <b>⚠ JANGAN BAGIKAN KODE INI</b> kepada siapa pun, termasuk admin atau pihak yang mengaku dari toko. Kami tidak pernah meminta kode ini.<br>Berlaku <b>10 menit</b>. Jika bukan kamu yang meminta, abaikan email ini.
    </div>`);
}
export function broadcastHtml({ subject, message, voucher, site }) {
  const body = esc(message).replace(/\n/g, '<br>');
  const off = voucher ? (voucher.kind === 'percent' ? voucher.value + '%' : 'Rp ' + Number(voucher.value).toLocaleString('id-ID')) : '';
  const until = voucher?.expires ? ' · berlaku sampai ' + new Date(voucher.expires).toLocaleDateString('id-ID') : '';
  const vbox = voucher ? `<div style="margin:16px 0;padding:16px;border:2px dashed #c084fc;border-radius:8px;text-align:center;background:#120a1f"><div style="color:#c9b3e6;font-size:12px">KODE VOUCHER</div><div style="font-family:'Courier New',monospace;font-weight:900;font-size:30px;letter-spacing:6px;color:#c084fc">${esc(voucher.code)}</div><div style="color:#e8f6ff">Diskon ${esc(off)}${esc(until)}</div></div>` : '';
  const html = shell(`
    <div style="font-size:20px;font-weight:700;margin-bottom:10px">${esc(subject)}</div>
    <div>${body}</div>${vbox}
    <div style="margin:18px 0"><a href="${esc(site)}" style="background:#00e5ff;color:#001a22;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:4px;display:inline-block">Buka Toko</a></div>
    <div style="color:#6f86a3;font-size:12px;border-top:1px solid #1b4f63;padding-top:12px">Kamu menerima email ini karena terdaftar di Toko Akun Rehan. Tidak ingin menerima info lagi? Matikan di menu Profil, bagian notifikasi email.</div>`);
  const text = `${subject}\n\n${message}\n${voucher ? `\nKode voucher: ${voucher.code} (diskon ${off}${until})\n` : ''}\nBuka toko: ${site}\n\nMatikan info ini di menu Profil.`;
  return { html, text };
}
