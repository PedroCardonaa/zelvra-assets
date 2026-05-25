import Link from "next/link";

export function Header() {
  return (
    <header className="relative border-b border-[color:var(--border)] backdrop-blur-sm bg-[color:var(--background)]/40 overflow-hidden">
      {/* Ambient sweep — slow horizontal phosphor wash */}
      <div className="radar-sweep" aria-hidden />

      <div className="relative max-w-5xl mx-auto px-6 h-14 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="pulse-dot" aria-hidden />
          <span className="font-mono text-sm tracking-[0.2em] uppercase text-[color:var(--accent)] group-hover:text-white transition-colors">
            Zelvra
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-xs uppercase tracking-widest text-[color:var(--muted)]">
          <Link
            href="/"
            className="hover:text-[color:var(--foreground)] transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/sources"
            className="hover:text-[color:var(--foreground)] transition-colors"
          >
            Sources
          </Link>
        </nav>
        <span className="ml-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--muted)]">
          <span className="hidden sm:inline">OSINT</span>
          <span className="text-[color:var(--accent)]/60">·</span>
          <span>Live</span>
        </span>
      </div>
    </header>
  );
}
