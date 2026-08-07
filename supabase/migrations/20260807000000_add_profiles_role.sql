-- Adds an admin/member role to profiles so panel-server can authorize
-- Minecraft server power actions. No RLS exists on profiles yet; this
-- migration only adds the column. Apply via the Supabase Studio SQL editor
-- (no linked project/CLI in this repo yet) or `supabase db push` once linked.

alter table profiles
  add column role text not null default 'member' check (role in ('member', 'admin'));

-- Bootstrap the first admin by hand after this runs, e.g.:
-- update profiles set role = 'admin' where discord_id = '<your discord id>';
