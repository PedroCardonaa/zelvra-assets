import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLineDiff, summarizeDiff } from "@/lib/osint/diff";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type { Signal, Source } from "@/lib/osint/types";

export const dynamic = "force-dynamic";

type SignalWithSource = Signal & {
  sources: Pick<Source, "id" | "label" | "kind" | "url"> | null;
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 19) + "Z";
}

async function getNeighbor(
  sourceId: string,
  observedAt: string,
  direction: "prev" | "next",
): Promise<Pick<Signal, "id" | "observed_at" | "content"> | null> {
  const supabase = createAdminClient();
  const query = supabase
    .from("signals")
    .select("id, observed_at, content")
    .eq("source_id", sourceId);

  if (direction === "prev") {
    query.lt("observed_at", observedAt).order("observed_at", { ascending: false });
  } else {
    query.gt("observed_at", observedAt).order("observed_at", { ascending: true });
  }

  const { data } = await query.limit(1).maybeSingle();
  return data;
}

export default async function SignalDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("signals")
    .select("*, sources ( id, label, kind, url )")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="flex flex-1 flex-col gap-4 px-6 py-10 max-w-4xl mx-auto w-full">
        <p className="text-sm text-[color:var(--danger)]">Error: {error.message}</p>
      </main>
    );
  }
  if (!data) notFound();
  const signal = data as SignalWithSource;

  const [prev, next] = signal.sources
    ? await Promise.all([
        getNeighbor(signal.sources.id, signal.observed_at, "prev"),
        getNeighbor(signal.sources.id, signal.observed_at, "next"),
      ])
    : [null, null];

  const diff = prev ? computeLineDiff(prev.content, signal.content) : null;
  const stats = diff ? summarizeDiff(diff) : null;

  const displayName =
    signal.sources?.label ?? signal.sources?.url ?? "(deleted source)";

  return (
    <main className="flex flex-1 flex-col gap-10 px-6 py-10 max-w-4xl mx-auto w-full">
      {/* Sticky source header — keeps context while scrolling through long content. */}
      <section className="sticky top-0 z-10 -mx-6 px-6 py-4 bg-[color:var(--background)]/85 backdrop-blur-md border-b border-[color:var(--border)] flex flex-col gap-3">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            signal.sources
              ? { label: displayName, href: `/sources/${signal.sources.id}` }
              : { label: displayName },
            { label: formatTimestamp(signal.observed_at) },
          ]}
        />
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-[color:var(--background-elev)] border border-[color:var(--border)] font-mono uppercase tracking-widest text-[10px] text-[color:var(--accent)]">
            {signal.sources?.kind ?? "—"}
          </span>
          <h1 className="font-display text-2xl tracking-tight">{displayName}</h1>
          <span className="ml-auto font-mono text-[10px] text-[color:var(--muted)]">
            {formatTimestamp(signal.observed_at)}
          </span>
        </div>
      </section>

      {/* AI summary card */}
      {(signal.summary || signal.change_summary) && (
        <section className="flex flex-col gap-4 p-5 rounded border border-[color:var(--border-strong)] bg-[color:var(--background-elev)]/60 shadow-[0_0_40px_-20px_var(--accent-glow)]">
          {signal.change_summary && (
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--accent)]">
                Δ What changed
              </span>
              <p className="text-base text-[color:var(--accent)] leading-relaxed">
                {signal.change_summary}
              </p>
            </div>
          )}
          {signal.summary && (
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                AI summary
              </span>
              <p className="text-base text-[color:var(--foreground)] leading-relaxed">
                {signal.summary}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Prev / next navigation */}
      <nav className="flex items-center justify-between text-xs font-mono pb-4 border-b border-[color:var(--border)]">
        {prev ? (
          <Link
            href={`/signals/${prev.id}`}
            className="flex flex-col items-start gap-0.5 text-[color:var(--muted)] hover:text-[color:var(--accent)] transition-colors"
          >
            <span className="text-[10px] uppercase tracking-widest opacity-70">Previous</span>
            <span>← {formatTimestamp(prev.observed_at)}</span>
          </Link>
        ) : (
          <span className="text-[color:var(--muted)]/40 flex flex-col items-start gap-0.5">
            <span className="text-[10px] uppercase tracking-widest">Previous</span>
            <span>— earliest —</span>
          </span>
        )}
        {next ? (
          <Link
            href={`/signals/${next.id}`}
            className="flex flex-col items-end gap-0.5 text-[color:var(--muted)] hover:text-[color:var(--accent)] transition-colors"
          >
            <span className="text-[10px] uppercase tracking-widest opacity-70">Next</span>
            <span>{formatTimestamp(next.observed_at)} →</span>
          </Link>
        ) : (
          <span className="text-[color:var(--muted)]/40 flex flex-col items-end gap-0.5">
            <span className="text-[10px] uppercase tracking-widest">Next</span>
            <span>— latest —</span>
          </span>
        )}
      </nav>

      {/* Diff */}
      {diff && stats && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-[color:var(--muted)]">
            <span>Diff vs previous</span>
            <span className="text-[color:var(--accent)]">+{stats.added}</span>
            <span className="text-[color:var(--danger)]">−{stats.removed}</span>
          </div>
          <pre className="text-xs font-mono leading-relaxed rounded border border-[color:var(--border)] bg-[color:var(--background-elev)]/50 overflow-x-auto">
            {diff.map((line, i) => {
              const bg =
                line.kind === "add"
                  ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                  : line.kind === "remove"
                    ? "bg-[color:var(--danger)]/10 text-[color:var(--danger)]"
                    : "text-[color:var(--foreground)]/70";
              const prefix = line.kind === "add" ? "+" : line.kind === "remove" ? "−" : " ";
              return (
                <div key={i} className={`px-3 ${bg} whitespace-pre-wrap break-words`}>
                  <span className="select-none mr-2 opacity-60">{prefix}</span>
                  {line.text || " "}
                </div>
              );
            })}
          </pre>
        </section>
      )}

      {/* Captured content */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-[color:var(--muted)]">
          Captured content
        </h2>
        <pre className="text-xs font-mono leading-relaxed p-4 rounded border border-[color:var(--border)] bg-[color:var(--background-elev)]/50 whitespace-pre-wrap break-words overflow-x-auto max-h-[640px] overflow-y-auto">
          {signal.content}
        </pre>
        <div className="text-[10px] font-mono text-[color:var(--muted)] flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>sha256 {signal.hash.slice(0, 16)}…{signal.hash.slice(-8)}</span>
          {signal.metadata && typeof signal.metadata === "object" && (
            <span>{JSON.stringify(signal.metadata)}</span>
          )}
        </div>
      </section>
    </main>
  );
}
