import Robot from '@/components/Robot';
export default function NotFound() {
  return (
    <div className="w" style={{ textAlign: 'center', padding: '60px 0' }}>
      <Robot size={140} />
      <h1 className="glitch" data-text="404" style={{ fontSize: 56, margin: '14px 0 4px' }}>404</h1>
      <p className="mut" style={{ marginBottom: 18 }}>Halaman tidak ditemukan. Robot kami sudah mencari ke mana-mana.</p>
      <a href="/" className="btn">Kembali ke toko</a>
    </div>
  );
}
