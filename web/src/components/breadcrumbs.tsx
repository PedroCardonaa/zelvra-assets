import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[color:var(--muted)]">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[color:var(--accent)] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-[color:var(--foreground)]/70" : ""}>
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-[color:var(--muted)]/40">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
