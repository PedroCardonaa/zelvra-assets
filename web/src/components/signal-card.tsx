import Link from "next/link";
import type { Signal, Source } from "@/lib/osint/types";

type SignalWithSource = Signal & {
  sources: Pick<Source, "id" | "label" | "kind" | "url"> | null;
};

const NEW_THRESHOLD_MS = 5 * 60 * 1000;

function formatTimestamp(iso: string): string {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 19) + "Z";
}

export function SignalCard({ signal }: { signal: SignalWithSource }) {
  const isFresh = Date.now() - new Date(signal.observed_at).getTime() < NEW_THRESHOLD_MS;

  return (
    <li className="group relative overflow-hidden p-3 pl-4 rounded border border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--background-elev)]/60 transition-all duration-200 ease-out hover:shadow-[0_0_24px_-12px_var(--accent-glow)]">
      {/* Left-edge accent bar: subtle by default, glows on hover, pulses if fresh */}
      <span
        className={`absolute left-0 top-2 bottom-2 w-[2px] rounded-r transition-all duration-200 ${
          isFresh
            ? "bg-[color:var(--accent)] edge-pulse"
            : "bg-[color:var(--border-strong)] group-hover:bg-[color:var(--accent)] group-hover:shadow-[0_0_8px_var(--accent-glow)]"
        }`}
        aria-hidden
      />

      <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
        <span className="px-1.5 py-0.5 rounded bg-[color:var(--background-elev)] border border-[color:var(--border)] font-mono uppercase tracking-widest text-[10px] text-[color:var(--accent)]">
          {signal.sources?.kind ?? "—"}
        </span>
        {signal.sources ? (
          <Link
            href={`/sources/${signal.sources.id}`}
            className="font-medium text-[color:var(--foreground)] truncate hover:text-[color:var(--accent)] transition-colors"
          >
            {signal.sources.label ?? signal.sources.url}
          </Link>
        ) : (
          <span className="font-medium text-[color:var(--muted)] truncate">
            (deleted source)
          </span>
        )}
        {isFresh && (
          <span className="px-1.5 py-0.5 rounded bg-[color:var(--accent)]/15 border border-[color:var(--accent)]/30 font-mono uppercase tracking-widest text-[9px] text-[color:var(--accent)]">
            new
          </span>
        )}
        <span className="ml-auto font-mono text-[10px]">
          {formatTimestamp(signal.observed_at)}
        </span>
      </div>
      <Link href={`/signals/${signal.id}`} className="block mt-2">
        {signal.change_summary && (
          <p className="text-sm text-[color:var(--accent)] italic">
            Δ {signal.change_summary}
          </p>
        )}
        {signal.summary ? (
          <p className="mt-1 text-sm text-[color:var(--foreground)]/90">
            {signal.summary}
          </p>
        ) : (
          <p className="mt-1 text-sm text-[color:var(--foreground)]/70 line-clamp-2 font-mono whitespace-pre-wrap break-words">
            {signal.content.slice(0, 240)}
          </p>
        )}
      </Link>
    </li>
  );
}
