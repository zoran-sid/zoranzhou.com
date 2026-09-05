/** Publishing and translation rules, independent of Astro's build runtime. */
export interface ContentRecord {
  collection: string;
  slug: string;
  body?: string;
  data: {
    lang?: string;
    draft?: boolean;
    published?: boolean;
    translationKey?: string;
    routeId?: string;
    tags?: string[];
    status?: string;
  };
}
export function isPublished(entry: ContentRecord): boolean {
  return !entry.data.draft && entry.data.published !== false;
}
export function hasReadableBody(entry: ContentRecord): boolean {
  return Boolean(entry.body?.replace(/<!--[\s\S]*?-->/g, "").trim());
}
export function findTranslation<T extends ContentRecord>(
  entries: T[],
  entry: T,
  locale: string,
): T | undefined {
  const identity = entry.collection === "routes" ? "routeId" : "translationKey";
  const key = entry.data[identity];
  if (!key) return undefined;
  const candidates = entries.filter(
    (candidate) =>
      candidate.collection === entry.collection &&
      candidate.data[identity] === key &&
      candidate.data.lang === locale &&
      isPublished(candidate),
  );
  // Ambiguous associations must not silently send readers to the wrong article.
  return candidates.length === 1 ? candidates[0] : undefined;
}
export type WritingCategory = "technology" | "research" | "life";
export function writingCategory(entry: ContentRecord): WritingCategory {
  if (entry.collection === "research") return "research";
  if (
    entry.collection === "essays" ||
    entry.data.tags?.some((tag) =>
      /^(life|travel|reading review|生活|旅行|书评)$/i.test(tag),
    )
  )
    return "life";
  return "technology";
}
