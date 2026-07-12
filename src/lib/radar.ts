export const RADAR_SWEEP_DEGREES = 90;
export const RADAR_DURATION_MS = 8_000;
export const RADAR_CSS_INITIAL_ROTATION_DEGREES = -90;

// CSS's -90deg transform places the sector's trailing edge at north (0deg)
// in the radar's clockwise coordinate system.
export const RADAR_INITIAL_SWEEP_START_DEGREES =
  RADAR_CSS_INITIAL_ROTATION_DEGREES + 90;

export function normalizeRadarAngle(angleDegrees: number) {
  return ((angleDegrees % 360) + 360) % 360;
}

export function radarPosition(angleDegrees: number, radiusPercent: number) {
  const radius = Math.min(36, Math.max(0, radiusPercent));
  const radians = (angleDegrees * Math.PI) / 180;
  return {
    x: Math.sin(radians) * radius,
    y: -Math.cos(radians) * radius,
    radius,
  };
}

export function radarAngleInVisibleSweep(
  sweepRotation: number,
  targetAngle: number,
  sweepDegrees = RADAR_SWEEP_DEGREES,
) {
  const offset = normalizeRadarAngle(targetAngle - sweepRotation);
  return offset <= sweepDegrees;
}

export function crossedRadarTarget(
  previousTime: number,
  currentTime: number,
  targetAngle: number,
  duration = RADAR_DURATION_MS,
  sweepDegrees = RADAR_SWEEP_DEGREES,
) {
  if (duration <= 0 || currentTime < previousTime) return false;

  const degreesPerMs = 360 / duration;
  const previousRotation =
    RADAR_INITIAL_SWEEP_START_DEGREES + previousTime * degreesPerMs;
  const currentRotation =
    RADAR_INITIAL_SWEEP_START_DEGREES + currentTime * degreesPerMs;

  if (
    previousTime === 0 &&
    radarAngleInVisibleSweep(previousRotation, targetAngle, sweepDegrees)
  ) {
    return true;
  }

  // The clockwise leading edge is one visible-sector width ahead of the CSS
  // border edge. Unwrapped degrees preserve skipped frames and 360° crossings.
  const previousLeading = previousRotation + sweepDegrees;
  const currentLeading = currentRotation + sweepDegrees;
  const normalizedTarget = normalizeRadarAngle(targetAngle);
  let crossing =
    Math.ceil((previousLeading - normalizedTarget) / 360) * 360 +
    normalizedTarget;

  if (crossing < previousLeading) crossing += 360;
  return crossing <= currentLeading;
}

export function radarTargetDetected(
  alreadyDetected: boolean,
  previousTime: number,
  currentTime: number,
  targetAngle: number,
  duration = RADAR_DURATION_MS,
  sweepDegrees = RADAR_SWEEP_DEGREES,
) {
  return (
    alreadyDetected ||
    crossedRadarTarget(
      previousTime,
      currentTime,
      targetAngle,
      duration,
      sweepDegrees,
    )
  );
}
