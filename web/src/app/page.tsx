export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-start justify-center gap-4 px-8 py-24 max-w-3xl mx-auto w-full">
      <span className="text-xs uppercase tracking-widest text-zinc-500">
        Zelvra
      </span>
      <h1 className="text-4xl font-semibold tracking-tight">
        OSINT intelligence tracker
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
        Scaffold ready. Ingestion pipeline lives under{" "}
        <code className="font-mono text-sm">src/lib/osint</code>; the monitor
        endpoint is at <code className="font-mono text-sm">/api/monitor</code>.
      </p>
    </main>
  );
}
