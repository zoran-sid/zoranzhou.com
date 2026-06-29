import { getCollection } from "astro:content";

export async function GET() {
  const blog = await getCollection("blog", ({ data }) => !data.draft);
  const research = await getCollection("research", ({ data }) => !data.draft);
  const projects = await getCollection("projects", ({ data }) => !data.draft);

  const entries = [...blog, ...research, ...projects]
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((entry) => ({
      title: entry.data.title,
      collection: entry.collection,
      slug: entry.slug,
      url: `/${entry.collection}/${entry.slug}`,
      date: entry.data.date.toISOString().slice(0, 10),
    }));

  return new Response(JSON.stringify(entries), {
    headers: { "Content-Type": "application/json" },
  });
}
