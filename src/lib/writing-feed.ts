import { createHash } from "node:crypto";
import type { RSSFeedItem } from "@astrojs/rss";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import headingLevels from "./markdown/heading-levels.mjs";
import { entryPath, type WritingEntry } from "./writing-entry";

const xmlEscapes: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  '"': "&quot;",
  "'": "&apos;",
};

export function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (character) => xmlEscapes[character]);
}

function absoluteResourceUrl(value: string, pageUrl: URL): string {
  if (
    value.startsWith("#") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    /^[a-z][a-z\d+.-]*:/i.test(value)
  )
    return value;
  return new URL(value, pageUrl).href;
}

function absoluteUrls(pageUrl: URL) {
  return () => (tree: { type: string; children?: unknown[] }) => {
    const visit = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      const current = node as {
        type?: string;
        properties?: Record<string, unknown>;
        children?: unknown[];
      };
      if (current.type === "element" && current.properties) {
        for (const attribute of ["href", "src"]) {
          const value = current.properties[attribute];
          if (typeof value === "string")
            current.properties[attribute] = absoluteResourceUrl(value, pageUrl);
        }
      }
      current.children?.forEach(visit);
    };
    visit(tree);
  };
}

async function renderFeedContent(
  entry: WritingEntry,
  site: URL,
): Promise<string> {
  // Resolve relative resources against the canonical directory form of the page.
  const pageUrl = new URL(`${entryPath(entry).replace(/\/$/, "")}/`, site);
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(headingLevels)
    .use(remarkRehype, { allowDangerousHtml: true })
    // Parse authored HTML too, so its images and links receive the same treatment
    // as Markdown. Feed readers need static HTML without page scripts or styles.
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeSanitize, {
      ...defaultSchema,
      // Preserve heading/footnote targets in this standalone feed fragment.
      clobberPrefix: "",
      tagNames: [...(defaultSchema.tagNames ?? []), "figure", "figcaption"],
      strip: [...(defaultSchema.strip ?? []), "style", "iframe"],
    })
    .use(absoluteUrls(pageUrl))
    .use(rehypeStringify);
  const result = await file.process(entry.body);
  return String(result);
}

/** A published translation has its own release time, separate from the source date. */
export async function writingFeedItem(
  entry: WritingEntry,
  site: URL,
): Promise<RSSFeedItem & { pubDate: Date }> {
  const { data } = entry;
  const pubDate = new Date(
    Math.max(
      data.date.valueOf(),
      data.updated?.valueOf() ?? 0,
      data.lang === "en" ? (data.translation?.translatedAt.valueOf() ?? 0) : 0,
    ),
  );
  // Keep the original canonical URL (including Astro RSS's trailing slash policy).
  const link = new URL(`${entryPath(entry).replace(/\/$/, "")}/`, site).href;
  const updated = pubDate.valueOf() > data.date.valueOf();
  // A declared release/update gets a content-based identity. Rebuilding, changing
  // translation provenance or exporting identical wording cannot create new IDs.
  // Legacy articles without an update retain their existing permalink GUID.
  const revision = createHash("sha256")
    .update(
      JSON.stringify([
        data.title,
        data.description ?? "",
        entry.body.replace(/\r\n/g, "\n").trim(),
      ]),
    )
    .digest("hex");

  return {
    title: data.title,
    description: data.description ?? "",
    content: await renderFeedContent(entry, site),
    pubDate,
    link,
    categories: data.tags,
    ...(updated
      ? {
          customData: `<guid isPermaLink="false">${escapeXml(`${link}#revision-${revision}`)}</guid>`,
        }
      : {}),
  };
}
