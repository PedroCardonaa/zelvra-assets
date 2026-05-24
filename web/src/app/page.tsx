import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Signal, Source } from "@/lib/osint/types";
import { runIngestionNow } from "./actions";

export const dynamic = "force-dynamic";

type SignalWithSource = Signal & {
  sources: Pick<Source, "label" | "kind" | "url"> | null;
};

export default async function Home() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("signals")
    .select("*, sources ( label, kind, url )")
    .order("observed_at", { ascending: false })
    .limit(50);

  const signals = (data ?? []) as SignalWithSource[];

  return (
    <main className="flex flex-1 flex-col gap-8 px-8 py-12 max-w-4xl mx-auto w-full">
      <header className="flex items-baseline justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-zinc-500">
            Zelvra
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            Signal dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sources"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Sources →
          </Link>
          <form action={runIngestionNow}>
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-zinc-900 text-white text-sm font-medium dark:bg-zinc-100 dark:text-zinc-900"
            >
              Run ingestion
            </button>
          </form>
        </div>
      </header>

      {error && (
        <p className="text-sm text-red-600">
          Could not load signals: {error.message}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {signals.length === 0 && (
          <li className="p-4 text-sm text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-700 rounded">
            No signals yet. Add a source on /sources and hit “Run ingestion”.
          </li>
        )}
        {signals.map((s) => (
          <li
            key={s.id}
            className="flex flex-col gap-1 p-3 border border-zinc-200 dark:border-zinc-800 rounded"
          >
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">
                {s.sources?.kind ?? "—"}
              </span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {s.sources?.label ?? s.sources?.url ?? "(deleted source)"}
              </span>
              <span className="ml-auto font-mono">
                {new Date(s.observed_at).toISOString().replace("T", " ").slice(0, 19)}
              </span>
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-3 font-mono whitespace-pre-wrap break-words">
              {s.content.slice(0, 280)}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
