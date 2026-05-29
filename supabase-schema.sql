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
