export function radarPosition(angleDegrees: number, radiusPercent: number) {
  const radius = Math.min(36, Math.max(0, radiusPercent));
  const radians = angleDegrees * Math.PI / 180;
  return { x: Math.sin(radians) * radius, y: -Math.cos(radians) * radius, radius };
}

export function crossedRadarTarget(previousTime: number, currentTime: number, targetAngle: number, duration: number) {
  if (currentTime - previousTime >= duration) return true;
  const targetTime = (((targetAngle % 360) + 360) % 360) / 360 * duration;
  const firstCrossing = Math.floor(previousTime / duration) * duration + targetTime;
  const crossing = firstCrossing < previousTime ? firstCrossing + duration : firstCrossing;
  return currentTime >= crossing;
}
