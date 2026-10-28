import type { CollectionEntry } from "astro:content";
import { localizePath, type Locale } from "../i18n/utils";

export type WritingEntry = CollectionEntry<"blog" | "essays" | "research">;

/** Localized canonical path for a writing entry. */
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
