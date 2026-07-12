import { strict as assert } from "node:assert";
import {
  crossedRadarTarget,
  radarPosition,
  radarTargetDetected,
} from "../src/lib/radar";

const targets = [
  { angle: 52, radius: 34 },
  { angle: 178, radius: 36 },
  { angle: 286, radius: 35 },
];
for (const target of targets) {
  const position = radarPosition(target.angle, target.radius);
  assert.ok(Math.hypot(position.x, position.y) <= 36.000001);
  assert.ok(
    position.radius < 40,
    "target center must remain inside the 80% radar ring",
  );
  console.log(`PASS target ${target.angle}° remains inside the radar`);
}

const timeAtLeadingEdge = (angle: number) =>
  ((angle - 90 + 360) % 360) / (360 / 8_000);

assert.equal(crossedRadarTarget(0, 0, 0), true);
console.log("PASS a target near 0° is visible in the initial sector");

const nearWrap = timeAtLeadingEdge(359);
assert.equal(crossedRadarTarget(nearWrap - 10, nearWrap, 359), true);
console.log("PASS a target near 359° is detected at wrap-around");

assert.equal(crossedRadarTarget(100, 8_500, 286), true);
console.log("PASS a skipped frame cannot miss a target crossing");

const leadingTouch = timeAtLeadingEdge(100);
assert.equal(crossedRadarTarget(leadingTouch - 1, leadingTouch, 100), true);
console.log("PASS the target reveals when the leading edge first touches it");

assert.equal(
  crossedRadarTarget(leadingTouch - 10, leadingTouch - 1, 100),
  false,
);
console.log("PASS a target remains hidden before the leading edge touches it");

assert.equal(radarTargetDetected(true, 0, 0, 250), true);
console.log("PASS an already detected target remains visible");
