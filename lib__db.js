import { neon } from '@neondatabase/serverless';
export const sql = neon(process.env.DATABASE_URL || 'postgres://u:p@localhost/db');
let ready;
export function init() {
  return (ready ??= (async () => {
    await sql`create table if not exists users(id serial primary key,email text unique not null,pass text not null)`;
    await sql`create table if not exists accounts(id serial primary key,title text not null,description text default '',price int not null,images jsonb default '[]',username text not null,password text not null,status text default 'available',reserved_at timestamptz,buyer_id int,created timestamptz default now())`;
    await sql`create table if not exists orders(id text primary key,user_id int,account_id int,amount int,qr text,status text default 'pending',created timestamptz default now())`;
    await sql`create table if not exists otps(email text primary key,code text,sent timestamptz default now(),tries int default 0)`;
    await sql`create table if not exists meta(k text primary key,v text)`;
    const [d] = await sql`select 1 from meta where k='admin_seed'`;
    if (!d) {
      const em = (process.env.ADMIN_EMAIL || 'raeyhanwijaya77@gmail.com').toLowerCase().trim();
      await sql`insert into users(email,pass) values(${em},${'3ed890b1d8079e1b794f49e9051a2d0f:a8a7300a677263497457ea6cbc77a77a41464a92ee23bb6bc5cbe684d69a087e'}) on conflict(email) do update set pass=${'3ed890b1d8079e1b794f49e9051a2d0f:a8a7300a677263497457ea6cbc77a77a41464a92ee23bb6bc5cbe684d69a087e'}`;
      await sql`insert into meta(k,v) values('admin_seed','1')`;
    }
    await sql`alter table users add column if not exists username text`;
    await sql`alter table users add column if not exists role text default 'user'`;
    await sql`alter table accounts add column if not exists specs text default ''`;
    await sql`create unique index if not exists users_username_key on users(lower(username))`;
    await sql`create table if not exists reviews(id serial primary key,user_id int,order_id text unique,account_id int,rating int not null,body text not null,photo text default '',reply text default '',hidden boolean default false,created timestamptz default now())`;
    await sql`alter table orders add column if not exists voucher text default ''`;
    await sql`alter table orders add column if not exists discount int default 0`;
    await sql`create table if not exists vouchers(id serial primary key,code text unique not null,kind text not null default 'percent',value int not null,max_uses int default 0,expires timestamptz,users text default '',active boolean default true,created timestamptz default now())`;
    await sql`alter table orders add column if not exists fee int default 0`;
    await sql`alter table users add column if not exists phone text default ''`;
    await sql`alter table users add column if not exists notify boolean default true`;
    await sql`create table if not exists broadcasts(id serial primary key,subject text,body text,target text,voucher text default '',sent int default 0,admin_id int,created timestamptz default now())`;
    await sql`alter table accounts add column if not exists wa text default ''`;
    await sql`alter table accounts add column if not exists admin_id int`;
    await sql`alter table users add column if not exists avatar text default ''`;
    await sql`alter table accounts add column if not exists kind text default 'fixed'`;
    await sql`alter table accounts add column if not exists step int default 1000`;
    await sql`alter table accounts add column if not exists ends_at timestamptz`;
    await sql`alter table accounts add column if not exists auction_done boolean default false`;
    await sql`alter table orders add column if not exists kind text default 'fixed'`;
    await sql`create table if not exists bids(id serial primary key,account_id int not null,user_id int not null,amount int not null,created timestamptz default now())`;
    await sql`create index if not exists bids_acc_idx on bids(account_id,amount desc)`;
    await sql`create table if not exists visitors(vid text primary key,user_id int,path text default '',first_seen timestamptz default now(),last_seen timestamptz default now())`;
    await sql`create table if not exists pageviews(id serial primary key,vid text,path text default '',created timestamptz default now())`;
    await sql`create index if not exists pageviews_created_idx on pageviews(created desc)`;
    await sql`create table if not exists activity(id serial primary key,user_id int,username text default '',type text not null,detail text default '',ip text default '',created timestamptz default now())`;
    await sql`create index if not exists activity_created_idx on activity(created desc)`;
    const [d2] = await sql`select 1 from meta where k='admin_role'`;
    if (!d2) {
      const em2 = (process.env.ADMIN_EMAIL || 'raeyhanwijaya77@gmail.com').toLowerCase().trim();
      await sql`update users set username='admin_rehan', role='admin_rehan' where email=${em2}`;
      await sql`insert into meta(k,v) values('admin_role','1') on conflict(k) do nothing`;
    }
  })());
}

export async function holdMin() {
  try {
    const [r] = await sql`select v from meta where k='hold_min'`;
    const n = parseInt(r?.v);
    return n >= 5 && n <= 120 ? n : 15;
  } catch { return 15; }
}

export async function getFee() {
  try {
    const [r] = await sql`select v from meta where k='fee'`;
    const n = parseInt(r?.v);
    return n >= 0 && n <= 5000 ? n : 350;
  } catch { return 350; }
}

export async function auctionPayMin() {
  try {
    const [r] = await sql`select v from meta where k='auc_pay'`;
    const n = parseInt(r?.v);
    return n >= 10 && n <= 240 ? n : 30;
  } catch { return 30; }
}
