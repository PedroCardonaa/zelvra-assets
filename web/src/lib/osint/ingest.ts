import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { summarizeSignal, explainDiff } from "./ai";
import { notifyNewSignal } from "./notify";
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
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  for (const source of sources) {
    try {
      const body = await fetchSource(source);
      result.fetched += 1;

      const hash = sha256(body);
      const content = body.length > MAX_CONTENT_BYTES ? body.slice(0, MAX_CONTENT_BYTES) : body;

      // Fetch the previous signal (if any) so we can diff + explain change.
      const { data: prevRows } = await supabase
        .from("signals")
        .select("id, content")
        .eq("source_id", source.id)
        .order("observed_at", { ascending: false })
        .limit(1);
      const previous = prevRows?.[0] ?? null;

      const signal: NewSignal = {
        source_id: source.id,
        content,
        url: source.url,
        hash,
        metadata: { bytes: body.length },
      };

      const { data: inserted, error } = await supabase
        .from("signals")
        .upsert(signal, { onConflict: "source_id,hash", ignoreDuplicates: true })
        .select("id, observed_at");

      if (error) throw new Error(error.message);

      if (!inserted || inserted.length === 0) {
        result.skipped += 1;
        continue;
      }
      result.inserted += 1;
      const inserted0 = inserted[0] as { id: string; observed_at: string };

      // AI summary + change explanation run in parallel and are best-effort.
      const [summary, changeSummary] = await Promise.all([
        summarizeSignal(content),
        previous ? explainDiff(previous.content, content) : Promise.resolve(null),
      ]);

      if (summary || changeSummary) {
        await supabase
          .from("signals")
          .update({ summary, change_summary: changeSummary })
          .eq("id", inserted0.id);
      }

      await notifyNewSignal({
        signal: {
          id: inserted0.id,
          content,
          observed_at: inserted0.observed_at,
          summary,
          change_summary: changeSummary,
        },
        source: { label: source.label, kind: source.kind, url: source.url },
        appUrl,
      });
    } catch (err) {
      result.errors.push({
        sourceId: source.id,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}
