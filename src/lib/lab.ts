import type { CollectionEntry } from "astro:content";
import { localizePath, type Locale } from "../i18n/utils";
import { findTranslation } from "./content-policy";

export const LAB_ICON_REVISION = "20260905";

export const LAB_CURRENT_FOCUS_KEY = "lab-typescript-foundations";

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
  return findTranslation(entries, entry, targetLocale);
}
