import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "yaml";
import { privacyCheck } from "./content/privacy.mjs";
import { displayTicketDate, linkedNote, newestTickets, ticketDay, ticketTypes } from "../src/lib/ticket-model";
import type { ContentRecord } from "../src/lib/content-policy";

test("ticket dates preserve calendar days and reject impossible or timestamp inputs", () => {
  assert.equal(ticketDay("2024-02-29"), "2024-02-29");
  assert.equal(ticketDay(new Date("2026-10-27T00:00:00Z")), "2026-10-27");
  for (const invalid of ["2026-02-29", "2026-04-31", "2026-00-10", "2026-13-01", "2026-10-27T20:00:00+08:00", "", null, undefined, 0, new Date("invalid"), new Date("2026-10-27T20:00:00Z")]) {
    assert.equal(ticketDay(invalid), undefined, String(invalid));
  }
  const oldZone = process.env.TZ;
  try {
    for (const zone of ["UTC", "Asia/Hong_Kong", "America/Los_Angeles"]) {
      process.env.TZ = zone;
      assert.equal(displayTicketDate(new Date("2026-10-27"), "en"), "27 Oct 2026");
    }
  } finally { if (oldZone === undefined) delete process.env.TZ; else process.env.TZ = oldZone; }
});

test("ticket ordering uses event dates with deterministic ties, without mutating sources", () => {
  const entries = [
    { slug: "b", data: { date: new Date("2026-09-01") } },
    { slug: "a", data: { date: new Date("2026-09-01") } },
    { slug: "new", data: { date: new Date("2026-10-27") } },
  ];
  assert.deepEqual(newestTickets(entries).map((entry) => entry.slug), ["new", "a", "b"]);
  assert.equal(entries[0].slug, "b");
});

test("note association requires one exact, public, readable note and tolerates cross-language links", () => {
  const note: ContentRecord = { collection: "blog", slug: "stable-id", body: "回忆。", data: { format: "note", publication: "approved", lang: "zh-CN" } };
  assert.equal(linkedNote("stable-id", [note]), note);
  assert.equal(linkedNote(undefined, [note]), undefined);
  assert.equal(linkedNote("removed", [note]), undefined);
  assert.equal(linkedNote("stable-id", [note, { ...note }]), undefined);
  for (const invalid of [
    { ...note, data: { ...note.data, draft: true } },
    { ...note, data: { ...note.data, publication: "draft" } },
    { ...note, data: { ...note.data, format: "essay" as const } },
    { ...note, collection: "tickets" },
    { ...note, body: "<!-- no public content -->" },
  ]) assert.equal(linkedNote("stable-id", [invalid]), undefined);
  assert.equal(linkedNote("stable-id", [{ ...note, data: { ...note.data, lang: "en" } }])?.slug, "stable-id");
});

test("CMS exposes three required fields, separate uploads and a stable optional note reference", () => {
  const config = parse(readFileSync(".pages.yml", "utf8"));
  const collection = config.content.find((entry: { name: string }) => entry.name === "tickets");
  const fields = Object.fromEntries(collection.fields.map((field: { name: string }) => [field.name, field]));
  assert.deepEqual(collection.fields.filter((f: { required: boolean }) => f.required).map((f: { name: string }) => f.name), ["title", "date", "type"]);
  assert.equal(collection.path, "src/content/tickets");
  assert.equal(collection.filename.template, "ticket-{fields.slug}.md");
  assert.equal(collection.operations.rename, false);
  assert.equal(fields.slug.type, "uuid");
  assert.equal(fields.date.options.time, false);
  assert.equal(fields.date.options.format, "yyyy-MM-dd");
  assert.deepEqual(fields.type.options.values.map((v: { name: string }) => v.name), [...ticketTypes]);
  assert.equal(fields.note.options.collection, "notes");
  assert.equal(fields.note.options.value, "{fields.slug}");
  assert.equal(fields.note.options.multiple, false);
  assert.equal(fields.publication.default, "approved");
  const media = config.media.find((item: { name: string }) => item.name === fields.photos.options.media);
  assert.equal(media.input, `public${media.output}`);
  assert.equal(media.output, "/ticket-images");
  assert.equal(media.rename, "random");
  assert.ok(!media.extensions.includes("svg"));
});

test("unapproved ticket photos cannot silently enter the build", async () => {
  const root = mkdtempSync(join(tmpdir(), "zoran-ticket-privacy-"));
  try {
    mkdirSync(join(root, "tickets"));
    const path = join(root, "tickets", "ticket.md");
    for (const publication of ["", "publication: draft\n", "publication: approved\ndraft: true\n"]) {
      writeFileSync(path, `---\ntitle: Test\n${publication}photos: [/ticket-images/test.jpg]\n---\n`);
      await assert.rejects(privacyCheck(root), /草稿含可能被编译或复制的资源/);
    }
    writeFileSync(path, "---\ntitle: Test\npublication: approved\nphotos: [/ticket-images/test.jpg]\n---\n");
    await privacyCheck(root);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
