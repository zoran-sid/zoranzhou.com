export interface RoutePoint {
  lat: number;
  lng: number;
  elevation?: number;
  time?: string;
  distance?: number;
  segmentIndex?: number;
}

export interface RouteWaypoint {
  lat: number;
  lng: number;
  elevation?: number;
  time?: string;
  name?: string;
  type?: string;
}

export interface RouteEndpoint extends RoutePoint {
  name?: string;
}

export interface MetricSummary {
  count: number;
  min: number;
  max: number;
  average: number;
}

export interface ParsedRoute {
  format: "gpx" | "geojson";
  creator?: string;
  source?: string;
  name?: string;
  description?: string;
  metadataTime?: string;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  distanceMeters: number;
  elevationGainMeters?: number;
  elevationLossMeters?: number;
  minElevationMeters?: number;
  maxElevationMeters?: number;
  points: RoutePoint[];
  segments: RoutePoint[][];
  waypoints: RouteWaypoint[];
  start?: RouteEndpoint;
  end?: RouteEndpoint;
  sensitiveMetrics: Record<string, MetricSummary>;
}

const EARTH_RADIUS_METERS = 6_371_000;

function decodeXml(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#([0-9]+);/g, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function stripTags(value: string) {
  return decodeXml(value.replace(/<[^>]+>/g, "").trim());
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tagPattern(localName: string, global = false) {
  const name = escapeRegExp(localName);
  return new RegExp(
    `<(?:[\\w.-]+:)?${name}\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${name}\\s*>`,
    global ? "gi" : "i",
  );
}

function getFirstTagText(xml: string, localName: string) {
  const match = tagPattern(localName).exec(xml);
  return match ? stripTags(match[1]) : undefined;
}

function getBlocks(xml: string, localName: string) {
  const matches: string[] = [];
  const pattern = tagPattern(localName, true);
  for (const match of xml.matchAll(pattern)) matches.push(match[1]);
  return matches;
}

function getElementMatches(xml: string, localName: string) {
  const name = escapeRegExp(localName);
  const pattern = new RegExp(
    String.raw`<(?:[\w.-]+:)?${name}\b([^>]*?)(?:\/\s*>|>([\s\S]*?)<\/(?:[\w.-]+:)?${name}\s*>)`,
    "gi",
  );
  return [...xml.matchAll(pattern)].map((match) => ({
    attributes: match[1],
    body: match[2] ?? "",
  }));
}

function getAttribute(attributes: string, name: string) {
  const escaped = escapeRegExp(name);
  const match = new RegExp(
    `(?:^|\\s)${escaped}\\s*=\\s*(["'])(.*?)\\1`,
    "i",
  ).exec(attributes);
  return match ? decodeXml(match[2]) : undefined;
}

function finiteNumber(value?: string) {
  if (value == null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function validIsoDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isFinite(date.valueOf()) ? date.toISOString() : undefined;
}

export function haversineDistanceMeters(
  a: Pick<RoutePoint, "lat" | "lng">,
  b: Pick<RoutePoint, "lat" | "lng">,
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const q =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.atan2(Math.sqrt(q), Math.sqrt(Math.max(0, 1 - q)))
  );
}

function parsePoint(
  attributes: string,
  body: string,
  segmentIndex: number,
): RoutePoint | undefined {
  const lat = finiteNumber(getAttribute(attributes, "lat"));
  const lng = finiteNumber(
    getAttribute(attributes, "lon") ?? getAttribute(attributes, "lng"),
  );
  if (lat == null || lng == null) return undefined;

  return {
    lat,
    lng,
    elevation: finiteNumber(getFirstTagText(body, "ele")),
    time: validIsoDate(getFirstTagText(body, "time")),
    segmentIndex,
  };
}

function parseWaypoint(
  attributes: string,
  body: string,
): RouteWaypoint | undefined {
  const point = parsePoint(attributes, body, 0);
  if (!point) return undefined;
  return {
    lat: point.lat,
    lng: point.lng,
    elevation: point.elevation,
    time: point.time,
    name: getFirstTagText(body, "name"),
    type: getFirstTagText(body, "type") ?? getFirstTagText(body, "sym"),
  };
}

function addCumulativeDistances(segments: RoutePoint[][]) {
  let total = 0;
  return segments.map((segment, segmentIndex) =>
    segment.map((point, pointIndex) => {
      if (pointIndex > 0) {
        total += haversineDistanceMeters(segment[pointIndex - 1], point);
      }
      return { ...point, distance: total, segmentIndex };
    }),
  );
}

function calculateElevationStats(segments: RoutePoint[][]) {
  let gain = 0;
  let loss = 0;
  const elevations: number[] = [];
  const sampleIntervalMeters = 10;
  const smoothingWindow = 5;

  for (const segment of segments) {
    const elevationPoints = segment.filter(
      (point) =>
        Number.isFinite(point.elevation) && Number.isFinite(point.distance),
    );
    if (elevationPoints.length === 0) continue;

    elevations.push(
      ...elevationPoints.map((point) => point.elevation as number),
    );

    const sampled: RoutePoint[] = [];
    let lastSampleDistance = Number.NEGATIVE_INFINITY;
    for (const point of elevationPoints) {
      if (
        sampled.length === 0 ||
        (point.distance ?? 0) - lastSampleDistance >= sampleIntervalMeters
      ) {
        sampled.push(point);
        lastSampleDistance = point.distance ?? 0;
      }
    }
    const finalPoint = elevationPoints.at(-1)!;
    if (sampled.at(-1) !== finalPoint) sampled.push(finalPoint);

    const radius = Math.floor(smoothingWindow / 2);
    const smoothed = sampled.map((_, index) => {
      const window = sampled.slice(
        Math.max(0, index - radius),
        Math.min(sampled.length, index + radius + 1),
      );
      return (
        window.reduce(
          (total, point) => total + (point.elevation as number),
          0,
        ) / window.length
      );
    });

    for (let index = 1; index < smoothed.length; index += 1) {
      const delta = smoothed[index] - smoothed[index - 1];
      if (delta > 0) gain += delta;
      else loss += Math.abs(delta);
    }
  }

  if (elevations.length === 0) return {};
  return {
    elevationGainMeters: gain,
    elevationLossMeters: loss,
    minElevationMeters: Math.min(...elevations),
    maxElevationMeters: Math.max(...elevations),
  };
}

function summarize(values: number[]): MetricSummary | undefined {
  if (values.length === 0) return undefined;
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    average: sum / values.length,
  };
}

function extractSensitiveMetrics(xml: string) {
  const aliases: Record<string, string[]> = {
    heartRate: ["hr", "heartrate", "heart_rate"],
    cadence: ["cad", "cadence", "runcadence"],
    speed: ["speed", "velocity"],
    power: ["power", "watts", "watt"],
    calories: ["calories", "energy", "kilocalories"],
  };
  const result: Record<string, MetricSummary> = {};

  for (const [key, names] of Object.entries(aliases)) {
    const values: number[] = [];
    for (const name of names) {
      const escaped = escapeRegExp(name);
      const pattern = new RegExp(
        `<(?:[\\w.-]+:)?${escaped}\\b[^>]*>\\s*(-?\\d+(?:\\.\\d+)?)\\s*<\\/(?:[\\w.-]+:)?${escaped}\\s*>`,
        "gi",
      );
      for (const match of xml.matchAll(pattern)) {
        const value = Number(match[1]);
        if (Number.isFinite(value)) values.push(value);
      }
    }
    const summary = summarize(values);
    if (summary) result[key] = summary;
  }

  return result;
}

function normalizeWaypointLabel(value?: string) {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "") ?? ""
  );
}

function findEndpointWaypoint(
  waypoints: RouteWaypoint[],
  point: RoutePoint,
  kind: "start" | "end",
) {
  const needles =
    kind === "start"
      ? ["start", "begin", "起点", "开始"]
      : ["finish", "end", "stop", "终点", "结束"];
  const labeled = waypoints.find((waypoint) => {
    const value = normalizeWaypointLabel(
      `${waypoint.name ?? ""}${waypoint.type ?? ""}`,
    );
    return needles.some((needle) => value.includes(needle));
  });
  if (labeled) return labeled;

  return waypoints
    .map((waypoint) => ({
      waypoint,
      distance: haversineDistanceMeters(point, waypoint),
    }))
    .filter((candidate) => candidate.distance <= 100)
    .sort((a, b) => a.distance - b.distance)[0]?.waypoint;
}

function detectSource(creator?: string, xml = "") {
  const haystack = `${creator ?? ""} ${xml.slice(0, 5_000)}`.toLowerCase();
  if (haystack.includes("gpx.studio")) return "GPX Studio";
  if (haystack.includes("garmin")) return "Garmin";
  if (haystack.includes("coros")) return "Coros";
  if (haystack.includes("rungap")) return "RunGap";
  if (haystack.includes("keep")) return "Keep";
  if (haystack.includes("apple") || haystack.includes("healthkit")) {
    return "Apple Health";
  }
  return creator?.trim() || "Standard GPX";
}

export function parseGpx(xml: string): ParsedRoute {
  const gpxOpen = /<(?:[\w.-]+:)?gpx\b([^>]*)>/i.exec(xml);
  const creator = gpxOpen ? getAttribute(gpxOpen[1], "creator") : undefined;
  const metadata = getBlocks(xml, "metadata")[0] ?? "";
  const trackBlock = getBlocks(xml, "trk")[0] ?? "";
  const routeBlock = getBlocks(xml, "rte")[0] ?? "";

  const rawSegments = getBlocks(xml, "trkseg");
  let segments = rawSegments
    .map((segment, segmentIndex) =>
      getElementMatches(segment, "trkpt")
        .map((match) => parsePoint(match.attributes, match.body, segmentIndex))
        .filter((point): point is RoutePoint => Boolean(point)),
    )
    .filter((segment) => segment.length > 0);

  if (segments.length === 0) {
    const trackPoints = getElementMatches(xml, "trkpt")
      .map((match) => parsePoint(match.attributes, match.body, 0))
      .filter((point): point is RoutePoint => Boolean(point));
    if (trackPoints.length > 0) segments = [trackPoints];
  }

  const routePoints = getElementMatches(xml, "rtept")
    .map((match) => parsePoint(match.attributes, match.body, segments.length))
    .filter((point): point is RoutePoint => Boolean(point));
  if (routePoints.length > 0) segments.push(routePoints);

  segments = addCumulativeDistances(segments);
  const points = segments.flat();
  const waypoints = getElementMatches(xml, "wpt")
    .map((match) => parseWaypoint(match.attributes, match.body))
    .filter((waypoint): waypoint is RouteWaypoint => Boolean(waypoint));

  const firstPoint = points[0];
  const lastPoint = points.at(-1);
  const firstWaypoint = firstPoint
    ? findEndpointWaypoint(waypoints, firstPoint, "start")
    : undefined;
  const lastWaypoint = lastPoint
    ? findEndpointWaypoint(waypoints, lastPoint, "end")
    : undefined;

  const pointTimes = points
    .map((point) => point.time)
    .filter((time): time is string => Boolean(time));
  const startedAt =
    pointTimes[0] ?? validIsoDate(getFirstTagText(metadata, "time"));
  const endedAt = pointTimes.at(-1);
  const durationSeconds =
    startedAt && endedAt
      ? Math.max(
          0,
          (new Date(endedAt).valueOf() - new Date(startedAt).valueOf()) / 1000,
        )
      : undefined;

  const elevation = calculateElevationStats(segments);

  return {
    format: "gpx",
    creator,
    source: detectSource(creator, xml),
    name:
      getFirstTagText(metadata, "name") ??
      getFirstTagText(trackBlock, "name") ??
      getFirstTagText(routeBlock, "name"),
    description:
      getFirstTagText(metadata, "desc") ??
      getFirstTagText(trackBlock, "desc") ??
      getFirstTagText(routeBlock, "desc"),
    metadataTime: validIsoDate(getFirstTagText(metadata, "time")),
    startedAt,
    endedAt,
    durationSeconds,
    distanceMeters: points.at(-1)?.distance ?? 0,
    ...elevation,
    points,
    segments,
    waypoints,
    start: firstPoint
      ? {
          ...firstPoint,
          name: firstWaypoint?.name,
        }
      : undefined,
    end: lastPoint
      ? {
          ...lastPoint,
          name: lastWaypoint?.name,
        }
      : undefined,
    sensitiveMetrics: extractSensitiveMetrics(xml),
  };
}

function geoJsonLineStrings(value: unknown): number[][][] {
  if (!value || typeof value !== "object") return [];
  const object = value as Record<string, any>;

  if (object.type === "FeatureCollection" && Array.isArray(object.features)) {
    return object.features.flatMap((feature: unknown) =>
      geoJsonLineStrings(feature),
    );
  }
  if (object.type === "Feature") return geoJsonLineStrings(object.geometry);
  if (object.type === "LineString" && Array.isArray(object.coordinates)) {
    return [object.coordinates];
  }
  if (object.type === "MultiLineString" && Array.isArray(object.coordinates)) {
    return object.coordinates;
  }
  return [];
}

export function parseGeoJson(text: string): ParsedRoute {
  const json = JSON.parse(text) as unknown;
  const coordinateSegments = geoJsonLineStrings(json);
  let segments: RoutePoint[][] = coordinateSegments
    .map((coordinates, segmentIndex) =>
      coordinates
        .map(([lng, lat, elevation]) => ({
          lat: Number(lat),
          lng: Number(lng),
          elevation: Number.isFinite(Number(elevation))
            ? Number(elevation)
            : undefined,
          segmentIndex,
        }))
        .filter(
          (point) => Number.isFinite(point.lat) && Number.isFinite(point.lng),
        ),
    )
    .filter((segment) => segment.length > 0);
  segments = addCumulativeDistances(segments);
  const points = segments.flat();
  const elevation = calculateElevationStats(segments);

  return {
    format: "geojson",
    source: "GeoJSON",
    distanceMeters: points.at(-1)?.distance ?? 0,
    ...elevation,
    points,
    segments,
    waypoints: [],
    start: points[0],
    end: points.at(-1),
    sensitiveMetrics: {},
  };
}

export function parseRouteDocument(text: string, filename = "route.gpx") {
  const normalized = filename.toLowerCase().split("?")[0].split("#")[0];
  if (normalized.endsWith(".json") || normalized.endsWith(".geojson")) {
    return parseGeoJson(text);
  }
  return parseGpx(text);
}
