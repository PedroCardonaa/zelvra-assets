import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Source } from "@/lib/osint/types";
import { SubmitButton } from "@/components/submit-button";
import { RadarIllustration } from "@/components/radar-illustration";
import { addSource, deleteSource } from "./actions";

export const dynamic = "force-dynamic";

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ suggest?: string }>;
}) {
  const { suggest } = await searchParams;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .order("created_at", { ascending: false });

  const sources = (data ?? []) as Source[];

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-10 max-w-4xl mx-auto w-full">
      <section className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Targets
        </span>
        <h1 className="font-display text-[2rem] leading-tight tracking-tight">
          Sources
        </h1>
      </section>

      <form
        action={addSource}
        className="grid grid-cols-1 sm:grid-cols-[1fr_140px_1fr_auto] gap-2 p-4 rounded border border-[color:var(--border)] bg-[color:var(--background-elev)]/40"
      >
        <input
          name="url"
          type="url"
          required
          defaultValue={suggest ?? ""}
          placeholder="https://example.com/feed"
          className="px-3 py-2 text-sm font-mono"
        />
        <select name="kind" defaultValue="web" className="px-3 py-2 text-sm font-mono">
          <option value="web">web</option>
          <option value="rss">rss</option>
          <option value="social">social</option>
          <option value="paste">paste</option>
          <option value="api">api</option>
        </select>
        <input name="label" placeholder="label (optional)" className="px-3 py-2 text-sm" />
        <SubmitButton idle="Add target" pending="Adding…" variant="primary" />
      </form>

      {error && (
        <p className="text-sm text-[color:var(--danger)]">
          Could not load sources: {error.message}
        </p>
      )}

      {sources.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-4 py-12 px-6 fade-up">
          <RadarIllustration size={160} />
          <h2 className="font-display text-xl tracking-tight">
            No targets yet.
          </h2>
          <p className="text-sm text-[color:var(--muted)] max-w-md">
            Add any URL above — a feed, a status page, a profile — and Zelvra
            will start watching it on the next sweep.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-[color:var(--border)] border border-[color:var(--border)] rounded overflow-hidden">
          {sources.map((s) => {
            const isHealthy = s.last_error == null;
            const neverFetched = s.last_fetched_at == null;
            return (
              <li
                key={s.id}
                className="flex items-center gap-3 p-3 text-sm bg-[color:var(--background-elev)]/30 hover:bg-[color:var(--background-elev)]/60 transition-colors"
              >
                <span
                  title={
                    neverFetched
                      ? "Not yet fetched"
                      : isHealthy
                        ? `Last fetched ${timeAgo(s.last_fetched_at)}`
                        : `Error: ${s.last_error}`
                  }
                  className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                    neverFetched
                      ? "bg-[color:var(--muted)]/40"
                      : isHealthy
                        ? "bg-[color:var(--accent)] shadow-[0_0_8px_var(--accent-glow)]"
                        : "bg-[color:var(--danger)]"
                  }`}
                  aria-hidden
                />
                <span className="px-1.5 py-0.5 rounded bg-[color:var(--background)] border border-[color:var(--border)] font-mono uppercase tracking-widest text-[10px] text-[color:var(--accent)]">
                  {s.kind}
                </span>
                <Link
                  href={`/sources/${s.id}`}
                  className="flex-1 min-w-0 flex flex-col gap-0.5 hover:text-[color:var(--accent)] transition-colors"
                >
                  <span className="font-medium text-[color:var(--foreground)] truncate">
                    {s.label ?? s.url}
                  </span>
                  <span className="font-mono text-[10px] text-[color:var(--muted)]">
                    {neverFetched ? "never fetched" : `last ${timeAgo(s.last_fetched_at)}`}
                    {s.last_error && (
                      <span className="text-[color:var(--danger)]"> · {s.last_error.slice(0, 80)}</span>
                    )}
                  </span>
                </Link>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--muted)] hover:text-[color:var(--accent)] font-mono text-[10px] transition-colors"
                >
                  open ↗
                </a>
                <form action={deleteSource}>
                  <input type="hidden" name="id" value={s.id} />
                  <SubmitButton idle="Delete" pending="…" variant="danger" />
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
