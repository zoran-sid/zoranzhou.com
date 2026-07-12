import { getCollection } from "astro:content";
import { localizePath, type Locale, locales } from "../../i18n/utils";

export async function getStaticPaths() {
  return locales.map((locale) => ({
    params: { locale },
  }));
}

export async function GET(context: { currentLocale?: string }) {
  const blog = await getCollection("blog", ({ data }) => !data.draft);
  const research = await getCollection("research", ({ data }) => !data.draft);
  const projects = await getCollection("projects", ({ data }) => !data.draft);
  const routes = await getCollection("routes", ({ data }) => !data.draft && data.published !== false);

  const locale = (context.currentLocale ?? "zh-CN") as Locale;

  const entries = [...blog, ...research, ...projects, ...routes]
    .filter((entry) => (entry.data.lang ?? "zh-CN") === locale)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((entry) => ({
      title: entry.data.title,
      collection: entry.collection === "routes" ? "map" : entry.collection,
      slug: entry.slug,
      url: localizePath(`/${entry.collection === "routes" ? "map" : entry.collection}/${entry.slug}`, locale),
      date: entry.data.date.toISOString().slice(0, 10),
    }));

  return new Response(JSON.stringify(entries), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
