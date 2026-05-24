import type { Signal, Source } from "./types";

type NewSignalNotification = {
  signal: Pick<Signal, "id" | "content" | "observed_at"> & {
    summary?: string | null;
    change_summary?: string | null;
  };
  source: Pick<Source, "label" | "kind" | "url">;
  appUrl: string; // e.g. https://zelvra.example.com
};

const PHOSPHOR_GREEN = 0x4ade80;

export async function notifyNewSignal({ signal, source, appUrl }: NewSignalNotification): Promise<void> {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return;

  const title = source.label ?? source.url;
  const description =
    signal.change_summary ?? signal.summary ?? signal.content.slice(0, 280);

  const payload = {
    embeds: [
      {
        title: `[${source.kind}] ${title}`.slice(0, 256),
        description: description.slice(0, 4000),
        url: `${appUrl.replace(/\/$/, "")}/signals/${signal.id}`,
        color: PHOSPHOR_GREEN,
        timestamp: signal.observed_at,
        footer: { text: "Zelvra · new contact" },
      },
    ],
  };

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Don't let a flaky webhook break ingestion.
  }
}
