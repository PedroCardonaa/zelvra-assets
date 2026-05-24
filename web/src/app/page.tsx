import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Signal, Source, SourceKind } from "@/lib/osint/types";
import { SubmitButton } from "@/components/submit-button";
import { DashboardFilters } from "@/components/dashboard-filters";
import { runIngestionNow } from "./actions";

export const dynamic = "force-dynamic";

type SignalWithSource = Signal & {
  sources: Pick<Source, "id" | "label" | "kind" | "url"> | null;
};

const KINDS: SourceKind[] = ["web", "rss", "social", "paste", "api"];

function formatTimestamp(iso: string): string {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 19) + "Z";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    kind?: string;
    source?: string;
    changes_only?: string;
  }>;
}) {
  const params = await searchParams;
  const kindFilter = KINDS.includes(params.kind as SourceKind)
    ? (params.kind as SourceKind)
    : undefined;
  const sourceFilter = params.source || undefined;
  const changesOnly = params.changes_only === "1";
  const q = params.q?.trim() || undefined;

  const supabase = createAdminClient();

  let query = supabase
    .from("signals")
    .select("*, sources!inner ( id, label, kind, url )")
    .order("observed_at", { ascending: false })
    .limit(50);

  if (sourceFilter) query = query.eq("source_id", sourceFilter);
  if (kindFilter) query = query.eq("sources.kind", kindFilter);
  if (changesOnly) {
    query = query
      .not("change_summary", "is", null)
      .not("change_summary", "ilike", "no material change%");
  }
  if (q) {
    const escaped = q.replace(/[%_]/g, (m) => `\\${m}`);
    const pattern = `%${escaped}%`;
    query = query.or(
      `content.ilike.${pattern},summary.ilike.${pattern},change_summary.ilike.${pattern}`,
    );
  }

  const [signalsResp, sourcesResp] = await Promise.all([
    query,
    supabase
      .from("sources")
      .select("id, label, url, kind")
      .order("created_at", { ascending: false }),
  ]);

  const signals = (signalsResp.data ?? []) as SignalWithSource[];
  const sources = (sourcesResp.data ?? []) as Pick<
    Source,
    "id" | "label" | "url" | "kind"
  >[];

  const hasFilters = !!(q || kindFilter || sourceFilter || changesOnly);

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10 max-w-5xl mx-auto w-full">
      <section className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Scope · last 50{hasFilters ? " (filtered)" : ""}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            Signal contacts
          </h1>
        </div>
        <form action={runIngestionNow}>
          <SubmitButton idle="Sweep now" pending="Sweeping…" variant="primary" />
        </form>
      </section>

      <DashboardFilters
        sources={sources}
        current={{
          q,
          kind: kindFilter ?? "",
          source: sourceFilter,
          changesOnly,
        }}
      />

      {signalsResp.error && (
        <p className="text-sm text-[color:var(--danger)]">
          Could not load signals: {signalsResp.error.message}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {signals.length === 0 && (
          <li className="p-6 text-sm text-[color:var(--muted)] border border-dashed border-[color:var(--border)] rounded text-center">
            {hasFilters ? (
              <>No contacts match these filters.</>
            ) : (
              <>
                No contacts yet. Add a source on{" "}
                <Link
                  href="/sources"
                  className="text-[color:var(--accent)] underline-offset-4 hover:underline"
                >
                  /sources
                </Link>
                {" "}and trigger a sweep.
              </>
            )}
          </li>
        )}
        {signals.map((s) => (
          <li
            key={s.id}
            className="p-3 rounded border border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--background-elev)]/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
              <span className="px-1.5 py-0.5 rounded bg-[color:var(--background-elev)] border border-[color:var(--border)] font-mono uppercase tracking-widest text-[10px] text-[color:var(--accent)]">
                {s.sources?.kind ?? "—"}
              </span>
              {s.sources ? (
                <Link
                  href={`/sources/${s.sources.id}`}
                  className="font-medium text-[color:var(--foreground)] truncate hover:text-[color:var(--accent)]"
                >
                  {s.sources.label ?? s.sources.url}
                </Link>
              ) : (
                <span className="font-medium text-[color:var(--muted)] truncate">
                  (deleted source)
                </span>
              )}
              <span className="ml-auto font-mono text-[10px]">
                {formatTimestamp(s.observed_at)}
              </span>
            </div>
            <Link href={`/signals/${s.id}`} className="block mt-2">
              {s.change_summary && (
                <p className="text-sm text-[color:var(--accent)] italic">
                  Δ {s.change_summary}
                </p>
              )}
              {s.summary ? (
                <p className="mt-1 text-sm text-[color:var(--foreground)]/90">
                  {s.summary}
                </p>
              ) : (
                <p className="mt-1 text-sm text-[color:var(--foreground)]/70 line-clamp-2 font-mono whitespace-pre-wrap break-words">
                  {s.content.slice(0, 240)}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
