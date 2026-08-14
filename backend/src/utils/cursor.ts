/**
 * Opaque cursor encoding for keyset pagination (design §4.2).
 * Encodes (publishedAt, id) of the last row in a page so the next
 * query can resume with WHERE (published_at, id) < (cursor values).
 */

interface CursorPayload {
  publishedAt: string; // ISO string
  id: string;
}

export function encodeCursor(publishedAt: Date, id: string): string {
  const payload: CursorPayload = { publishedAt: publishedAt.toISOString(), id };
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

export function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    if (typeof parsed.publishedAt !== "string" || typeof parsed.id !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
