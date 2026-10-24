type Point = { x: number; y: number };
/** Parabolic hops land on measured glyph tops, followed by one small bounce and a fade. */
export function nameBounceFrames(
  impacts: Point[],
  diameter: number,
  random = Math.random,
) {
  const hop = 300;
  if (!impacts.length) return { frames: [] as Keyframe[], duration: 0, hop };
  const first = impacts[0];
  const last = impacts.at(-1)!;
  const stops = [{ x: -diameter * 2, y: first.y - diameter }, ...impacts, last];
  const fade = 180;
  const travel = (stops.length - 1) * hop;
  const duration = travel + fade;
  const frames: Keyframe[] = [];
  for (let step = 0; step < stops.length - 1; step++) {
    const from = stops[step],
      to = stops[step + 1];
    const height =
      diameter *
      (step === stops.length - 2
        ? 0.4 + random() * 0.35
        : 1.25 + random() * 0.9);
    const drift = diameter * (random() - 0.5) * 0.9;
    for (let sample = 0; sample < 12; sample++) {
      const t = sample / 12;
      const x = from.x + (to.x - from.x) * t + 4 * drift * t * (1 - t);
      const y = from.y + (to.y - from.y) * t - 4 * height * t * (1 - t);
      frames.push({
        transform: `translate(${x}px, ${y}px)`,
        opacity: 1,
        offset: ((step + t) * hop) / duration,
      });
    }
  }
  frames.push({
    transform: `translate(${last.x}px, ${last.y}px)`,
    opacity: 1,
    offset: travel / duration,
  });
  frames.push({
    transform: `translate(${last.x}px, ${last.y}px)`,
    opacity: 0,
    offset: 1,
  });
  return { frames, duration, hop };
}
