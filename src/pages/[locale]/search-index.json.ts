import { isPublicData } from "../../lib/content-policy";
import { getCollection } from "astro:content";
import { localizePath, type Locale, locales } from "../../i18n/utils";
import { getLabEntryPath } from "../../lib/lab";
import { hasReadableBody } from "../../lib/content-policy";
import { getTickets } from "../../lib/tickets";
import { ticketTypeLabels } from "../../lib/ticket-model";

export async function getStaticPaths() {
  return locales.map((locale) => ({
    params: { locale },
  }));
}

export async function GET(context: { currentLocale?: string }) {
  const blog = await getCollection("blog", ({ data }) => isPublicData(data));
  const essays = await getCollection("essays", ({ data }) =>
    isPublicData(data),
  );
  const research = await getCollection("research", ({ data }) =>
    isPublicData(data),
  );
  const projects = await getCollection("projects", ({ data }) =>
    isPublicData(data),
  );
  const routes = await getCollection(
    "routes",
    ({ data }) => isPublicData(data) && data.published !== false,
  );
  const lab = await getCollection("lab", ({ data }) => isPublicData(data));

  const locale = (context.currentLocale ?? "zh-CN") as Locale;

  const standardEntries = [
    ...blog,
    ...essays,
    ...research,
    ...projects,
    ...routes,
  ]
    .filter(
      (entry) =>
        (entry.data.lang ?? "zh-CN") === locale &&
        (entry.collection === "routes" || hasReadableBody(entry)),
    )
    .map((entry) => ({
      title: entry.data.title,
      description: entry.data.description ?? "",
      tags: entry.data.tags,
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
      description: entry.data.description ?? "",
      tags: entry.data.tags,
      collection: "lab",
      slug: entry.slug,
      url: getLabEntryPath(entry),
      date: entry.data.date.toISOString().slice(0, 10),
    }));

  const ticketEntries = (await getTickets(locale)).map((ticket) => ({
    title: ticket.data.title,
    description: [ticketTypeLabels[locale][ticket.data.type], ticket.data.location].filter(Boolean).join(" · "),
    tags: ticket.data.tags,
    collection: "tickets",
    slug: ticket.slug,
    url: localizePath(`/tickets/${ticket.slug}`, locale),
    date: ticket.data.date.toISOString().slice(0, 10),
  }));
  const entries = [...standardEntries, ...labEntries, ...ticketEntries].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return new Response(JSON.stringify(entries), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
