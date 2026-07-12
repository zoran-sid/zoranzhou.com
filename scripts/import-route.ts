import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseGpx, type ParsedRoute, type RouteEndpoint } from "../src/lib/routes/gpx";
import { createRouteId } from "../src/lib/routes/identity";
import {
  assembleMarkdown,
  normalizeGpxPath,
  readRouteRecord,
  scalar,
  setFields,
  walkFiles,
  yamlValue,
  type Locale,
} from "./route-files";

interface Options {
  inputs: string[];
  locale: Locale;
  published: boolean;
  geocode: boolean;
  dryRun: boolean;
}

interface GeocodedLocation { location: string; slug: string }

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GPX_DIRECTORY = join(ROOT, "public", "routes");
const CONTENT_DIRECTORY = join(ROOT, "src", "content", "routes");

function option(args: string[], name: string) {
  return args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
}

function parseArgs(args: string[]): Options {
  const localeValue = option(args, "lang") ?? option(args, "locale");
  return {
    inputs: args.filter((arg) => !arg.startsWith("--")),
    locale: localeValue === "en" ? "en" : "zh-CN",
    published: !["false", "0", "no"].includes((option(args, "published") ?? "true").toLowerCase()),
    geocode: !args.includes("--no-geocode"),
    dryRun: args.includes("--dry-run"),
  };
}

function display(file: string) { return relative(ROOT, file).replaceAll("\\", "/"); }

function inputFiles(inputs: string[]) {
  if (inputs.length === 0) return walkFiles(GPX_DIRECTORY, [".gpx"]);
  const result = new Set<string>();
  for (const input of inputs) {
    const file = resolve(ROOT, input);
    if (!existsSync(file)) {
      console.warn(`SKIPPED missing input: ${input}`);
      continue;
    }
    if (statSync(file).isDirectory()) walkFiles(file, [".gpx"]).forEach((item) => result.add(item));
    else if (extname(file).toLowerCase() === ".gpx") result.add(file);
    else console.warn(`SKIPPED non-GPX input: ${input}`);
  }
  return [...result];
}

function publicPath(file: string) {
  const path = relative(join(ROOT, "public"), file).split(sep).join("/");
  if (path.startsWith("../")) throw new Error(`${display(file)} is outside public/`);
  return normalizeGpxPath(path);
}

function round(value: number | undefined, digits = 2) {
  if (value == null || !Number.isFinite(value)) return undefined;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function endpoint(point: RouteEndpoint | undefined) {
  if (!point) return undefined;
  return { lat: round(point.lat, 6), lng: round(point.lng, 6), ...(point.name ? { name: point.name } : {}) };
}

function filenameDate(...values: string[]) {
  for (const value of values) {
    const match = /(?:^|\D)(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)(?:\D|$)/.exec(value);
    if (!match) continue;
    const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`);
    if (Number.isFinite(date.valueOf())) return date.toISOString();
  }
}

function fallbackDistance(value: string) {
  const match = /(\d+(?:\.\d+)?)\s*km\b/i.exec(value);
  return match ? Number(match[1]) : undefined;
}

function inferKind(route: ParsedRoute) {
  const value = `${route.name ?? ""} ${route.description ?? ""}`.toLowerCase();
  if (/\b(run|running|jog|jogging)\b/.test(value)) return "run";
  if (/\b(cycl|bike|biking|ride|riding)\b/.test(value)) return "ride";
  if (/\b(hike|hiking|trek|trail)\b/.test(value)) return "hike";
  if (/photo.?walk|photowalk/.test(value)) return "photo-walk";
  return "travel";
}

async function reverseGeocode(point: RouteEndpoint | undefined, enabled: boolean): Promise<GeocodedLocation> {
  if (!point || !enabled) return { location: "Unknown", slug: "unknown" };
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(point.lat));
    url.searchParams.set("lon", String(point.lng));
    url.searchParams.set("zoom", "12");
    url.searchParams.set("accept-language", "en");
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "zoranzhou.com Route Importer/2.0" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as { display_name?: string; name?: string; address?: Record<string, string> };
    const address = data.address ?? {};
    const location = address.suburb ?? address.city_district ?? address.city ?? address.town ?? address.county ?? address.state ?? data.name ?? "Unknown";
    return { location, slug: location === "Unknown" ? "unknown" : location.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown" };
  } catch (error) {
    console.warn(`WARNING reverse geocoding failed: ${error instanceof Error ? error.message : String(error)}`);
    return { location: "Unknown", slug: "unknown" };
  }
}

function routeRecords() {
  return walkFiles(CONTENT_DIRECTORY, [".md", ".mdx"]).map(readRouteRecord);
}

function comparablePoint(value: unknown, point: RouteEndpoint | undefined) {
  if (!value || typeof value !== "object" || !point) return false;
  const item = value as Record<string, unknown>;
  return typeof item.lat === "number" && typeof item.lng === "number" && Math.abs(item.lat - point.lat) < 0.00001 && Math.abs(item.lng - point.lng) < 0.00001;
}

function fingerprintMatch(frontmatter: string, route: ParsedRoute, startedAt: string) {
  const date = scalar(frontmatter, "date");
  const start = scalar(frontmatter, "start");
  const end = scalar(frontmatter, "end");
  if (typeof date !== "string" || date.slice(0, 10) !== startedAt.slice(0, 10)) return false;
  return comparablePoint(start, route.start) && comparablePoint(end, route.end);
}

function findTargets(routeId: string, gpx: string, route: ParsedRoute, startedAt: string, locale: Locale) {
  const records = routeRecords().filter((record) => record.parts);
  const byId = records.filter((record) => record.routeId === routeId);
  if (byId.length > 0) return { matches: byId, reason: "routeId" };
  const byGpx = records.filter((record) => record.gpx === gpx);
  if (byGpx.length > 0) return { matches: byGpx, reason: "gpx" };
  const byFingerprint = records.filter((record) => fingerprintMatch(record.parts!.frontmatter, route, startedAt));
  if (byFingerprint.length > 0) return { matches: byFingerprint, reason: "fingerprint" };
  return { matches: records.filter((record) => record.lang === locale && record.routeId === routeId), reason: "none" };
}

function metadata(route: ParsedRoute) {
  return {
    sourceFormat: route.format,
    sourceApp: route.source,
    creator: route.creator,
    sourceName: route.name,
    pointCount: route.points.length,
    trackCount: route.trackCount,
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

function generatedUpdates(route: ParsedRoute, routeId: string, gpx: string, startedAt: string) {
  const distance = route.distanceMeters > 0 ? round(route.distanceMeters / 1_000, 2) : fallbackDistance(basename(gpx));
  return {
    routeId,
    date: startedAt,
    distance,
    duration: route.durationSeconds == null ? undefined : Math.round(route.durationSeconds),
    elevationGain: round(route.elevationGainMeters, 0),
    gpx,
    start: endpoint(route.start),
    end: endpoint(route.end),
    coordinates: endpoint(route.points[Math.floor(route.points.length / 2)]),
    metadata: Object.fromEntries(Object.entries(metadata(route)).filter(([, value]) => value !== undefined)),
  };
}

function createFilename(startedAt: string, distance: number | undefined, routeId: string, locale: Locale) {
  const day = startedAt.slice(0, 10).replaceAll("-", "");
  const distancePart = distance == null ? "unknown-distance" : `${Number(distance.toFixed(2))}km`;
  return `${day}_${distancePart}_${routeId}${locale === "en" ? ".en" : ""}.md`;
}

function createBody(locale: Locale) {
  return locale === "zh-CN"
    ? "## 旅程记录\n\n<!-- 在这里写下这段旅程。重新导入 GPX 不会覆盖正文。 -->\n"
    : "## Story\n\n<!-- Write the story of this journey here. Re-importing the GPX will not overwrite this body. -->\n";
}

async function processFile(file: string, options: Options) {
  const route = parseGpx(readFileSync(file, "utf8"));
  if (route.points.length < 2) {
    console.warn(`SKIPPED ${display(file)}: fewer than two valid track points`);
    return "skipped";
  }
  const routeId = createRouteId(route);
  const gpx = publicPath(file);
  const startedAt = route.startedAt ?? route.metadataTime ?? filenameDate(basename(file), route.name ?? "") ?? statSync(file).mtime.toISOString();
  const updates = generatedUpdates(route, routeId, gpx, startedAt);
  const targetResult = findTargets(routeId, gpx, route, startedAt, options.locale);

  if (targetResult.matches.length > 0) {
    let changed = false;
    for (const record of targetResult.matches) {
      const frontmatter = setFields(record.parts!.frontmatter, updates);
      const next = assembleMarkdown(record.parts!, frontmatter);
      if (next === record.content) {
        console.log(`UNCHANGED ${display(record.file)} (${targetResult.reason})`);
        continue;
      }
      if (!options.dryRun) writeFileSync(record.file, next);
      console.log(`UPDATED ${display(record.file)} (${targetResult.reason}, ${record.lang})`);
      changed = true;
    }
    return changed ? "updated" : "unchanged";
  }

  const geocoded = await reverseGeocode(route.start, options.geocode);
  const distance = updates.distance as number | undefined;
  const filename = createFilename(startedAt, distance, routeId, options.locale);
  const target = join(CONTENT_DIRECTORY, filename);
  if (existsSync(target)) throw new Error(`refusing to overwrite existing ${display(target)}`);
  const kind = inferKind(route);
  const title = options.locale === "zh-CN" ? `${geocoded.location} · 路线记录` : `${geocoded.location} · Route Journal`;
  const initial = {
    title,
    description: options.locale === "zh-CN" ? `${geocoded.location}的一段旅行与生活记录。` : `A travel and life log from ${geocoded.location}.`,
    tags: ["Route", "Travel Journal"],
    published: options.published,
    draft: false,
    kind,
    lang: options.locale,
    location: geocoded.location,
    photos: [],
    ...updates,
  };
  const frontmatter = Object.entries(initial).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}: ${yamlValue(value)}`).join("\n");
  const markdown = `---\n${frontmatter}\n---\n\n${createBody(options.locale)}`;
  if (!options.dryRun) {
    mkdirSync(CONTENT_DIRECTORY, { recursive: true });
    writeFileSync(target, markdown);
  }
  console.log(`CREATED ${display(target)} (${routeId}, ${options.locale})`);
  return "created";
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = inputFiles(options.inputs).sort((a, b) => a.localeCompare(b));
  if (files.length === 0) throw new Error("No GPX files found in public/routes/ or supplied inputs.");
  console.log(`Route import: ${files.length} GPX; ${options.dryRun ? "dry-run" : "write"}; geocode ${options.geocode ? "on" : "off"}`);
  const totals = { created: 0, updated: 0, unchanged: 0, skipped: 0 };
  for (const file of files) {
    const result = await processFile(file, options);
    totals[result] += 1;
  }
  console.log(`Totals: ${totals.created} created, ${totals.updated} updated, ${totals.unchanged} unchanged, ${totals.skipped} skipped.`);
  if (options.dryRun) console.log("No files were written (--dry-run).");
}

main().catch((error) => {
  console.error(`ERROR ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
