import Link from 'next/link';
import SafeImg from '@/components/SafeImg';
import Countdown from '@/components/Countdown';
import CopyLink from '@/components/CopyLink';
export default function ProductCard({ a }) {
  const auction = a.kind === 'auction';
  return (
    <div className="card">
      <Link href={`/akun/${a.id}`} className="clink">
        <div className="frame">
          <SafeImg src={a.cover} alt={a.title} />
          {auction
            ? <span className="tag gold2">LELANG</span>
            : <span className="tag ok">Ready</span>}
          {a.n > 1 && <span className="tag n">{a.n} foto</span>}
          <span className="pchip">{auction ? <Countdown left={a.left} /> : 'Rp ' + a.price.toLocaleString('id-ID')}</span>
        </div>
        <div className="cb">
          <h3>{a.title}</h3>
          <div className="pr">
            {auction
              ? <span className="price">{a.top ? 'Rp ' + a.top.toLocaleString('id-ID') : 'Mulai Rp ' + a.price.toLocaleString('id-ID')}</span>
              : <span className="mut">Lihat spesifikasi</span>}
            <span className="go">{auction ? (a.bids || 0) + ' bid' : 'Detail'}</span>
          </div>
        </div>
      </Link>
      <CopyLink id={a.id} />
    </div>
  );
}
