import type { CollectionEntry } from "astro:content";

export type RouteContentEntry = CollectionEntry<"routes">;

export interface RouteCoordinate {
  lat: number;
  lng: number;
  name?: string;
}

type RouteData = RouteContentEntry["data"] & Record<string, unknown>;

export function isRouteVisible(data: RouteData) {
  return data.draft !== true && data.published !== false;
}

export function getRouteFile(data: RouteData) {
  return data.gpx as string;
}

export function getRouteStart(data: RouteData): RouteCoordinate | undefined {
  const start = data.start as RouteCoordinate | undefined;
  if (start && Number.isFinite(start.lat) && Number.isFinite(start.lng)) {
    return start;
  }
  return undefined;
}

export function getRouteEnd(data: RouteData): RouteCoordinate | undefined {
  const end = data.end as RouteCoordinate | undefined;
  if (end && Number.isFinite(end.lat) && Number.isFinite(end.lng)) return end;
  return undefined;
}

export function getRouteCoordinates(data: RouteData) {
  const coordinates = data.coordinates as RouteCoordinate | undefined;
  if (
    coordinates &&
    Number.isFinite(coordinates.lat) &&
    Number.isFinite(coordinates.lng)
  ) {
    return coordinates;
  }

  return getRouteStart(data) ?? getRouteEnd(data);
}

function trimNumber(value: number, decimals: number) {
  return value.toFixed(decimals).replace(/\.?0+$/, "");
}

export function formatDistance(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return `${trimNumber(value, value < 100 ? 2 : 1)} km`;
}

export function formatDuration(value: unknown, locale: "zh-CN" | "en") {
  if (typeof value === "string") return value;
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;

  const totalMinutes = Math.max(0, Math.round(value / 60));
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;

  if (locale === "zh-CN") {
    return [
      days > 0 ? `${days}天` : "",
      hours > 0 ? `${hours}小时` : "",
      minutes > 0 || (days === 0 && hours === 0) ? `${minutes}分钟` : "",
    ]
      .filter(Boolean)
      .join("");
  }

  return [
    days > 0 ? `${days}d` : "",
    hours > 0 ? `${hours}h` : "",
    minutes > 0 || (days === 0 && hours === 0) ? `${minutes}m` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatElevation(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return `${Math.round(value)} m`;
}

export function normalizeRouteEntries(entries: RouteContentEntry[]) {
  const seen = new Set<string>();
  const result: RouteContentEntry[] = [];

  for (const entry of entries) {
    const locale = entry.data.lang ?? "zh-CN";
    const key = `${locale}:${entry.data.routeId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
  }

  return result;
}
