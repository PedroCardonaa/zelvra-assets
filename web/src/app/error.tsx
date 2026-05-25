"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Could pipe to your error reporter here.
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 max-w-2xl mx-auto w-full text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--danger)]">
        Signal lost
      </span>
      <h1 className="font-display text-[2.5rem] leading-tight tracking-tight">
        Something went sideways.
      </h1>
      <p className="text-[color:var(--muted)] max-w-md">
        An unexpected error interrupted this view. You can try again, or head
        back to the dashboard.
      </p>
      {error.digest && (
        <code className="font-mono text-[10px] text-[color:var(--muted)]/70">
          digest · {error.digest}
        </code>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 rounded bg-[color:var(--accent)] text-black font-mono text-xs uppercase tracking-widest hover:bg-[color:var(--accent-dim)] hover:text-white transition-colors shadow-[0_0_18px_var(--accent-glow)]"
        >
          Retry
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded border border-[color:var(--border-strong)] font-mono text-xs uppercase tracking-widest text-[color:var(--foreground)] hover:bg-[color:var(--background-elev)] transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}
