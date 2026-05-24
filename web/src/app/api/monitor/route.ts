import { runIngestion } from "@/lib/osint/ingest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return Response.json({ status: "ok", endpoint: "monitor" });
}

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = process.env.MONITOR_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await runIngestion([]);
  return Response.json(result);
}
