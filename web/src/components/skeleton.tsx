// Skeleton primitives. All `skeleton` CSS class lives in globals.css.

type Props = {
  className?: string;
};

export function Skeleton({ className = "" }: Props) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function SkeletonText({ className = "", width = "100%" }: Props & { width?: string }) {
  return <div className={`skeleton h-3 ${className}`} style={{ width }} aria-hidden />;
}

export function SkeletonSignalCard() {
  return (
    <li className="p-3 rounded border border-[color:var(--border)] flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-24 ml-auto" />
      </div>
      <SkeletonText width="90%" />
      <SkeletonText width="70%" />
    </li>
  );
}

export function SkeletonSourceRow() {
  return (
    <li className="flex items-center gap-3 p-3">
      <Skeleton className="h-2 w-2 rounded-full" />
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-3 flex-1 max-w-xs" />
      <Skeleton className="h-3 w-16" />
    </li>
  );
}
