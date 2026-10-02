-- Site images managed from the staff panel (/admin -> Images).
--
-- Files live in the public `site-media` storage bucket; this table holds which
-- section each image belongs to, its order, alt text and visibility. Anyone
-- can read visible images, only admins (profiles.role = 'admin') can upload,
-- edit or delete. Requires public.is_admin() from the store_and_orders
-- migration.
--
-- Apply via the Supabase Studio SQL editor, or `supabase db push` once linked.

create table if not exists public.site_media (
  id uuid primary key default gen_random_uuid(),
  section text not null default 'featured',   -- e.g. 'featured' = Models page showcase
  path text not null unique,                   -- object path inside the site-media bucket
  alt text not null default '',
  sort integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists site_media_section_sort on public.site_media (section, sort);

alter table public.site_media enable row level security;

create policy "visible site media is public"
  on public.site_media for select
  using (visible or public.is_admin());

create policy "admins manage site media"
  on public.site_media for all
  using (public.is_admin())
  with check (public.is_admin());

-- storage bucket: public reads, admin-only writes
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "admins upload site media"
  on storage.objects for insert
  with check (bucket_id = 'site-media' and public.is_admin());

create policy "admins update site media"
  on storage.objects for update
  using (bucket_id = 'site-media' and public.is_admin());

create policy "admins delete site media"
  on storage.objects for delete
  using (bucket_id = 'site-media' and public.is_admin());

-- live updates on the Models page when staff change images
alter publication supabase_realtime add table public.site_media;
