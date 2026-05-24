import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { IngestResult, NewSignal, Source } from "./types";

const MAX_CONTENT_BYTES = 64_000;

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

async function fetchSource(source: Source): Promise<string> {
  const res = await fetch(source.url, {
    redirect: "follow",
    headers: { "user-agent": "zelvra-monitor/0.1" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

export async function runIngestion(sources: Source[]): Promise<IngestResult> {
  const result: IngestResult = { fetched: 0, inserted: 0, skipped: 0, errors: [] };
  if (sources.length === 0) return result;

  const supabase = createAdminClient();

  for (const source of sources) {
    try {
      const body = await fetchSource(source);
      result.fetched += 1;

      const hash = sha256(body);
      const content = body.length > MAX_CONTENT_BYTES ? body.slice(0, MAX_CONTENT_BYTES) : body;

      const signal: NewSignal = {
        source_id: source.id,
        content,
        url: source.url,
        hash,
        metadata: { bytes: body.length },
      };

      const { data, error } = await supabase
        .from("signals")
        .upsert(signal, { onConflict: "source_id,hash", ignoreDuplicates: true })
        .select("id");

      if (error) throw new Error(error.message);
      if (data && data.length > 0) result.inserted += 1;
      else result.skipped += 1;
    } catch (err) {
      result.errors.push({
        sourceId: source.id,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}
