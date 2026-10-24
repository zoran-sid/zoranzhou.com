import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { parseMediaList } from "../src/lib/media/list";

// A manually invoked cache: production pages and normal builds never scrape.
const root = fileURLToPath(new URL("..", import.meta.url));
const manifestPath = path.join(root, "src/data/media-covers.json");
const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--all"))
  throw new Error("Usage: npm run media:images -- [--all]");
const items = parseMediaList(
  await fs.readFile(path.join(root, "src/content/media.md"), "utf8"),
);
const films = items.filter(
  (item) => item.category === "movies" || item.category === "tv",
);
const games = items.filter((item) => item.category === "games");
const selected = [
  ...items.filter((item) => item.category === "books"),
  ...(args.includes("--all") ? films : films.slice(0, 24)),
  ...(args.includes("--all") ? games : games.slice(0, 24)),
];
const covers: Record<string, string> = JSON.parse(
  await fs.readFile(manifestPath, "utf8"),
);
const sources = [
  ...new Set(
    selected
      .map((item) => item.poster)
      .filter((url): url is string => Boolean(url)),
  ),
];
await fs.mkdir(path.join(root, "public/media/covers"), { recursive: true });
let added = 0;
let failures = 0;
for (const source of sources) {
  const name = createHash("sha256").update(source).digest("hex").slice(0, 16);
  const localPath = `/media/covers/${name}.webp`;
  const destination = path.join(root, "public", localPath);
  if (
    covers[source] === localPath &&
    (await fs.stat(destination).then(
      () => true,
      () => false,
    ))
  )
    continue;
  try {
    const response = await fetch(source, {
      signal: AbortSignal.timeout(20_000),
      headers: {
        "User-Agent": "Mozilla/5.0",
        // The cover is embedded by its source catalogue, which some CDNs require.
        ...(new URL(source).hostname.endsWith(".doubanio.com")
          ? {
              Referer:
                selected.find((item) => item.poster === source)?.url ??
                "https://book.douban.com/",
            }
          : {}),
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!response.headers.get("content-type")?.startsWith("image/"))
      throw new Error("Not an image");
    const bytes = Buffer.from(await response.arrayBuffer());
    const thumbnail = await sharp(bytes)
      .resize({
        width: 320,
        height: 480,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
    const temporary = `${destination}.${process.pid}.tmp`;
    await fs.writeFile(temporary, thumbnail);
    await fs.rename(temporary, destination);
    covers[source] = localPath;
    added += 1;
  } catch (error) {
    failures += 1;
    console.warn(
      `[media:images] Kept existing cover for ${source}: ${error instanceof Error ? error.message : error}`,
    );
  }
}
const temporaryManifest = `${manifestPath}.${process.pid}.tmp`;
await fs.writeFile(temporaryManifest, JSON.stringify(covers, null, 2) + "\n");
await fs.rename(temporaryManifest, manifestPath);
console.log(
  `[media:images] ${added} thumbnails added, ${failures} unavailable, ${Object.keys(covers).length} cached. Markdown unchanged.`,
);
if (failures) process.exitCode = 1;
