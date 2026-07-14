import type { CollectionEntry } from "astro:content";
import { localizePath, type Locale } from "../i18n/utils";

export const LAB_TYPE_SEGMENTS = {
  learning: "learning",
  build: "builds",
  security: "security",
  architecture: "architecture",
  note: "notes",
} as const;

export type LabEntry = CollectionEntry<"lab">;

export function getLabEntryPath(entry: LabEntry): string {
  return localizePath(
    `/lab/${LAB_TYPE_SEGMENTS[entry.data.type]}/${entry.slug}`,
    entry.data.lang as Locale,
  );
}

export function getLabHomePath(locale: Locale): string {
  return localizePath("/lab", locale);
}

export function findLabTranslation(
  entries: LabEntry[],
  entry: LabEntry,
  targetLocale: Locale,
): LabEntry | undefined {
  if (!entry.data.translationKey) return undefined;

  return entries.find(
    (candidate) =>
      candidate.data.translationKey === entry.data.translationKey &&
      candidate.data.lang === targetLocale &&
      !candidate.data.draft,
  );
}
