import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLineDiff, summarizeDiff } from "@/lib/osint/diff";
import type { Signal, Source } from "@/lib/osint/types";

export const dynamic = "force-dynamic";

const SIGNAL_LIMIT = 100;

function formatTimestamp(iso: string): string {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 19) + "Z";
}

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function SourceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: sourceRow, error: sourceError }, { data: signalRows }] =
    await Promise.all([
      supabase.from("sources").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("signals")
        .select("id, observed_at, content, summary, change_summary")
        .eq("source_id", id)
        .order("observed_at", { ascending: false })
        .limit(SIGNAL_LIMIT),
    ]);

  if (sourceError) {
    return (
      <main className="flex flex-1 flex-col gap-4 px-6 py-10 max-w-4xl mx-auto w-full">
        <p className="text-sm text-[color:var(--danger)]">
          Error: {sourceError.message}
        </p>
      </main>
    );
  }
  if (!sourceRow) notFound();
  const source = sourceRow as Source;
  const signals = (signalRows ?? []) as Pick<
    Signal,
    "id" | "observed_at" | "content" | "summary" | "change_summary"
  >[];

  // Diff stats per row: each signal[i] vs signal[i+1] (older).
  const stats = signals.map((s, i) => {
    const older = signals[i + 1];
    if (!older) return null;
    const diff = computeLineDiff(older.content, s.content);
    return summarizeDiff(diff);
  });

  const isHealthy = source.last_error == null;

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-10 max-w-4xl mx-auto w-full">
      <section className="flex flex-col gap-3">
        <Link
          href="/sources"
          className="text-xs font-mono uppercase tracking-widest text-[color:var(--muted)] hover:text-[color:var(--accent)] w-fit"
        >
          ← Sources
        </Link>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-[color:var(--background-elev)] border border-[color:var(--border)] font-mono uppercase tracking-widest text-[10px] text-[color:var(--accent)]">
            {source.kind}
          </span>
          <h1 className="text-xl font-semibold tracking-tight">
            {source.label ?? source.url}
          </h1>
        </div>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-[color:var(--muted)] hover:text-[color:var(--accent)] truncate"
        >
          {source.url}
        </a>

        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-mono">
          <span className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isHealthy
                  ? "bg-[color:var(--accent)] shadow-[0_0_8px_var(--accent-glow)]"
                  : "bg-[color:var(--danger)]"
              }`}
              aria-hidden
            />
            <span className="text-[color:var(--muted)]">
              {isHealthy ? "healthy" : "error"} · last fetch {timeAgo(source.last_fetched_at)}
            </span>
          </span>
          <span className="text-[color:var(--muted)]">
            {signals.length} signal{signals.length === 1 ? "" : "s"} captured
          </span>
        </div>

        {source.last_error && (
          <p className="text-xs font-mono text-[color:var(--danger)] mt-1 p-2 rounded border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/5">
            {source.last_error}
          </p>
        )}
      </section>

      <ul className="flex flex-col gap-2">
        {signals.length === 0 && (
          <li className="p-6 text-sm text-[color:var(--muted)] border border-dashed border-[color:var(--border)] rounded text-center">
            No signals captured from this source yet.
          </li>
        )}
        {signals.map((s, i) => {
          const stat = stats[i];
          return (
            <li key={s.id}>
              <Link
                href={`/signals/${s.id}`}
                className="block p-3 rounded border border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--background-elev)]/60 transition-colors"
              >
                <div className="flex items-center gap-3 text-xs font-mono text-[color:var(--muted)]">
                  <span>{formatTimestamp(s.observed_at)}</span>
                  {stat && (stat.added > 0 || stat.removed > 0) ? (
                    <span className="flex items-center gap-2">
                      <span className="text-[color:var(--accent)]">+{stat.added}</span>
                      <span className="text-[color:var(--danger)]">−{stat.removed}</span>
                    </span>
                  ) : i === signals.length - 1 ? (
                    <span className="text-[color:var(--muted)]/60">initial capture</span>
                  ) : (
                    <span className="text-[color:var(--muted)]/60">no change</span>
                  )}
                </div>
                {s.change_summary && (
                  <p className="mt-1.5 text-sm text-[color:var(--accent)] italic">
                    Δ {s.change_summary}
                  </p>
                )}
                {s.summary && (
                  <p className="mt-1 text-sm text-[color:var(--foreground)]/90">
                    {s.summary}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
