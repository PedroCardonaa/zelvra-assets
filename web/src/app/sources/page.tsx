import { createAdminClient } from "@/lib/supabase/admin";
import type { Source } from "@/lib/osint/types";
import { SubmitButton } from "@/components/submit-button";
import { addSource, deleteSource } from "./actions";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
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
        <h1 className="text-2xl font-semibold tracking-tight">Sources</h1>
      </section>

      <form
        action={addSource}
        className="grid grid-cols-1 sm:grid-cols-[1fr_140px_1fr_auto] gap-2 p-4 rounded border border-[color:var(--border)] bg-[color:var(--background-elev)]/40"
      >
        <input
          name="url"
          type="url"
          required
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

      <ul className="flex flex-col divide-y divide-[color:var(--border)] border border-[color:var(--border)] rounded overflow-hidden">
        {sources.length === 0 && (
          <li className="p-4 text-sm text-[color:var(--muted)]">No targets yet.</li>
        )}
        {sources.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 p-3 text-sm bg-[color:var(--background-elev)]/30 hover:bg-[color:var(--background-elev)]/60 transition-colors"
          >
            <span className="px-1.5 py-0.5 rounded bg-[color:var(--background)] border border-[color:var(--border)] font-mono uppercase tracking-widest text-[10px] text-[color:var(--accent)]">
              {s.kind}
            </span>
            <span className="font-medium text-[color:var(--foreground)] min-w-0">
              {s.label ?? "—"}
            </span>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 truncate text-[color:var(--muted)] hover:text-[color:var(--accent)] font-mono text-xs"
            >
              {s.url}
            </a>
            <form action={deleteSource}>
              <input type="hidden" name="id" value={s.id} />
              <SubmitButton idle="Delete" pending="…" variant="danger" />
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
