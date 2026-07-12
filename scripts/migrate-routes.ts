import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseGpx } from "../src/lib/routes/gpx";
import { createRouteId } from "../src/lib/routes/identity";
import {
  assembleMarkdown,
  normalizeGpxPath,
  removeField,
  scalar,
  setFields,
  splitMarkdown,
  walkFiles,
} from "./route-files";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LEGACY = join(ROOT, "src", "content", "map");
const ROUTES = join(ROOT, "src", "content", "routes");
const PUBLIC = join(ROOT, "public");
const dryRun = process.argv.includes("--dry-run");

function display(file: string) { return relative(ROOT, file).replaceAll("\\", "/"); }

function numericDistance(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = /(-?\d+(?:\.\d+)?)\s*km\b/i.exec(value);
    if (match) return Number(match[1]);
  }
  return Number((fallback / 1_000).toFixed(2));
}

function numericDuration(value: unknown, fallback: number | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "string") {
    const hours = /(\d+)\s*(?:h|hour|小时|灏忔椂)/i.exec(value);
    const minutes = /(\d+)\s*(?:m|min|minute|分|鍒)/i.exec(value);
    if (hours || minutes) return Number(hours?.[1] ?? 0) * 3_600 + Number(minutes?.[1] ?? 0) * 60;
  }
  return fallback == null ? undefined : Math.round(fallback);
}

function pointValue(point: { lat: number; lng: number; name?: string } | undefined) {
  return point ? { lat: Number(point.lat.toFixed(6)), lng: Number(point.lng.toFixed(6)), ...(point.name ? { name: point.name } : {}) } : undefined;
}

function migrateFile(source: string) {
  const original = readFileSync(source, "utf8");
  const parts = splitMarkdown(original);
  if (!parts) throw new Error("invalid or missing frontmatter");
  const rawGpx = scalar(parts.frontmatter, "gpx") ?? scalar(parts.frontmatter, "routeFile");
  if (typeof rawGpx !== "string") throw new Error("missing gpx/routeFile frontmatter");
  const gpx = normalizeGpxPath(rawGpx);
  const gpxFile = join(PUBLIC, ...gpx.slice(1).split("/"));
  if (!existsSync(gpxFile)) throw new Error(`missing GPX ${gpx}`);
  const parsed = parseGpx(readFileSync(gpxFile, "utf8"));
  const routeId = createRouteId(parsed);
  const withoutLegacy = removeField(parts.frontmatter, "routeFile");
  const frontmatter = setFields(withoutLegacy, {
    gpx,
    routeId,
    distance: numericDistance(scalar(parts.frontmatter, "distance"), parsed.distanceMeters),
    duration: numericDuration(scalar(parts.frontmatter, "duration"), parsed.durationSeconds),
    start: pointValue(parsed.start),
    end: pointValue(parsed.end),
    coordinates: pointValue(parsed.points[Math.floor(parsed.points.length / 2)]),
    elevationGain: parsed.elevationGainMeters == null ? undefined : Math.round(parsed.elevationGainMeters),
  });
  const migrated = assembleMarkdown(parts, frontmatter);
  const destination = join(ROUTES, relative(LEGACY, source));

  if (existsSync(destination)) {
    if (readFileSync(destination, "utf8") === migrated) {
      console.log(`SKIPPED ${display(source)} -> ${display(destination)} (identical)`);
      return "skipped";
    }
    console.error(`CONFLICT ${display(source)} -> ${display(destination)}`);
    return "conflict";
  }
  console.log(`MIGRATED ${display(source)} -> ${display(destination)} (${routeId})`);
  if (!dryRun) {
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, migrated);
  }
  return "migrated";
}

const sources = walkFiles(LEGACY, [".md", ".mdx"]).sort();
const totals = { migrated: 0, skipped: 0, conflict: 0, error: 0 };
for (const source of sources) {
  try {
    totals[migrateFile(source)] += 1;
  } catch (error) {
    totals.error += 1;
    console.error(`ERROR ${display(source)}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (!dryRun && totals.conflict === 0 && totals.error === 0 && existsSync(LEGACY)) {
  rmSync(LEGACY, { recursive: true });
  console.log(`MIGRATED legacy directory removed: ${display(LEGACY)}`);
}
console.log(`Totals: ${totals.migrated} migrated, ${totals.skipped} skipped, ${totals.conflict} conflicts, ${totals.error} errors.`);
if (totals.conflict > 0 || totals.error > 0) process.exitCode = 1;
