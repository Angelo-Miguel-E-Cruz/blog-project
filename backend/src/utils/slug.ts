export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Appends a short random suffix to resolve slug collisions without a DB round trip loop. */
export function withUniqueSuffix(slug: string): string {
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slug}-${suffix}`;
}
