/** Publishing and translation rules, independent of Astro's build runtime. */
export interface ContentRecord {
  collection: string;
  slug: string;
  body?: string;
  data: {
    lang?: string;
    draft?: boolean;
    publication?: string;
    format?: WritingFormat;
    published?: boolean;
    translationKey?: string;
    routeId?: string;
    tags?: string[];
    categories?: string[];
    status?: string;
  };
}
export const WRITING_FORMATS = ["note", "guide", "research", "essay"] as const;
export type WritingFormat = (typeof WRITING_FORMATS)[number];
/** Long-form formats share the writing index; notes keep their own timeline. */
export const ARTICLE_FORMATS = ["guide", "research", "essay"] as const;
export function isPublicData(data: ContentRecord["data"]): boolean {
  return (
    !data.draft &&
    (data.publication === "approved" || (!data.publication && !data.format)) &&
    data.published !== false
  );
}
export function isPublished(entry: ContentRecord): boolean {
  return isPublicData(entry.data);
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
  // Migrated research articles declare themselves through their existing categories.
  if (
    entry.collection === "research" ||
    entry.data.categories?.some((category) =>
      /^(安全研究|security research)$/i.test(category),
    )
  )
    return "research";
  if (
    entry.collection === "essays" ||
    entry.data.tags?.some((tag) =>
      /^(life|travel|reading review|生活|旅行|书评)$/i.test(tag),
    )
  )
    return "life";
  return "technology";
}

export function writingFormat(entry: ContentRecord): WritingFormat {
  if (entry.data.format) return entry.data.format;
  const category = writingCategory(entry);
  if (category === "research") return "research";
  return entry.collection === "blog" && category === "technology"
    ? "guide"
    : "essay";
}
const FORMAT_LABELS: Record<"zh-CN" | "en", Record<WritingFormat, string>> = {
  "zh-CN": {
    note: "随记",
    guide: "技术指南",
    research: "研究分析",
    essay: "随笔",
  },
  en: { note: "Notes", guide: "Guides", research: "Research", essay: "Essays" },
};
export function writingFormatLabel(format: WritingFormat, locale: string) {
  return FORMAT_LABELS[locale === "zh-CN" ? "zh-CN" : "en"][format];
}
export function formatLabel(entry: ContentRecord, locale: string): string {
  return writingFormatLabel(writingFormat(entry), locale);
}
