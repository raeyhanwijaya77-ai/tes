import { sql, init, holdMin } from '@/lib/db';
import Reveal from '@/components/Reveal';
import Rotator from '@/components/Rotator';
import CountUp from '@/components/CountUp';
import Faq from '@/components/Faq';
import ProductCard from '@/components/ProductCard';
import { LivePanel } from '@/components/LiveStats';
import Stars from '@/components/Stars';
import Shop from '@/components/Shop';
import Cyborg from '@/components/Cyborg';
import AucCard from '@/components/AucCard';
import Robot from '@/components/Robot';
export const dynamic = 'force-dynamic';
const WA = process.env.NEXT_PUBLIC_WA_ADMIN || '6282319319768';
const STOK = 'https://whatsapp.com/channel/0029VbCOpsZ2UPB9asft7t05';
const TESTI = 'https://whatsapp.com/channel/0029Vb8X3IUDp2Q8pNBKI40L';
const WAICON = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';
const BADGES = ['Pembayaran QRIS', 'Akun dikirim otomatis', 'Dibantu admin', 'Foto dan spesifikasi jelas', 'Riwayat pesanan lengkap'];
const HOW = [['01', 'Pilih akun', 'Lihat foto dan spesifikasi lengkap sebelum membeli.'], ['02', 'Bayar QRIS', 'Scan dari e-wallet atau m-banking, terverifikasi otomatis.'], ['03', 'Terima akun', 'Username dan password tampil, lalu admin bantu mengamankan.']];
const FAQ = [
  ['Bagaimana cara membeli?', 'Pilih akun, tekan Beli Sekarang, lalu scan QRIS. Setelah pembayaran terverifikasi, data akun tampil otomatis di halaman pesanan.'],
  ['Kapan akun saya dikirim?', 'Otomatis begitu pembayaran terverifikasi. Kamu tidak perlu menunggu admin untuk menerima data akun.'],
  ['Apa yang dilakukan setelah menerima akun?', 'Segera Chat Admin agar akun diamankan, misalnya penggantian password dan data pemulihan.'],
  ['Di mana melihat pesanan lama?', 'Buka menu Pesanan setelah masuk. Data akun dari pesanan yang sudah lunas bisa dibuka kapan saja.'],
];
const CH = [
  ['Saluran Stok', 'Info akun baru dan restok terbaru langsung di WhatsApp.', STOK, 'Gabung saluran', 't1'],
  ['Saluran Testimoni', 'Bukti transaksi dan ulasan langsung dari pembeli.', TESTI, 'Lihat testimoni', 't2'],
  ['Chat Admin', 'Tanya akun, request stok, atau minta bantuan.', `https://wa.me/${WA}`, 'Chat sekarang', 't3'],
];
export default async function Home() {
  await init();
  const hold = await holdMin();
  const rows = await sql`select id,title,price,description,specs,case when (images->>0) like 'data:%' then '/api/img/' || id::text else images->>0 end as cover,case when jsonb_typeof(images)='array' then jsonb_array_length(images) else 0 end as n from accounts where kind='fixed' and (status='available' or (status='reserved' and reserved_at<now()-make_interval(mins => ${hold}::int))) order by id desc`;
  const auc = await sql`select a.id,a.title,a.price,case when (a.images->>0) like 'data:%' then '/api/img/' || a.id::text else a.images->>0 end as cover,extract(epoch from (a.ends_at-now()))::int as left,(select max(amount)::int from bids b where b.account_id=a.id) as top,(select count(*)::int from bids b where b.account_id=a.id) as n from accounts a where a.kind='auction' and a.auction_done=false and a.ends_at>now() order by a.ends_at asc limit 6`;
  const [s] = await sql`select count(*) filter (where status='sold')::int as sold, count(*) filter (where status='available' and kind='fixed')::int as ready from accounts`;
  const items = rows.map((r) => ({ id: r.id, title: r.title, price: r.price, cover: r.cover || '', n: r.n, hay: [r.title, r.description, r.specs].join(' ').toLowerCase() }));
  const [ag] = await sql`select count(*)::int as n, coalesce(round(avg(rating)::numeric,1),0)::float as avg from reviews where not hidden`;
  const [vs] = await sql`select (select count(*) from visitors where last_seen>now()-interval '2 minutes')::int as online, (select count(distinct vid) from pageviews where created::date=current_date)::int as today`;
  const rv = await sql`select r.rating,r.body,u.username from reviews r left join users u on u.id=r.user_id where not r.hidden order by r.id desc limit 3`;
  return (
    <div className="w">
      <section className="hero3">
        <Reveal>
          <span className="badge"><i />Pembayaran QRIS otomatis</span>
          <h1>Akun Roblox<Rotator />langsung kamu pegang.</h1>
          <p className="lead">Pilih akun, bayar lewat QRIS, dan data login langsung muncul di layar. Admin siap membantu mengamankan akun setelahnya.</p>
          <div className="acts">
            <a href="#stok" className="btn">Lihat stok akun</a>
            <a href={`https://wa.me/${WA}`} target="_blank" className="btn o">Chat Admin</a>
          </div>
          <div className="trust"><span>Foto jelas</span><span>Dikirim otomatis</span><span>Dibantu admin</span></div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="cyw">
            <Cyborg />
            <span className="fchip c1">▣ {s?.ready || 0} stok siap</span>
            <span className="fchip c2">🔨 {auc.length} lelang live</span>
            <span className="fchip c3">★ QRIS otomatis</span>
          </div>
        </Reveal>
      </section>
      <div className="mq"><div className="mqt">{[...BADGES, ...BADGES].map((b, i) => <span key={i}>{b}</span>)}</div></div>
      <Reveal><LivePanel /></Reveal>
      <div className="sh"><h2>Cara beli</h2></div>
      <div className="how">
        {HOW.map(([n, t, d], i) => (
          <Reveal key={n} delay={i * 0.08}><div><b className="n">{n}</b><b>{t}</b><p className="mut">{d}</p></div></Reveal>
        ))}
      </div>
      {auc.length > 0 && (
        <>
          <div className="sh"><h2>Lelang berlangsung</h2><a href="/lelang" className="go">Lihat semua lelang</a></div>
          <div className="grid">
            {auc.map((a, i) => <Reveal key={a.id} delay={Math.min(i, 6) * 0.06}><AucCard a={a} /></Reveal>)}
          </div>
        </>
      )}
      <div className="sh" id="stok"><h2>Stok akun</h2><a href="/store" className="go">Buka Store</a></div>
      {!items.length ? (
        <div className="empty"><h3>Stok sedang kosong</h3><p>Hubungi admin untuk request akun yang kamu cari, atau ikut lelang.</p><a href={`https://wa.me/${WA}`} target="_blank" className="btn">Chat Admin</a></div>
      ) : (
        <>
          <div className="grid">{items.slice(0, 6).map((a, i) => <Reveal key={a.id} delay={Math.min(i, 6) * 0.06}><ProductCard a={{ ...a, kind: 'fixed' }} /></Reveal>)}</div>
          <div style={{ textAlign: 'center', marginTop: 18 }}><a href="/store" className="btn o">Lihat semua di Store ({items.length})</a></div>
        </>
      )}
      <div className="sh"><h2>Testimoni pembeli</h2><a href="/testimoni" className="go">Lihat semua dan tulis testimoni</a></div>
      <Reveal>
        <div className="rsum" style={{ marginBottom: 14 }}>
          <div className="bigr">{ag.avg.toFixed(1)}<small>/5</small></div>
          <div className="rmid"><Stars n={ag.avg} /><p className="mut">{ag.n} testimoni dari pembeli terverifikasi</p></div>
        </div>
      </Reveal>
      {rv.length > 0 && (
        <div className="rvs">
          {rv.map((r, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="rv"><div className="rvh"><span className="avatar sm">{(r.username || '?')[0].toUpperCase()}</span><div><b>{r.username || 'Pembeli'}</b><small className="mut">Pembeli terverifikasi</small></div><Stars n={r.rating} /></div><p>{r.body}</p></div>
            </Reveal>
          ))}
        </div>
      )}
      <div className="sh"><h2>Saluran dan Chat Admin</h2></div>
      <div className="chans">
        {CH.map(([t, d, h, b, c], i) => (
          <Reveal key={t} delay={i * 0.08}>
            <a href={h} target="_blank" className={'chan v ' + c}>
              <span className="wi"><svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d={WAICON} /></svg></span>
              <span className="ct"><b>{t}</b><small>{d}</small></span>
              <span className="btn">{b}</span>
            </a>
          </Reveal>
        ))}
      </div>
      <div className="sh"><h2>Pertanyaan umum</h2></div>
      <Reveal><Faq items={FAQ} /></Reveal>
      <footer className="foot">
        <div><Robot size={46} /><b>Toko Akun Rehan</b>Akun Roblox dengan pembayaran QRIS otomatis. v1.0</div>
        <div><b>Saluran</b><a href={STOK} target="_blank">Saluran Stok</a><a href={TESTI} target="_blank">Saluran Testimoni</a></div>
        <div><b>Bantuan</b><a href={`https://wa.me/${WA}`} target="_blank">Chat Admin</a><a href="/login">Masuk atau daftar</a></div>
      </footer>
    </div>
  );
}
