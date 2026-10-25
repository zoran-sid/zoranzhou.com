import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Root, RootContent } from "mdast";

const parser = unified().use(remarkParse);

/** A plain-text preview; never execute MDX or insert raw Markdown HTML. */
export function notePreview(body: string, limit = 220) {
  const tree = parser.parse(body) as Root;
  let image: { src: string; alt: string } | undefined;
  const text = (node: Root | RootContent): string => {
    if (node.type === "break") return "\n";
    if (node.type === "image") {
      // Relative source assets require Astro's content renderer, used on the feed/detail.
      if (!image && /^(?:\/(?!\/)|https?:\/\/)/i.test(node.url))
        image = { src: node.url, alt: node.alt ?? "" };
      return "";
    }
    if (["html", "definition", "imageReference", "code"].includes(node.type))
      return "";
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
  return {
    text:
      characters.length > limit
        ? `${characters.slice(0, limit).join("").trimEnd()}…`
        : plain,
    image,
  };
}
