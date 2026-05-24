import { createAdminClient } from "@/lib/supabase/admin";
import { runIngestion } from "@/lib/osint/ingest";
import type { Source } from "@/lib/osint/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Vercel cron hits this with GET and the Authorization header is set from CRON_SECRET.
// Manual triggers (curl, scripts) can POST with MONITOR_SECRET.
async function isAuthorized(request: Request): Promise<boolean> {
  const auth = request.headers.get("authorization");
  const cron = process.env.CRON_SECRET;
  const monitor = process.env.MONITOR_SECRET;
  if (cron && auth === `Bearer ${cron}`) return true;
  if (monitor && auth === `Bearer ${monitor}`) return true;
  // If neither secret is configured, allow (single-user dev mode).
  return !cron && !monitor;
}

async function runSweep(): Promise<Response> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("sources").select("*");
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  const result = await runIngestion((data ?? []) as Source[]);
  return Response.json(result);
}

export async function GET(request: Request) {
  // Vercel cron sets x-vercel-cron: 1. Treat that as the live trigger.
  const isCron = request.headers.get("x-vercel-cron") !== null;
  if (!isCron && !(await isAuthorized(request))) {
    return Response.json({ status: "ok", endpoint: "monitor" });
  }
  return runSweep();
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return new Response("Unauthorized", { status: 401 });
  }
  return runSweep();
}
