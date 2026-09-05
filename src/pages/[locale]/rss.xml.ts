import rss from "@astrojs/rss";
import { getWriting, entryPath } from "../../lib/writing";
import { getTranslations, type Locale, locales } from "../../i18n/utils";

export async function getStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

export async function GET(context: { site: URL; currentLocale?: string }) {
  const locale = (context.currentLocale ?? "zh-CN") as Locale;
  const t = getTranslations(locale);
  const all = await getWriting(locale);

  return rss({
    title: t.siteTitle,
    description: t.siteDescription,
    site: context.site,
    items: all.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description ?? "",
      pubDate: entry.data.date,
      link: entryPath(entry),
      categories: entry.data.tags,
    })),
    customData: `<language>${locale === "zh-CN" ? "zh-Hans" : "en-us"}</language>`,
  });
}
