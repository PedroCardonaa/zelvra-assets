import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Source } from "@/lib/osint/types";
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
    <main className="flex flex-1 flex-col gap-8 px-8 py-12 max-w-3xl mx-auto w-full">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Sources</h1>
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Dashboard
        </Link>
      </header>

      <form
        action={addSource}
        className="grid grid-cols-1 sm:grid-cols-[1fr_140px_1fr_auto] gap-2"
      >
        <input
          name="url"
          type="url"
          required
          placeholder="https://example.com/feed"
          className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
        />
        <select
          name="kind"
          defaultValue="web"
          className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
        >
          <option value="web">web</option>
          <option value="rss">rss</option>
          <option value="social">social</option>
          <option value="paste">paste</option>
          <option value="api">api</option>
        </select>
        <input
          name="label"
          placeholder="label (optional)"
          className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-zinc-900 text-white text-sm font-medium dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600">
          Could not load sources: {error.message}
        </p>
      )}

      <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded">
        {sources.length === 0 && (
          <li className="p-4 text-sm text-zinc-500">No sources yet.</li>
        )}
        {sources.map((s) => (
          <li key={s.id} className="flex items-center gap-3 p-3 text-sm">
            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-mono">
              {s.kind}
            </span>
            <span className="font-medium">{s.label ?? "—"}</span>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 truncate text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {s.url}
            </a>
            <form action={deleteSource}>
              <input type="hidden" name="id" value={s.id} />
              <button
                type="submit"
                className="text-xs text-red-600 hover:underline"
              >
                delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
