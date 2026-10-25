import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Root, RootContent } from "mdast";

const parser = unified().use(remarkParse);
export interface NoteImage {
  src: string;
  alt?: string;
}

/** A plain-text preview; never execute MDX or insert raw Markdown HTML. */
export function notePreview(body: string, limit = 220, cover?: NoteImage) {
  const tree = parser.parse(body) as Root;
  const images = new Map<string, NoteImage>();
  let coverIsInline = false;
  const definitions = new Map(
    tree.children
      .filter((node) => node.type === "definition")
      .map((node) => [node.identifier.toLowerCase(), node.url]),
  );
  const addImage = (src: string, alt = "") => {
    // Count local source images too, but never offer unsupported URL schemes.
    if (
      /^\/\//.test(src) ||
      (/^[a-z][\w+.-]*:/i.test(src) && !/^https?:\/\//i.test(src))
    )
      return;
    if (!images.has(src)) images.set(src, { src, alt });
  };
  if (cover) addImage(cover.src, cover.alt);
  const text = (node: Root | RootContent): string => {
    if (node.type === "break") return "\n";
    if (node.type === "image") {
      addImage(node.url, node.alt ?? "");
      if (node.url === cover?.src) coverIsInline = true;
      return "";
    }
    if (node.type === "imageReference") {
      const src = definitions.get(node.identifier.toLowerCase());
      if (src) addImage(src, node.alt ?? "");
      if (src && src === cover?.src) coverIsInline = true;
      return "";
    }
    if (["html", "definition", "code"].includes(node.type)) return "";
    if ("children" in node) {
      const separator = ["root", "list", "listItem", "blockquote"].includes(
        node.type,
      )
        ? "\n"
        : "";
      return node.children
        .map((child) => text(child as RootContent))
        .join(separator);
    }
    return "value" in node ? String(node.value) : "";
  };
  const plain = text(tree)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const characters = Array.from(plain);
  // Relative source assets require Astro's full renderer on the detail page.
  const previewImages = [...images.values()].filter(({ src }) =>
    /^(?:\/(?!\/)|https?:\/\/)/i.test(src),
  );
  return {
    text:
      characters.length > limit
        ? `${characters.slice(0, limit).join("").trimEnd()}…`
        : plain,
    truncated: characters.length > limit,
    images: previewImages,
    image: previewImages[0],
    imageCount: images.size,
    coverIsInline,
  };
}
