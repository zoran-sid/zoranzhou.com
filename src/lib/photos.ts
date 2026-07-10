import type { ImageMetadata } from "astro";

// ──────────────────────────────────────────
// Auto-discovered local photos from src/assets/photos/
// ──────────────────────────────────────────

type PhotoModule = { default: ImageMetadata };

const photoModules = import.meta.glob<PhotoModule>(
  [
    "/src/assets/photos/**/*.{jpg,jpeg,png,webp,avif,gif}",
    "!/src/assets/photos/**/_*",
    "!/src/assets/photos/**/.*",
  ],
  { eager: true },
);

export interface PhotoItem {
  id: string;
  fileName: string;
  alt: string;
  image: ImageMetadata;
}

export interface PhotoAlbum {
  slug: string;
  title: string;
  date: string | null;
  photos: PhotoItem[];
}

function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function humanizeFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseAlbumFolder(folder: string): { title: string; date: string | null } {
  const match = folder.match(/^(\d{4}-\d{2}-\d{2})[-_](.+)$/);
  if (!match) {
    return {
      title: folder.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim(),
      date: null,
    };
  }
  const [, date, rawTitle] = match;
  return {
    date,
    title: rawTitle.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim(),
  };
}

function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (ch) => ch.toUpperCase());
}

export function getLocalPhotoAlbums(): PhotoAlbum[] {
  const albums = new Map<string, PhotoAlbum>();

  for (const [fullPath, mod] of Object.entries(photoModules)) {
    const relativePath = fullPath.replace("/src/assets/photos/", "");
    const segments = relativePath.split("/");
    const fileName = segments.pop();
    if (!fileName) continue;

    const folder = segments.length > 0 ? segments[0] : "misc";
    const parsed = parseAlbumFolder(folder);

    let album = albums.get(folder);
    if (!album) {
      album = {
        slug: folder,
        title: titleCase(parsed.title),
        date: parsed.date,
        photos: [],
      };
      albums.set(folder, album);
    }

    album.photos.push({
      id: `${folder}/${fileName}`,
      fileName,
      alt: humanizeFileName(fileName) || `${parsed.title} photo`,
      image: mod.default,
    });
  }

  return Array.from(albums.values())
    .map((album) => ({
      ...album,
      photos: [...album.photos].sort((a, b) => naturalCompare(a.fileName, b.fileName)),
    }))
    .sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date);
      if (a.date) return -1;
      if (b.date) return 1;
      return naturalCompare(a.slug, b.slug);
    });
}
