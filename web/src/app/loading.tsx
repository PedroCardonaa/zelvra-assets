import { Skeleton, SkeletonSignalCard } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10 max-w-5xl mx-auto w-full">
      <section className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-8 w-24" />
      </section>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 max-w-sm" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded" />
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonSignalCard key={i} />
        ))}
      </ul>
    </main>
  );
}
