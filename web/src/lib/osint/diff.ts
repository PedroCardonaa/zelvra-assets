import { diffLines, type Change } from "diff";

export type DiffLine = {
  kind: "add" | "remove" | "context";
  text: string;
};

export function computeLineDiff(previous: string, current: string): DiffLine[] {
  const changes: Change[] = diffLines(previous, current, { newlineIsToken: false });
  const lines: DiffLine[] = [];

  for (const change of changes) {
    const kind: DiffLine["kind"] = change.added
      ? "add"
      : change.removed
        ? "remove"
        : "context";
    // Split each chunk back into individual lines so we can render row-by-row.
    const chunkLines = change.value.replace(/\n$/, "").split("\n");
    for (const text of chunkLines) {
      lines.push({ kind, text });
    }
  }

  return lines;
}

export function summarizeDiff(diff: DiffLine[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const line of diff) {
    if (line.kind === "add") added += 1;
    else if (line.kind === "remove") removed += 1;
  }
  return { added, removed };
}
