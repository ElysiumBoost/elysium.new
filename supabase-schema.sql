-- Elysium Boost — Supabase schema
-- Run this in the Supabase SQL editor to create all required tables.

-- ── profiles ──────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text,
  email         text,
  discord_id    text,
  country       text,
  avatar_url    text,
  total_spent   numeric(10,2) not null default 0,
  referral_code text unique,
  created_at    timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can upsert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, referral_code)
  values (
    new.id,
    new.email,
    'ELY-' || upper(substring(new.id::text, 1, 8))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── orders ────────────────────────────────────────────────────────
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  game              text not null,
  service_name      text not null,
  price             numeric(10,2) not null default 0,
  status            text not null default 'Pending' check (status in ('Pending','In Progress','Completed','Cancelled')),
  discord_ticket_id text,
  created_at        timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "Users can read own orders" on public.orders for select using (auth.uid() = user_id);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx  on public.orders(status);

-- ── promo_codes ───────────────────────────────────────────────────
create table if not exists public.promo_codes (
  code             text primary key,
  discount_percent int  not null check (discount_percent between 1 and 100),
  max_uses         int  not null default 1,
  used_count       int  not null default 0,
  expires_at       timestamptz,
  is_active        bool not null default true
);
alter table public.promo_codes enable row level security;
-- Only authenticated users can read active codes (validation done server-side ideally)
create policy "Auth users can read promo codes" on public.promo_codes for select to authenticated using (is_active = true);

-- ════════════════════════════════════════════════════════════════════
-- BOOSTER PLATFORM MIGRATION
-- Booster panel, site-internal chat, order tracking, rank system.
-- Additive migration — safe to run on the existing schema above.
-- NOTE: orders.user_id IS the customer reference (the booster spec's
--       "customer_id"); kept as-is so the customer dashboard keeps working.
-- ════════════════════════════════════════════════════════════════════

-- ── profiles: booster fields ──────────────────────────────────────
alter table public.profiles add column if not exists role            text    not null default 'customer';
alter table public.profiles add column if not exists booster_id_code text;
alter table public.profiles add column if not exists is_available    boolean not null default true;
alter table public.profiles add column if not exists is_banned       boolean not null default false;
alter table public.profiles add column if not exists ban_reason      text;
alter table public.profiles add column if not exists banned_at       timestamptz;
alter table public.profiles add column if not exists rules_accepted_at timestamptz;
alter table public.profiles add column if not exists completed_orders integer not null default 0;
alter table public.profiles add column if not exists rating          numeric(3,2) not null default 5.0;
alter table public.profiles add column if not exists discord_tag     text;
alter table public.profiles add column if not exists games           text;
alter table public.profiles add column if not exists payout_email    text;
alter table public.profiles add column if not exists payout_method   text;
alter table public.profiles add column if not exists max_active_orders integer not null default 5;

do $$ begin
  alter table public.profiles add constraint profiles_role_check
    check (role in ('customer','booster','admin'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.profiles add constraint profiles_payout_method_check
    check (payout_method is null or payout_method in ('paypal','bank','crypto'));
exception when duplicate_object then null; end $$;

-- A booster needs to read other boosters' availability is NOT required;
-- but customers/boosters must read the counterparty's public booster info
-- (username, avatar, rank) for chat headers. Allow authenticated read of
-- minimal profile fields via a dedicated policy.
do $$ begin
  create policy "Auth users can read booster public info"
    on public.profiles for select to authenticated
    using (role = 'booster' or auth.uid() = id);
exception when duplicate_object then null; end $$;

-- ── orders: booster + tracking fields ─────────────────────────────
alter table public.orders add column if not exists booster_id    uuid references public.profiles(id);
alter table public.orders add column if not exists customer_note  text;
alter table public.orders add column if not exists embark_id      text;
alter table public.orders add column if not exists proof_url      text;
alter table public.orders add column if not exists picked_at      timestamptz;
alter table public.orders add column if not exists completed_at   timestamptz;
alter table public.orders add column if not exists eta_minutes    integer;

-- Widen the status vocabulary: booster flow uses lowercase states.
-- Keep the legacy capitalized values so existing customer rows stay valid.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (
  status in (
    'pending','active','proof_submitted','completed','disputed',
    'Pending','In Progress','Completed','Cancelled'
  )
);

create index if not exists orders_booster_id_idx on public.orders(booster_id);
create index if not exists orders_pending_idx on public.orders(status) where booster_id is null;

-- Boosters can read the open pick queue + their own claimed orders.
do $$ begin
  create policy "Boosters read pick queue and own orders"
    on public.orders for select to authenticated
    using (
      (status = 'pending' and booster_id is null)
      or booster_id = auth.uid()
      or user_id = auth.uid()
    );
exception when duplicate_object then null; end $$;

-- Boosters update only orders they own (proof, status, eta).
do $$ begin
  create policy "Boosters update own orders"
    on public.orders for update to authenticated
    using (booster_id = auth.uid())
    with check (booster_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ── pick_order(): atomic claim, prevents two boosters racing ──────
create or replace function public.pick_order(p_order_id uuid, p_booster_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare picked_rows integer := 0;
begin
  -- Enforce the per-booster active cap inside the transaction.
  if (select count(*) from public.orders
        where booster_id = p_booster_id and status = 'active')
     >= coalesce((select max_active_orders from public.profiles where id = p_booster_id), 5)
  then
    return false;
  end if;

  update public.orders
     set booster_id = p_booster_id, status = 'active', picked_at = now()
   where id = p_order_id and booster_id is null and status = 'pending';
  get diagnostics picked_rows = row_count;
  return picked_rows > 0;
end;
$$;

-- When an order is marked completed, credit the booster's completed_orders.
create or replace function public.on_order_completed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'completed' and coalesce(old.status,'') <> 'completed' and new.booster_id is not null then
    update public.profiles set completed_orders = completed_orders + 1 where id = new.booster_id;
    new.completed_at := coalesce(new.completed_at, now());
  end if;
  return new;
end;
$$;
drop trigger if exists trg_order_completed on public.orders;
create trigger trg_order_completed
  before update on public.orders
  for each row execute procedure public.on_order_completed();

-- ── messages: site-internal order chat ────────────────────────────
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  sender_id   uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('booster','customer')),
  content     text,
  image_url   text,
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);
alter table public.messages enable row level security;
create index if not exists messages_order_id_idx on public.messages(order_id);

-- Only the customer or booster of the parent order can read/send.
do $$ begin
  create policy "Order parties read messages"
    on public.messages for select to authenticated
    using (exists (
      select 1 from public.orders o
       where o.id = messages.order_id
         and (o.user_id = auth.uid() or o.booster_id = auth.uid())
    ));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Order parties send messages"
    on public.messages for insert to authenticated
    with check (
      sender_id = auth.uid()
      and exists (
        select 1 from public.orders o
         where o.id = messages.order_id
           and (o.user_id = auth.uid() or o.booster_id = auth.uid())
      )
    );
exception when duplicate_object then null; end $$;

-- Either party can mark messages read (set read_at).
do $$ begin
  create policy "Order parties update read state"
    on public.messages for update to authenticated
    using (exists (
      select 1 from public.orders o
       where o.id = messages.order_id
         and (o.user_id = auth.uid() or o.booster_id = auth.uid())
    ));
exception when duplicate_object then null; end $$;

-- Live updates for chat + order status.
do $$ begin alter publication supabase_realtime add table public.messages; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.orders;   exception when others then null; end $$;

-- ── Storage: booster-proofs (private) ─────────────────────────────
insert into storage.buckets (id, name, public)
values ('booster-proofs', 'booster-proofs', false)
on conflict (id) do nothing;

-- Writes restricted to the uploader (proof confidentiality).
do $$ begin
  create policy "Owner writes booster-proofs"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'booster-proofs' and owner = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Owner updates booster-proofs"
    on storage.objects for update to authenticated
    using (bucket_id = 'booster-proofs' and owner = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Owner deletes booster-proofs"
    on storage.objects for delete to authenticated
    using (bucket_id = 'booster-proofs' and owner = auth.uid());
exception when duplicate_object then null; end $$;
-- Reads allowed to any authenticated user: chat images must reach the
-- counterparty, and object keys are unguessable UUIDs behind auth + signed URLs.
do $$ begin
  create policy "Auth reads booster-proofs"
    on storage.objects for select to authenticated
    using (bucket_id = 'booster-proofs');
exception when duplicate_object then null; end $$;

-- ════════════════════════════════════════════════════════════════════
-- CHAT SYSTEM EXTENSION
-- Rich site-internal chat: flags, edits, reactions, pins, dedup, types,
-- admin moderation, tips, customer confirmation. Additive + idempotent.
-- ════════════════════════════════════════════════════════════════════

-- ── messages: rich chat columns ──────────────────────────────────
alter table public.messages add column if not exists flagged      boolean not null default false;
alter table public.messages add column if not exists flag_reason  text;
alter table public.messages add column if not exists edited_at    timestamptz;
alter table public.messages add column if not exists deleted_at   timestamptz;
alter table public.messages add column if not exists reactions    jsonb not null default '{}'::jsonb;
alter table public.messages add column if not exists pinned       boolean not null default false;
alter table public.messages add column if not exists client_id    text;
alter table public.messages add column if not exists message_type text not null default 'user';

-- Allow admin- and system-authored messages.
alter table public.messages drop constraint if exists messages_sender_role_check;
alter table public.messages add constraint messages_sender_role_check
  check (sender_role in ('booster','customer','admin','system'));

-- Offline-queue dedup: one row per client_id within an order.
create unique index if not exists messages_order_client_idx
  on public.messages(order_id, client_id) where client_id is not null;

-- Admins read/moderate every conversation (flagged-message review).
do $$ begin
  create policy "Admins read all messages"
    on public.messages for select to authenticated
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Admins send messages"
    on public.messages for insert to authenticated
    with check (sender_id = auth.uid()
      and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;

-- ── orders: tip + customer confirmation ──────────────────────────
alter table public.orders add column if not exists tip_amount numeric(10,2) not null default 0;
alter table public.orders add column if not exists customer_confirmed_at timestamptz;

-- Allow customers to place their own orders
do $$ begin
  create policy "Customers can insert own orders"
    on public.orders for insert to authenticated
    with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ════════════════════════════════════════════════════════════════════
-- CHAT WIDGET EXTENSION
-- Support requests, voluntary tips, preferred boosters, and order-less
-- support chat. Additive + idempotent.
-- ════════════════════════════════════════════════════════════════════

-- ── profiles: preferred boosters ──────────────────────────────────
alter table public.profiles add column if not exists preferred_boosters uuid[] not null default '{}';

-- ── support_requests ──────────────────────────────────────────────
create table if not exists public.support_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete set null,
  type        text not null check (type in (
                'change_booster','refund','eta_update','urgent','schedule',
                'preferred_booster','report','external_payment_report')),
  reason      text,
  status      text not null default 'open' check (status in ('open','reviewing','resolved','rejected')),
  urgent      boolean not null default false,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);
alter table public.support_requests enable row level security;
create index if not exists support_requests_user_idx   on public.support_requests(user_id);
create index if not exists support_requests_status_idx on public.support_requests(status);

do $$ begin
  create policy "Users read own support requests"
    on public.support_requests for select to authenticated
    using (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Users create own support requests"
    on public.support_requests for insert to authenticated
    with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Admins manage support requests"
    on public.support_requests for all to authenticated
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;

-- ── tips (voluntary, 80% booster / 20% platform) ──────────────────
create table if not exists public.tips (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  customer_id     uuid not null references auth.users(id) on delete cascade,
  booster_id      uuid references public.profiles(id) on delete set null,
  amount          numeric(10,2) not null check (amount >= 1),
  booster_amount  numeric(10,2) not null default 0,
  platform_amount numeric(10,2) not null default 0,
  flagged         boolean not null default false,
  created_at      timestamptz not null default now()
);
alter table public.tips enable row level security;
create index if not exists tips_order_idx   on public.tips(order_id);
create index if not exists tips_booster_idx on public.tips(booster_id);

do $$ begin
  create policy "Customers create own tips"
    on public.tips for insert to authenticated
    with check (customer_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Customers read own tips"
    on public.tips for select to authenticated
    using (customer_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Boosters read tips for them"
    on public.tips for select to authenticated
    using (booster_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ── messages: order-less support conversations ────────────────────
-- Support chat is not tied to an order. order_id becomes nullable and a
-- support_user_id identifies the customer the support thread belongs to.
alter table public.messages alter column order_id drop not null;
alter table public.messages add column if not exists support_user_id uuid references auth.users(id) on delete cascade;
create index if not exists messages_support_user_idx on public.messages(support_user_id) where order_id is null;

do $$ begin
  create policy "Users read own support messages"
    on public.messages for select to authenticated
    using (order_id is null and support_user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Users send own support messages"
    on public.messages for insert to authenticated
    with check (order_id is null and support_user_id = auth.uid() and sender_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Users mark own support messages read"
    on public.messages for update to authenticated
    using (order_id is null and support_user_id = auth.uid());
exception when duplicate_object then null; end $$;
-- Admin read/send policies above already cover order-less support messages.

-- Live updates for support requests.
do $$ begin alter publication supabase_realtime add table public.support_requests; exception when others then null; end $$;
