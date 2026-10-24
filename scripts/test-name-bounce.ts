import test from "node:test";
import assert from "node:assert/strict";
import { nameBounceFrames } from "../src/lib/name-bounce";

test("ball lands on each measured letter top, including differing lowercase heights", () => {
  const impacts = [
    { x: 20, y: 20 },
    { x: 60, y: 45 },
    { x: 110, y: 42 },
  ];
  const { frames, duration, hop } = nameBounceFrames(impacts, 20, () => 0.5);
  impacts.forEach((point, index) => {
    const landing = frames.find(
      (frame) =>
        Math.abs(Number(frame.offset) - ((index + 1) * hop) / duration) <
        0.0001,
    );
    assert.equal(landing?.transform, `translate(${point.x}px, ${point.y}px)`);
  });
  assert.equal(frames.at(-1)?.opacity, 0);
  assert.equal(frames.at(-1)?.transform, "translate(110px, 42px)");
  assert.ok(
    frames.every(
      (frame, index) =>
        index === 0 || Number(frame.offset) > Number(frames[index - 1].offset),
    ),
  );
});

test("hops rise above the letters and the last bounce stays on u", () => {
  const { frames } = nameBounceFrames(
    [
      { x: 20, y: 20 },
      { x: 60, y: 40 },
    ],
    20,
    () => 0.5,
  );
  const middle = String(frames[18].transform).match(
    /translate\(([-\d.]+)px, ([-\d.]+)px\)/,
  )!;
  assert.ok(Number(middle[1]) > 20 && Number(middle[1]) < 60);
  assert.ok(Number(middle[2]) < 20);
  assert.equal(frames.at(-2)?.transform, "translate(60px, 40px)");
  assert.equal(nameBounceFrames([], 20).duration, 0);
});

test("two entrances vary in arc without missing the same letters", () => {
  const points = [
    { x: 10, y: 20 },
    { x: 50, y: 35 },
  ];
  const first = nameBounceFrames(points, 20, () => 0);
  const second = nameBounceFrames(points, 20, () => 1);
  assert.notEqual(first.frames[6].transform, second.frames[6].transform);
  assert.equal(first.frames.at(-1)?.transform, second.frames.at(-1)?.transform);
});
