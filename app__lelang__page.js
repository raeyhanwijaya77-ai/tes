import { sql, init } from '@/lib/db';
import Reveal from '@/components/Reveal';
import AucCard from '@/components/AucCard';
import ProductCard from '@/components/ProductCard';
import { settleAuctions } from '@/lib/auction';
export const dynamic = 'force-dynamic';
export default async function Lelang() {
  await init();
  await settleAuctions();
  const auc = await sql`select a.id,a.title,a.price,case when (a.images->>0) like 'data:%' then '/api/img/' || a.id::text else a.images->>0 end as cover,extract(epoch from (a.ends_at-now()))::int as left,(select max(amount)::int from bids b where b.account_id=a.id) as top,(select count(*)::int from bids b where b.account_id=a.id) as n from accounts a where a.kind='auction' and a.auction_done=false and a.ends_at>now() order by a.ends_at asc limit 40`;
  const st = await sql`select id,title,price,case when (images->>0) like 'data:%' then '/api/img/' || id::text else images->>0 end as cover,'fixed'::text as kind,case when jsonb_typeof(images)='array' then jsonb_array_length(images) else 0 end as n from accounts where kind='fixed' and status='available' order by id desc limit 4`;
  return (
    <div className="w">
      <Reveal><div className="sh" style={{ marginTop: 10 }}><h2>Lelang akun</h2><span className="mut">{auc.length} berlangsung</span></div></Reveal>
      <Reveal delay={0.05}><p className="mut" style={{ marginBottom: 16 }}>Pasang bid tertinggi sebelum waktu habis. Pemenang otomatis mendapat QRIS pembayaran.</p></Reveal>
      {!auc.length && <div className="empty"><h3>Belum ada lelang</h3><p>Pantau terus, lelang baru muncul di sini.</p></div>}
      <div className="grid">{auc.map((a, i) => <Reveal key={a.id} delay={Math.min(i, 8) * 0.05}><AucCard a={a} /></Reveal>)}</div>
      {st.length > 0 && (
        <>
          <div className="sh"><h2>Dari Store</h2><a href="/store" className="go">Buka Store</a></div>
          <div className="grid">{st.map((a) => <Reveal key={a.id}><ProductCard a={a} /></Reveal>)}</div>
        </>
      )}
    </div>
  );
}
