import { strict as assert } from "node:assert";
import { crossedRadarTarget, radarPosition } from "../src/lib/radar";

const targets = [{ angle: 52, radius: 34 }, { angle: 178, radius: 36 }, { angle: 286, radius: 35 }];
for (const target of targets) {
  const position = radarPosition(target.angle, target.radius);
  assert.ok(Math.hypot(position.x, position.y) <= 36.000001);
  assert.ok(position.radius < 40, "target center must remain inside the 80% radar ring");
  console.log(`PASS target ${target.angle}° at ${position.radius}% radius is inside the 40% radar circle`);
}
assert.equal(crossedRadarTarget(7_900, 8_100, 2, 8_000), true);
console.log("PASS detection crosses the 0/360 boundary");
assert.equal(crossedRadarTarget(100, 8_500, 286, 8_000), true);
console.log("PASS a skipped frame longer than one sweep cannot miss a target");
assert.equal(crossedRadarTarget(500, 600, 52, 8_000), false);
console.log("PASS targets remain hidden before the beam crosses them");
