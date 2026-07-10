import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getTranslations, localizePath, type Locale, locales } from "../../i18n/utils";

export async function getStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

export async function GET(context: { site: URL; currentLocale?: string }) {
  const blog = await getCollection("blog", ({ data }) => !data.draft);
  const essays = await getCollection("essays", ({ data }) => !data.draft);
  const research = await getCollection("research", ({ data }) => !data.draft);
  const all = [...blog, ...essays, ...research].sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const locale = (context.currentLocale ?? "zh-CN") as Locale;
  const t = getTranslations(locale);

  return rss({
    title: t.siteTitle,
    description: t.siteDescription,
    site: context.site,
    items: all.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description ?? "",
      pubDate: entry.data.date,
      link: localizePath(`/${entry.collection}/${entry.slug}`, locale),
      categories: entry.data.tags,
    })),
    customData: `<language>${locale === "zh-CN" ? "zh-Hans" : "en-us"}</language>`,
  });
}
