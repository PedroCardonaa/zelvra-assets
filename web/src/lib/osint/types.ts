export type SourceKind = "web" | "rss" | "social" | "paste" | "api";

export type Source = {
  id: string;
  kind: SourceKind;
  url: string;
  label?: string;
};

// A normalized observation pulled from a source.
export type Signal = {
  sourceId: string;
  observedAt: string; // ISO timestamp
  content: string;
  url?: string;
  hash: string; // content hash for dedup
  metadata?: Record<string, unknown>;
};

export type IngestResult = {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: { sourceId: string; message: string }[];
};
