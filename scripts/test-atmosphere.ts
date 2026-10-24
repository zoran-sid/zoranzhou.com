import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  atmosphereColor,
  atmospherePalettes,
  scrollProgress,
  sectionProgress,
} from "../src/lib/scroll-atmosphere";

// Read live theme tokens so a palette change cannot silently leave stale tests.
const globalCss = readFileSync(
  new URL("../src/styles/global.css", import.meta.url),
  "utf8",
);
const atmosphereCss = readFileSync(
  new URL("../src/styles/atmosphere.css", import.meta.url),
  "utf8",
);
const token = (dark: boolean, name: string) => {
  const block = globalCss.match(
    dark ? /\.dark \{([\s\S]*?)\n\}/ : /:root \{([\s\S]*?)\n\}/,
  )![1];
  return block.match(new RegExp(`--${name}: (#[\\da-f]+)`))![1];
};
const lightStyle = (dark: boolean) => {
  const block = atmosphereCss.match(
    dark
      ? /\[data-dark="true"\] \.atmosphere-lights \{([\s\S]*?)\n\}/
      : /\.atmosphere-lights \{([\s\S]*?)\n\}/,
  )![1];
  return {
    color: block.match(/color: (#[\da-f]+)/)![1],
    opacity: Number(block.match(/opacity: ([\d.]+)/)![1]),
  };
};

const luminance = (hex: string) => {
  const channels = [1, 3, 5]
    .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

test("reading progress handles short pages and overscroll", () => {
  assert.equal(scrollProgress(200, 800, 800), 0);
  assert.equal(scrollProgress(-40, 2000, 800), 0);
  assert.equal(scrollProgress(300, 2000, 800), 0.25);
  assert.equal(scrollProgress(1500, 2000, 800), 1);
});

test("section travel is bounded for tall, short and offscreen sections", () => {
  assert.equal(sectionProgress(800, 400, 800), 0);
  assert.equal(sectionProgress(200, 400, 800), 0.5);
  assert.equal(sectionProgress(-400, 400, 800), 1);
  assert.equal(sectionProgress(-900, 400, 800), 1);
  assert.equal(sectionProgress(1500, 400, 800), 0);
  assert.equal(sectionProgress(-600, 2000, 800), 0.5);
  assert.equal(sectionProgress(0, 0, 0), 0);
});

test("colour transitions retain endpoints and stay continuous across stops", () => {
  for (const dark of [false, true]) {
    const palette = dark ? atmospherePalettes.dark : atmospherePalettes.light;
    assert.equal(atmosphereColor(-1, dark), palette[0]);
    assert.equal(atmosphereColor(2, dark), palette.at(-1));
    for (const stop of [1 / 3, 2 / 3]) {
      assert.equal(
        atmosphereColor(stop - 0.00001, dark),
        atmosphereColor(stop + 0.00001, dark),
      );
    }
  }
});

test("text retains AA contrast through scroll, including the brightest light point", () => {
  for (const dark of [false, true]) {
    const homeCss = readFileSync(
      new URL("../src/styles/home.css", import.meta.url),
      "utf8",
    );
    const sectionBlock = homeCss.match(
      dark ? /\.dark \{([\s\S]*?)\n\}/ : /:root \{([\s\S]*?)\n\}/,
    )![1];
    const sectionInks = ["garden-green", "section-blue", "section-ochre"].map(
      (name) => sectionBlock.match(new RegExp(`--${name}: (#[\\da-f]+)`))![1],
    );
    const inks = [
      ...["ink", "muted", "accent"].map((name) => token(dark, name)),
      ...sectionInks,
    ];
    for (let i = 0; i <= 300; i++) {
      const base = atmosphereColor(i / 300, dark);
      const { color: point, opacity } = lightStyle(dark);
      // Halo (0.7) and core (0.5) overlap inside the field's opacity.
      const alpha =
        (dark ? 1 - (1 - 0.7 * 0.95) * (1 - 0.85) : 1 - (1 - 0.7) * (1 - 0.5)) *
        opacity;
      const overlay =
        "#" +
        [1, 3, 5]
          .map((offset) =>
            Math.round(
              parseInt(base.slice(offset, offset + 2), 16) * (1 - alpha) +
                parseInt(point.slice(offset, offset + 2), 16) * alpha,
            )
              .toString(16)
              .padStart(2, "0"),
          )
          .join("");
      for (const background of [base, overlay]) {
        const backdrop = luminance(background);
        for (const ink of inks) {
          const foreground = luminance(ink);
          const ratio =
            (Math.max(foreground, backdrop) + 0.05) /
            (Math.min(foreground, backdrop) + 0.05);
          assert.ok(
            ratio >= 4.5,
            `${dark ? "dark" : "light"}: ${ink} at ${i / 300}: ${ratio}`,
          );
        }
      }
    }
  }
});
