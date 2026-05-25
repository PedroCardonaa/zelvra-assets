import Link from "next/link";
import { RadarIllustration } from "@/components/radar-illustration";

export const metadata = {
  title: "Zelvra — Watch what matters",
  description:
    "An AI-powered OSINT intelligence tracker. Add sources, get summaries when something changes, never re-read a page again.",
};

const FEATURES = [
  {
    label: "Sweep",
    title: "Continuous capture",
    body: "Point Zelvra at any URL — RSS feed, status page, social profile. Vercel cron sweeps every 15 minutes.",
  },
  {
    label: "Diff",
    title: "Material change only",
    body: "Two hashes match? Zelvra skips. They diverge? You see exactly what was added and removed, line by line.",
  },
  {
    label: "Brief",
    title: "AI summaries",
    body: "Each new signal gets a one-sentence digest. Each diff gets a one-sentence explanation of what materially changed.",
  },
  {
    label: "Alert",
    title: "Notifications",
    body: "Discord webhook out of the box. New signal lands, your team sees the summary and a deep link.",
  },
];

export default function Welcome() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative px-6 pt-16 pb-24 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-center">
          <div className="flex flex-col gap-5 fade-up">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[color:var(--accent)]">
              OSINT · v0.1
            </span>
            <h1 className="font-display text-[3rem] sm:text-[3.5rem] leading-[1.05] tracking-tight">
              Watch what
              <br />
              <span className="text-[color:var(--accent)]">matters</span>.
            </h1>
            <p className="text-base text-[color:var(--foreground)]/80 max-w-md leading-relaxed">
              Zelvra is an AI-powered OSINT intelligence tracker. Point it at
              any URL. When something actually changes, it tells you what — in
              one sentence — and shows you the diff.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[color:var(--accent)] text-black font-mono text-xs uppercase tracking-widest hover:bg-[color:var(--accent-dim)] hover:text-white transition-colors shadow-[0_0_24px_var(--accent-glow)]"
              >
                Open dashboard →
              </Link>
              <Link
                href="/sources"
                className="px-4 py-2.5 rounded border border-[color:var(--border-strong)] font-mono text-xs uppercase tracking-widest text-[color:var(--foreground)] hover:bg-[color:var(--background-elev)] transition-colors"
              >
                Add a source
              </Link>
            </div>
          </div>
          <div className="hidden md:block fade-up" style={{ animationDelay: "200ms" }}>
            <RadarIllustration size={300} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              className="p-5 rounded border border-[color:var(--border)] bg-[color:var(--background-elev)]/30 hover:bg-[color:var(--background-elev)]/60 hover:border-[color:var(--border-strong)] transition-colors fade-up"
              style={{ animationDelay: `${300 + i * 80}ms` }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--accent)]">
                {f.label}
              </span>
              <h2 className="mt-1 font-display text-xl tracking-tight">
                {f.title}
              </h2>
              <p className="mt-2 text-sm text-[color:var(--foreground)]/75 leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-32 max-w-5xl mx-auto w-full">
        <div className="flex flex-col gap-2 mb-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Pipeline
          </span>
          <h2 className="font-display text-3xl tracking-tight">
            How a contact is made.
          </h2>
        </div>
        <ol className="flex flex-col gap-3">
          {[
            "Cron fires. Zelvra fetches every registered source.",
            "Content is hashed. If the hash is unchanged, the fetch is skipped.",
            "If the hash diverged, a new signal is captured and diffed against its predecessor.",
            "Claude writes a one-sentence summary and explains the diff.",
            "A Discord embed lands in your channel with a deep link to the signal.",
          ].map((step, i) => (
            <li
              key={i}
              className="flex gap-4 p-3 rounded border border-[color:var(--border)]"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--accent)] mt-0.5 min-w-[24px]">
                0{i + 1}
              </span>
              <p className="text-sm text-[color:var(--foreground)]/85">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t border-[color:var(--border)] px-6 py-6 max-w-5xl mx-auto w-full flex items-center justify-between text-xs font-mono text-[color:var(--muted)]">
        <span>Zelvra · OSINT intelligence tracker</span>
        <Link href="/" className="hover:text-[color:var(--accent)] transition-colors">
          Enter dashboard →
        </Link>
      </footer>
    </main>
  );
}
