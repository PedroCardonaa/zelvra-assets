-- Track per-source fetch health so the /sources page can show a status badge
-- without having to query the signals table.

alter table public.sources
  add column if not exists last_fetched_at timestamptz,
  add column if not exists last_error      text;
