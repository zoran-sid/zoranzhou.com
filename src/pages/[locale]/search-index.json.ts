import { getCollection } from "astro:content";
import { localizePath, type Locale, locales } from "../../i18n/utils";
import { getLabEntryPath } from "../../lib/lab";

export async function getStaticPaths() {
  return locales.map((locale) => ({
    params: { locale },
  }));
}

export async function GET(context: { currentLocale?: string }) {
  const blog = await getCollection("blog", ({ data }) => !data.draft);
  const research = await getCollection("research", ({ data }) => !data.draft);
  const projects = await getCollection("projects", ({ data }) => !data.draft);
  const routes = await getCollection(
    "routes",
    ({ data }) => !data.draft && data.published !== false,
  );
  const lab = await getCollection("lab", ({ data }) => !data.draft);

  const locale = (context.currentLocale ?? "zh-CN") as Locale;

  const standardEntries = [...blog, ...research, ...projects, ...routes]
    .filter((entry) => (entry.data.lang ?? "zh-CN") === locale)
    .map((entry) => ({
      title: entry.data.title,
      collection: entry.collection === "routes" ? "map" : entry.collection,
      slug: entry.slug,
      url: localizePath(
        `/${entry.collection === "routes" ? "map" : entry.collection}/${entry.slug}`,
        locale,
      ),
      date: entry.data.date.toISOString().slice(0, 10),
    }));

  const labEntries = lab
    .filter((entry) => entry.data.lang === locale)
    .map((entry) => ({
      title: entry.data.title,
      collection: "lab",
      slug: entry.slug,
      url: getLabEntryPath(entry),
      date: entry.data.date.toISOString().slice(0, 10),
    }));

  const entries = [...standardEntries, ...labEntries].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return new Response(JSON.stringify(entries), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
