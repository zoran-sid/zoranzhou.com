import { createHash } from "node:crypto";
import { parseDocument, isMap } from "yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import { normalizedNumbers, normalizeTranslation } from "./normalization.js";

export const RULES_VERSION = "deepl-natural-context-export-v3";
export const collections = ["blog", "essays", "research", "lab"] as const;
export const hash = (text: string) =>
  createHash("sha256").update(text).digest("hex");
export const hasChinese = (text: string) => /\p{Script=Han}/u.test(text);

export function parseContent(raw: string) {
  const match = raw.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error("缺少 YAML frontmatter，停止处理。");
  const doc = parseDocument(match[1]);
  if (doc.errors.length || !isMap(doc.contents)) {
    throw new Error("YAML frontmatter 无效，停止处理。");
  }
  const data = doc.toJS({ maxAliasCount: 100 }) as Record<string, any>;
  if (typeof data.title !== "string") throw new Error("文章缺少标题。");
  return { doc, data, body: raw.slice(match[0].length), raw };
}
export type Article = ReturnType<typeof parseContent>;
export function serialize(article: {
  doc: { toString(): string };
  body: string;
}) {
  return `---\n${article.doc.toString()}---\n${article.body}`;
}
export function outputHash(raw: string) {
  const article = parseContent(raw);
  article.doc.delete("translation");
  return hash(serialize(article));
}

type Node = {
  type: string;
  value?: string;
  children?: Node[];
  position?: { start: { offset?: number }; end: { offset?: number } };
  [key: string]: unknown;
};
function parser(mdx: boolean) {
  const p = unified().use(remarkParse).use(remarkGfm);
  return mdx ? p.use(remarkMdx) : p;
}
function signature(node: Node, body: string): unknown {
  if (node.type.startsWith("mdx")) {
    return {
      type: node.type,
      raw: body.slice(node.position?.start.offset, node.position?.end.offset),
    };
  }
  return Object.fromEntries(
    Object.entries(node)
      .filter(
        ([key]) =>
          key !== "position" && !(node.type === "text" && key === "value"),
      )
      .map(([key, value]) => [
        key,
        key === "children"
          ? (value as Node[]).map((child) => signature(child, body))
          : value,
      ]),
  );
}
// Escaping punctuation keeps provider output from introducing Markdown/MDX syntax.
function markdownText(text: string) {
  return text
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[\\`*_\[\]<>|{}&#!]/g, "\\$&")
    .replace(/^(\s*)([-+=])(?=\s)/, "$1\\$2")
    .replace(/^(\s*\d+)([.)])(?=\s)/, "$1\\$2");
}
export function segments(body: string, mdx: boolean) {
  const ast = parser(mdx).parse(body) as Node;
  const nodes: Node[] = [];
  const contextText: string[] = [];
  function visit(node: Node) {
    // JSX attributes, component children, expressions and imports are code-owned.
    if (node.type.startsWith("mdx") || node.type === "html") return;
    if (node.type === "text" && node.value) contextText.push(node.value);
    if (node.type === "inlineCode" && node.value && node.value.length <= 100)
      contextText.push(node.value);
    if (node.type === "text" && node.value && hasChinese(node.value))
      nodes.push(node);
    node.children?.forEach(visit);
  }
  visit(ast);
  return {
    texts: nodes.map((node) => node.value!),
    context: contextText.join(" "),
    apply(translated: string[]) {
      if (translated.length !== nodes.length)
        throw new Error("翻译段落数量不一致。");
      let result = body;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        const start = node.position?.start.offset;
        const end = node.position?.end.offset;
        if (start === undefined || end === undefined)
          throw new Error("正文位置无法确认。");
        const before = node.value!;
        const leading = before.match(/^\s*/)?.[0] ?? "";
        const trailing = before.match(/\s*$/)?.[0] ?? "";
        const replacement =
          leading + markdownText(translated[i].trim()) + trailing;
        result = result.slice(0, start) + replacement + result.slice(end);
      }
      if (
        JSON.stringify(signature(ast, body)) !==
        JSON.stringify(signature(parser(mdx).parse(result) as Node, result))
      ) {
        throw new Error("翻译改变了 Markdown/MDX 结构，已拒绝写入。");
      }
      return result;
    },
  };
}

const textFields = ["title", "description", "currentPhase"];
const arrayFields = ["implementedFeatures", "knownLimitations"];
export function translationPlan(
  source: Article,
  mdx: boolean,
  existing?: Article,
) {
  const doc = existing ? existing.doc.clone() : source.doc.clone();
  // Keep existing English slugs and unknown target-only fields. Sync factual metadata.
  for (const key of Object.keys(source.data)) {
    if (key !== "slug" && key !== "translation")
      doc.set(key, source.doc.get(key, true));
  }
  doc.delete("translation");
  doc.set("lang", "en");
  if (!existing && typeof source.data.slug === "string")
    doc.set("slug", `${source.data.slug}-en`);
  const paths: (string | number)[][] = [];
  const texts: string[] = [];
  function add(path: (string | number)[], value: unknown) {
    if (typeof value === "string" && hasChinese(value)) {
      paths.push(path);
      texts.push(value);
    }
  }
  textFields.forEach((key) => add([key], source.data[key]));
  for (const key of arrayFields) {
    if (Array.isArray(source.data[key]))
      source.data[key].forEach((v: unknown, i: number) => add([key, i], v));
  }
  for (const key of ["alt", "caption"])
    add(["cover", key], source.data.cover?.[key]);
  const body = segments(source.body, mdx);
  const all = [...texts, ...body.texts];
  return {
    texts: all,
    labels: [
      ...paths.map((p) => p.join(".")),
      ...body.texts.map((_, i) => `正文片段 ${i + 1}`),
    ],
    context: [source.data.title, source.data.description, body.context]
      .filter(Boolean)
      .join("\n")
      .slice(0, 12000),
    render(translated: string[]) {
      validateTranslations(all, translated);
      // DeepL may wrap translated book names in asterisks even in plain-text mode.
      // Keep our existing markup authoritative and don't display added styling literally.
      translated = translated.map((text, i) =>
        normalizeTranslation(all[i], text),
      );
      paths.forEach((path, i) => doc.setIn(path, translated[i]));
      const result = { doc, body: body.apply(translated.slice(texts.length)) };
      const content = serialize(result);
      doc.set("translation", {
        provider: "deepl",
        sourceHash: hash(source.raw),
        outputHash: outputHash(content),
        rulesVersion: RULES_VERSION,
        translatedAt: new Date().toISOString(),
      });
      return serialize(result);
    },
  };
}

export function validateTranslations(source: string[], translated: string[]) {
  if (source.length !== translated.length)
    throw new Error("翻译结果数量不一致。");
  const numbers = normalizedNumbers;
  translated.forEach((text, i) => {
    if (
      typeof text !== "string" ||
      !text.trim() ||
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text)
    ) {
      throw new Error("翻译结果为空或包含非法字符。");
    }
    const remaining = numbers(text, source[i]);
    // Repeating the same value in an explanation need not repeat it in English.
    // Every distinct original value must still be represented.
    for (const number of new Set(numbers(source[i]))) {
      const index = remaining.indexOf(number);
      if (index < 0)
        throw new Error(
          `第 ${i + 1} 个翻译片段遗漏或改动了原文数字；问题已记录，原文件未修改。`,
        );
      remaining.splice(index, 1);
    }
  });
}
