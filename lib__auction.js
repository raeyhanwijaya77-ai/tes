import { sql, init, getFee, auctionPayMin } from './db';
import { createQris, isPaid, finalize } from './payment';
import { notifyAuction } from './discord';
import { logAct } from './activity';
let last = 0;
export async function settleAuctions(force = false) {
  if (!force && Date.now() - last < 8000) return;
  last = Date.now();
  try {
    await init();
    const due = await sql`select id,title from accounts where kind='auction' and auction_done=false and ends_at<=now() limit 5`;
    for (const a of due) {
      const [c] = await sql`update accounts set auction_done=true where id=${a.id} and auction_done=false returning id`;
      if (!c) continue;
      const [top] = await sql`select b.user_id,b.amount,u.username,u.email from bids b left join users u on u.id=b.user_id where b.account_id=${a.id} order by b.amount desc, b.id asc limit 1`;
      if (!top) {
        await sql`update accounts set kind='fixed',status='available' where id=${a.id}`;
        await notifyAuction(a.title, '', 0, 0);
        continue;
      }
      const [n] = await sql`select count(*)::int as n from bids where account_id=${a.id}`;
      const fee = await getFee();
      const win = await auctionPayMin();
      const amount = top.amount + fee;
      const id = 'RBX' + Date.now() + Math.floor(Math.random() * 900 + 100);
      await sql`update accounts set status='reserved',buyer_id=${top.user_id},reserved_at=now() where id=${a.id}`;
      let qr = '';
      try { qr = (await createQris(id, amount, win)) || ''; } catch {}
      await sql`insert into orders(id,user_id,account_id,amount,qr,voucher,discount,fee,kind) values(${id},${top.user_id},${a.id},${amount},${qr},'',0,${fee},'auction')`;
      await logAct('lelang_menang', { user: { id: top.user_id }, detail: `${a.title} Rp ${top.amount}` });
      await notifyAuction(a.title, top.username || top.email, top.amount, n.n);
    }
    const win2 = await auctionPayMin();
    const stale = await sql`select * from orders where kind='auction' and status='pending' and created<now()-make_interval(mins => ${win2}::int) limit 5`;
    for (const o of stale) {
      if (await isPaid(o)) { await finalize(o); continue; }
      await sql`update orders set status='expired' where id=${o.id} and status='pending'`;
      await sql`update accounts set status='available',kind='fixed',reserved_at=null,buyer_id=null where id=${o.account_id} and status='reserved'`;
    }
  } catch {}
}
