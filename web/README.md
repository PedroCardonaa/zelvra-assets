# Zelvra — web

Next.js 16 (App Router) + TypeScript + Tailwind v4. Frontend and API surface for the Zelvra OSINT tracker.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in Supabase keys
npm run dev
```

## Layout

```
src/
  app/
    api/monitor/route.ts   # ingestion trigger endpoint
    layout.tsx
    page.tsx
  lib/
    supabase/
      client.ts            # browser
      server.ts            # server (RSC / route handlers)
      admin.ts             # service-role, server-only
    osint/
      types.ts             # Source, Signal, IngestResult
      ingest.ts            # pipeline entry (stub)
```

The Python scraper microservice lives one level up at `../scraper`.
