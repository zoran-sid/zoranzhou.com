import type { RoutePoint } from "./gpx";

function perpendicularDistance(
  point: RoutePoint,
  start: RoutePoint,
  end: RoutePoint,
) {
  const dx = end.lng - start.lng;
  const dy = end.lat - start.lat;
  if (dx === 0 && dy === 0) return Math.hypot(point.lng - start.lng, point.lat - start.lat);
  const t = Math.max(
    0,
    Math.min(1, ((point.lng - start.lng) * dx + (point.lat - start.lat) * dy) / (dx * dx + dy * dy)),
  );
  return Math.hypot(
    point.lng - (start.lng + t * dx),
    point.lat - (start.lat + t * dy),
  );
}

function simplify(points: RoutePoint[], target: number) {
  if (points.length <= target) return points;
  const kept = new Set([0, points.length - 1]);
  const ranges: Array<[number, number]> = [[0, points.length - 1]];
  while (kept.size < target && ranges.length > 0) {
    let bestRange = -1;
    let bestIndex = -1;
    let bestDistance = -1;
    for (let rangeIndex = 0; rangeIndex < ranges.length; rangeIndex += 1) {
      const [start, end] = ranges[rangeIndex];
      for (let index = start + 1; index < end; index += 1) {
        const distance = perpendicularDistance(points[index], points[start], points[end]);
        if (distance > bestDistance) {
          bestDistance = distance;
          bestRange = rangeIndex;
          bestIndex = index;
        }
      }
    }
    if (bestIndex < 0) break;
    const [start, end] = ranges.splice(bestRange, 1)[0];
    kept.add(bestIndex);
    if (bestIndex - start > 1) ranges.push([start, bestIndex]);
    if (end - bestIndex > 1) ranges.push([bestIndex, end]);
  }
  return [...kept].sort((a, b) => a - b).map((index) => points[index]);
}

export function downsampleSegments(segments: RoutePoint[][], maximum = 2_000) {
  const populated = segments.filter((segment) => segment.length > 0);
  const total = populated.reduce((sum, segment) => sum + segment.length, 0);
  if (total <= maximum) return populated;
  const minimum = Math.min(2, maximum);
  let remaining = maximum;
  return populated.map((segment, index) => {
    const laterMinimum = minimum * (populated.length - index - 1);
    const proportional = Math.round((segment.length / total) * maximum);
    const allocation = Math.max(minimum, Math.min(segment.length, proportional, remaining - laterMinimum));
    remaining -= allocation;
    return simplify(segment, allocation);
  });
}
