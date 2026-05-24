-- Zelvra: initial schema.
-- Single-user mode for now: RLS is enabled but policies are permissive so the
-- anon key can read/write. When auth lands, tighten the policies to
-- `auth.uid() = owner_id` and add an owner_id column.

create extension if not exists "pgcrypto";

create table if not exists public.sources (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('web', 'rss', 'social', 'paste', 'api')),
  url         text not null,
  label       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.signals (
  id           uuid primary key default gen_random_uuid(),
  source_id    uuid not null references public.sources(id) on delete cascade,
  observed_at  timestamptz not null default now(),
  content      text not null,
  url          text,
  hash         text not null,
  metadata     jsonb,
  unique (source_id, hash)
);

create index if not exists signals_observed_at_idx on public.signals (observed_at desc);
create index if not exists signals_source_id_idx   on public.signals (source_id);

alter table public.sources enable row level security;
alter table public.signals enable row level security;

drop policy if exists "sources_all" on public.sources;
create policy "sources_all" on public.sources for all using (true) with check (true);

drop policy if exists "signals_all" on public.signals;
create policy "signals_all" on public.signals for all using (true) with check (true);
