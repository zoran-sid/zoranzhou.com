// Exercise the actual static timeline with temporary content; never publish this build.
import assert from "node:assert/strict";
import {
  existsSync,
  writeFileSync,
  readFileSync,
  unlinkSync,
  openSync,
  closeSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { stringify } from "yaml";

const prefix = "zz-note-timeline-check";
const written: string[] = [];
const logPath = "/tmp/zoran-note-fixture-build.log";
function write(path: string, body: string | Buffer) {
  assert.ok(!existsSync(path));
  writeFileSync(path, body, { flag: "wx" });
  written.push(path);
}
function note(
  id: string,
  date: string,
  body: string,
  data: Record<string, unknown> = {},
) {
  write(
    `src/content/blog/notes/${prefix}-${id}.md`,
    `---\n${stringify({
      title: `Timeline fixture ${id}`,
      slug: `${prefix}-${id}`,
      date,
      format: "note",
      publication: "approved",
      lang: "zh-CN",
      ...data,
    })}---\n${body}\n`,
  );
}
const html = (path: string) => readFileSync(`dist/${path}/index.html`, "utf8");
try {
  const photos = Array.from(
    { length: 9 },
    (_, i) => `/writing-images/notes/${prefix}-${i}.png`,
  );
  for (const photo of photos)
    write(
      `public${photo}`,
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB9sAAAAASUVORK5CYII=",
        "base64",
      ),
    );
  note(
    "latest",
    "2027-02-01T00:01:00+08:00",
    `**一段完整的生活记录。**\n\n${"很长的临时记录。".repeat(70)}完整正文终点。\n\n${photos.map((src, i) => `![照片 ${i}](${src})`).join("\n\n")}`,
    {
      location: "香港 · 临时测试",
      locationUrl: "https://example.com/map",
    },
  );
  for (let i = 0; i < 10; i++)
    note(
      String(i),
      `2027-01-${String(31 - i).padStart(2, "0")}T12:00:00+08:00`,
      `临时记录 ${i}。`,
    );
  note("old-year", "2026-12-31T23:59:00+08:00", "上一年的临时记录。");
  note(
    "english",
    "2027-02-01T12:00:00+08:00",
    "A moment in the **English timeline**.",
    { lang: "en" },
  );
  note("draft", "2027-03-01T12:00:00+08:00", "DO_NOT_PUBLISH_TIMELINE_DRAFT", {
    draft: true,
  });
  write(
    `src/content/tickets/${prefix}.md`,
    `---\n${stringify({
      title: "临时关联票根",
      slug: prefix,
      date: "2027-02-01",
      type: "movie",
      lang: "zh-CN",
      publication: "approved",
      note: `${prefix}-latest`,
    })}---\n`,
  );
  const log = openSync(logPath, "w");
  try {
    const build = spawnSync("npm", ["run", "build"], {
      stdio: ["ignore", log, log],
    });
    assert.equal(build.status, 0, `Fixture build failed: ${logPath}`);
    const checks = spawnSync(
      process.execPath,
      ["--import", "tsx", "scripts/test-site-build.ts"],
      { stdio: ["ignore", log, log] },
    );
    assert.equal(checks.status, 0, `Site checks failed: ${logPath}`);
  } finally {
    closeSync(log);
  }
  const first = html("zh-CN/blog/formats/note");
  const second = html("zh-CN/blog/formats/note/2");
  const home = html("zh-CN");
  assert.equal(
    (first.match(/<article\b[^>]*data-note-entry/g) ?? []).length,
    10,
  );
  assert.equal((home.match(/<article\b[^>]*data-note-entry/g) ?? []).length, 1);
  assert.ok(
    first.includes('class="note-timeline__year"') && first.includes("2027"),
  );
  assert.ok(
    second.includes('class="note-timeline__year"') && second.includes("2026"),
  );
  assert.ok(first.includes("<strong>一段完整的生活记录。</strong>"));
  assert.ok(
    first.includes("完整正文终点。") && first.includes("data-note-expand"),
  );
  assert.ok(first.includes('class="note-entry__photos-more"'));
  assert.equal((first.match(/data-note-photo aria-label/g) ?? []).length, 9);
  for (const src of photos)
    assert.ok(
      first.includes(`href="${src}"`),
      "Photos open their real source, not an article",
    );
  assert.ok(
    first.includes('width="1" height="1"'),
    "Local image dimensions are preserved",
  );
  assert.ok(first.includes(`href="/zh-CN/blog/${prefix}-latest#comments"`));
  assert.ok(first.includes(`href="/zh-CN/tickets/${prefix}"`));
  assert.ok(
    first.includes("香港 · 临时测试") &&
      first.includes("https://example.com/map"),
  );
  assert.ok(
    !first.includes("data-comments-widget") &&
      !first.includes("archive-navigation"),
  );
  assert.ok(first.includes('href="/zh-CN/blog/formats/note/2"'));
  assert.ok(second.includes('href="/zh-CN/blog/formats/note"'));
  for (const id of [
    "latest",
    ...Array.from({ length: 10 }, (_, i) => String(i)),
    "old-year",
  ]) {
    const anchor = `id="note-blog-${prefix}-${id}"`;
    assert.equal(
      (first + second).split(anchor).length - 1,
      1,
      "Each note appears once across pages",
    );
  }
  assert.ok(!first.includes("DO_NOT_PUBLISH_TIMELINE_DRAFT"));
  assert.ok(!second.includes("DO_NOT_PUBLISH_TIMELINE_DRAFT"));
  assert.ok(
    html(`zh-CN/blog/${prefix}-latest`).includes("data-comments-widget"),
    "Existing comment permalinks remain valid",
  );
  assert.ok(html("en/blog/formats/note").includes("English timeline</strong>"));
  console.log(
    "PASS: timeline pagination, UTC+8 month/year grouping, full inline text, nine photos, local dimensions, location, ticket links, stable comments, bilingual pages and draft exclusion.",
  );
} finally {
  for (const path of written.reverse()) unlinkSync(path);
  console.log(
    `Temporary notes removed. Build the production site again before publishing. Log: ${logPath}`,
  );
}
