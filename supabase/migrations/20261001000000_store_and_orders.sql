-- Store catalog + order tracking.
--
-- Flow: players join the Minecraft server directly; signing in (Discord via
-- Supabase Auth) is only needed to buy. A signed-in player submits an order
-- request, which is tracked through these statuses:
--
--   awaiting_quote   -> commissions only: staff price the request
--   awaiting_payment -> priced, waiting for the player to pay (manual for now)
--   paid             -> payment confirmed by staff
--   in_progress      -> being delivered / built
--   delivered        -> done
--   cancelled        -> closed without delivery
--
-- Prices live in store_items, never in the browser: the insert trigger copies
-- name/kind/price from the catalog, so a tampered request can't set its own
-- price. Only admins (profiles.role = 'admin') can change an order's status.
--
-- Apply via the Supabase Studio SQL editor, or `supabase db push` once linked.

-- ---------------------------------------------------------------------------
-- helpers

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

-- ---------------------------------------------------------------------------
-- catalog

create table if not exists public.store_items (
  key text primary key,
  kind text not null check (kind in ('rank', 'cosmetic', 'commission')),
  name text not null,
  description text not null default '',
  price_cents integer check (price_cents is null or price_cents >= 0), -- null = quoted per order
  perks text[] not null default '{}',
  sort integer not null default 0,
  active boolean not null default true
);

alter table public.store_items enable row level security;

create policy "store items are public"
  on public.store_items for select
  using (active or public.is_admin());

create policy "admins manage store items"
  on public.store_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- Placeholder catalog: rename, reprice and add items here (or in Studio).
insert into public.store_items (key, kind, name, description, price_cents, perks, sort) values
  ('rank-settler',   'rank', 'Settler',   'A first step up for regulars.',              499,  array['Colored name in chat', 'Two extra homes', '/hat'], 10),
  ('rank-vanguard',  'rank', 'Vanguard',  'More room to build and trade.',              999,  array['Everything in Settler', 'Five extra homes', 'Extra player shop slot'], 20),
  ('rank-architect', 'rank', 'Architect', 'The full set of perks.',                     1999, array['Everything in Vanguard', 'Ten extra homes', 'Priority queue', 'Exclusive cosmetic set'], 30),
  ('cos-trail-pack', 'cosmetic', 'Particle trail pack', 'Three trails that follow you around the colony.', 299, '{}', 110),
  ('cos-crate-keys', 'cosmetic', 'Crate keys (x5)',     'Five keys for the cosmetic crates at spawn.',     399, '{}', 120),
  ('cos-pet-drone',  'cosmetic', 'Companion drone',     'A small drone pet that hovers beside you.',       599, '{}', 130),
  ('com-minecraft-skins', 'commission', 'Minecraft Skins', 'Player skins tailored to your character, from simple retextures to full overhauls.', null, '{}', 210),
  ('com-custom-items',    'commission', 'Custom Items',    'One-off item models built to spec for quests, cosmetics, or server events.',      null, '{}', 220),
  ('com-custom-tools',    'commission', 'Custom Tools',    'Bespoke tool sets with matching CustomModelData.',                                 null, '{}', 230),
  ('com-furnitures',      'commission', 'Furnitures',      'Functional furniture models: seating, storage, and decor.',                        null, '{}', 240),
  ('com-plushies',        'commission', 'Plushies',        'Soft, low-poly companion models for spawn rooms and player lounges.',              null, '{}', 250),
  ('com-tools',           'commission', 'Tools',           'Pickaxes, hoes, and shears built for utility without sacrificing style.',         null, '{}', 260),
  ('com-gliders',         'commission', 'Gliders',         'Custom elytra reskins.',                                                            null, '{}', 270),
  ('com-weapons',         'commission', 'Weapons',         'Blades, scythes, and sidearms for combat and boss events.',                        null, '{}', 280),
  ('com-building',        'commission', 'Building',        'Tool and block models for large-scale construction.',                              null, '{}', 290),
  ('com-characters',      'commission', 'Characters',      'Fully rigged humanoid and mob models.',                                            null, '{}', 300)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- orders

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_key text not null references public.store_items (key),
  item_name text not null,
  kind text not null,
  quantity integer not null default 1 check (quantity between 1 and 99),
  price_cents integer,          -- unit price at order time (null until quoted)
  minecraft_username text,
  notes text check (char_length(notes) <= 2000),
  status text not null default 'awaiting_payment'
    check (status in ('awaiting_quote', 'awaiting_payment', 'paid', 'in_progress', 'delivered', 'cancelled')),
  staff_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_created_at on public.orders (user_id, created_at desc);

create table if not exists public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_id on public.order_events (order_id, created_at);

-- On insert: stamp owner, code, catalog name/kind/price and the starting status
-- server-side, ignoring whatever the client sent for those fields.
create or replace function public.orders_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item store_items;
begin
  select * into item from store_items where key = new.item_key and active;
  if not found then
    raise exception 'Unknown or inactive store item: %', new.item_key;
  end if;

  if item.kind in ('rank', 'cosmetic') and coalesce(trim(new.minecraft_username), '') = '' then
    raise exception 'A Minecraft username is required for in-game purchases';
  end if;

  new.user_id := auth.uid();
  new.code := 'EDN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  new.item_name := item.name;
  new.kind := item.kind;
  new.price_cents := item.price_cents;
  new.quantity := case when item.kind = 'rank' then 1 else new.quantity end;
  new.status := case when item.price_cents is null then 'awaiting_quote' else 'awaiting_payment' end;
  new.staff_note := null;
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;

create trigger orders_before_insert
  before insert on public.orders
  for each row execute function public.orders_before_insert();

-- Record the timeline: one event on creation, one per status change.
create or replace function public.orders_log_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into order_events (order_id, status) values (new.id, new.status);
  elsif new.status is distinct from old.status then
    new.updated_at := now();
    insert into order_events (order_id, status, note) values (new.id, new.status, new.staff_note);
  end if;
  return new;
end;
$$;

create trigger orders_log_event_insert
  after insert on public.orders
  for each row execute function public.orders_log_event();

create trigger orders_log_event_update
  before update on public.orders
  for each row execute function public.orders_log_event();

alter table public.orders enable row level security;
alter table public.order_events enable row level security;

create policy "players see their own orders"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

create policy "signed-in players place orders"
  on public.orders for insert
  with check (auth.uid() is not null);

create policy "admins update orders"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "players see their own order events"
  on public.order_events for select
  using (
    public.is_admin()
    or exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- live tracking updates in the browser (RLS still applies to realtime)
alter publication supabase_realtime add table public.orders, public.order_events;
