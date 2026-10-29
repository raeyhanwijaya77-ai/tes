'use client';
export default function OtpBox({ value, onChange, onResend, cd = 0, sent = false }) {
  return (
    <div className="otpb">
      <div className="otpw">
        <b>⚠ Jangan bagikan kode ini</b>
        <span>Kode berlaku 10 menit. Jangan berikan ke siapa pun, termasuk admin. Kami tidak pernah memintanya.</span>
      </div>
      <label className="l" style={{ textAlign: 'center' }}>Masukkan kode 6 digit dari Gmail</label>
      <input className="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="••••••" value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
      <button type="button" className="btn o sm otpr" onClick={onResend} disabled={cd > 0}>{cd > 0 ? `Kirim ulang kode (${cd} dtk)` : sent ? 'Kirim ulang kode' : 'Kirim kode ke Gmail'}</button>
    </div>
  );
}
