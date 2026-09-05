import { getCollection, type CollectionEntry } from "astro:content";
import { localizePath, type Locale } from "../i18n/utils";
import {
  hasReadableBody,
  isPublished,
  writingCategory,
} from "./content-policy";
export type WritingEntry = CollectionEntry<"blog" | "essays" | "research">;
export async function getWriting(locale?: Locale): Promise<WritingEntry[]> {
  const collections = await Promise.all([
    getCollection("blog"),
    getCollection("essays"),
    getCollection("research"),
  ]);
  return collections
    .flat()
    .filter(
      (entry) =>
        isPublished(entry) &&
        hasReadableBody(entry) &&
        (!locale || entry.data.lang === locale),
    )
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
export function entryPath(entry: {
  collection: string;
  slug: string;
  data: { lang: Locale };
}): string {
  return localizePath(
    `/${entry.collection === "routes" ? "map" : entry.collection}/${entry.slug}`,
    entry.data.lang,
  );
}
export function categoryLabel(entry: WritingEntry, locale: Locale): string {
  const category = writingCategory(entry);
  return locale === "zh-CN"
    ? { technology: "技术实践", research: "研究笔记", life: "生活与随笔" }[
        category
      ]
    : {
        technology: "Engineering",
        research: "Research",
        life: "Life & essays",
      }[category];
}
export function displayDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === "zh-CN" ? "zh-CN" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
// References only: titles, dates and summaries are read from the original entries.
const selections = {
  "zh-CN": ["agentshield-deep-analysis", "building-blog", "2025-12-31"],
  en: ["agentshield-deep-analysis", "building-blog", "minecraft-local-project"],
} as const;
export function selectWriting(
  entries: WritingEntry[],
  locale: Locale,
): WritingEntry[] {
  return selections[locale].map((key) => {
    const entry = entries.find(
      (entry) =>
        entry.data.lang === locale &&
        (entry.data.translationKey === key || entry.slug === key),
    );
    if (!entry)
      throw new Error(`Missing published homepage selection: ${locale}/${key}`);
    return entry;
  });
}
