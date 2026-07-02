/**
 * Media enricher — orchestrates fetching, caching, and image downloading.
 *
 * This is the main entry point for the build-time enrichment pipeline.
 *
 * The enrichment writes enriched frontmatter directly into the source
 * markdown files so that Astro's type:content collections pick up the data.
 * Original files are backed up to .cache/media/originals/.
 *
 * Usage:
 *   import { enrichAllMedia } from "./lib/media/enricher";
 *   await enrichAllMedia();
 */

import fs from "node:fs/promises";
import path from "node:path";
import { searchMedia, type MediaMetadata, type MediaType } from "./api";
import { hasCache, readCache, writeCache } from "./cache";
import { downloadImages } from "./images";

// ── Types ──────────────────────────────────────────────────────────────────

export interface MediaFrontmatter {
  title: string;
  type: MediaType;
  status?: string;
  date?: string;
  rating?: number;
  year?: number;
  tags?: string[];
  featured?: boolean;
  draft?: boolean;
  lang?: string;
  // Collection-specific
  seasons?: number;
  pages?: number;
  isbn?: string;
  platform?: string[];
}

export interface EnrichedMedia extends MediaFrontmatter {
  originalTitle?: string;
  poster?: string;
  cover?: string;
  summary?: string;
  genres: string[];
  country?: string;
  director?: string;
  author?: string;
  developer?: string;
  publisher?: string;
  runtime?: string;
  language?: string;
  apiRating?: number;
  popularity?: number;
  fromCache: boolean;
}

// ── Content directory mapping ──────────────────────────────────────────────

const CONTENT_ROOT = path.resolve(process.cwd(), "src", "content");
const ORIGINALS_ROOT = path.resolve(process.cwd(), ".cache", "media", "originals");

const MEDIA_DIRS: Record<string, string> = {
  movie: path.join(CONTENT_ROOT, "movies"),
  tv: path.join(CONTENT_ROOT, "tv"),
  book: path.join(CONTENT_ROOT, "books"),
  game: path.join(CONTENT_ROOT, "games"),
};

// ── Frontmatter parsing ────────────────────────────────────────────────────

/**
 * Parse ALL frontmatter fields from a markdown file.
 * Returns the full data object, the body, and the raw content.
 */
async function parseFullMarkdown(
  filePath: string,
): Promise<{ data: Record<string, unknown>; body: string; raw: string } | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) return null;

    const fm = match[1];
    const body = match[2];
    const data: Record<string, unknown> = {};

    for (const line of fm.split("\n")) {
      const kv = line.match(/^(\w[\w-]*):\s*(.+)$/);
      if (!kv) continue;
      const key = kv[1];
      let value: unknown = kv[2].trim();

      // Unquote strings
      if ((value as string).startsWith('"') && (value as string).endsWith('"')) {
        value = (value as string).slice(1, -1);
      } else if ((value as string).startsWith("'") && (value as string).endsWith("'")) {
        value = (value as string).slice(1, -1);
      }

      // Parse numbers
      if (/^-?\d+(\.\d+)?$/.test(value as string)) {
        value = Number(value);
      }

      // Parse arrays
      if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
        value = value
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""));
      }

      // Parse booleans
      if (value === "true") value = true;
      if (value === "false") value = false;

      data[key] = value;
    }

    return { data, body, raw: content };
  } catch {
    return null;
  }
}

// ── Slug generation ────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-+/g, "-");
}

// ── YAML generation ────────────────────────────────────────────────────────

/**
 * Generate a YAML frontmatter block from enriched data.
 */
function generateFrontmatter(enriched: EnrichedMedia, originalFm: Record<string, unknown>): string {
  const lines: string[] = ["---"];

  // Title
  const title = enriched.title.includes('"') ? enriched.title : `"${enriched.title}"`;
  lines.push(`title: ${title}`);

  // Original title
  if (enriched.originalTitle) {
    lines.push(`originalTitle: "${enriched.originalTitle}"`);
  }

  // Year
  const year = enriched.year ?? enriched.releaseYear ?? enriched.apiRating ?? undefined;
  if (year !== undefined) {
    lines.push(`year: ${year}`);
  }

  // User rating
  if (enriched.rating !== undefined) {
    lines.push(`rating: ${enriched.rating}`);
  }

  // Poster / cover
  if (enriched.poster) {
    lines.push(`poster: "${enriched.poster}"`);
  }
  if (enriched.cover) {
    lines.push(`cover: "${enriched.cover}"`);
  }

  // Genres
  if (enriched.genres.length > 0) {
    const genreStr = enriched.genres.map((g) => `"${g}"`).join(", ");
    lines.push(`genres: [${genreStr}]`);
  }

  // Country
  if (enriched.country) {
    lines.push(`country: "${enriched.country}"`);
  }

  // Director / Author / Developer
  if (enriched.director) lines.push(`director: "${enriched.director}"`);
  if (enriched.author) lines.push(`author: "${enriched.author}"`);
  if (enriched.developer) lines.push(`developer: "${enriched.developer}"`);
  if (enriched.publisher) lines.push(`publisher: "${enriched.publisher}"`);

  // Runtime
  if (enriched.runtime) lines.push(`runtime: "${enriched.runtime}"`);

  // Language
  if (enriched.language) lines.push(`language: "${enriched.language}"`);

  // Status & date
  if (enriched.status) lines.push(`status: ${enriched.status}`);
  if (enriched.date) lines.push(`watchedDate: ${enriched.date}`);

  // Tags
  if (enriched.tags && enriched.tags.length > 0) {
    const tagStr = enriched.tags.map((t) => `"${t}"`).join(", ");
    lines.push(`tags: [${tagStr}]`);
  }

  // Summary
  if (enriched.summary) {
    lines.push(`summary: "${enriched.summary.replace(/"/g, '\\"')}"`);
  }

  // Collection-specific fields
  if (enriched.seasons !== undefined) lines.push(`seasons: ${enriched.seasons}`);
  if (enriched.pages !== undefined) lines.push(`pages: ${enriched.pages}`);
  if (enriched.isbn) lines.push(`isbn: "${enriched.isbn}"`);
  if (enriched.platform && enriched.platform.length > 0) {
    const platStr = enriched.platform.map((p) => `"${p}"`).join(", ");
    lines.push(`platform: [${platStr}]`);
  }

  // Flags
  lines.push(`draft: ${enriched.draft ?? false}`);
  if (enriched.featured) lines.push(`featured: true`);
  if (enriched.lang) lines.push(`lang: ${enriched.lang}`);

  lines.push("---");
  return lines.join("\n");
}

// ── Enrichment ─────────────────────────────────────────────────────────────

async function enrichFromAPI(
  frontmatter: MediaFrontmatter,
  type: MediaType,
  slug: string,
): Promise<{ metadata: MediaMetadata | null; fromCache: boolean }> {
  const cached = await hasCache(type, slug);
  if (cached) {
    console.log(`[Enricher] Cache hit: ${type}/${slug}`);
    return { metadata: await readCache(type, slug), fromCache: true };
  }

  console.log(`[Enricher] Fetching: ${type}/${slug} ("${frontmatter.title}")`);
  try {
    const metadata = await searchMedia(type, frontmatter.title, frontmatter.year);
    if (metadata) {
      await writeCache(type, slug, metadata);
      return { metadata, fromCache: false };
    }
    console.warn(`[Enricher] No results for: ${type}/${slug}`);
    return { metadata: null, fromCache: false };
  } catch (err) {
    console.error(`[Enricher] Error fetching ${type}/${slug}:`, (err as Error).message);
    return { metadata: null, fromCache: false };
  }
}

// ── Markdown file enrichment ───────────────────────────────────────────────

/**
 * Enrich a single markdown file:
 * 1. Back up the original to .cache/media/originals/
 * 2. Fetch/cache metadata from API
 * 3. Download poster images
 * 4. Write enriched frontmatter back into the .md file
 */
async function enrichMarkdownFile(
  filePath: string,
  type: MediaType,
  defaultType: MediaType,
): Promise<boolean> {
  const parsed = await parseFullMarkdown(filePath);
  if (!parsed) return false;

  const frontmatter = parsed.data;
  const title = (frontmatter.title as string) ?? path.basename(filePath, ".md");
  const slug = slugify(title) || path.basename(filePath, ".md");

  // Extract user-specific fields from original frontmatter
  const userFields: MediaFrontmatter = {
    title,
    type: (frontmatter.type as MediaType) ?? defaultType,
    status: frontmatter.status as string | undefined,
    date: frontmatter.date as string | undefined,
    rating: frontmatter.rating as number | undefined,
    year: frontmatter.year as number | undefined,
    tags: frontmatter.tags as string[] | undefined,
    featured: frontmatter.featured as boolean | undefined,
    draft: frontmatter.draft as boolean | undefined,
    lang: frontmatter.lang as string | undefined,
    seasons: frontmatter.seasons as number | undefined,
    pages: frontmatter.pages as number | undefined,
    isbn: frontmatter.isbn as string | undefined,
    platform: frontmatter.platform as string[] | undefined,
  };

  // Fetch or read cache
  const { metadata, fromCache } = await enrichFromAPI(userFields, type, slug);

  // Download images
  let poster: string | undefined;
  let cover: string | undefined;
  if (metadata?.poster || metadata?.cover) {
    const images = await downloadImages(type, slug, metadata.poster, metadata.cover);
    poster = images.poster;
    cover = images.cover;
  }

  // Merge enriched data
  const enriched: EnrichedMedia = {
    ...userFields,
    title: metadata?.title ?? title,
    originalTitle: metadata?.originalTitle ?? (frontmatter.originalTitle as string | undefined),
    poster: poster ?? (frontmatter.poster as string | undefined),
    cover: cover ?? (frontmatter.cover as string | undefined),
    summary: metadata?.summary ?? (frontmatter.summary as string | undefined),
    genres: metadata?.genres ?? (frontmatter.genres as string[]) ?? [],
    country: metadata?.country ?? (frontmatter.country as string | undefined),
    director: metadata?.director ?? (frontmatter.director as string | undefined),
    author: metadata?.author ?? (frontmatter.author as string | undefined),
    developer: metadata?.developer ?? (frontmatter.developer as string | undefined),
    publisher: metadata?.publisher ?? (frontmatter.publisher as string | undefined),
    runtime: metadata?.runtime ?? (frontmatter.runtime as string | undefined),
    language: metadata?.language ?? (frontmatter.language as string | undefined),
    apiRating: metadata?.rating,
    popularity: metadata?.popularity,
    fromCache,
  };

  // Back up original file
  const relativePath = path.relative(CONTENT_ROOT, filePath);
  const backupPath = path.join(ORIGINALS_ROOT, relativePath);
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(filePath, backupPath);

  // Generate and write enriched markdown
  const newFm = generateFrontmatter(enriched, frontmatter);
  const newContent = `${newFm}\n${parsed.body}`;
  await fs.writeFile(filePath, newContent, "utf-8");

  console.log(`[Enricher] Updated: ${relativePath}${fromCache ? " (cached)" : " (fresh)"}`);
  return true;
}

// ── Batch enrichment ───────────────────────────────────────────────────────

async function findMarkdownFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => path.join(dir, e.name));
  } catch {
    return [];
  }
}

/**
 * Enrich all media markdown files in all collections.
 * Writes enriched frontmatter directly into the source .md files.
 * Backs up originals to .cache/media/originals/.
 */
export async function enrichAllMedia(): Promise<void> {
  let total = 0;

  for (const [typeKey, dir] of Object.entries(MEDIA_DIRS)) {
    const type = typeKey as MediaType;
    const files = await findMarkdownFiles(dir);
    console.log(`[Enricher] Processing ${files.length} files in ${type}/`);

    for (const filePath of files) {
      const ok = await enrichMarkdownFile(filePath, type, type);
      if (ok) total++;

      // Rate limit between API calls
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  console.log(`\n[Enricher] Done. Enriched ${total} media files.`);
  console.log(`[Enricher] Originals backed up to: ${ORIGINALS_ROOT}`);
}

/**
 * Restore original markdown files from backup.
 */
export async function restoreOriginals(): Promise<void> {
  try {
    const entries = await fs.readdir(ORIGINALS_ROOT, { recursive: true, withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const backupPath = path.join(entry.parentPath ?? ORIGINALS_ROOT, entry.name);
      const relPath = path.relative(ORIGINALS_ROOT, backupPath);
      const originalPath = path.join(CONTENT_ROOT, relPath);
      await fs.copyFile(backupPath, originalPath);
      console.log(`[Restore] ${relPath}`);
    }
    console.log(`[Restore] Done. Restored from ${ORIGINALS_ROOT}`);
  } catch {
    console.log("[Restore] No backups found.");
  }
}
