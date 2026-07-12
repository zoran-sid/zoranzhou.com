import { createHash } from "node:crypto";
import type { ParsedRoute, RoutePoint } from "./gpx";

const ROUTE_ID_PATTERN = /^route-[a-f0-9]{12}$/;

function coordinate(point: RoutePoint | undefined) {
  return point
    ? [Number(point.lat.toFixed(6)), Number(point.lng.toFixed(6))]
    : null;
}

function samplePoints(route: ParsedRoute) {
  const samples: Array<[number, number, number]> = [];
  for (const [segmentIndex, segment] of route.segments.entries()) {
    if (segment.length === 0) continue;
    const sampleCount = Math.min(24, segment.length);
    for (let index = 0; index < sampleCount; index += 1) {
      const pointIndex = Math.round(
        (index * (segment.length - 1)) / Math.max(1, sampleCount - 1),
      );
      const point = segment[pointIndex];
      samples.push([
        segmentIndex,
        Number(point.lat.toFixed(6)),
        Number(point.lng.toFixed(6)),
      ]);
    }
  }
  return samples;
}

export function normalizedRouteIdentity(route: ParsedRoute) {
  return {
    startedAt: route.startedAt ?? route.metadataTime ?? null,
    endedAt: route.endedAt ?? null,
    start: coordinate(route.start),
    end: coordinate(route.end),
    pointCount: route.points.length,
    trackCount: route.trackCount,
    segmentCount: route.segments.length,
    distanceMeters: Math.round(route.distanceMeters),
    segmentBoundaries: route.segments.map((segment) => ({
      count: segment.length,
      start: coordinate(segment[0]),
      end: coordinate(segment.at(-1)),
    })),
    samples: samplePoints(route),
  };
}

export function createRouteId(route: ParsedRoute) {
  const digest = createHash("sha256")
    .update(JSON.stringify(normalizedRouteIdentity(route)))
    .digest("hex")
    .slice(0, 12);
  return `route-${digest}`;
}

export function isValidRouteId(value: unknown): value is string {
  return typeof value === "string" && ROUTE_ID_PATTERN.test(value);
}
