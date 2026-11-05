import assert from "node:assert/strict";
import test from "node:test";
import {
  groupNotes,
  noteAnchor,
  renderTimelineNote,
} from "../src/lib/note-timeline";

const options = {
  id: "note-blog-one",
  permalink: "/zh-CN/blog/one",
  limit: 420,
};

test("notes form descending calendar groups in Hong Kong time, including year boundaries", () => {
  const entries = [
    { data: { date: new Date("2025-12-31T15:59:00Z") }, text: "older" },
    { data: { date: new Date("2026-01-31T16:00:00Z") }, text: "newest" },
    { data: { date: new Date("2025-12-31T16:00:00Z") }, text: "new year" },
  ];
  const groups = groupNotes(entries, "zh-CN");
  assert.deepEqual(
    groups.map(({ year, month }) => [year, month]),
    [
      ["2026", "02"],
      ["2026", "01"],
      ["2025", "12"],
    ],
  );
  assert.equal(groups[0].entries[0].text, "newest");
  assert.equal(groupNotes(entries, "en")[0].label, "February");
  assert.equal(
    entries[0].text,
    "older",
    "grouping does not mutate caller order",
  );
  assert.deepEqual(groupNotes([], "en"), []);
  assert.notEqual(
    noteAnchor({ collection: "blog", slug: "same" }),
    noteAnchor({ collection: "research", slug: "same" }),
  );
});

test("the stream keeps complete formatted text and collects all photos once in source order", async () => {
  const photos = Array.from(
    { length: 9 },
    (_, index) => `![照片 ${index}](/writing-images/${index}.jpg)`,
  );
  const note = await renderTimelineNote(
    `今天 **很开心**。\n\n[网址](https://example.com)\n\n${photos.join("\n\n")}`,
    {
      ...options,
      cover: { src: "/writing-images/0.jpg", alt: "封面" },
    },
  );
  assert.match(note.html, /<strong>很开心<\/strong>/);
  assert.match(note.html, /href="https:\/\/example.com\//);
  assert.doesNotMatch(note.html, /<img|<p>\s*<\/p>/);
  assert.equal(note.images.length, 9);
  assert.equal(note.images[0].alt, "封面");
  assert.equal(note.images[8].src, "/writing-images/8.jpg");
  assert.equal(note.truncated, false);
});

test("long notes only shorten the excerpt and keep the entire body available inline", async () => {
  const note = await renderTimelineNote(
    `出门🏃${"走了一会儿。".repeat(150)}最后回家。`,
    { ...options, limit: 3 },
  );
  assert.equal(note.excerpt, "出门🏃…");
  assert.equal(note.truncated, true);
  assert.match(note.html, /最后回家。/);
});

test("raw HTML photos, GIFs and references become real image links while active HTML is stripped", async () => {
  const note = await renderTimelineNote(
    `![雨][photo]\n\n[photo]: /rain.gif\n\n<img src="/sky.jpg" alt="天空" onerror="alert(1)">\n\n<script>alert(1)</script>\n\n[bad](javascript:alert)`,
    options,
  );
  assert.deepEqual(
    note.images.map((image) => image.src),
    ["/rain.gif", "/sky.jpg"],
  );
  assert.doesNotMatch(note.html, /<script|onerror|javascript:/);
  assert.equal(note.unresolvedImages, false);
});

test("source-relative photos have an explicit unresolved state and image-only notes need no invented text", async () => {
  assert.equal(
    (await renderTimelineNote("![本地](./hill.jpg)", options)).unresolvedImages,
    true,
  );
  const note = await renderTimelineNote("![天空](/sky.jpg)", options);
  assert.equal(note.excerpt, "");
  assert.equal(note.truncated, false);
  assert.equal(note.images.length, 1);
});

test("links resolve against the original note and embedded headings cannot add page titles", async () => {
  const note = await renderTimelineNote(
    '# 标题\n\n[相邻页面](../two)\n\n<p id="hello">位置</p><a href="#hello">回到位置</a>',
    options,
  );
  assert.doesNotMatch(note.html, /<h1/);
  assert.match(note.html, /<h4>标题/);
  assert.match(note.html, /href="https:\/\/zoranzhou.com\/zh-CN\/blog\/two"/);
  assert.match(note.html, /id="note-blog-one--hello"/);
  assert.match(note.html, /href="#note-blog-one--hello"/);
});

test("footnotes and back links resolve within their own note, including ARIA references", async () => {
  for (const id of ["note-one", "note-two"]) {
    const note = await renderTimelineNote(
      "一条备注[^1]。\n\n[^1]: 详细说明。",
      { ...options, id },
    );
    const ids = [...note.html.matchAll(/\bid="([^"]+)"/g)].map(
      (match) => match[1],
    );
    const links = [...note.html.matchAll(/href="#([^"]+)"/g)].map((match) =>
      decodeURIComponent(match[1]),
    );
    assert.ok(
      ids.length > 0 && ids.every((value) => value.startsWith(`${id}--`)),
    );
    assert.ok(links.every((value) => ids.includes(value)));
    assert.ok(note.html.includes(`aria-describedby="${id}--footnote-label"`));
  }
});

test("local and protocol-relative images never bypass HTML sanitization", async () => {
  const note = await renderTimelineNote(
    '<img src="//example.com/a.gif"><img src="./local.jpg"><script>alert(1)</script>',
    {
      ...options,
      resolveImage: async (src) => {
        assert.equal(src, "./local.jpg");
        return { src: "/_astro/local.jpg", width: 1200, height: 800 };
      },
    },
  );
  assert.doesNotMatch(note.html, /<script|alert/);
  assert.equal(note.unresolvedImages, false);
  assert.deepEqual(
    note.images.map((image) => image.src),
    ["https://example.com/a.gif", "/_astro/local.jpg"],
  );
  assert.equal(note.images[1].width, 1200);
});
