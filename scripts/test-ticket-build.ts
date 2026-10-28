// Temporary public fixtures exercise Astro's real schema/rendering. Always removed
// after the check; run a clean build before publishing dist/.
import assert from "node:assert/strict";
import {
  existsSync,
  writeFileSync,
  readFileSync,
  unlinkSync,
  openSync,
  closeSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { stringify } from "yaml";
import { ticketTypes } from "../src/lib/ticket-model";

const prefix = "zz-ticket-build-check";
const written: string[] = [];
const noteSlug = `${prefix}-note`;
const logPath = join(tmpdir(), "zoran-ticket-fixture-build.log");
function write(path: string, content: string | Buffer) {
  assert.ok(!existsSync(path), `Refusing to overwrite ${path}`);
  writeFileSync(path, content, { flag: "wx" });
  written.push(path);
}
function content(path: string, data: Record<string, unknown>, body = "") {
  write(path, `---\n${stringify(data)}---\n${body}\n`);
}
const html = (path: string) => readFileSync(`dist/${path}/index.html`, "utf8");
function ticket(id: string, data: Record<string, unknown> = {}, body = "") {
  content(
    `src/content/tickets/${prefix}-${id}.md`,
    {
      title: `票根构建测试 ${id}`,
      date: "2026-10-27",
      type: "movie",
      slug: `${prefix}-${id}`,
      lang: "zh-CN",
      publication: "approved",
      ...data,
    },
    body,
  );
}

try {
  content(
    `src/content/blog/notes/${noteSlug}.md`,
    {
      title: "关联随记构建测试",
      date: "2026-10-27T12:00:00+08:00",
      slug: noteSlug,
      format: "note",
      publication: "approved",
      lang: "zh-CN",
    },
    "这是临时测试随记，构建测试结束后删除。",
  );
  content(
    `src/content/blog/notes/${prefix}-draft-note.md`,
    {
      title: "草稿随记构建测试",
      date: "2026-10-27T12:00:00+08:00",
      slug: `${prefix}-draft-note`,
      format: "note",
      publication: "draft",
      lang: "zh-CN",
    },
    "临时草稿。",
  );
  const photos = Array.from({ length: 7 }, (_, i) => {
    const src = `/ticket-images/${prefix}-${i}.png`;
    write(
      `public${src}`,
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB9sAAAAASUVORK5CYII=",
        "base64",
      ),
    );
    return src;
  });
  ticket(
    "latest",
    {
      note: noteSlug,
      photos,
      location: "香港 · 测试场地",
      translationKey: prefix,
      details: {
        variant: "movie",
        cinema: "测试影院",
        startTime: "20:10",
        seat: "F8",
        collectionCode: "<test-code>",
      },
    },
    "## 那天\n\n这是保留完整段落的临时故事。",
  );
  ticket("older", {
    date: "2024-02-29",
    note: noteSlug,
    photos: null,

    location: null,
  });
  ticket("missing-note", { note: "removed-note" });
  ticket("draft-note", { note: `${prefix}-draft-note` });
  ticket("draft", { publication: "draft" });
  ticket("unapproved", { publication: undefined });
  ticket("en", {
    title: "Ticket build fixture",
    lang: "en",
    note: noteSlug,
    translationKey: prefix,
    photos: [photos[0]],
  });
  for (const type of ticketTypes)
    ticket(type, {
      type,
      date: "2026-01-01",
      note: null,
      title: `A very long bilingual title 用于检查完整保留的票根名称 ${type}`,
      details: {
        variant: type,
        fromIata: "HKG",
        toIata: "NRT",
        from: "香港",
        to: "东京",
        fromStation: "香港西九龙",
        toStation: "深圳北",
        departure: "08:00",
        items: "茶与咖啡",
        total: "HK$ 50",
      },
    });

  const log = openSync(logPath, "w");
  try {
    const build = spawnSync("npm", ["run", "build"], {
      stdio: ["ignore", log, log],
      env: process.env,
    });
    assert.equal(build.status, 0, `Fixture build failed: ${logPath}`);
    const links = spawnSync("npm", ["run", "test:site-build"], {
      stdio: ["ignore", log, log],
      env: process.env,
    });
    assert.equal(links.status, 0, `Built site check failed: ${logPath}`);
  } finally {
    closeSync(log);
  }

  const listing = html("zh-CN/tickets");
  const latest = html(`zh-CN/tickets/${prefix}-latest`);
  const older = html(`zh-CN/tickets/${prefix}-older`);
  const note = html(`zh-CN/blog/${noteSlug}`);
  const en = html(`en/tickets/${prefix}-en`);
  assert.ok(
    listing.indexOf(`href="/zh-CN/tickets/${prefix}-latest"`) <
      listing.indexOf(`href="/zh-CN/tickets/${prefix}-older"`),
  );
  for (const type of ticketTypes)
    assert.ok(listing.includes(`data-ticket-filter="${type}"`));
  assert.ok(listing.includes('aria-pressed="true"'));
  assert.ok(
    listing.includes('class="ticket-cover"'),
    "Ticket wall uses collectible covers",
  );
  assert.ok(
    !listing.includes("<img"),
    "Listing covers use print designs, not uploaded or work images",
  );
  assert.ok(
    latest.includes("ticket-face--full") &&
      !latest.includes('class="ticket-cover"'),
    "Detail ticket remains unchanged",
  );
  for (const src of photos) assert.ok(latest.includes(`src="${src}"`));
  assert.ok(latest.includes("这是保留完整段落的临时故事。"));
  assert.ok(
    latest.includes("测试影院") &&
      latest.includes("F8") &&
      latest.includes("20:10"),
  );
  assert.ok(
    latest.includes("&lt;test-code&gt;") && !latest.includes("<test-code>"),
  );
  assert.ok(html(`zh-CN/tickets/${prefix}-flight`).includes("HKG"));
  assert.ok(html(`zh-CN/tickets/${prefix}-train`).includes("香港西九龙"));
  assert.ok(html(`zh-CN/tickets/${prefix}-receipt`).includes("HK$ 50"));
  assert.ok(latest.includes(`href="/zh-CN/blog/${noteSlug}"`));
  assert.ok(
    latest.includes(
      `hreflang="en" href="https://zoranzhou.com/en/tickets/${prefix}-en"`,
    ),
  );
  assert.ok(older.includes('datetime="2024-02-29"'));
  assert.ok(!older.includes('class="ticket-photos'));
  assert.ok(note.includes(`href="/zh-CN/tickets/${prefix}-latest"`));
  assert.ok(note.includes(`href="/zh-CN/tickets/${prefix}-older"`));
  assert.ok(note.includes(`href="/en/tickets/${prefix}-en"`));
  assert.ok(en.includes(`href="/zh-CN/blog/${noteSlug}"`));
  for (const page of [latest, note, en])
    assert.ok(
      page.includes('id="comments"') && page.includes("data-comments-widget"),
    );
  assert.ok(en.includes(`data-path="/en/tickets/${prefix}-en"`));
  for (const path of [
    "zh-CN",
    "zh-CN/life",
    "zh-CN/tickets",
    "en/tickets",
    "zh-CN/photos",
    "zh-CN/map",
    "zh-CN/lab",
  ])
    assert.ok(
      !html(path).includes('id="comments"'),
      `${path}: no comment widget on listings`,
    );
  assert.ok(
    !html(`zh-CN/tickets/${prefix}-missing-note`).includes(
      'id="ticket-note-title"',
    ),
  );
  assert.ok(
    !html(`zh-CN/tickets/${prefix}-draft-note`).includes(
      'id="ticket-note-title"',
    ),
  );
  for (const id of ["draft", "unapproved"])
    assert.ok(!existsSync(`dist/zh-CN/tickets/${prefix}-${id}/index.html`));
  for (const locale of ["zh-CN", "en"]) {
    const search = JSON.parse(
      readFileSync(`dist/${locale}/search-index.json`, "utf8"),
    );
    assert.ok(
      search.some(
        (entry: { collection: string }) => entry.collection === "tickets",
      ),
    );
    assert.ok(
      !search.some((entry: { slug: string }) =>
        [`${prefix}-unapproved`, `${prefix}-draft`].includes(entry.slug),
      ),
    );
    const feed = readFileSync(`dist/${locale}/rss.xml`, "utf8");
    assert.ok(
      ![...feed.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)].some(
        (match) => match[1].includes("/tickets/"),
      ),
    );
    assert.ok(html(`${locale}/life`).includes(`href="/${locale}/tickets"`));
  }
  console.log(
    "票根构建测试通过：全部分类筛选与票面字段、排序、七图详情、空图、双向/跨语言关联、草稿排除、评论范围、搜索、语言配对、站内链接与 RSS 隔离。",
  );
} finally {
  written.reverse().forEach((path) => unlinkSync(path));
  console.log(
    `临时内容已清理。测试日志：${logPath}。请重新运行 npm run build 生成正式产物。`,
  );
}
