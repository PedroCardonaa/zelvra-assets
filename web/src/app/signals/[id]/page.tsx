import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLineDiff, summarizeDiff } from "@/lib/osint/diff";
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

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-10 max-w-4xl mx-auto w-full">
      <section className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-xs font-mono uppercase tracking-widest text-[color:var(--muted)] hover:text-[color:var(--accent)] w-fit"
        >
          ← Dashboard
        </Link>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-[color:var(--background-elev)] border border-[color:var(--border)] font-mono uppercase tracking-widest text-[10px] text-[color:var(--accent)]">
            {signal.sources?.kind ?? "—"}
          </span>
          <h1 className="text-xl font-semibold tracking-tight">
            {signal.sources?.label ?? signal.sources?.url ?? "(deleted source)"}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[color:var(--muted)]">
          <span>{formatTimestamp(signal.observed_at)}</span>
          {signal.sources?.url && (
            <a
              href={signal.sources.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[color:var(--accent)] truncate"
            >
              {signal.sources.url}
            </a>
          )}
        </div>
      </section>

      {(signal.summary || signal.change_summary) && (
        <section className="flex flex-col gap-3 p-4 rounded border border-[color:var(--border-strong)] bg-[color:var(--background-elev)]/60">
          {signal.change_summary && (
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--accent)]">
                Δ Change
              </span>
              <p className="text-sm text-[color:var(--accent)]">
                {signal.change_summary}
              </p>
            </div>
          )}
          {signal.summary && (
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                AI summary
              </span>
              <p className="text-sm text-[color:var(--foreground)]">
                {signal.summary}
              </p>
            </div>
          )}
        </section>
      )}

      <nav className="flex items-center justify-between text-xs font-mono">
        {prev ? (
          <Link
            href={`/signals/${prev.id}`}
            className="text-[color:var(--muted)] hover:text-[color:var(--accent)]"
          >
            ← {formatTimestamp(prev.observed_at)}
          </Link>
        ) : (
          <span className="text-[color:var(--muted)]/40">— earliest —</span>
        )}
        {next ? (
          <Link
            href={`/signals/${next.id}`}
            className="text-[color:var(--muted)] hover:text-[color:var(--accent)]"
          >
            {formatTimestamp(next.observed_at)} →
          </Link>
        ) : (
          <span className="text-[color:var(--muted)]/40">— latest —</span>
        )}
      </nav>

      {diff && stats && (
        <section className="flex flex-col gap-2">
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

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-mono uppercase tracking-widest text-[color:var(--muted)]">
          Captured content
        </h2>
        <pre className="text-xs font-mono leading-relaxed p-4 rounded border border-[color:var(--border)] bg-[color:var(--background-elev)]/50 whitespace-pre-wrap break-words overflow-x-auto max-h-[640px] overflow-y-auto">
          {signal.content}
        </pre>
        <div className="text-[10px] font-mono text-[color:var(--muted)]">
          sha256 {signal.hash.slice(0, 16)}…{signal.hash.slice(-8)}
          {signal.metadata && typeof signal.metadata === "object" && (
            <> · {JSON.stringify(signal.metadata)}</>
          )}
        </div>
      </section>
    </main>
  );
}
