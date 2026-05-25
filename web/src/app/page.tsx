import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Signal, Source, SourceKind } from "@/lib/osint/types";
import { SubmitButton } from "@/components/submit-button";
import { DashboardFilters } from "@/components/dashboard-filters";
import { SignalCard } from "@/components/signal-card";
import { RadarIllustration } from "@/components/radar-illustration";
import { runIngestionNow } from "./actions";

export const dynamic = "force-dynamic";

type SignalWithSource = Signal & {
  sources: Pick<Source, "id" | "label" | "kind" | "url"> | null;
};

const KINDS: SourceKind[] = ["web", "rss", "social", "paste", "api"];

const SAMPLE_SOURCES = [
  { label: "Hacker News front page", url: "https://news.ycombinator.com" },
  { label: "GitHub trending", url: "https://github.com/trending" },
  { label: "A status page", url: "https://www.githubstatus.com" },
];

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
  const hasSources = sources.length > 0;

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10 max-w-5xl mx-auto w-full">
      <section className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Scope · last 50{hasFilters ? " (filtered)" : ""}
          </span>
          <h1 className="font-display text-[2rem] leading-tight tracking-tight">
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

      {signals.length === 0 ? (
        <EmptyState hasFilters={hasFilters} hasSources={hasSources} />
      ) : (
        <ul className="flex flex-col gap-2">
          {signals.map((s) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </ul>
      )}
    </main>
  );
}

function EmptyState({
  hasFilters,
  hasSources,
}: {
  hasFilters: boolean;
  hasSources: boolean;
}) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 px-6 border border-dashed border-[color:var(--border)] rounded fade-up">
        <p className="text-sm text-[color:var(--muted)]">
          No contacts match these filters.
        </p>
        <Link
          href="/"
          className="px-3 py-1.5 rounded border border-[color:var(--border-strong)] font-mono text-[10px] uppercase tracking-widest text-[color:var(--foreground)] hover:bg-[color:var(--background-elev)] transition-colors"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-6 py-16 px-6 fade-up">
      <RadarIllustration size={200} />
      <div className="flex flex-col gap-2 max-w-md">
        <h2 className="font-display text-2xl tracking-tight">
          The scope is clear.
        </h2>
        <p className="text-sm text-[color:var(--muted)] leading-relaxed">
          {hasSources
            ? "Sources are configured but nothing has been captured yet. Trigger a sweep to get the first contact, or wait for the next cron tick."
            : "Add your first source to start tracking. Zelvra will fetch, dedupe, diff, and summarize automatically."}
        </p>
      </div>
      {!hasSources && (
        <>
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
              Try one of these
            </span>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {SAMPLE_SOURCES.map((s) => (
                <Link
                  key={s.url}
                  href={`/sources?suggest=${encodeURIComponent(s.url)}`}
                  className="px-3 py-1.5 rounded border border-[color:var(--border)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] text-xs font-mono text-[color:var(--muted)] transition-colors"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/sources"
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded bg-[color:var(--accent)] text-black font-mono text-xs uppercase tracking-widest hover:bg-[color:var(--accent-dim)] hover:text-white transition-colors shadow-[0_0_18px_var(--accent-glow)]"
          >
            Add a source →
          </Link>
        </>
      )}
    </div>
  );
}
