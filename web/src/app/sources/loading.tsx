import { Skeleton, SkeletonSourceRow } from "@/components/skeleton";

export default function SourcesLoading() {
  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-10 max-w-4xl mx-auto w-full">
      <section className="flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-32" />
      </section>

      <Skeleton className="h-20 w-full rounded border border-[color:var(--border)]" />

      <ul className="flex flex-col divide-y divide-[color:var(--border)] border border-[color:var(--border)] rounded overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonSourceRow key={i} />
        ))}
      </ul>
    </main>
  );
}
