/**
 * Auto-generates an excerpt from Tiptap JSON content by walking text nodes,
 * used unless the admin has provided a manual override (design §6.2).
 */

const MAX_EXCERPT_LENGTH = 200;

interface TiptapNode {
  type?: string;
  text?: string;
  content?: TiptapNode[];
}

function extractPlainText(node: TiptapNode, acc: string[]): void {
  if (node.text) acc.push(node.text);
  if (node.content) {
    for (const child of node.content) extractPlainText(child, acc);
  }
}

export function generateExcerpt(content: unknown): string {
  const acc: string[] = [];
  try {
    extractPlainText(content as TiptapNode, acc);
  } catch {
    return "";
  }

  const fullText = acc.join(" ").replace(/\s+/g, " ").trim();
  if (fullText.length <= MAX_EXCERPT_LENGTH) return fullText;

  const truncated = fullText.slice(0, MAX_EXCERPT_LENGTH);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : MAX_EXCERPT_LENGTH)}…`;
}
