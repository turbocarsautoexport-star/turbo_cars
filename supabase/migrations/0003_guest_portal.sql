-- Guest/customer self-service portal: news, offers already existed (0001),
-- adds containers (public shipment status board), orders (secret-code
-- tracking, same access pattern as support_chats — no direct anon table
-- access, only via the track_order RPC), and site_settings (terms text +
-- FX buffer, editable from the panel).

-- ---------------------------------------------------------------------------
-- news — company announcements shown on the guest portal
-- ---------------------------------------------------------------------------
create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.news enable row level security;

create policy "anyone can read news" on public.news for select to anon, authenticated using (true);
create policy "workers can manage news" on public.news for all to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()))
  with check (exists (select 1 from public.worker_profiles where id = auth.uid()));

-- ---------------------------------------------------------------------------
-- containers — shipment tracking, public-safe subset (no cost/price fields)
-- ---------------------------------------------------------------------------
create table public.containers (
  id uuid primary key default gen_random_uuid(),
  container_number text,
  origin_port text not null,
  destination_port text not null,
  departure_date date,
  arrival_date date,
  vessel_name text,
  voyage_number text,
  customs_status text not null default 'pending' check (customs_status in ('pending', 'filed', 'in_progress', 'held', 'cleared')),
  status text not null default 'preparing' check (status in ('preparing', 'in_transit', 'arrived', 'cleared')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.containers enable row level security;

create policy "anyone can read containers" on public.containers for select to anon, authenticated using (true);
create policy "workers can manage containers" on public.containers for all to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()))
  with check (exists (select 1 from public.worker_profiles where id = auth.uid()));

-- ---------------------------------------------------------------------------
-- orders — "track my order" by a secret code, staff-assigned per customer.
-- Same pattern as support_chats: no anon table grants, RPC-only access.
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  tracking_code text not null unique,
  guest_name text not null,
  car_id uuid references public.cars (id) on delete set null,
  container_id uuid references public.containers (id) on delete set null,
  status_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "workers can manage orders" on public.orders for all to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()))
  with check (exists (select 1 from public.worker_profiles where id = auth.uid()));
-- No anon policy: guests only ever go through track_order() below.

create function public.track_order(p_tracking_code text)
returns table (
  guest_name text,
  status_note text,
  updated_at timestamptz,
  car_model text,
  car_year int,
  car_status text,
  container_status text,
  container_origin_port text,
  container_destination_port text,
  container_departure_date date,
  container_arrival_date date,
  container_vessel_name text
)
language plpgsql
security definer set search_path = public
as $$
begin
  return query
    select
      o.guest_name, o.status_note, o.updated_at,
      c.model, c.year, c.status,
      ct.status, ct.origin_port, ct.destination_port, ct.departure_date, ct.arrival_date, ct.vessel_name
    from orders o
    left join cars c on c.id = o.car_id
    left join containers ct on ct.id = o.container_id
    where o.tracking_code = upper(trim(p_tracking_code));
end;
$$;

grant execute on function public.track_order(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- site_settings — small key/value store (terms text, FX buffer, etc.)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  key text primary key,
  value text not null default ''
);

alter table public.site_settings enable row level security;

create policy "anyone can read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "workers can manage settings" on public.site_settings for all to authenticated
  using (exists (select 1 from public.worker_profiles where id = auth.uid()))
  with check (exists (select 1 from public.worker_profiles where id = auth.uid()));

insert into public.site_settings (key, value) values
  ('terms_content', 'Shartlar va qoidalar matni hali kiritilmagan.'),
  ('fx_buffer', '0');
