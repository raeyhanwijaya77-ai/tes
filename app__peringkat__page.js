import { sql, init } from '@/lib/db';
import { getUser } from '@/lib/auth';
import Reveal from '@/components/Reveal';
import Avatar from '@/components/Avatar';
export const dynamic = 'force-dynamic';
const lv = (n) => (n >= 10 ? ['LEGEND', 'gold'] : n >= 5 ? ['ELITE', 'ok'] : n >= 3 ? ['PRO', 'info'] : ['ROOKIE', 'mut']);
export default async function Peringkat() {
  await init();
  const u = await getUser();
  const rows = await sql`select u.id,u.username,u.avatar,count(*)::int as n from orders o join users u on u.id=o.user_id where o.status='paid' group by u.id,u.username,u.avatar order by n desc, min(o.created) asc limit 20`;
  let me = null;
  if (u) {
    const [m] = await sql`select count(*)::int as n from orders where user_id=${u.id} and status='paid'`;
    if (m?.n > 0) {
      const [r] = await sql`select count(*)::int + 1 as rank from (select user_id, count(*) as n from orders where status='paid' group by user_id) t where t.n > ${m.n}`;
      me = { n: m.n, rank: r?.rank || 1 };
    }
  }
  const pod = [rows[1], rows[0], rows[2]];
  const rk = [2, 1, 3];
  return (
    <div className="w">
      <Reveal><div className="sh" style={{ marginTop: 10 }}><h2>Papan peringkat</h2><span className="mut">berdasarkan akun yang dibeli</span></div></Reveal>
      {u && (
        <Reveal>
          <div className="rsum" style={{ marginBottom: 16 }}>
            <div className="bigr">{me ? '#' + me.rank : '-'}</div>
            <div className="rmid"><b>Peringkatmu</b><p className="mut">{me ? `${me.n} akun dibeli` : 'Belum ada pembelian. Beli akun pertamamu untuk masuk papan peringkat.'}</p></div>
          </div>
        </Reveal>
      )}
      {!rows.length ? (
        <div className="empty"><h3>Belum ada peringkat</h3><p>Jadilah pembeli pertama dan duduki posisi #1.</p></div>
      ) : (
        <>
          <div className="pod">
            {pod.map((r, i) => r ? (
              <Reveal key={r.id} delay={i * 0.1}>
                <div className={'pd pd' + rk[i]}>
                  <div className="medal">{rk[i]}</div>
                  <Avatar src={r.avatar} name={r.username} size={48} />
                  <b>{r.username || 'Pembeli'}</b>
                  <span className={'pill ' + lv(r.n)[1]}>{lv(r.n)[0]}</span>
                  <div className="pn">{r.n}<small> akun</small></div>
                </div>
              </Reveal>
            ) : <div key={i} />)}
          </div>
          <div className="lbl">
            {rows.slice(3).map((r, i) => (
              <Reveal key={r.id} delay={Math.min(i, 8) * 0.04}>
                <div className="lbr">
                  <span className="rk">{i + 4}</span>
                  <Avatar src={r.avatar} name={r.username} size={34} />
                  <b>{r.username || 'Pembeli'}</b>
                  <span className={'pill ' + lv(r.n)[1]}>{lv(r.n)[0]}</span>
                  <span className="cnt">{r.n} akun</span>
                </div>
              </Reveal>
            ))}
          </div>
        </>
      )}
      <p className="mut" style={{ marginTop: 18, fontSize: 13 }}>Level: ROOKIE (1 akun), PRO (3), ELITE (5), LEGEND (10 atau lebih).</p>
    </div>
  );
}
