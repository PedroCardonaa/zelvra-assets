import type { IngestResult, Signal, Source } from "./types";

// Pulls from sources, normalizes to Signals, persists. Stub until the Python
// scraper and Supabase schema are wired in.
export async function runIngestion(_sources: Source[]): Promise<IngestResult> {
  return { fetched: 0, inserted: 0, skipped: 0, errors: [] };
}

export async function persistSignals(_signals: Signal[]): Promise<number> {
  return 0;
}
