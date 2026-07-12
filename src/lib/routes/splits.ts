import type { ParsedRoute, RoutePoint } from "./gpx";

export interface RouteSplit {
  kilometre: number;
  distanceMeters: number;
  durationSeconds: number;
  paceSecondsPerKm: number;
  averageCadence?: number;
  partial: boolean;
}

interface SplitAccumulator {
  timedDistance: number;
  duration: number;
  cadenceDistance: number;
  cadenceTotal: number;
}

function timestamp(point: RoutePoint) {
  if (!point.time) return undefined;
  const value = Date.parse(point.time);
  return Number.isFinite(value) ? value : undefined;
}

export function calculateKilometreSplits(route: ParsedRoute): RouteSplit[] {
  if (route.distanceMeters <= 0) return [];
  const buckets = new Map<number, SplitAccumulator>();
  let totalTimedDistance = 0;

  for (const segment of route.segments) {
    for (let index = 1; index < segment.length; index += 1) {
      const previous = segment[index - 1];
      const point = segment[index];
      const startDistance = previous.distance;
      const endDistance = point.distance;
      const startTime = timestamp(previous);
      const endTime = timestamp(point);
      if (
        startDistance == null ||
        endDistance == null ||
        startTime == null ||
        endTime == null ||
        endDistance <= startDistance ||
        endTime <= startTime
      ) {
        continue;
      }

      const pairDistance = endDistance - startDistance;
      const pairDuration = (endTime - startTime) / 1_000;
      let cursor = startDistance;
      while (cursor < endDistance) {
        const bucketIndex = Math.floor(cursor / 1_000);
        const boundary = Math.min(endDistance, (bucketIndex + 1) * 1_000);
        const distance = boundary - cursor;
        const bucket = buckets.get(bucketIndex) ?? {
          timedDistance: 0,
          duration: 0,
          cadenceDistance: 0,
          cadenceTotal: 0,
        };
        bucket.timedDistance += distance;
        bucket.duration += pairDuration * (distance / pairDistance);

        const cadenceSamples = [previous.cadence, point.cadence].filter(
          (value): value is number => value != null && value > 0,
        );
        if (cadenceSamples.length > 0) {
          const cadence =
            cadenceSamples.reduce((total, value) => total + value, 0) /
            cadenceSamples.length;
          bucket.cadenceTotal += cadence * distance;
          bucket.cadenceDistance += distance;
        }
        buckets.set(bucketIndex, bucket);
        totalTimedDistance += distance;
        cursor = boundary;
      }
    }
  }

  if (totalTimedDistance < route.distanceMeters * 0.8) return [];
  const splits: RouteSplit[] = [];
  for (
    let index = 0;
    index < Math.ceil(route.distanceMeters / 1_000);
    index += 1
  ) {
    const distanceMeters = Math.min(
      1_000,
      route.distanceMeters - index * 1_000,
    );
    const bucket = buckets.get(index);
    if (!bucket || bucket.timedDistance < distanceMeters * 0.8) continue;
    const paceSecondsPerKm = bucket.duration / (bucket.timedDistance / 1_000);
    if (paceSecondsPerKm < 60 || paceSecondsPerKm > 21_600) continue;

    splits.push({
      kilometre: index + 1,
      distanceMeters,
      durationSeconds: bucket.duration,
      paceSecondsPerKm,
      averageCadence:
        bucket.cadenceDistance / distanceMeters >= 0.5
          ? bucket.cadenceTotal / bucket.cadenceDistance
          : undefined,
      partial: distanceMeters < 999.5,
    });
  }
  return splits;
}

export function formatSplitDuration(seconds: number) {
  const rounded = Math.max(0, Math.round(seconds));
  const hours = Math.floor(rounded / 3_600);
  const minutes = Math.floor((rounded % 3_600) / 60);
  const remainder = rounded % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function formatPace(secondsPerKm: number) {
  const rounded = Math.max(0, Math.round(secondsPerKm));
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
}
