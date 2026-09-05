import { getCollection, type CollectionEntry } from "astro:content";
import { localizePath, locales, type Locale } from "../i18n/utils";
import { findTranslation, isPublished } from "./content-policy";
import { entryPath } from "./writing";
type StandardCollection =
  "blog" | "essays" | "research" | "projects" | "photos" | "routes";
export async function resolveAlternatePaths(
  path: string,
  locale: Locale,
): Promise<Partial<Record<Locale, string>>> {
  const segments = path
    .replace(/^\/(zh-CN|en)(?=\/|$)/, "")
    .split("/")
    .filter(Boolean);
  if (
    segments.length <= 1 ||
    (segments[0] === "blog" &&
      segments[1] === "topics" &&
      segments.length === 3)
  )
    return Object.fromEntries(
      locales.map((lang) => [
        lang,
        localizePath(`/${segments.join("/")}`, lang),
      ]),
    );
  const result: Partial<Record<Locale, string>> = { [locale]: path };
  const section = segments[0] === "map" ? "routes" : segments[0];
  if (
    !["blog", "essays", "research", "projects", "photos", "routes"].includes(
      section,
    )
  )
    return result;
  const entries = (await getCollection(
    section as StandardCollection,
  )) as CollectionEntry<StandardCollection>[];
  const entry = entries.find(
    (entry) =>
      entry.data.lang === locale &&
      entry.slug === decodeURIComponent(segments.slice(1).join("/")) &&
      isPublished(entry),
  );
  if (!entry) return result;
  for (const lang of locales) {
    const translated = findTranslation(entries, entry, lang);
    if (translated) result[lang] = entryPath(translated);
  }
  return result;
}
