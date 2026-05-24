export type SourceKind = "web" | "rss" | "social" | "paste" | "api";

export type Source = {
  id: string;
  kind: SourceKind;
  url: string;
  label: string | null;
  created_at: string;
};

export type Signal = {
  id: string;
  source_id: string;
  observed_at: string;
  content: string;
  url: string | null;
  hash: string;
  metadata: Record<string, unknown> | null;
};

export type NewSignal = Omit<Signal, "id" | "observed_at"> & {
  observed_at?: string;
};

export type IngestResult = {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: { sourceId: string; message: string }[];
};
