"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { runIngestion } from "@/lib/osint/ingest";
import type { Source } from "@/lib/osint/types";

// Returns void so it can be bound directly to <form action={...}>.
export async function runIngestionNow(): Promise<void> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("sources").select("*");
  if (error) throw new Error(error.message);

  await runIngestion((data ?? []) as Source[]);
  revalidatePath("/");
}
