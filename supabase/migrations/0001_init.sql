-- Turbo Cars platform — initial schema (Phase 1)
-- Covers: worker auth/roles, cars (export catalog), auctions/bids, ads/offers/reviews,
-- and a support-chat system (guest widget <-> workers panel).
--
-- Guest access to support_chats/support_messages is intentionally NOT granted via
-- direct table RLS (that would let anyone with the public anon key enumerate every
-- support ticket). Instead, guests only ever go through the SECURITY DEFINER RPC
-- functions at the bottom of this file, gated by the high-entropy ticket_code.
-- Staff (authenticated, present in worker_profiles) get normal table access + Realtime.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto; -- gen_random_uuid(), gen_random_bytes()

-- ---------------------------------------------------------------------------
-- worker_profiles — one row per staff member, keyed to auth.users
-- ---------------------------------------------------------------------------
create table public.worker_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role text not null default 'worker' check (role in ('admin', 'worker')),
  permissions jsonb not null default '{}'::jsonb,
  phone text,
  photo_url text,
  created_at timestamptz not null default now()
);

alter table public.worker_profiles enable row level security;

create policy "workers can read all profiles"
  on public.worker_profiles for select
  to authenticated
  using (true);

create policy "workers can update their own profile"
  on public.worker_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "admins can manage all profiles"
  on public.worker_profiles for all
  to authenticated
  using (exists (select 1 from public.worker_profiles wp where wp.id = auth.uid() and wp.role = 'admin'))
  with check (exists (select 1 from public.worker_profiles wp where wp.id = auth.uid() and wp.role = 'admin'));

-- Auto-create a worker_profiles row whenever a new auth user is created.
-- The very first worker ever created becomes admin; everyone after is a worker
-- (the admin promotes/adjusts permissions afterwards from the Team page).
create function public.handle_new_worker()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.worker_profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case when exists (select 1 from public.worker_profiles) then 'worker' else 'admin' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_worker();

-- ---------------------------------------------------------------------------
-- cars — export/auction inventory
-- ---------------------------------------------------------------------------
create table public.cars (
  id uuid primary key default gen_random_uuid(),
  model text not null,
  year int not null,
  photos text[] not null default '{}',
  status text not null default 'in_stock' check (status in ('in_stock', 'transit', 'sold')),
  category text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cars enable row level security;

create policy "anyone can read cars" on public.cars for select to anon, authenticated using (true);
create policy "workers can manage cars" on public.cars for all to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()))
  with check (exists (select 1 from public.worker_profiles where id = auth.uid()));

-- ---------------------------------------------------------------------------
-- auctions + bids + access_codes
-- ---------------------------------------------------------------------------
create table public.auctions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  brand text not null,
  year int not null,
  mileage_km int not null default 0,
  transmission text not null check (transmission in ('Avtomat', 'Mexanika')),
  fuel text not null check (fuel in ('Benzin', 'Dizel', 'Gibrid', 'Elektr')),
  city text not null,
  description text not null default '',
  accent int not null default 0,
  start_price numeric not null,
  current_price numeric not null,
  bid_step numeric not null,
  currency text not null default 'so''m',
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'live', 'ended')),
  winner_name text,
  reserve_price numeric,
  requires_deposit boolean not null default false,
  deposit_amount numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.auctions enable row level security;

create policy "anyone can read auctions" on public.auctions for select to anon, authenticated using (true);
create policy "workers can manage auctions" on public.auctions for all to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()))
  with check (exists (select 1 from public.worker_profiles where id = auth.uid()));

create table public.bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  bidder_name text not null,
  amount numeric not null,
  created_at timestamptz not null default now()
);

alter table public.bids enable row level security;

create policy "anyone can read bids" on public.bids for select to anon, authenticated using (true);
create policy "anyone can place a valid bid" on public.bids for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.auctions a
      where a.id = auction_id
        and a.status = 'live'
        and now() between a.start_at and a.end_at
        and amount >= a.current_price + a.bid_step
    )
  );
create policy "workers can manage bids" on public.bids for delete to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()));

-- Keep auctions.current_price in sync with the highest bid even if a client
-- forgets to update it (defense in depth alongside the app-level update).
create function public.sync_auction_current_price()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.auctions set current_price = new.amount where id = new.auction_id;
  return new;
end;
$$;

create trigger on_bid_insert_sync_price
  after insert on public.bids
  for each row execute function public.sync_auction_current_price();

create table public.access_codes (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  code text not null,
  holder_name text,
  created_at timestamptz not null default now(),
  redeemed_at timestamptz
);

alter table public.access_codes enable row level security;

create policy "workers can manage access codes" on public.access_codes for all to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()))
  with check (exists (select 1 from public.worker_profiles where id = auth.uid()));

-- Anyone may attempt to redeem a code (checked/updated via the redeem_access_code RPC below),
-- but codes themselves are never listable by anon.

-- ---------------------------------------------------------------------------
-- ads / offers / reviews — public marketing content, managed from the panel
-- ---------------------------------------------------------------------------
create table public.ads (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('news', 'rates', 'containers', 'track', 'offers', 'catalog', 'reviews', 'sold', 'support', 'home', 'eksport', 'auksionlar')),
  placement text not null check (placement in ('top', 'island', 'split')),
  size text check (size in ('portrait', 'square', 'story')),
  accent text not null default 'red' check (accent in ('red', 'dark', 'gradient')),
  body text not null,
  cta_label text,
  start_date date,
  end_date date,
  media jsonb not null default '[]'::jsonb,
  clicks int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ads enable row level security;

create policy "anyone can read ads" on public.ads for select to anon, authenticated using (true);
create policy "workers can manage ads" on public.ads for all to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()))
  with check (exists (select 1 from public.worker_profiles where id = auth.uid()));

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  discount_text text,
  description text,
  publish_date date not null default current_date,
  valid_until date,
  created_at timestamptz not null default now()
);

alter table public.offers enable row level security;

create policy "anyone can read offers" on public.offers for select to anon, authenticated using (true);
create policy "workers can manage offers" on public.offers for all to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()))
  with check (exists (select 1 from public.worker_profiles where id = auth.uid()));

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  body text not null,
  photo_url text,
  pending boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "anyone can read approved reviews" on public.reviews for select to anon using (pending = false);
create policy "workers can read all reviews" on public.reviews for select to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()));
create policy "anyone can submit a review" on public.reviews for insert to anon, authenticated with check (pending = true);
create policy "workers can update reviews" on public.reviews for update to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()))
  with check (exists (select 1 from public.worker_profiles where id = auth.uid()));
create policy "workers can delete reviews" on public.reviews for delete to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()));

-- ---------------------------------------------------------------------------
-- support_chats / support_messages — see header note: no direct anon grants.
-- ---------------------------------------------------------------------------
create table public.support_chats (
  id uuid primary key default gen_random_uuid(),
  ticket_code text not null unique,
  guest_name text not null,
  status text not null default 'open' check (status in ('open', 'claimed', 'closed')),
  claimed_by uuid references public.worker_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  satisfaction int check (satisfaction between 1 and 5)
);

alter table public.support_chats enable row level security;

create policy "workers can read all tickets" on public.support_chats for select to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()));
create policy "workers can update tickets" on public.support_chats for update to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()))
  with check (exists (select 1 from public.worker_profiles where id = auth.uid()));
-- No insert/select policy for anon: creation happens only via create_support_ticket() below.

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.support_chats (id) on delete cascade,
  sender text not null check (sender in ('guest', 'staff')),
  body text not null,
  attachment_url text,
  created_at timestamptz not null default now()
);

alter table public.support_messages enable row level security;

create policy "workers can read all messages" on public.support_messages for select to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()));
create policy "workers can reply to unclaimed or own tickets" on public.support_messages for insert to authenticated
  with check (
    sender = 'staff'
    and exists (select 1 from public.worker_profiles where id = auth.uid())
    and exists (
      select 1 from public.support_chats c
      where c.id = chat_id and (c.claimed_by is null or c.claimed_by = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Guest-facing RPCs (SECURITY DEFINER — the only way anon touches support_* tables)
-- ---------------------------------------------------------------------------
create function public.create_support_ticket(p_guest_name text, p_message text)
returns table (chat_id uuid, ticket_code text)
language plpgsql
security definer set search_path = public
as $$
declare
  v_chat_id uuid;
  v_code text;
begin
  v_code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10));

  insert into support_chats (ticket_code, guest_name)
  values (v_code, trim(p_guest_name))
  returning id into v_chat_id;

  insert into support_messages (chat_id, sender, body)
  values (v_chat_id, 'guest', trim(p_message));

  return query select v_chat_id, v_code;
end;
$$;

grant execute on function public.create_support_ticket(text, text) to anon, authenticated;

create function public.get_support_ticket(p_ticket_code text)
returns table (
  chat_id uuid,
  status text,
  claimed_by_name text,
  created_at timestamptz,
  closed_at timestamptz,
  messages jsonb
)
language plpgsql
security definer set search_path = public
as $$
begin
  return query
    select
      c.id,
      c.status,
      w.name,
      c.created_at,
      c.closed_at,
      coalesce(
        (select jsonb_agg(jsonb_build_object(
            'id', m.id, 'sender', m.sender, 'body', m.body,
            'attachmentUrl', m.attachment_url, 'createdAt', m.created_at
          ) order by m.created_at)
         from support_messages m where m.chat_id = c.id),
        '[]'::jsonb
      )
    from support_chats c
    left join worker_profiles w on w.id = c.claimed_by
    where c.ticket_code = upper(trim(p_ticket_code));
end;
$$;

grant execute on function public.get_support_ticket(text) to anon, authenticated;

create function public.send_guest_message(p_ticket_code text, p_body text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_chat_id uuid;
  v_status text;
begin
  select id, status into v_chat_id, v_status
  from support_chats where ticket_code = upper(trim(p_ticket_code));

  if v_chat_id is null then
    raise exception 'invalid ticket code';
  end if;
  if v_status = 'closed' then
    raise exception 'ticket is closed';
  end if;

  insert into support_messages (chat_id, sender, body)
  values (v_chat_id, 'guest', trim(p_body));
end;
$$;

grant execute on function public.send_guest_message(text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- redeem_access_code — lets a guest redeem a deposit access code without
-- ever being able to list codes directly.
-- ---------------------------------------------------------------------------
create function public.redeem_access_code(p_auction_id uuid, p_code text)
returns text -- 'ok' | 'invalid' | 'used'
language plpgsql
security definer set search_path = public
as $$
declare
  v_id uuid;
  v_redeemed timestamptz;
begin
  select id, redeemed_at into v_id, v_redeemed
  from access_codes
  where auction_id = p_auction_id and code = upper(trim(p_code));

  if v_id is null then
    return 'invalid';
  end if;
  if v_redeemed is not null then
    return 'used';
  end if;

  update access_codes set redeemed_at = now() where id = v_id;
  return 'ok';
end;
$$;

grant execute on function public.redeem_access_code(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: let the panel subscribe to live changes on staff-facing tables.
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.bids;
alter publication supabase_realtime add table public.auctions;
alter publication supabase_realtime add table public.support_chats;
alter publication supabase_realtime add table public.support_messages;
