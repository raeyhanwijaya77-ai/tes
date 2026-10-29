import { notFound } from 'next/navigation';
import Link from 'next/link';
import { sql, init, getFee } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { logAct } from '@/lib/activity';
import Reveal from '@/components/Reveal';
import Gallery from '@/components/Gallery';
import Buy from './buy';
import AuctionPanel from '@/components/AuctionPanel';
import CopyLink from '@/components/CopyLink';
import ProductCard from '@/components/ProductCard';
export const dynamic = 'force-dynamic';
export default async function Detail({ params }) {
  const { id } = await params;
  await init();
  const [a] = await sql`select id,title,description,specs,price,images,status,wa,kind from accounts where id=${id}`;
  if (!a) notFound();
  const fee = await getFee();
  const me = await getUser();
  if (me) await logAct('lihat_akun', { user: me, detail: a.title, dedupe: 10 });
  const rel = await sql`select a.id,a.title,a.price,a.kind,case when (a.images->>0) like 'data:%' then '/api/img/' || a.id::text else a.images->>0 end as cover,case when jsonb_typeof(a.images)='array' then jsonb_array_length(a.images) else 0 end as n,extract(epoch from (a.ends_at-now()))::int as left,(select max(amount)::int from bids b where b.account_id=a.id) as top,(select count(*)::int from bids b where b.account_id=a.id) as bids from accounts a where a.id<>${a.id} and ((a.kind='fixed' and a.status='available') or (a.kind='auction' and a.auction_done=false and a.ends_at>now())) order by (a.kind<>${a.kind}::text) desc, a.id desc limit 4`;
  const [pv] = await sql`select id,title,kind from accounts where id<${a.id} and ((kind='fixed' and status='available') or (kind='auction' and auction_done=false and ends_at>now())) order by id desc limit 1`;
  const [nx] = await sql`select id,title,kind from accounts where id>${a.id} and ((kind='fixed' and status='available') or (kind='auction' and auction_done=false and ends_at>now())) order by id asc limit 1`;
  const imgs = (a.images || []).map((s, k) => (String(s).startsWith('data:') ? `/api/img/${a.id}?i=${k}` : s));
  const specs = String(a.specs || '').split('\n').map((x) => x.trim()).filter(Boolean);
  return (
    <div className="w">
      <a href={a.kind === 'auction' ? '/lelang' : '/store'} className="mut">Kembali ke {a.kind === 'auction' ? 'Lelang' : 'Store'}</a>
      <div className="det">
        <Reveal><Gallery images={imgs} alt={a.title} /></Reveal>
        <Reveal delay={0.1} className="buyw">
          <div className="buy">
            <div className="trow"><h1>{a.title}</h1><CopyLink id={a.id} className="cpy inl" label=" Salin link" /></div>
            <p className="price">{a.kind === 'auction' ? 'Lelang mulai ' : ''}Rp {a.price.toLocaleString('id-ID')}</p>
            {specs.length > 0 && (
              <div className="specs"><b>Spesifikasi akun</b><ul>{specs.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            )}
            {a.description && <p className="desc">{a.description}</p>}
            <ul className="pts">
              <li>Bayar QRIS, terverifikasi otomatis</li>
              <li>Data login tampil setelah pembayaran lunas</li>
              <li>Admin membantu mengamankan akun</li>
            </ul>
            <a className="btn o sm" style={{ marginBottom: 12 }} target="_blank" href={`https://wa.me/${a.wa || process.env.NEXT_PUBLIC_WA_ADMIN || '6282319319768'}?text=${encodeURIComponent('Halo admin, saya mau tanya akun: ' + a.title)}`}>Tanya admin stok ini</a>
            {a.kind === 'auction' ? <AuctionPanel id={a.id} fee={fee} /> : a.status === 'sold' ? <b className="err">Sudah terjual</b> : <Buy id={a.id} price={a.price} fee={fee} />}
          </div>
        </Reveal>
      </div>
      {(pv || nx) && (
        <div className="pnav">
          {pv ? <Link href={`/akun/${pv.id}`}><small>‹ Produk sebelumnya · {pv.kind === 'auction' ? 'LELANG' : 'STORE'}</small><b>{pv.title}</b></Link> : <span />}
          {nx ? <Link href={`/akun/${nx.id}`} style={{ textAlign: 'right' }}><small>Produk berikutnya · {nx.kind === 'auction' ? 'LELANG' : 'STORE'} ›</small><b>{nx.title}</b></Link> : <span />}
        </div>
      )}
      {rel.length > 0 && (
        <>
          <div className="sh"><h2>{a.kind === 'auction' ? 'Juga di Store' : 'Lelang dan produk lain'}</h2><a href={a.kind === 'auction' ? '/store' : '/lelang'} className="go">{a.kind === 'auction' ? 'Buka Store' : 'Buka Lelang'}</a></div>
          <div className="grid">{rel.map((r) => <Reveal key={r.id}><ProductCard a={r} /></Reveal>)}</div>
        </>
      )}
    </div>
  );
}
