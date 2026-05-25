import { Skeleton, SkeletonSignalCard } from "@/components/skeleton";

export default function SourceDetailLoading() {
  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-10 max-w-4xl mx-auto w-full">
      <section className="flex flex-col gap-3">
        <Skeleton className="h-3 w-20" />
        <div className="flex items-baseline gap-3">
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-7 w-64" />
        </div>
        <Skeleton className="h-3 w-80" />
        <div className="flex gap-4 mt-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-32" />
        </div>
      </section>

      <ul className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonSignalCard key={i} />
        ))}
      </ul>
    </main>
  );
}
