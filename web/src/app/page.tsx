import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Signal, Source } from "@/lib/osint/types";
import { SubmitButton } from "@/components/submit-button";
import { runIngestionNow } from "./actions";

export const dynamic = "force-dynamic";

type SignalWithSource = Signal & {
  sources: Pick<Source, "label" | "kind" | "url"> | null;
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 19) + "Z";
}

export default async function Home() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("signals")
    .select("*, sources ( label, kind, url )")
    .order("observed_at", { ascending: false })
    .limit(50);

  const signals = (data ?? []) as SignalWithSource[];

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-10 max-w-5xl mx-auto w-full">
      <section className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Scope · last 50
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            Signal contacts
          </h1>
        </div>
        <form action={runIngestionNow}>
          <SubmitButton idle="Sweep now" pending="Sweeping…" variant="primary" />
        </form>
      </section>

      {error && (
        <p className="text-sm text-[color:var(--danger)]">
          Could not load signals: {error.message}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {signals.length === 0 && (
          <li className="p-6 text-sm text-[color:var(--muted)] border border-dashed border-[color:var(--border)] rounded text-center">
            No contacts yet. Add a source on{" "}
            <Link href="/sources" className="text-[color:var(--accent)] underline-offset-4 hover:underline">
              /sources
            </Link>
            {" "}and trigger a sweep.
          </li>
        )}
        {signals.map((s) => (
          <li key={s.id}>
            <Link
              href={`/signals/${s.id}`}
              className="block group p-3 rounded border border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--background-elev)]/60 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
                <span className="px-1.5 py-0.5 rounded bg-[color:var(--background-elev)] border border-[color:var(--border)] font-mono uppercase tracking-widest text-[10px] text-[color:var(--accent)]">
                  {s.sources?.kind ?? "—"}
                </span>
                <span className="font-medium text-[color:var(--foreground)] truncate">
                  {s.sources?.label ?? s.sources?.url ?? "(deleted source)"}
                </span>
                <span className="ml-auto font-mono text-[10px]">
                  {formatTimestamp(s.observed_at)}
                </span>
              </div>
              <p className="mt-2 text-sm text-[color:var(--foreground)]/80 line-clamp-3 font-mono whitespace-pre-wrap break-words">
                {s.content.slice(0, 280)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
