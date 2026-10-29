import Link from 'next/link';
import { sql, init } from '@/lib/db';
import { getUser } from '@/lib/auth';
import Reveal from '@/components/Reveal';
import Stars from '@/components/Stars';
import Avatar from '@/components/Avatar';
import ReviewForm from '@/components/ReviewForm';
export const dynamic = 'force-dynamic';
export default async function Testimoni() {
  await init();
  const u = await getUser();
  const [ag] = await sql`select count(*)::int as n, coalesce(round(avg(rating)::numeric,1),0)::float as avg from reviews where not hidden`;
  const dist = await sql`select rating, count(*)::int as c from reviews where not hidden group by rating`;
  const list = await sql`select r.id,r.rating,r.body,case when r.photo like 'data:%' then '/api/rimg/' || r.id::text else r.photo end as photo,r.reply,r.created,u.username,u.avatar,a.title from reviews r left join users u on u.id=r.user_id left join accounts a on a.id=r.account_id where not r.hidden order by r.id desc limit 30`;
  let eligible = [];
  if (u) eligible = await sql`select o.id,a.title from orders o left join accounts a on a.id=o.account_id left join reviews r on r.order_id=o.id where o.user_id=${u.id} and o.status='paid' and r.id is null order by o.created desc`;
  const cnt = (k) => dist.find((d) => d.rating === k)?.c || 0;
  return (
    <div className="w">
      <Reveal>
        <div className="rsum">
          <div className="bigr">{ag.avg.toFixed(1)}<small>/5</small></div>
          <div className="rmid"><Stars n={ag.avg} /><p className="mut">{ag.n} testimoni dari pembeli terverifikasi</p></div>
          <div className="dist">
            {[5, 4, 3, 2, 1].map((k) => (
              <div key={k}><span>{k}★</span><em><i style={{ width: (ag.n ? (cnt(k) / ag.n) * 100 : 0) + '%' }} /></em><span>{cnt(k)}</span></div>
            ))}
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <div className="box" style={{ maxWidth: 560 }}>
          {!u ? (
            <><h3>Tulis testimoni</h3><p className="mut" style={{ margin: '6px 0 14px' }}>Masuk dulu. Testimoni hanya untuk pembeli yang sudah membayar.</p><Link href="/login" className="btn">Masuk</Link></>
          ) : eligible.length ? (
            <ReviewForm orders={eligible.map((e) => ({ id: e.id, title: e.title || '' }))} />
          ) : (
            <><h3>Tulis testimoni</h3><p className="mut" style={{ marginTop: 6 }}>Belum ada pesanan lunas yang bisa diberi testimoni. Testimoni hanya untuk pembeli yang sudah membeli, satu testimoni untuk satu pesanan.</p></>
          )}
        </div>
      </Reveal>
      <div className="sh"><h2>Kata pembeli</h2></div>
      {!list.length && <div className="empty"><h3>Belum ada testimoni</h3><p>Jadilah yang pertama setelah membeli akun.</p></div>}
      <div className="rvs">
        {list.map((r, i) => (
          <Reveal key={r.id} delay={Math.min(i, 6) * 0.05}>
            <div className="rv">
              <div className="rvh">
                <Avatar src={r.avatar} name={r.username} size={38} />
                <div><b>{r.username || 'Pembeli'}</b><small className="mut">Pembeli terverifikasi · {new Date(r.created).toLocaleDateString('id-ID')}</small></div>
                <Stars n={r.rating} />
              </div>
              <p>{r.body}</p>
              {r.photo && <img className="rvp" src={r.photo} alt="Foto testimoni" loading="lazy" />}
              {r.title && <small className="mut">Membeli: {r.title}</small>}
              {r.reply && <div className="rvr"><b>Admin Rehan</b><p>{r.reply}</p></div>}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
