import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DOUBAN_COLLECTION_URL,
  fetchAllDoubanMovies,
  parseDoubanPage,
  type DoubanMovie,
} from "./media/douban";
import { parseMediaTable, replaceMoviesTable } from "./media/markdown";

interface CliOptions {
  delayMs?: number;
  dryRun: boolean;
  input?: string;
  output: string;
}

const REPOSITORY_ROOT = path.resolve(
  fileURLToPath(new URL("..", import.meta.url)),
);
const DEFAULT_OUTPUT = path.join(REPOSITORY_ROOT, "src", "content", "media.md");

function usage(): string {
  return [
    "Usage: npm run media:update -- [options]",
    "",
    "Options:",
    "  --input <file-or-dir>  Read saved .html pages or an exported .json file",
    "  --delay <milliseconds> Delay between network requests (default: 2000)",
    "  --dry-run              Parse and merge without writing media.md",
    "  --output <path>        Alternate output file (primarily for safe testing)",
    "  --help                 Show this help",
  ].join("\n");
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { dryRun: false, output: DEFAULT_OUTPUT };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      console.log(usage());
      process.exit(0);
    } else if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (
      argument === "--input" ||
      argument === "--output" ||
      argument === "--delay"
    ) {
      const value = argv[index + 1];
      if (!value)
        throw new Error(`${argument} requires a value.\n\n${usage()}`);
      index += 1;
      if (argument === "--input") options.input = path.resolve(value);
      if (argument === "--output") options.output = path.resolve(value);
      if (argument === "--delay") {
        const delayMs = Number.parseInt(value, 10);
        if (!Number.isFinite(delayMs) || delayMs < 500) {
          throw new Error(
            "--delay must be an integer of at least 500 milliseconds.",
          );
        }
        options.delayMs = delayMs;
      }
    } else {
      throw new Error(`Unknown argument: ${argument}\n\n${usage()}`);
    }
  }
  return options;
}

function textValue(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function normalizeRating(value: unknown): string | undefined {
  const number =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(number) || number <= 0) return undefined;
  const fivePoint = number > 5 && number <= 10 ? number / 2 : number;
  if (fivePoint > 5)
    throw new Error(
      `Invalid rating ${number}; expected a 5- or 10-point value.`,
    );
  return String(Number(fivePoint.toFixed(1)));
}

function normalizeWebUrl(value: unknown, label: string): string | undefined {
  const text = textValue(value);
  if (!text) return undefined;
  try {
    const url = new URL(text);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !url.hostname
    ) {
      throw new Error();
    }
    return url.href;
  } catch {
    throw new Error(`${label} must be an absolute HTTP(S) URL: ${text}`);
  }
}

function normalizeDate(value: unknown, label: string): string | undefined {
  const text = textValue(value);
  if (!text) return undefined;
  const match = text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (!match) throw new Error(`${label} must contain a YYYY-MM-DD date.`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`${label} contains an invalid calendar date: ${match[0]}`);
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeExportedMovie(value: unknown, index: number): DoubanMovie {
  if (!value || typeof value !== "object") {
    throw new Error(`JSON movie at index ${index} is not an object.`);
  }
  const raw = value as Record<string, unknown>;
  const collect =
    raw.collectInfo && typeof raw.collectInfo === "object"
      ? (raw.collectInfo as Record<string, unknown>)
      : {};
  const rawUrl = textValue(raw.url ?? raw.link);
  const url = rawUrl
    ? normalizeWebUrl(rawUrl, `JSON movie ${index} URL`)
    : undefined;
  const explicitId = textValue(
    raw.subjectId ?? raw.doubanId ?? raw.id,
  )?.replace(/^douban:/, "");
  const urlObject = url ? new URL(url) : undefined;
  if (urlObject && urlObject.hostname !== "movie.douban.com") {
    throw new Error(`JSON movie ${index} URL must use movie.douban.com.`);
  }
  const urlId = urlObject?.pathname.match(/^\/subject\/(\d+)\/?$/)?.[1];
  const subjectId = explicitId?.match(/^\d+$/)?.[0] ?? urlId;
  if (!subjectId) {
    throw new Error(
      `JSON movie at index ${index} has no Douban subject ID or subject URL.`,
    );
  }
  if (url && !urlId)
    throw new Error(`JSON movie ${index} URL is not a Douban subject URL.`);
  if (urlId && explicitId?.match(/^\d+$/) && urlId !== explicitId) {
    throw new Error(
      `JSON movie ${index} has mismatched ID ${explicitId} and URL subject ${urlId}.`,
    );
  }
  const normalizedUrl = `https://movie.douban.com/subject/${subjectId}/`;
  const primaryName = textValue(raw.name ?? raw.title);
  const greyName = textValue(raw.greyName);
  const name = [greyName, primaryName]
    .filter(
      (part, partIndex, parts): part is string =>
        Boolean(part) && parts.indexOf(part) === partIndex,
    )
    .join(" / ");
  if (!name) throw new Error(`JSON movie ${subjectId} has no title.`);

  const rawTags = raw.tags ?? collect.tags;
  const tags = Array.isArray(rawTags)
    ? rawTags.map(textValue).filter(Boolean).join(", ")
    : textValue(rawTags);
  const rawYear = textValue(raw.year ?? raw.releaseDate)?.match(
    /(?:18|19|20)\d{2}/,
  )?.[0];
  const poster = normalizeWebUrl(
    raw.poster ?? raw.cover,
    `JSON movie ${subjectId} poster`,
  );
  const watchedDate = normalizeDate(
    raw.watchedDate ?? raw.date ?? collect.date,
    `JSON movie ${subjectId} watched date`,
  );
  const rating = normalizeRating(
    raw.rating ?? raw.score ?? collect.rating ?? collect.score,
  );
  const comment = textValue(raw.comment ?? collect.comment);
  const metadata = textValue(raw.metadata ?? raw.rawInfos ?? raw.intro);

  return {
    id: `douban:${subjectId}`,
    slug: textValue(raw.slug) ?? `douban-${subjectId}`,
    name,
    ...(rawYear ? { year: rawYear } : {}),
    ...(rating ? { rating } : {}),
    status: "watched",
    ...(poster ? { poster } : {}),
    url: normalizedUrl,
    ...(watchedDate ? { watchedDate } : {}),
    ...(tags ? { tags } : {}),
    ...(comment ? { comment } : {}),
    ...(metadata ? { metadata } : {}),
  };
}

function parseExportedJson(json: string, source: string): DoubanMovie[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new Error(
      `Could not parse ${source} as JSON: ${(error as Error).message}`,
    );
  }
  const records = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object"
      ? ((parsed as Record<string, unknown>).movies ??
        (parsed as Record<string, unknown>).items)
      : undefined;
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error(
      `${source} must contain a non-empty array, or an object with movies/items.`,
    );
  }
  return records.map(normalizeExportedMovie);
}

async function collectInputFiles(input: string): Promise<string[]> {
  let stats;
  try {
    stats = await fs.stat(input);
  } catch (error) {
    throw new Error(
      `Cannot read --input ${input}: ${(error as Error).message}`,
    );
  }
  if (stats.isFile()) return [input];
  if (!stats.isDirectory())
    throw new Error(`--input must be an HTML/JSON file or directory: ${input}`);

  const files = (await fs.readdir(input, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && /\.(?:html?|json)$/i.test(entry.name))
    .map((entry) => path.join(input, entry.name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (files.length === 0)
    throw new Error(`No .html, .htm, or .json files found in ${input}.`);
  return files;
}

export async function loadMoviesFromInput(
  input: string,
): Promise<DoubanMovie[]> {
  const files = await collectInputFiles(input);
  const movies = new Map<string, DoubanMovie>();
  let expectedTotal: number | undefined;
  let parsedCount = 0;
  let omittedCount = 0;
  const advertisedPositions = new Set<number>();

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const isJson = /\.json$/i.test(file);
    const parsed = isJson
      ? undefined
      : parseDoubanPage(content, DOUBAN_COLLECTION_URL);
    const pageMovies = parsed?.movies ?? parseExportedJson(content, file);
    if (
      expectedTotal !== undefined &&
      parsed?.total !== undefined &&
      parsed.total !== expectedTotal
    ) {
      throw new Error(
        `Saved pages disagree on collection total (${expectedTotal} versus ${parsed.total}).`,
      );
    }
    expectedTotal = parsed?.total ?? expectedTotal;
    if (parsed?.rangeStart !== undefined && parsed.rangeEnd !== undefined) {
      for (
        let position = parsed.rangeStart;
        position <= parsed.rangeEnd;
        position += 1
      ) {
        advertisedPositions.add(position);
      }
    }
    parsedCount += pageMovies.length;
    omittedCount += parsed?.omittedCount ?? 0;
    const uniqueBefore = movies.size;
    for (const movie of pageMovies) movies.set(movie.id, movie);
    const newUnique = movies.size - uniqueBefore;
    console.log(
      `[media:update] ${path.basename(file)}: parsed ${pageMovies.length}, added ${newUnique} unique${parsed?.omittedCount ? `, ${parsed.omittedCount} source record omitted by Douban` : ""}; totals ${parsedCount} parsed / ${movies.size} unique.`,
    );
  }

  if (movies.size === 0)
    throw new Error("The local input contained no valid movies.");
  const coveredCount = advertisedPositions.size;
  if (
    expectedTotal !== undefined &&
    (coveredCount > 0
      ? coveredCount < expectedTotal
      : parsedCount < expectedTotal)
  ) {
    throw new Error(
      `Saved input covers only ${coveredCount || parsedCount} of ${expectedTotal} advertised records. Save every pagination page before updating.`,
    );
  }
  if (movies.size < parsedCount) {
    console.warn(
      `[media:update] Saved pages contain ${parsedCount} records and ${movies.size} unique subject IDs; duplicates will be written once.`,
    );
  }
  if (omittedCount > 0) {
    console.warn(
      `[media:update] ${omittedCount} advertised record${omittedCount === 1 ? " was" : "s were"} absent from saved Douban item blocks (usually deleted or private) and cannot be imported.`,
    );
  }
  return [...movies.values()];
}

async function atomicWrite(filePath: string, content: string): Promise<void> {
  const directory = path.dirname(filePath);
  const temporary = path.join(
    directory,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
  );
  await fs.mkdir(directory, { recursive: true });
  try {
    await fs.writeFile(temporary, content, { encoding: "utf8", flag: "wx" });
    const verification = await fs.readFile(temporary, "utf8");
    if (verification !== content)
      throw new Error("Temporary-file verification failed.");
    await fs.rename(temporary, filePath);
  } finally {
    await fs.rm(temporary, { force: true }).catch(() => undefined);
  }
}

function countMovieRows(markdown: string): number {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) =>
    /^##\s+movies\s*$/i.test(line.trim()),
  );
  const tableStart = lines.findIndex(
    (line, index) => index > start && line.trim().startsWith("|"),
  );
  let tableEnd = tableStart;
  while (
    tableEnd >= 0 &&
    tableEnd < lines.length &&
    lines[tableEnd].trim().startsWith("|")
  ) {
    tableEnd += 1;
  }
  return parseMediaTable(lines.slice(tableStart, tableEnd)).rows.length;
}

export async function runMediaUpdate(options: CliOptions): Promise<void> {
  const current = await fs.readFile(options.output, "utf8").catch((error) => {
    throw new Error(
      `Cannot read Media data file ${options.output}: ${(error as Error).message}`,
    );
  });
  const movies = options.input
    ? await loadMoviesFromInput(options.input)
    : await fetchAllDoubanMovies({ delayMs: options.delayMs });
  const updated = replaceMoviesTable(current, movies);
  const rowCount = countMovieRows(updated);
  if (rowCount < movies.length) {
    throw new Error(
      `Generated movies table has ${rowCount} rows for ${movies.length} imports; refusing to write.`,
    );
  }

  if (options.dryRun) {
    console.log(
      `[media:update] Dry run successful: ${movies.length} Douban movies merged into ${rowCount} rows. No files written.`,
    );
    return;
  }

  await atomicWrite(options.output, updated);
  console.log(
    `[media:update] Updated ${options.output} atomically (${rowCount} movie rows).`,
  );
  console.log(
    "[media:update] Review the Git diff; this command does not commit or push changes.",
  );
}

async function main(): Promise<void> {
  try {
    await runMediaUpdate(parseArgs(process.argv.slice(2)));
  } catch (error) {
    console.error(`[media:update] ERROR: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  void main();
}
