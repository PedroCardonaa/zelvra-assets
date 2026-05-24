export type SourceKind = "web" | "rss" | "social" | "paste" | "api";

export type Source = {
  id: string;
  kind: SourceKind;
  url: string;
  label: string | null;
  created_at: string;
  last_fetched_at: string | null;
  last_error: string | null;
};

export type Signal = {
  id: string;
  source_id: string;
  observed_at: string;
  content: string;
  url: string | null;
  hash: string;
  metadata: Record<string, unknown> | null;
  summary: string | null;
  change_summary: string | null;
};

export type NewSignal = Omit<Signal, "id" | "observed_at" | "summary" | "change_summary"> & {
  observed_at?: string;
};

export type IngestResult = {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: { sourceId: string; message: string }[];
};
