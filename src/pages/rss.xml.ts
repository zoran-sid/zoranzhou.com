import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "../lib/constants";

export async function GET() {
  const blog = await getCollection("blog", ({ data }) => !data.draft);
  const essays = await getCollection("essays", ({ data }) => !data.draft);
  const research = await getCollection("research", ({ data }) => !data.draft);
  const all = [...blog, ...essays, ...research].sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: SITE.url,
    items: all.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description ?? "",
      pubDate: entry.data.date,
      link: `/${entry.collection}/${entry.slug}`,
      categories: entry.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
