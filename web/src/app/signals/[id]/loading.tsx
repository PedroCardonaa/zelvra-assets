import { Skeleton } from "@/components/skeleton";

export default function SignalDetailLoading() {
  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-10 max-w-4xl mx-auto w-full">
      <section className="flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <div className="flex items-baseline gap-3">
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-7 w-72" />
        </div>
        <Skeleton className="h-3 w-96" />
      </section>

      <Skeleton className="h-24 w-full rounded" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-64 w-full rounded" />
    </main>
  );
}
