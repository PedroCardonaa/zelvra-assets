"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SourceKind } from "@/lib/osint/types";

const KINDS: SourceKind[] = ["web", "rss", "social", "paste", "api"];

export async function addSource(formData: FormData) {
  const url = String(formData.get("url") ?? "").trim();
  const kind = String(formData.get("kind") ?? "").trim() as SourceKind;
  const label = String(formData.get("label") ?? "").trim() || null;

  if (!url) throw new Error("URL is required");
  if (!KINDS.includes(kind)) throw new Error(`Invalid kind: ${kind}`);
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("sources").insert({ url, kind, label });
  if (error) throw new Error(error.message);

  revalidatePath("/sources");
  revalidatePath("/");
}

export async function deleteSource(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("id is required");

  const supabase = createAdminClient();
  const { error } = await supabase.from("sources").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/sources");
  revalidatePath("/");
}
