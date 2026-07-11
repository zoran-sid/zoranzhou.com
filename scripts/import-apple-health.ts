import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { createInterface } from "node:readline";

interface WorkoutRecord {
  activityType: string;
  startDate: string;
  endDate: string;
  durationMinutes?: number;
  distanceKm?: number;
  totalEnergyKcal?: number;
  sourceName?: string;
}

const args = process.argv.slice(2);
const inputArg = args.find((arg) => !arg.startsWith("--"));
const outputArg = args.find((arg) => arg.startsWith("--output="))?.split("=")[1];
const activityArg = args.find((arg) => arg.startsWith("--activity="))?.split("=")[1] ?? "running";

if (!inputArg) {
  console.error("Usage: npm run import:apple-health -- <export.xml> [--output=src/data/apple-health-workouts.json] [--activity=running]");
  process.exit(1);
}

const input = resolve(inputArg);
if (!existsSync(input)) {
  console.error(`Apple Health export not found: ${input}`);
  process.exit(1);
}

const output = resolve(outputArg ?? "src/data/apple-health-workouts.json");
const activityNeedle = activityArg.toLowerCase();
const workouts: WorkoutRecord[] = [];

function decodeXml(value: string) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function attrs(line: string) {
  const result: Record<string, string> = {};
  for (const match of line.matchAll(/([\w:.-]+)="([^"]*)"/g)) result[match[1]] = decodeXml(match[2]);
  return result;
}

function numberValue(value?: string) {
  const parsed = value == null ? Number.NaN : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const rl = createInterface({ input: createReadStream(input, { encoding: "utf8" }), crlfDelay: Infinity });
for await (const line of rl) {
  if (!line.includes("<Workout ")) continue;
  const data = attrs(line);
  const activityType = data.workoutActivityType ?? "";
  if (!activityType.toLowerCase().includes(activityNeedle)) continue;

  const distance = numberValue(data.totalDistance);
  const distanceUnit = (data.totalDistanceUnit ?? "km").toLowerCase();
  const distanceKm = distance == null ? undefined : distanceUnit.includes("mi") ? distance * 1.609344 : distance;
  workouts.push({
    activityType,
    startDate: data.startDate,
    endDate: data.endDate,
    durationMinutes: numberValue(data.duration),
    distanceKm,
    totalEnergyKcal: numberValue(data.totalEnergyBurned),
    sourceName: data.sourceName,
  });
}

workouts.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: basename(input),
  activityFilter: activityArg,
  note: "Workout summaries imported from Apple Health export.xml. GPS routes must be exported separately as GPX/FIT/TCX and placed in public/routes.",
  workouts,
}, null, 2) + "\n");

console.log(`Imported ${workouts.length} ${activityArg} workouts -> ${output}`);