import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import type { Element, Root } from "hast";
import type { Locale } from "../i18n/utils";
import type { NoteImage } from "./note-preview";

export const noteTimeZone = "Asia/Hong_Kong";
export interface TimelineImage extends NoteImage {
  width?: number;
  height?: number;
}

export function noteAnchor(entry: { collection: string; slug: string }) {
  return `note-${entry.collection}-${entry.slug}`;
}

/** Calendar groups follow the same UTC+8 clock used by Pages CMS. */
export function groupNotes<T extends { data: { date: Date } }>(
  entries: T[],
  locale: Locale,
) {
  const groups: { year: string; month: string; label: string; entries: T[] }[] =
    [];
  for (const entry of [...entries].sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  )) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: noteTimeZone,
      year: "numeric",
      month: "2-digit",
    }).formatToParts(entry.data.date);
    const year = parts.find((part) => part.type === "year")!.value;
    const month = parts.find((part) => part.type === "month")!.value;
    let group = groups.at(-1);
    if (!group || group.year !== year || group.month !== month) {
      group = {
        year,
        month,
        label: entry.data.date.toLocaleDateString(
          locale === "zh-CN" ? "zh-CN" : "en-GB",
          {
            timeZone: noteTimeZone,
            month: "long",
          },
        ),
        entries: [],
      };
      groups.push(group);
    }
    group.entries.push(entry);
  }
  return groups;
}

/** Render readable Markdown on the stream, with a separate photo gallery. */
export async function renderTimelineNote(
  body: string,
  options: {
    id: string;
    permalink: string;
    limit: number;
    cover?: NoteImage;
    resolveImage?: (src: string) => Promise<TimelineImage | undefined>;
  },
) {
  const images = new Map<string, NoteImage>();
  let plain = "";
  const addImage = (src: string, alt = "") => {
    if (src.startsWith("//")) src = `https:${src}`;
    if (/^[a-z][\w+.-]*:/i.test(src) && !/^https?:\/\//i.test(src)) return;
    if (!images.has(src)) images.set(src, { src, alt });
  };
  if (options.cover) addImage(options.cover.src, options.cover.alt);
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    // IDs are namespaced below, along with all fragment and ARIA references.
    .use(rehypeSanitize, { ...defaultSchema, clobberPrefix: "" })
    .use(() => (tree: Root) => {
      const ids = new Map<string, string>();
      const collectIds = (node: Root | Element) => {
        if (node.type === "element") {
          for (const key of ["id", "name"]) {
            if (node.properties[key])
              ids.set(
                String(node.properties[key]),
                `${options.id}--${node.properties[key]}`,
              );
          }
        }
        for (const child of node.children)
          if (child.type === "element") collectIds(child);
      };
      collectIds(tree);
      const visit = (node: Root | Element) => {
        node.children = node.children.filter((child) => {
          if (child.type === "text") {
            plain += child.value;
            return true;
          }
          if (child.type !== "element") return true;
          if (child.tagName === "img") {
            if (typeof child.properties.src === "string")
              addImage(
                child.properties.src,
                String(child.properties.alt ?? ""),
              );
            return false;
          }
          if (/^h[1-6]$/.test(child.tagName))
            child.tagName = `h${Math.min(6, Number(child.tagName.slice(1)) + 3)}`;
          for (const key of ["id", "name"]) {
            if (child.properties[key])
              child.properties[key] = ids.get(String(child.properties[key]));
          }
          for (const key of ["ariaDescribedBy", "ariaLabelledBy"]) {
            const value = child.properties[key];
            if (value)
              child.properties[key] = (
                Array.isArray(value) ? value : String(value).split(/\s+/)
              ).map((id) => ids.get(String(id)) ?? id);
          }
          if (typeof child.properties.href === "string") {
            const href = child.properties.href;
            try {
              child.properties.href = href.startsWith("#")
                ? ids.has(decodeURIComponent(href.slice(1)))
                  ? `#${encodeURIComponent(ids.get(decodeURIComponent(href.slice(1)))!)}`
                  : `${options.permalink}${href}`
                : new URL(href, `https://zoranzhou.com${options.permalink}/`)
                    .href;
            } catch {
              delete child.properties.href;
            }
          }
          visit(child);
          if (
            ["p", "li", "pre", "blockquote", "h4", "h5", "h6"].includes(
              child.tagName,
            )
          )
            plain += "\n";
          return (
            !["p", "a"].includes(child.tagName) ||
            child.children.some(
              (item) => item.type !== "text" || item.value.trim(),
            )
          );
        });
      };
      visit(tree);
    })
    .use(rehypeStringify)
    .process(body);
  const text = plain.replace(/\n{3,}/g, "\n\n").trim();
  const characters = Array.from(text);
  const truncated = characters.length > options.limit;
  const photos: TimelineImage[] = [];
  let unresolvedImages = false;
  for (const image of images.values()) {
    if (/^(?:\/|https?:\/\/)/i.test(image.src)) photos.push(image);
    else {
      const resolved = await options.resolveImage?.(image.src);
      if (resolved) photos.push({ ...resolved, alt: image.alt });
      else unresolvedImages = true;
    }
  }
  return {
    html: String(result),
    images: photos,
    unresolvedImages,
    truncated,
    excerpt: truncated
      ? `${characters.slice(0, options.limit).join("").trimEnd()}…`
      : text,
  };
}
