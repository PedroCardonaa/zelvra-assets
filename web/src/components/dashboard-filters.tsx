"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { Source, SourceKind } from "@/lib/osint/types";

type Filters = {
  q?: string;
  kind?: SourceKind | "";
  source?: string;
  changesOnly?: boolean;
};

const KINDS: SourceKind[] = ["web", "rss", "social", "paste", "api"];

function buildHref(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.source) params.set("source", filters.source);
  if (filters.changesOnly) params.set("changes_only", "1");
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function DashboardFilters({
  sources,
  current,
}: {
  sources: Pick<Source, "id" | "label" | "url" | "kind">[];
  current: Filters;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(current.q ?? "");
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses search — like grep/less. Skips when the user is already
  // typing into a form field, so it doesn't hijack normal input.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement ||
        (t && t.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = (next: Filters) => {
    startTransition(() => router.push(buildHref(next)));
  };

  const hasFilters =
    !!current.q || !!current.kind || !!current.source || !!current.changesOnly;

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ ...current, q: searchValue });
        }}
        className="flex flex-wrap gap-2 items-center"
      >
        <label className="relative flex-1 min-w-[180px]">
          <span className="sr-only">Search signals</span>
          <input
            ref={searchRef}
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search content / summary…"
            className="w-full px-3 py-1.5 pr-10 rounded text-sm font-mono focus:border-[color:var(--accent)] transition-colors"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--muted)]/60 border border-[color:var(--border)] rounded px-1.5 py-0.5 bg-[color:var(--background)]/50">
            /
          </kbd>
        </label>
        <select
          value={current.source ?? ""}
          onChange={(e) => navigate({ ...current, source: e.target.value || undefined })}
          className="px-3 py-1.5 rounded text-sm font-mono"
          aria-label="Filter by source"
        >
          <option value="">All sources</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              [{s.kind}] {s.label ?? s.url}
            </option>
          ))}
        </select>
        {hasFilters && (
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-widest text-[color:var(--muted)] hover:text-[color:var(--danger)] transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="flex flex-wrap items-center gap-1.5">
        <Pill
          href={buildHref({ ...current, kind: "" })}
          active={!current.kind}
          label="All kinds"
        />
        {KINDS.map((k) => (
          <Pill
            key={k}
            href={buildHref({ ...current, kind: k })}
            active={current.kind === k}
            label={k}
          />
        ))}
        <span className="mx-2 text-[color:var(--muted)]/40">·</span>
        <Pill
          href={buildHref({ ...current, changesOnly: !current.changesOnly })}
          active={!!current.changesOnly}
          label="Changes only"
        />
      </div>
    </div>
  );
}

function Pill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-widest transition-all duration-200 border ${
        active
          ? "bg-[color:var(--accent)] text-black border-[color:var(--accent)] shadow-[0_0_10px_var(--accent-glow)]"
          : "bg-transparent text-[color:var(--muted)] border-[color:var(--border)] hover:text-[color:var(--foreground)] hover:border-[color:var(--border-strong)]"
      }`}
    >
      {label}
    </Link>
  );
}
