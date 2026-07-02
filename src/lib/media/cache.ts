/**
 * Local cache system for media metadata.
 *
 * Cache structure:
 *   .cache/media/
 *     movie/
 *       {slug}.json
 *     tv/
 *       {slug}.json
 *     book/
 *       {slug}.json
 *     game/
 *       {slug}.json
 *
 * Each JSON file stores the full MediaMetadata object.
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { MediaMetadata, MediaType } from "./api";

const CACHE_ROOT = path.resolve(process.cwd(), ".cache", "media");

function cacheDir(type: MediaType): string {
  return path.join(CACHE_ROOT, type);
}

function cachePath(type: MediaType, slug: string): string {
  return path.join(cacheDir(type), `${slug}.json`);
}

/**
 * Read cached metadata for a media item.
 * Returns null if no cache exists.
 */
export async function readCache(
  type: MediaType,
  slug: string,
): Promise<MediaMetadata | null> {
  try {
    const filePath = cachePath(type, slug);
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as MediaMetadata;
  } catch {
    return null;
  }
}

/**
 * Write metadata to cache.
 */
export async function writeCache(
  type: MediaType,
  slug: string,
  data: MediaMetadata,
): Promise<void> {
  const dir = cacheDir(type);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    cachePath(type, slug),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}

/**
 * Delete cached metadata for a media item.
 */
export async function deleteCache(
  type: MediaType,
  slug: string,
): Promise<void> {
  try {
    await fs.unlink(cachePath(type, slug));
  } catch {
    // ignore if file doesn't exist
  }
}

/**
 * Check if cache exists for a media item.
 */
export async function hasCache(
  type: MediaType,
  slug: string,
): Promise<boolean> {
  try {
    await fs.access(cachePath(type, slug));
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all cached slugs for a given media type.
 */
export async function listCache(type: MediaType): Promise<string[]> {
  try {
    const dir = cacheDir(type);
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

/**
 * Return the cache root directory path.
 */
export function getCacheRoot(): string {
  return CACHE_ROOT;
}
