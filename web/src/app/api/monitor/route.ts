import { createAdminClient } from "@/lib/supabase/admin";
import { runIngestion } from "@/lib/osint/ingest";
import type { Source } from "@/lib/osint/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return Response.json({ status: "ok", endpoint: "monitor" });
}

export async function POST(request: Request) {
  const expected = process.env.MONITOR_SECRET;
  if (expected) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("sources").select("*");
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const result = await runIngestion((data ?? []) as Source[]);
  return Response.json(result);
}
