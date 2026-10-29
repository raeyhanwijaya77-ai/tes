import { sql, init, holdMin } from '@/lib/db';
import Reveal from '@/components/Reveal';
import Shop from '@/components/Shop';
import ProductCard from '@/components/ProductCard';
export const dynamic = 'force-dynamic';
const WA = process.env.NEXT_PUBLIC_WA_ADMIN || '6282319319768';
export default async function Store() {
  await init();
  const hold = await holdMin();
  const rows = await sql`select id,title,price,description,specs,case when (images->>0) like 'data:%' then '/api/img/' || id::text else images->>0 end as cover,case when jsonb_typeof(images)='array' then jsonb_array_length(images) else 0 end as n from accounts where kind='fixed' and (status='available' or (status='reserved' and reserved_at<now()-make_interval(mins => ${hold}::int))) order by id desc`;
  const items = rows.map((r) => ({ id: r.id, title: r.title, price: r.price, cover: r.cover || '', n: r.n, hay: [r.title, r.description, r.specs].join(' ').toLowerCase() }));
  const auc = await sql`select a.id,a.title,a.price,case when (a.images->>0) like 'data:%' then '/api/img/' || a.id::text else a.images->>0 end as cover,'auction'::text as kind,0 as n,extract(epoch from (a.ends_at-now()))::int as left,(select max(amount)::int from bids b where b.account_id=a.id) as top,(select count(*)::int from bids b where b.account_id=a.id) as bids from accounts a where a.kind='auction' and a.auction_done=false and a.ends_at>now() order by a.ends_at asc limit 4`;
  return (
    <div className="w">
      <Reveal><div className="sh" style={{ marginTop: 10 }}><h2>Store</h2><span className="mut">{items.length} stok tersedia</span></div></Reveal>
      <Reveal delay={0.05}><p className="mut" style={{ marginBottom: 14 }}>Harga tetap, bayar QRIS, akun langsung dikirim. Mau yang lebih murah? Coba <a href="/lelang" className="go">ikut lelang</a>.</p></Reveal>
      <Shop items={items} wa={WA} />
      {auc.length > 0 && (
        <>
          <div className="sh"><h2>Lelang berlangsung</h2><a href="/lelang" className="go">Buka Lelang</a></div>
          <div className="grid">{auc.map((a) => <Reveal key={a.id}><ProductCard a={a} /></Reveal>)}</div>
        </>
      )}
    </div>
  );
}
