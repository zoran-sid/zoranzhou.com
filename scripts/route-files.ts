import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

export type Locale = "zh-CN" | "en";

export interface MarkdownParts {
  frontmatter: string;
  separator: string;
  body: string;
}

export function walkFiles(directory: string, extensions: string[]) {
  if (!existsSync(directory)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(file, extensions));
    else if (entry.isFile() && extensions.includes(extname(entry.name).toLowerCase())) files.push(file);
  }
  return files;
}

export function splitMarkdown(content: string): MarkdownParts | undefined {
  const match = /^(---\r?\n)([\s\S]*?)(\r?\n---)(\r?\n?)([\s\S]*)$/.exec(content);
  if (!match) return undefined;
  return { frontmatter: match[2], separator: match[4] || "\n", body: match[5] };
}

export function scalar(frontmatter: string, key: string): unknown {
  const match = new RegExp(`^${key}:\\s*(.*)$`, "m").exec(frontmatter);
  if (!match) return undefined;
  const value = match[1].trim();
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    if (value === "true") return true;
    if (value === "false") return false;
    if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
    return value.replace(/^['"]|['"]$/g, "");
  }
}

export function localeOf(frontmatter: string): Locale {
  return scalar(frontmatter, "lang") === "en" ? "en" : "zh-CN";
}

export function yamlValue(value: unknown) {
  return JSON.stringify(value);
}

function fieldRange(lines: string[], key: string) {
  const start = lines.findIndex((line) => new RegExp(`^${key}:\\s*`).test(line));
  if (start < 0) return undefined;
  let end = start + 1;
  while (end < lines.length && (/^\s+/.test(lines[end]) || lines[end].trim() === "")) end += 1;
  return { start, end };
}

export function setFields(frontmatter: string, updates: Record<string, unknown>) {
  const newline = frontmatter.includes("\r\n") ? "\r\n" : "\n";
  const lines = frontmatter.split(/\r?\n/);
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    const replacement = `${key}: ${yamlValue(value)}`;
    const range = fieldRange(lines, key);
    if (range) lines.splice(range.start, range.end - range.start, replacement);
    else lines.push(replacement);
  }
  return lines.join(newline);
}

export function removeField(frontmatter: string, key: string) {
  const newline = frontmatter.includes("\r\n") ? "\r\n" : "\n";
  const lines = frontmatter.split(/\r?\n/);
  const range = fieldRange(lines, key);
  if (range) lines.splice(range.start, range.end - range.start);
  return lines.join(newline);
}

export function assembleMarkdown(parts: MarkdownParts, frontmatter: string) {
  const newline = frontmatter.includes("\r\n") ? "\r\n" : "\n";
  return `---${newline}${frontmatter}${newline}---${parts.separator}${parts.body}`;
}

export function normalizeGpxPath(value: string) {
  let normalized = value.trim().replaceAll("\\", "/");
  try { normalized = decodeURI(normalized); } catch { /* retain malformed input for validation */ }
  if (!normalized.startsWith("/")) normalized = `/${normalized.replace(/^\.\//, "")}`;
  return normalized.replace(/\/{2,}/g, "/");
}

export function readRouteRecord(file: string) {
  const content = readFileSync(file, "utf8");
  const parts = splitMarkdown(content);
  if (!parts) return { file, content };
  const gpxValue = scalar(parts.frontmatter, "gpx") ?? scalar(parts.frontmatter, "routeFile");
  return {
    file,
    content,
    parts,
    lang: localeOf(parts.frontmatter),
    routeId: scalar(parts.frontmatter, "routeId"),
    gpx: typeof gpxValue === "string" ? normalizeGpxPath(gpxValue) : undefined,
  };
}
