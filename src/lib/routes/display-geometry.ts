import { downsampleSegments } from "./downsample";
import { haversineDistanceMeters, type RoutePoint } from "./gpx";

const MAX_DISPLAY_POINTS = 2_000;

function isValidPoint(point: RoutePoint) {
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    Math.abs(point.lat) <= 90 &&
    Math.abs(point.lng) <= 180
  );
}

function removeDuplicates(points: RoutePoint[]) {
  const result: RoutePoint[] = [];
  for (const point of points) {
    const previous = result.at(-1);
    if (!previous || haversineDistanceMeters(previous, point) >= 0.5) {
      result.push(point);
    }
  }
  return result;
}

function isGpsSpike(previous: RoutePoint, point: RoutePoint, next: RoutePoint) {
  const inbound = haversineDistanceMeters(previous, point);
  const outbound = haversineDistanceMeters(point, next);
  const bypass = haversineDistanceMeters(previous, next);
  const detourSpike =
    inbound > 150 &&
    outbound > 150 &&
    bypass < Math.min(inbound, outbound) * 0.35;

  const previousTime = previous.time ? Date.parse(previous.time) : Number.NaN;
  const pointTime = point.time ? Date.parse(point.time) : Number.NaN;
  const nextTime = next.time ? Date.parse(next.time) : Number.NaN;
  const inboundSeconds = (pointTime - previousTime) / 1_000;
  const outboundSeconds = (nextTime - pointTime) / 1_000;
  const impossibleSpeed =
    inboundSeconds > 0 &&
    outboundSeconds > 0 &&
    inbound / inboundSeconds > 55 &&
    outbound / outboundSeconds > 55 &&
    bypass < inbound + outbound;

  return detourSpike || impossibleSpeed;
}

function rejectSpikes(points: RoutePoint[]) {
  if (points.length < 3) return points;
  return points.filter(
    (point, index) =>
      index === 0 ||
      index === points.length - 1 ||
      !isGpsSpike(points[index - 1], point, points[index + 1]),
  );
}

function smoothJitter(points: RoutePoint[]) {
  if (points.length < 3) return points;
  return points.map((point, index) => {
    if (index === 0 || index === points.length - 1) return point;
    const previous = points[index - 1];
    const next = points[index + 1];
    if (haversineDistanceMeters(previous, next) > 60) return point;

    const ax = point.lng - previous.lng;
    const ay = point.lat - previous.lat;
    const bx = next.lng - point.lng;
    const by = next.lat - point.lat;
    const magnitude = Math.hypot(ax, ay) * Math.hypot(bx, by);
    const cosine = magnitude === 0 ? 1 : (ax * bx + ay * by) / magnitude;

    // Preserve turns sharper than roughly 35 degrees and only damp local jitter.
    if (cosine < Math.cos((35 * Math.PI) / 180)) return point;
    return {
      ...point,
      lat: point.lat * 0.7 + ((previous.lat + next.lat) / 2) * 0.3,
      lng: point.lng * 0.7 + ((previous.lng + next.lng) / 2) * 0.3,
    };
  });
}

export function processRouteForDisplay(
  rawSegments: RoutePoint[][],
  maximumPoints = MAX_DISPLAY_POINTS,
) {
  // GPX segments stay independent so gaps never become false straight lines.
  const cleaned = rawSegments
    .map((segment) => segment.filter(isValidPoint))
    .map(removeDuplicates)
    .map(rejectSpikes)
    .map(smoothJitter)
    .filter((segment) => segment.length > 0);

  return downsampleSegments(cleaned, maximumPoints);
}
