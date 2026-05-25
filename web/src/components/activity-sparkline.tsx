// Pure SVG bar chart of signal counts per day over a fixed window.
// Server component — receives pre-computed buckets.

type Bucket = { day: string; count: number };

type Props = {
  buckets: Bucket[];
  width?: number;
  height?: number;
};

export function ActivitySparkline({ buckets, width = 260, height = 48 }: Props) {
  if (buckets.length === 0) return null;

  const max = Math.max(1, ...buckets.map((b) => b.count));
  const barGap = 2;
  const barWidth = (width - barGap * (buckets.length - 1)) / buckets.length;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)]">
        <span>Activity · {buckets.length}d</span>
        <span className="text-[color:var(--foreground)]/70">
          peak {max}
        </span>
      </div>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Signal activity over the last ${buckets.length} days`}
      >
        {/* Baseline */}
        <line
          x1="0"
          y1={height - 0.5}
          x2={width}
          y2={height - 0.5}
          stroke="rgba(74,222,128,0.18)"
          strokeWidth="1"
        />
        {buckets.map((b, i) => {
          const h = b.count === 0 ? 1 : Math.max(2, (b.count / max) * (height - 4));
          const x = i * (barWidth + barGap);
          const y = height - h;
          const isEmpty = b.count === 0;
          return (
            <g key={b.day}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx="1"
                fill={isEmpty ? "rgba(74,222,128,0.12)" : "#4ade80"}
                opacity={isEmpty ? 0.6 : Math.max(0.55, b.count / max)}
              />
              <title>
                {b.day}: {b.count} signal{b.count === 1 ? "" : "s"}
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function buildDailyBuckets(
  observedAts: string[],
  days = 14,
): Bucket[] {
  const buckets: Bucket[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    buckets.push({ day: d.toISOString().slice(0, 10), count: 0 });
  }
  const byDay = new Map(buckets.map((b) => [b.day, b]));
  for (const iso of observedAts) {
    const day = iso.slice(0, 10);
    const bucket = byDay.get(day);
    if (bucket) bucket.count += 1;
  }
  return buckets;
}
