-- AI-generated summaries for each signal.
-- summary: one-sentence digest of the content as captured.
-- change_summary: one-sentence digest of what changed vs the previous signal
--                 from the same source (null when there's no predecessor).

alter table public.signals
  add column if not exists summary        text,
  add column if not exists change_summary text;
