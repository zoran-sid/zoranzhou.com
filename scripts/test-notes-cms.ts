import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { parse } from "yaml";
import { inspect } from "./content/core.mjs";
import { isPublicData } from "../src/lib/content-policy";

const config = parse(
  readFileSync(new URL("../.pages.yml", import.meta.url), "utf8"),
);
const collection = config.content.find(
  (entry: { name: string }) => entry.name === "notes",
);
const fields = Object.fromEntries(
  collection.fields.map((field: { name: string }) => [field.name, field]),
);

test("CMS defaults produce an approved note accepted by the existing importer contract", () => {
  const defaults = Object.fromEntries(
    collection.fields
      .filter((field: { default?: unknown }) => field.default !== undefined)
      .map((field: { name: string; default: unknown }) => [
        field.name,
        field.default,
      ]),
  );
  const data = {
    ...defaults,
    date: "2026-10-25T22:30:00+08:00",
    slug: randomUUID(),
  };
  assert.deepEqual(
    inspect(
      data,
      "今天读了几页书。\n\n![书页](/writing-images/notes/book.webp)",
    ).errors,
    [],
  );
  assert.equal(isPublicData(data), true);
  assert.equal(isPublicData({ ...data, draft: true }), false);
  assert.equal(fields.date.options.time, true);
  assert.equal(
    fields.date.options.format,
    "yyyy-MM-dd'T'HH:mm:ss'+08:00'",
    "CMS server time-zone must not change the author's UTC+8 wall time",
  );
  assert.equal(new Date(data.date).toISOString(), "2026-10-25T14:30:00.000Z");
});

test("CMS storage keeps ordinary articles outside the quick-note editor and stable note URLs", () => {
  assert.equal(config.content.length, 1);
  assert.equal(collection.path, "src/content/blog/notes");
  assert.equal(fields.slug.type, "uuid");
  assert.equal(fields.slug.hidden, true);
  assert.ok(collection.filename.template.includes("{fields.slug}"));
  assert.ok(!collection.filename.template.includes("title"));
  const media = config.media.find(
    (item: { name: string }) => item.name === fields.body.options.media,
  );
  assert.equal(media.input, `public${media.output}`);
  assert.equal(media.rename, "random");
  assert.ok(!media.extensions.includes("svg"));
  assert.deepEqual(
    fields.lang.options.values.map((v: { name: string }) => v.name),
    ["zh-CN", "en"],
  );
});

test("location is optional and map links accept ordinary web share URLs", () => {
  assert.ok(!fields.location.required && !fields.locationUrl.required);
  assert.equal(fields.location.options.maxlength, 100);
  const pattern = new RegExp(fields.locationUrl.pattern.regex);
  assert.ok(pattern.test("https://maps.apple.com/?q=Hong%20Kong"));
  assert.ok(pattern.test("https://surl.amap.com/example"));
  assert.ok(!pattern.test("javascript:alert(1)"));
  assert.ok(!pattern.test("地点名称 https://example.com"));
});
