import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getWriting } from "../../lib/writing";
import { escapeXml, writingFeedItem } from "../../lib/writing-feed";
import {
  getTranslations,
  type Locale,
  locales,
  localizePath,
} from "../../i18n/utils";

export async function getStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

export async function GET(context: APIContext) {
  const locale = context.params.locale as Locale;
  const t = getTranslations(locale);
  const all = await getWriting(locale);
  const site = context.site!;
  const items = all
    .map((entry) => writingFeedItem(entry, site))
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
  const feed = new URL(localizePath("/rss.xml", locale), site).href;

  return rss({
    title: `${t.siteTitle} · ${locale === "en" ? "English" : "中文"}`,
    description: t.siteDescription,
    site: new URL(localizePath("/", locale), site),
    items,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: [
      `<language>${locale === "zh-CN" ? "zh-Hans" : "en-us"}</language>`,
      `<atom:link href="${escapeXml(feed)}" rel="self" type="application/rss+xml" />`,
      ...(items.length
        ? [`<lastBuildDate>${items[0].pubDate.toUTCString()}</lastBuildDate>`]
        : []),
    ].join(""),
  });
}
