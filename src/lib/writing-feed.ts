import { createHash } from "node:crypto";
import type { RSSFeedItem } from "@astrojs/rss";
import { entryPath, type WritingEntry } from "./writing";

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

/** A published translation has its own release time, separate from the source date. */
export function writingFeedItem(
  entry: WritingEntry,
  site: URL,
): RSSFeedItem & { pubDate: Date } {
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
