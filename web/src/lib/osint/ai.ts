import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-7";
const MAX_INPUT_CHARS = 12_000;

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

function extractText(content: Anthropic.ContentBlock[]): string {
  for (const block of content) {
    if (block.type === "text") return block.text.trim();
  }
  return "";
}

export async function summarizeSignal(content: string): Promise<string | null> {
  const c = getClient();
  if (!c) return null;
  try {
    const response = await c.messages.create({
      model: MODEL,
      max_tokens: 256,
      system:
        "You summarize OSINT observations in one concise sentence. Focus on what was captured (entities, actions, claims), not interpretation. Plain text, no preamble, no quotes.",
      messages: [{ role: "user", content: content.slice(0, MAX_INPUT_CHARS) }],
    });
    return extractText(response.content) || null;
  } catch {
    return null;
  }
}

export async function explainDiff(
  before: string,
  after: string,
): Promise<string | null> {
  const c = getClient();
  if (!c) return null;
  try {
    const response = await c.messages.create({
      model: MODEL,
      max_tokens: 256,
      system:
        "You compare two versions of an OSINT-tracked document and describe the material change in one concise sentence. Ignore whitespace, reordering, and cosmetic edits. If nothing substantive changed, reply exactly: no material change.",
      messages: [
        {
          role: "user",
          content: `BEFORE:\n${before.slice(0, MAX_INPUT_CHARS / 2)}\n\nAFTER:\n${after.slice(0, MAX_INPUT_CHARS / 2)}`,
        },
      ],
    });
    return extractText(response.content) || null;
  } catch {
    return null;
  }
}
