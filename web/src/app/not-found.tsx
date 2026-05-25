import Link from "next/link";
import { RadarIllustration } from "@/components/radar-illustration";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 max-w-2xl mx-auto w-full text-center">
      <div className="opacity-60">
        <RadarIllustration size={200} />
      </div>
      <div className="flex flex-col gap-2 fade-up">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--danger)]">
          404 · Out of range
        </span>
        <h1 className="font-display text-[2.75rem] leading-tight tracking-tight">
          No contact at this bearing.
        </h1>
        <p className="text-[color:var(--muted)] max-w-md mx-auto">
          The page you tried to reach isn&apos;t on the scope. It may have been
          archived, renamed, or never existed.
        </p>
      </div>
      <div className="flex items-center gap-3 fade-up" style={{ animationDelay: "120ms" }}>
        <Link
          href="/"
          className="px-4 py-2 rounded bg-[color:var(--accent)] text-black font-mono text-xs uppercase tracking-widest hover:bg-[color:var(--accent-dim)] hover:text-white transition-colors shadow-[0_0_18px_var(--accent-glow)]"
        >
          Back to dashboard
        </Link>
        <Link
          href="/sources"
          className="px-4 py-2 rounded border border-[color:var(--border-strong)] font-mono text-xs uppercase tracking-widest text-[color:var(--foreground)] hover:bg-[color:var(--background-elev)] transition-colors"
        >
          Sources
        </Link>
      </div>
    </main>
  );
}
