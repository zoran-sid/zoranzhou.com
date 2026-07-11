import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  extname,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseGpx,
  type ParsedRoute,
  type RouteEndpoint,
} from "../src/lib/routes/gpx";

interface CliOptions {
  inputs: string[];
  contentDirectory: string;
  locale: "zh-CN" | "en";
  published: boolean;
  geocode: boolean;
  dryRun: boolean;
}

interface GeocodingCacheEntry {
  location: string;
  slug: string;
  displayName?: string;
  updatedAt: string;
}

type GeocodingCache = Record<string, GeocodingCacheEntry>;

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_ROUTE_DIRECTORY = join(PROJECT_ROOT, "public", "routes");
const DEFAULT_CONTENT_DIRECTORY = join(
  PROJECT_ROOT,
  "src",
  "content",
  "routes",
);
const LEGACY_CONTENT_DIRECTORY = join(PROJECT_ROOT, "src", "content", "map");
const GEOCODING_CACHE_FILE = join(
  PROJECT_ROOT,
  ".cache",
  "routes",
  "geocoding.json",
);

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value == null) return fallback;
  return !["false", "0", "no", "off"].includes(value.toLowerCase());
}

function parseArgs(args: string[]): CliOptions {
  const inputs = args.filter((arg) => !arg.startsWith("--"));
  const option = (name: string) =>
    args
      .find((arg) => arg.startsWith(`--${name}=`))
      ?.split("=")
      .slice(1)
      .join("=");
  const localeValue = option("lang") ?? option("locale") ?? "zh-CN";
  const locale = localeValue === "en" ? "en" : "zh-CN";
  const contentDirectory = resolve(
    PROJECT_ROOT,
    option("output") ?? relative(PROJECT_ROOT, DEFAULT_CONTENT_DIRECTORY),
  );

  return {
    inputs,
    contentDirectory,
    locale,
    published: parseBoolean(option("published"), true),
    geocode: !args.includes("--no-geocode"),
    dryRun: args.includes("--dry-run"),
  };
}

function walkFiles(directory: string, extension: string) {
  if (!existsSync(directory)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(path, extension));
    else if (
      entry.isFile() &&
      extname(entry.name).toLowerCase() === extension
    ) {
      files.push(path);
    }
  }
  return files;
}

function resolveInputs(inputs: string[]) {
  if (inputs.length === 0) return walkFiles(DEFAULT_ROUTE_DIRECTORY, ".gpx");

  const files = new Set<string>();
  for (const input of inputs) {
    const path = resolve(PROJECT_ROOT, input);
    if (!existsSync(path)) {
      console.warn(`⚠️  Skipped missing input: ${input}`);
      continue;
    }
    const stats = statSync(path);
    if (stats.isDirectory()) {
      for (const file of walkFiles(path, ".gpx")) files.add(file);
    } else if (extname(path).toLowerCase() === ".gpx") {
      files.add(path);
    } else {
      console.warn(`⚠️  Skipped non-GPX input: ${input}`);
    }
  }
  return [...files];
}

function loadCache(): GeocodingCache {
  if (!existsSync(GEOCODING_CACHE_FILE)) return {};
  try {
    return JSON.parse(readFileSync(GEOCODING_CACHE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveCache(cache: GeocodingCache, dryRun: boolean) {
  if (dryRun) return;
  mkdirSync(dirname(GEOCODING_CACHE_FILE), { recursive: true });
  writeFileSync(GEOCODING_CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`);
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function conciseLocation(address: Record<string, string>, fallback?: string) {
  const area =
    address.suburb ??
    address.city_district ??
    address.borough ??
    address.quarter ??
    address.neighbourhood ??
    address.town ??
    address.city ??
    address.village ??
    address.county ??
    address.state;
  const city =
    address.city ?? address.town ?? address.municipality ?? address.county;
  const parts = [area, city].filter(
    (value, index, values): value is string =>
      Boolean(value) && values.indexOf(value) === index,
  );
  return parts.join(", ") || fallback || "Unknown";
}

function geocodingKey(point: Pick<RouteEndpoint, "lat" | "lng">) {
  return `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`;
}

async function reverseGeocode(
  point: Pick<RouteEndpoint, "lat" | "lng"> | undefined,
  cache: GeocodingCache,
  enabled: boolean,
) {
  if (!point || !enabled) return { location: "Unknown", slug: "unknown" };
  const key = geocodingKey(point);
  if (cache[key]) return cache[key];

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(point.lat));
    url.searchParams.set("lon", String(point.lng));
    url.searchParams.set("zoom", "12");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("namedetails", "1");
    url.searchParams.set("accept-language", "en");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "zoranzhou.com Route Importer/2.0",
      },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as {
      display_name?: string;
      address?: Record<string, string>;
      namedetails?: Record<string, string>;
      name?: string;
    };
    const location = conciseLocation(
      data.address ?? {},
      data.namedetails?.["name:en"] ?? data.name,
    );
    const entry = {
      location,
      slug: slugify(location) || "unknown",
      displayName: data.display_name,
      updatedAt: new Date().toISOString(),
    };
    cache[key] = entry;
    return entry;
  } catch (error) {
    console.warn(
      `⚠️  Reverse geocoding unavailable for ${key}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return { location: "Unknown", slug: "unknown" };
  }
}

function filenameFallbackDate(...values: string[]) {
  for (const value of values) {
    const match = /(?:^|\D)(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)(?:\D|$)/.exec(
      value,
    );
    if (!match) continue;
    const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`);
    if (Number.isFinite(date.valueOf())) return date.toISOString();
  }
  return undefined;
}

function filenameFallbackDistance(...values: string[]) {
  for (const value of values) {
    const match = /(\d+(?:\.\d+)?)\s*km\b/i.exec(value);
    if (match) return Number(match[1]) * 1_000;
  }
  return undefined;
}

function filenameFallbackDuration(...values: string[]) {
  for (const value of values) {
    const compact = /(\d+)h(?:(\d+)m)?(?:(\d+)s)?/i.exec(value);
    if (compact) {
      return (
        Number(compact[1]) * 3_600 +
        Number(compact[2] ?? 0) * 60 +
        Number(compact[3] ?? 0)
      );
    }
    const minutes = /(\d+)m(?:(\d+)s)?/i.exec(value);
    if (minutes) return Number(minutes[1]) * 60 + Number(minutes[2] ?? 0);
  }
  return undefined;
}

function round(value: number | undefined, digits = 2) {
  if (value == null || !Number.isFinite(value)) return undefined;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function inferKind(route: ParsedRoute) {
  const value = `${route.name ?? ""} ${route.description ?? ""}`.toLowerCase();
  if (/\b(run|running|jog|jogging)\b/.test(value)) return "run";
  if (/\b(cycl|bike|biking|ride|riding)\b/.test(value)) return "ride";
  if (/\b(hike|hiking|trek|trail)\b/.test(value)) return "hike";
  if (/photo.?walk|photowalk/.test(value)) return "photo-walk";
  return "travel";
}

function publicRoutePath(file: string) {
  const publicDirectory = join(PROJECT_ROOT, "public");
  const routePath = relative(publicDirectory, file).split(sep).join("/");
  return `/${routePath}`;
}

function yamlValue(value: unknown) {
  return JSON.stringify(value);
}

function splitMarkdown(content: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n?)([\s\S]*)$/.exec(content);
  if (!match) return undefined;
  return {
    frontmatter: match[1],
    separator: match[2] || "\n",
    body: match[3],
  };
}

function topLevelField(frontmatter: string, key: string) {
  const match = new RegExp(`^${key}:\\s*(.*)$`, "m").exec(frontmatter);
  if (!match) return undefined;
  const value = match[1].trim();
  if (!value) return undefined;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value.replace(/^['"]|['"]$/g, "");
  }
}

function upsertFrontmatter(
  frontmatter: string,
  updates: Record<string, unknown>,
  preserveExisting: Set<string>,
) {
  const lines = frontmatter.split(/\r?\n/);

  for (const [key, value] of Object.entries(updates)) {
    const start = lines.findIndex((line) =>
      new RegExp(`^${key}:\\s*`).test(line),
    );
    if (start >= 0 && preserveExisting.has(key)) continue;
    const replacement = `${key}: ${yamlValue(value)}`;

    if (start < 0) {
      lines.push(replacement);
      continue;
    }

    let end = start + 1;
    while (
      end < lines.length &&
      (lines[end].trim() === "" || /^\s+/.test(lines[end]))
    ) {
      end += 1;
    }
    lines.splice(start, end - start, replacement);
  }

  return lines.join("\n");
}

function normalizeRouteReference(value: string) {
  try {
    return decodeURI(value).replaceAll("\\", "/").replace(/^\.\//, "/");
  } catch {
    return value.replaceAll("\\", "/").replace(/^\.\//, "/");
  }
}

function extractRouteReference(markdown: string) {
  const parts = splitMarkdown(markdown);
  if (!parts) return undefined;
  const value =
    topLevelField(parts.frontmatter, "gpx") ??
    topLevelField(parts.frontmatter, "routeFile");
  return typeof value === "string" ? normalizeRouteReference(value) : undefined;
}

function findExistingMarkdown(routePath: string) {
  const directories = [DEFAULT_CONTENT_DIRECTORY, LEGACY_CONTENT_DIRECTORY];
  const matches: string[] = [];
  for (const directory of directories) {
    for (const file of walkFiles(directory, ".md")) {
      const content = readFileSync(file, "utf8");
      if (
        extractRouteReference(content) === normalizeRouteReference(routePath)
      ) {
        matches.push(file);
      }
    }
  }
  return matches;
}

function uniqueTargetPath(directory: string, stem: string) {
  let candidate = join(directory, `${stem}.md`);
  let index = 2;
  while (existsSync(candidate)) {
    candidate = join(directory, `${stem}-${index}.md`);
    index += 1;
  }
  return candidate;
}

function dateStamp(iso: string) {
  return iso.slice(0, 10).replaceAll("-", "");
}

function distanceStamp(distanceKm: number | undefined) {
  if (distanceKm == null) return "unknown-distance";
  return `${Number(distanceKm.toFixed(2)).toString()}km`;
}

function endpointValue(point: RouteEndpoint | undefined) {
  if (!point) return undefined;
  return {
    lat: round(point.lat, 6),
    lng: round(point.lng, 6),
    ...(point.name ? { name: point.name } : {}),
  };
}

function buildMetadata(route: ParsedRoute) {
  return {
    sourceFormat: route.format,
    sourceApp: route.source,
    creator: route.creator,
    sourceName: route.name,
    pointCount: route.points.length,
    segmentCount: route.segments.length,
    waypointCount: route.waypoints.length,
    startedAt: route.startedAt,
    endedAt: route.endedAt,
    elevationLoss: round(route.elevationLossMeters, 0),
    minElevation: round(route.minElevationMeters, 1),
    maxElevation: round(route.maxElevationMeters, 1),
    sensitiveMetrics: route.sensitiveMetrics,
  };
}

function cleanObject<T extends Record<string, unknown>>(object: T) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  );
}

function createBody(locale: "zh-CN" | "en") {
  return locale === "zh-CN"
    ? "## Story\n\n<!-- 在这里写下这段旅程。重新导入 GPX 时，本段正文不会被覆盖。 -->\n"
    : "## Story\n\n<!-- Write the story of this journey here. Re-importing the GPX will not overwrite this body. -->\n";
}

async function processRoute(
  file: string,
  options: CliOptions,
  cache: GeocodingCache,
) {
  const xml = readFileSync(file, "utf8");
  const route = parseGpx(xml);
  if (route.points.length < 2) {
    console.warn(
      `⚠️  Skipped ${basename(file)}: fewer than two valid GPS points.`,
    );
    return { created: 0, updated: 0, skipped: 1 };
  }

  const fallbackValues = [basename(file), route.name ?? ""];
  const startedAt =
    route.startedAt ??
    route.metadataTime ??
    filenameFallbackDate(...fallbackValues) ??
    statSync(file).mtime.toISOString();
  const distanceMeters =
    route.distanceMeters > 0
      ? route.distanceMeters
      : filenameFallbackDistance(...fallbackValues);
  const durationSeconds =
    route.durationSeconds ?? filenameFallbackDuration(...fallbackValues);
  const distanceKm =
    distanceMeters == null ? undefined : round(distanceMeters / 1_000, 2);
  const routePath = publicRoutePath(file);
  const existingFiles = findExistingMarkdown(routePath);
  const existingLocation = existingFiles
    .map((markdown) => {
      const parts = splitMarkdown(readFileSync(markdown, "utf8"));
      return parts ? topLevelField(parts.frontmatter, "location") : undefined;
    })
    .find(
      (value): value is string =>
        typeof value === "string" && value !== "Unknown",
    );
  const geocoded = await reverseGeocode(route.start, cache, options.geocode);
  const location =
    geocoded.location === "Unknown" && existingLocation
      ? existingLocation
      : geocoded.location;
  const locationSlug =
    geocoded.slug === "unknown" && existingLocation
      ? slugify(existingLocation) || "unknown"
      : geocoded.slug;
  const locale = options.locale;
  const kind = inferKind(route);
  const metadata = cleanObject(buildMetadata(route));

  const generatedUpdates = cleanObject({
    date: startedAt,
    location,
    distance: distanceKm,
    duration: durationSeconds == null ? undefined : Math.round(durationSeconds),
    elevationGain: round(route.elevationGainMeters, 0),
    gpx: routePath,
    start: endpointValue(route.start),
    end: endpointValue(route.end),
    metadata,
  });
  const createOnly = {
    title:
      locale === "zh-CN"
        ? `${location} · 路线记录`
        : `${location} · Route Journal`,
    description:
      locale === "zh-CN"
        ? `${location}的一段旅行与生活记录。`
        : `A travel and life log from ${location}.`,
    published: options.published,
    tags: ["Route", "Travel Journal"],
    lang: locale,
    kind,
    draft: false,
    photos: [],
  };

  const targets =
    existingFiles.length > 0
      ? existingFiles
      : [
          uniqueTargetPath(
            options.contentDirectory,
            `${dateStamp(startedAt)}_${distanceStamp(distanceKm)}_${locationSlug}`,
          ),
        ];

  let created = 0;
  let updated = 0;
  for (const target of targets) {
    if (existsSync(target)) {
      const original = readFileSync(target, "utf8");
      const parts = splitMarkdown(original);
      if (!parts) {
        console.warn(
          `⚠️  Skipped ${relative(PROJECT_ROOT, target)}: invalid frontmatter.`,
        );
        continue;
      }
      const preserved = new Set(["title", "description", "cover", "photos"]);
      const currentLocation = topLevelField(parts.frontmatter, "location");
      const targetUpdates = {
        ...generatedUpdates,
        ...(typeof currentLocation === "string" && currentLocation !== "Unknown"
          ? { location: currentLocation }
          : {}),
      };
      const frontmatter = upsertFrontmatter(
        parts.frontmatter,
        {
          ...targetUpdates,
          published: options.published,
          tags: ["Route", "Travel Journal"],
          lang: topLevelField(parts.frontmatter, "lang") ?? locale,
          kind: topLevelField(parts.frontmatter, "kind") ?? kind,
        },
        new Set([
          ...preserved,
          ...(topLevelField(parts.frontmatter, "published") !== undefined
            ? ["published"]
            : []),
          ...(topLevelField(parts.frontmatter, "tags") !== undefined
            ? ["tags"]
            : []),
        ]),
      );
      const next = `---\n${frontmatter}\n---${parts.separator}${parts.body}`;
      if (next === original) {
        console.log(`↔️  Unchanged ${relative(PROJECT_ROOT, target)}`);
        continue;
      }
      if (!options.dryRun) writeFileSync(target, next);
      console.log(`♻️  Updated ${relative(PROJECT_ROOT, target)}`);
      updated += 1;
    } else {
      mkdirSync(dirname(target), { recursive: true });
      const frontmatter = Object.entries({ ...createOnly, ...generatedUpdates })
        .map(([key, value]) => `${key}: ${yamlValue(value)}`)
        .join("\n");
      const markdown = `---\n${frontmatter}\n---\n\n${createBody(locale)}`;
      if (!options.dryRun) writeFileSync(target, markdown);
      console.log(`✨ Created ${relative(PROJECT_ROOT, target)}`);
      created += 1;
    }
  }

  return { created, updated, skipped: 0 };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = resolveInputs(options.inputs).sort((a, b) =>
    a.localeCompare(b),
  );

  if (files.length === 0) {
    console.error(
      "No GPX files found. Put files in public/routes/ or pass a GPX path explicitly.",
    );
    process.exitCode = 1;
    return;
  }

  console.log("=".repeat(64));
  console.log("Route System v2 — GPX Import");
  console.log("=".repeat(64));
  console.log(`Files: ${files.length}`);
  console.log(`Mode: ${options.dryRun ? "dry run" : "write"}`);
  console.log(`Reverse geocoding: ${options.geocode ? "enabled" : "disabled"}`);

  const cache = loadCache();
  const totals = { created: 0, updated: 0, skipped: 0 };
  for (const [index, file] of files.entries()) {
    const result = await processRoute(file, options, cache);
    totals.created += result.created;
    totals.updated += result.updated;
    totals.skipped += result.skipped;
    if (options.geocode && index < files.length - 1) {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 1_100));
    }
  }
  saveCache(cache, options.dryRun);

  console.log("-".repeat(64));
  console.log(
    `Done: ${totals.created} created, ${totals.updated} updated, ${totals.skipped} skipped.`,
  );
  if (options.dryRun) console.log("No files were written (--dry-run). ");
}

main().catch((error) => {
  console.error("Route import failed:", error);
  process.exitCode = 1;
});
