import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { processRouteForDisplay } from "../src/lib/routes/display-geometry";
import { resolveRouteEndpoints } from "../src/lib/routes/endpoints";
import {
  parseGpx,
  type ParsedRoute,
  type RoutePoint,
} from "../src/lib/routes/gpx";
import { calculateKilometreSplits } from "../src/lib/routes/splits";

const originalSegments: RoutePoint[][] = [
  [
    { lat: 30, lng: 120 },
    { lat: 30, lng: 120 },
    { lat: 31, lng: 121 },
    { lat: 30, lng: 120.001 },
    { lat: 30, lng: 120.002 },
  ],
  [
    { lat: 30.1, lng: 120.1 },
    { lat: 30.101, lng: 120.101 },
  ],
];
const snapshot = structuredClone(originalSegments);
const display = processRouteForDisplay(originalSegments, 20);
assert.deepEqual(
  originalSegments,
  snapshot,
  "display processing must not mutate raw data",
);
assert.equal(display.length, 2, "separate GPX segments must remain separate");
assert.deepEqual(
  display[0][0],
  originalSegments[0][0],
  "start must be preserved",
);
assert.deepEqual(
  display[0].at(-1),
  originalSegments[0].at(-1),
  "finish must be preserved",
);
assert.equal(
  display[0].some((point) => point.lat === 31),
  false,
  "isolated GPS spike must be removed",
);
console.log(
  "PASS display processing preserves raw data, segments, and endpoints while removing a spike",
);

const points = Array.from({ length: 7 }, (_, index) => ({
  lat: 30 + index * 0.0045,
  lng: 120,
  elevation: 10,
  time: new Date(Date.UTC(2026, 0, 1, 0, index * 5)).toISOString(),
  cadence: 172,
  distance: index * 500,
  segmentIndex: 0,
}));
const route: ParsedRoute = {
  format: "gpx",
  distanceMeters: 2_500,
  trackCount: 1,
  points,
  segments: [points],
  waypoints: [],
  start: points[0],
  end: points.at(-1),
  sensitiveMetrics: {},
};
const splits = calculateKilometreSplits(route);
assert.equal(
  splits.length,
  3,
  "valid timestamps must produce kilometre splits",
);
assert.equal(
  splits.at(-1)?.partial,
  true,
  "final partial kilometre must be marked",
);
assert.ok(splits.every((split) => split.paceSecondsPerKm === 600));
assert.ok(splits.every((split) => split.averageCadence === 172));
console.log(
  "PASS raw timestamps and cadence produce full and partial kilometre splits",
);

const missingTimes = structuredClone(route);
missingTimes.points.forEach((point) => delete point.time);
missingTimes.segments = [missingTimes.points];
assert.deepEqual(calculateKilometreSplits(missingTimes), []);
console.log("PASS missing timestamps hide pace splits");

const invalidTimes = structuredClone(route);
invalidTimes.points[3].time = invalidTimes.points[2].time;
invalidTimes.segments = [invalidTimes.points];
assert.ok(
  calculateKilometreSplits(invalidTimes).every(
    (split) => split.paceSecondsPerKm > 0,
  ),
  "non-monotonic timestamps must not create invalid pace",
);
console.log("PASS non-monotonic timestamps do not create nonsense pace");

const cadenceGpx = `<?xml version="1.0"?><gpx xmlns:gpxtpx="urn:test"><trk><trkseg><trkpt lat="30" lon="120"><time>2026-01-01T00:00:00Z</time><extensions><gpxtpx:cad>174</gpxtpx:cad></extensions></trkpt><trkpt lat="30.001" lon="120"><time>2026-01-01T00:01:00Z</time></trkpt></trkseg></trk></gpx>`;
assert.equal(parseGpx(cadenceGpx).points[0].cadence, 174);
assert.equal(parseGpx(cadenceGpx).points[1].cadence, undefined);
console.log(
  "PASS supported namespaced cadence is parsed and missing cadence is not fabricated",
);

const nearbyStart = { lat: 31.851008, lng: 117.176344, name: "Start" };
const nearbyEnd = { lat: 31.851197, lng: 117.176441, name: "Finish" };
assert.deepEqual(
  resolveRouteEndpoints(nearbyStart, nearbyEnd, [[nearbyStart, nearbyEnd]]),
  { start: nearbyStart, end: nearbyEnd },
  "nearby endpoints must retain their exact source coordinates",
);

const endpointMapSources = [
  readFileSync("src/components/RouteMap.astro", "utf8"),
  readFileSync("src/components/MapExplorer.astro", "utf8"),
].join("\n");
assert.doesNotMatch(
  endpointMapSources,
  /endpointMarkerOffsets|offset:\s*offsets\.(?:start|end)/,
  "map markers must not receive artificial offsets",
);
console.log("PASS nearby start and finish markers retain their true positions");

const globalCss = readFileSync("src/styles/global.css", "utf8");
assert.match(
  globalCss,
  /\.journey-endpoint-marker\s*\{[^}]*position:\s*absolute/s,
  "MapLibre endpoint markers must remain absolutely positioned",
);
console.log("PASS overview endpoint markers retain MapLibre positioning");
