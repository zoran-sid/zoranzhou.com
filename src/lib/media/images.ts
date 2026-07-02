/**
 * Image download utility for media posters.
 *
 * Downloads poster images during build to:
 *   public/media/posters/{type}/{slug}.{ext}
 *
 * This ensures all images are served locally (no hotlinking)
 * and can be optimized by Astro's image service.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import type { MediaType } from "./api";

const POSTERS_ROOT = path.resolve(process.cwd(), "public", "media", "posters");

function posterDir(type: MediaType): string {
  return path.join(POSTERS_ROOT, type);
}

function posterPath(type: MediaType, slug: string, ext: string): string {
  return path.join(posterDir(type), `${slug}.${ext}`);
}

/**
 * Extract file extension from a URL or path.
 */
function getExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") return "jpg";
    if (ext === ".png") return "png";
    if (ext === ".webp") return "webp";
  } catch {
    // Not a valid URL
  }
  return "jpg"; // default
}

/**
 * Download an image from a URL to the local posters directory.
 * Returns the public-facing URL path (relative to site root).
 * Skips download if the file already exists.
 */
export async function downloadPoster(
  type: MediaType,
  slug: string,
  imageUrl: string,
): Promise<string | null> {
  if (!imageUrl) return null;

  const ext = getExtension(imageUrl);
  const dir = posterDir(type);
  const filePath = posterPath(type, slug, ext);

  // Skip if already downloaded
  try {
    await fs.access(filePath);
    return `/media/posters/${type}/${slug}.${ext}`;
  } catch {
    // File doesn't exist, proceed with download
  }

  try {
    await fs.mkdir(dir, { recursive: true });

    const response = await fetch(imageUrl);
    if (!response.ok || !response.body) {
      console.warn(`[Images] Failed to download: ${imageUrl} (${response.status})`);
      return null;
    }

    await pipeline(response.body, createWriteStream(filePath));

    console.log(`[Images] Downloaded: ${imageUrl} → ${filePath}`);
    return `/media/posters/${type}/${slug}.${ext}`;
  } catch (err) {
    console.warn(`[Images] Error downloading ${imageUrl}:`, (err as Error).message);
    return null;
  }
}

/**
 * Download both poster and cover/backdrop images.
 * Returns { poster, cover } with local paths.
 */
export async function downloadImages(
  type: MediaType,
  slug: string,
  posterUrl?: string,
  coverUrl?: string,
): Promise<{ poster?: string; cover?: string }> {
  const [poster, cover] = await Promise.all([
    posterUrl ? downloadPoster(type, slug, posterUrl) : Promise.resolve(undefined),
    coverUrl ? downloadPoster(type, `${slug}-cover`, coverUrl) : Promise.resolve(undefined),
  ]);

  return {
    poster: poster ?? undefined,
    cover: cover ?? undefined,
  };
}

/**
 * Get the public-facing URL for a cached poster.
 */
export function getPosterUrl(type: MediaType, slug: string): string | null {
  const dir = posterDir(type);
  const extensions = ["jpg", "png", "webp"];

  // Synchronous check (called during build)
  const { existsSync } = require("node:fs");
  for (const ext of extensions) {
    const filePath = path.join(dir, `${slug}.${ext}`);
    if (existsSync(filePath)) {
      return `/media/posters/${type}/${slug}.${ext}`;
    }
  }
  return null;
}
