import {
  haversineDistanceMeters,
  type RouteEndpoint,
  type RoutePoint,
} from "./gpx";

export interface DisplayEndpoint {
  lat: number;
  lng: number;
  name?: string;
}

function validEndpoint(endpoint?: DisplayEndpoint | RoutePoint) {
  return endpoint &&
    Number.isFinite(endpoint.lat) &&
    Number.isFinite(endpoint.lng)
    ? {
        lat: endpoint.lat,
        lng: endpoint.lng,
        name: "name" in endpoint ? endpoint.name : undefined,
      }
    : undefined;
}

export function resolveRouteEndpoints(
  frontmatterStart: DisplayEndpoint | undefined,
  frontmatterEnd: DisplayEndpoint | undefined,
  segments: RoutePoint[][],
): { start?: RouteEndpoint; end?: RouteEndpoint } {
  const first = segments.find((segment) => segment.length > 0)?.[0];
  const last = [...segments]
    .reverse()
    .find((segment) => segment.length > 0)
    ?.at(-1);
  return {
    start: validEndpoint(frontmatterStart) ?? validEndpoint(first),
    end: validEndpoint(frontmatterEnd) ?? validEndpoint(last),
  };
}

export function endpointMarkerOffsets(
  start?: DisplayEndpoint,
  end?: DisplayEndpoint,
): { start: [number, number]; end: [number, number] } {
  const overlap = Boolean(
    start && end && haversineDistanceMeters(start, end) < 50,
  );
  return overlap
    ? { start: [0, -30], end: [0, 30] }
    : { start: [0, 0], end: [0, 0] };
}
