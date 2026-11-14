/**
 * Word-level diff between the original prompt and the Forge's output.
 * Plain LCS over tokens (words and the whitespace between them). Falls back
 * to a line-level diff when the inputs are too large for a word grid.
 */

export type DiffPart = { kind: "same" | "add" | "del"; text: string };

const MAX_CELLS = 2_500_000;

function tokenize(text: string): string[] {
  return text.match(/\s+|[^\s]+/g) ?? [];
}

function lcsDiff(a: string[], b: string[]): DiffPart[] {
  const n = a.length;
  const m = b.length;
  const width = m + 1;
  const table = new Uint32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i * width + j] =
        a[i] === b[j]
          ? table[(i + 1) * width + j + 1] + 1
          : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }
  const parts: DiffPart[] = [];
  const push = (kind: DiffPart["kind"], text: string) => {
    const last = parts[parts.length - 1];
    if (last && last.kind === kind) last.text += text;
    else parts.push({ kind, text });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push("same", a[i]);
      i++;
      j++;
    } else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
      push("del", a[i++]);
    } else {
      push("add", b[j++]);
    }
  }
  while (i < n) push("del", a[i++]);
  while (j < m) push("add", b[j++]);
  return parts;
}

export function diffWords(before: string, after: string): DiffPart[] {
  const a = tokenize(before);
  const b = tokenize(after);
  if ((a.length + 1) * (b.length + 1) <= MAX_CELLS) return lcsDiff(a, b);
  const la = before.split(/(?<=\n)/);
  const lb = after.split(/(?<=\n)/);
  if ((la.length + 1) * (lb.length + 1) <= MAX_CELLS) return lcsDiff(la, lb);
  return [
    { kind: "del", text: before },
    { kind: "add", text: after },
  ];
}

export function wordCount(text: string): number {
  return (text.trim().match(/\S+/g) ?? []).length;
}

/** Share of the output's words that were kept from the original. */
export function retention(parts: DiffPart[]): number {
  let same = 0;
  let total = 0;
  for (const part of parts) {
    if (part.kind === "del") continue;
    const words = wordCount(part.text);
    total += words;
    if (part.kind === "same") same += words;
  }
  return total ? same / total : 1;
}
