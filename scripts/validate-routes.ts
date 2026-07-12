import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isValidRouteId } from "../src/lib/routes/identity";
import { normalizeGpxPath, readRouteRecord, scalar, walkFiles } from "./route-files";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "src", "content", "routes");
const LEGACY = join(ROOT, "src", "content", "map");
const PUBLIC = join(ROOT, "public");
const GPX_DIRECTORY = join(PUBLIC, "routes");
const errors: string[] = [];
const warnings: string[] = [];
const info: string[] = [];
const display = (file: string) => relative(ROOT, file).replaceAll("\\", "/");

function exactPublicFile(path: string) {
  const segments = path.slice(1).split("/");
  let current = PUBLIC;
  for (const segment of segments) {
    if (!existsSync(current)) return { exists: false, casing: false };
    const entry = readdirSync(current).find((name) => name.toLowerCase() === segment.toLowerCase());
    if (!entry) return { exists: false, casing: false };
    if (entry !== segment) return { exists: true, casing: false };
    current = join(current, entry);
  }
  return { exists: existsSync(current), casing: true };
}

function coordinateValid(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const point = value as Record<string, unknown>;
  return typeof point.lat === "number" && Number.isFinite(point.lat) && point.lat >= -90 && point.lat <= 90 && typeof point.lng === "number" && Number.isFinite(point.lng) && point.lng >= -180 && point.lng <= 180;
}

function validDate(value: unknown) {
  return (typeof value === "string" || value instanceof Date) && Number.isFinite(new Date(value as string).valueOf());
}

const records = walkFiles(CONTENT, [".md", ".mdx"]).map(readRouteRecord);
const gpxFiles = walkFiles(GPX_DIRECTORY, [".gpx"]);
const referenced = new Set<string>();
const ids = new Map<string, string>();
const paths = new Map<string, string>();
let chinese = 0, english = 0, published = 0, unpublished = 0, drafts = 0, missingLocation = 0, missingElevation = 0;

for (const record of records) {
  const name = display(record.file);
  if (!record.parts) { errors.push(`${name}: invalid frontmatter`); continue; }
  const fm = record.parts.frontmatter;
  const lang = record.lang!;
  lang === "en" ? english += 1 : chinese += 1;
  scalar(fm, "draft") === true ? drafts += 1 : undefined;
  scalar(fm, "published") === false ? unpublished += 1 : published += 1;
  const location = scalar(fm, "location");
  if (location === "Unknown") { missingLocation += 1; warnings.push(`${name}: location is Unknown`); }
  if (!scalar(fm, "description")) warnings.push(`${name}: missing description`);
  const title = scalar(fm, "title");
  if (typeof title === "string" && /(?:Unknown|Route Journal|路线记录)/.test(title)) warnings.push(`${name}: generated default title`);
  if (!isValidRouteId(record.routeId)) errors.push(`${name}: invalid or missing routeId`);
  else {
    const key = `${record.routeId}:${lang}`;
    if (ids.has(key)) errors.push(`${name}: duplicate routeId + lang with ${ids.get(key)}`);
    else ids.set(key, name);
  }
  if (!record.gpx) errors.push(`${name}: missing gpx`);
  else {
    const gpx = normalizeGpxPath(record.gpx);
    const key = `${gpx.toLowerCase()}:${lang}`;
    if (paths.has(key)) errors.push(`${name}: duplicate normalized gpx + lang with ${paths.get(key)}`);
    else paths.set(key, name);
    const file = exactPublicFile(gpx);
    if (!file.exists) errors.push(`${name}: referenced GPX does not exist: ${gpx}`);
    else if (!file.casing) errors.push(`${name}: GPX path casing does not match: ${gpx}`);
    referenced.add(gpx.toLowerCase());
  }
  if (!validDate(scalar(fm, "date"))) errors.push(`${name}: invalid date`);
  for (const key of ["start", "end", "coordinates"]) {
    const value = scalar(fm, key);
    if (value !== undefined && !coordinateValid(value)) errors.push(`${name}: invalid ${key} coordinates`);
  }
  const distance = scalar(fm, "distance");
  if (typeof distance !== "number" || !Number.isFinite(distance) || distance < 0) errors.push(`${name}: invalid distance (kilometres must be numeric)`);
  const duration = scalar(fm, "duration");
  if (duration !== undefined && (typeof duration !== "number" || !Number.isInteger(duration) || duration < 0)) errors.push(`${name}: invalid duration (seconds must be a non-negative integer)`);
  const elevation = scalar(fm, "elevationGain");
  if (elevation === undefined) { missingElevation += 1; warnings.push(`${name}: missing elevation`); }
  else if (typeof elevation !== "number" || !Number.isFinite(elevation)) errors.push(`${name}: invalid elevationGain`);
}

if (existsSync(LEGACY) && walkFiles(LEGACY, [".md", ".mdx"]).length > 0) errors.push("legacy Route content remains in src/content/map");
const runtimeFiles = walkFiles(join(ROOT, "src"), [".ts", ".tsx", ".astro"]);
for (const file of runtimeFiles) {
  const source = readFileSync(file, "utf8");
  if (/getCollection\(["']map["']\)/.test(source)) errors.push(`${display(file)}: remaining getCollection("map")`);
  if (/\brouteFile\b/.test(source)) errors.push(`${display(file)}: remaining Route runtime routeFile reference`);
  if (/\bmapCollection\b/.test(source)) errors.push(`${display(file)}: remaining map content collection`);
}

let unreferenced = 0;
for (const file of gpxFiles) {
  const path = `/${relative(PUBLIC, file).replaceAll("\\", "/")}`.toLowerCase();
  if (!referenced.has(path)) { unreferenced += 1; warnings.push(`${display(file)}: unreferenced GPX`); }
}
const counterpartIds = new Map<string, Set<string>>();
for (const record of records) {
  if (typeof record.routeId !== "string") continue;
  if (!counterpartIds.has(record.routeId)) counterpartIds.set(record.routeId, new Set());
  counterpartIds.get(record.routeId)!.add(record.lang!);
}
for (const [routeId, languages] of counterpartIds) if (languages.size < 2) warnings.push(`${routeId}: missing language counterpart`);

info.push(`Route Markdown total: ${records.length}`);
info.push(`GPX total: ${gpxFiles.length}`);
info.push(`Chinese count: ${chinese}`);
info.push(`English count: ${english}`);
info.push(`Published count: ${published}`);
info.push(`Unpublished count: ${unpublished}`);
info.push(`Draft count: ${drafts}`);
info.push(`Routes missing location: ${missingLocation}`);
info.push(`Routes missing elevation: ${missingElevation}`);
info.push(`Unreferenced GPX count: ${unreferenced}`);
info.forEach((message) => console.log(`INFO ${message}`));
warnings.forEach((message) => console.warn(`WARNING ${message}`));
errors.forEach((message) => console.error(`ERROR ${message}`));
console.log(`Validation: ${errors.length} errors, ${warnings.length} warnings.`);
if (errors.length > 0) process.exitCode = 1;
