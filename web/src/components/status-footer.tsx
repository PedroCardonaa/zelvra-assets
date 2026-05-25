import { createAdminClient } from "@/lib/supabase/admin";

// Server component. Re-runs per page load — cheap because dashboard pages are
// already dynamic. Wrapped in a Suspense-equivalent (Next renders async server
// components incrementally), so it doesn't block the page shell.

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

async function loadStats() {
  try {
    const supabase = createAdminClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [
      { data: lastSweep },
      { count: signalsToday },
      { count: sourceCount },
    ] = await Promise.all([
      supabase
        .from("sources")
        .select("last_fetched_at")
        .not("last_fetched_at", "is", null)
        .order("last_fetched_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("signals")
        .select("id", { count: "exact", head: true })
        .gte("observed_at", since),
      supabase.from("sources").select("id", { count: "exact", head: true }),
    ]);
    return {
      lastSweep: (lastSweep?.last_fetched_at as string | null) ?? null,
      signalsToday: signalsToday ?? 0,
      sourceCount: sourceCount ?? 0,
    };
  } catch {
    return { lastSweep: null, signalsToday: 0, sourceCount: 0 };
  }
}

export async function StatusFooter() {
  const stats = await loadStats();

  return (
    <footer
      className="border-t border-[color:var(--border)] bg-[color:var(--background)]/60 backdrop-blur-sm"
      aria-label="Operational status"
    >
      <div className="max-w-5xl mx-auto px-6 h-9 flex items-center gap-x-5 gap-y-1 flex-wrap text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)]">
        <span className="flex items-center gap-2">
          <span className="pulse-dot" aria-hidden />
          <span className="text-[color:var(--accent)]/80">Live</span>
        </span>
        <span>
          Last sweep <span className="text-[color:var(--foreground)]/80">{timeAgo(stats.lastSweep)}</span>
        </span>
        <span className="text-[color:var(--muted)]/40">·</span>
        <span>
          <span className="text-[color:var(--foreground)]/80">{stats.signalsToday}</span> signals · 24h
        </span>
        <span className="text-[color:var(--muted)]/40">·</span>
        <span>
          <span className="text-[color:var(--foreground)]/80">{stats.sourceCount}</span>{" "}
          source{stats.sourceCount === 1 ? "" : "s"} tracked
        </span>
        <span className="ml-auto opacity-60">Zelvra · v0.1</span>
      </div>
    </footer>
  );
}
