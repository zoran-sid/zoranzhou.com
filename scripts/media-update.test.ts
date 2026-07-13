import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fetchAllDoubanMovies, parseDoubanPage } from "./media/douban";
import { parseMediaTable, replaceMoviesTable } from "./media/markdown";
import { loadMoviesFromInput, runMediaUpdate } from "./media-update";

function item(
  id: string,
  name: string,
  options: { next?: boolean } = {},
): string {
  return `
    <div class="item">
      <div class="pic"><a href="https://movie.douban.com/subject/${id}/"><img src="https://img.example/${id}.jpg"></a></div>
      <div class="info"><ul>
        <li class="title"><a href="https://movie.douban.com/subject/${id}/"><em>${name}</em> / ignored alias</a></li>
        <li class="intro">导演: Example / 2025-07-01 / 中国大陆 / 剧情</li>
        <li><span class="date">2026-07-10 看过</span><span class="rating4-t"></span><span class="tags">标签: cinema test</span><span class="comment">Worth | it</span></li>
      </ul></div>
    </div>${options.next ? '<span class="next"><a href="?start=1">后页&gt;</a></span>' : ""}`;
}

function page(body: string, range: string): string {
  return `<!doctype html><html><body><div id="content"><span class="subject-num">${range}</span><div class="grid-view">${body}</div></div><!-- ${"padding ".repeat(80)} --></body></html>`;
}

const mediaSource = `# Media List

## movies

| name | year | rating | status | manualNote |
| --- | --- | --- | --- | --- |
| 测试电影 / Test Movie | 2025 | | watched | keep me |

## games

| name | year | rating | status |
| --- | --- | --- | --- |
| 手工游戏 | 2024 | 5 | completed |
`;

test("parses the supported Douban list fields", () => {
  const parsed = parseDoubanPage(
    page(item("123", "测试电影 / Test Movie"), "1-1 / 1"),
  );
  assert.equal(parsed.total, 1);
  assert.deepEqual(parsed.movies[0], {
    id: "douban:123",
    slug: "douban-123",
    name: "测试电影 / Test Movie",
    year: "2025",
    rating: "4",
    status: "watched",
    poster: "https://img.example/123.jpg",
    url: "https://movie.douban.com/subject/123/",
    watchedDate: "2026-07-10",
    tags: "cinema test",
    comment: "Worth | it",
    metadata: "导演: Example / 2025-07-01 / 中国大陆 / 剧情",
  });
});

test("parses the current mode=list li.item fallback markup", () => {
  const html = `<!doctype html><html><body>
    <span class="subject-num">1-1 / 1</span>
    <ul class="list-view"><li class="item">
      <div class="title"><a href="https://movie.douban.com/subject/789/"><em>列表电影</em> / List Movie</a></div>
      <div class="date">2026-7-3 看过</div>
      <span class="intro">2024-12-01 / 中国大陆 / 剧情</span>
      <span class="rating5-t"></span>
      <div class="tags">标签: saved html</div>
      <div class="comment">list comment</div>
    </li></ul><!-- ${"padding ".repeat(80)} -->
  </body></html>`;
  const parsed = parseDoubanPage(html);
  assert.equal(parsed.movies[0].name, "列表电影");
  assert.equal(parsed.movies[0].year, "2024");
  assert.equal(parsed.movies[0].rating, "5");
  assert.equal(parsed.movies[0].watchedDate, "2026-07-03");
  assert.equal(parsed.movies[0].tags, "saved html");
  assert.equal(parsed.movies[0].poster, undefined);
});

test("merges idempotently, escapes pipes, and preserves games byte-for-byte", () => {
  const movies = parseDoubanPage(
    page(item("123", "测试电影 / Test Movie"), "1-1 / 1"),
  ).movies;
  const gamesBefore = mediaSource.slice(mediaSource.indexOf("## games"));
  const first = replaceMoviesTable(mediaSource, movies);
  const second = replaceMoviesTable(first, movies);
  assert.equal(second, first);
  assert.equal(first.slice(first.indexOf("## games")), gamesBefore);
  assert.match(first, /Worth \\| it/);
  const tableLines = first
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"));
  assert.equal(
    parseMediaTable(tableLines.slice(0, 3)).rows[0].comment,
    "Worth | it",
  );
  assert.match(first, /keep me/);
});

test("fetches pagination until the advertised total", async () => {
  const html = [
    page(item("123", "One", { next: true }), "1-1 / 2"),
    page(item("456", "Two"), "2-2 / 2"),
  ];
  let request = 0;
  const requestedUrls: string[] = [];
  const movies = await fetchAllDoubanMovies({
    delayMs: 0,
    fetchImpl: (async (input: string | URL | Request) => {
      requestedUrls.push(String(input));
      return new Response(html[request++], {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }) as typeof fetch,
    logger: { log() {}, warn() {} },
  });
  assert.equal(request, 2);
  assert.deepEqual(
    movies.map((movie) => movie.id),
    ["douban:123", "douban:456"],
  );
  assert.equal(new URL(requestedUrls[0]).searchParams.get("mode"), "grid");
  assert.equal(new URL(requestedUrls[0]).searchParams.get("type"), "all");
  assert.equal(
    new URL(requestedUrls[0]).searchParams.get("tags_sort"),
    "count",
  );
});

test("finishes on advertised records while deduplicating an overlapping subject", async () => {
  const pages = [
    page(
      `${item("123", "One")}${item("456", "Two", { next: true })}`,
      "1-2 / 3",
    ),
    page(item("456", "Two again"), "3-3 / 3"),
  ];
  let request = 0;
  const warnings: string[] = [];
  const movies = await fetchAllDoubanMovies({
    delayMs: 0,
    fetchImpl: (async () =>
      new Response(pages[request++], {
        headers: { "content-type": "text/html; charset=utf-8" },
      })) as typeof fetch,
    logger: {
      log() {},
      warn(message) {
        warnings.push(String(message));
      },
    },
  });
  assert.equal(request, 2);
  assert.deepEqual(
    movies.map((movie) => movie.id),
    ["douban:123", "douban:456"],
  );
  assert.match(
    warnings.join("\n"),
    /3 parsed records normalized to 2 unique subject IDs/,
  );
});

test("allows and reports a source-omitted advertised record", async () => {
  const parsed = parseDoubanPage(page(item("123", "Visible"), "1-2 / 2"));
  assert.equal(parsed.itemBlockCount, 1);
  assert.equal(parsed.omittedCount, 1);

  const warnings: string[] = [];
  const movies = await fetchAllDoubanMovies({
    delayMs: 0,
    fetchImpl: (async () =>
      new Response(page(item("123", "Visible"), "1-2 / 2"), {
        headers: { "content-type": "text/html; charset=utf-8" },
      })) as typeof fetch,
    logger: {
      log() {},
      warn(message) {
        warnings.push(String(message));
      },
    },
  });
  assert.equal(movies.length, 1);
  assert.match(warnings.join("\n"), /advertised 1 record.*no item block/);
});

test("rejects an item block that cannot be parsed", () => {
  const brokenItem = `<div class="item"><a href="https://movie.douban.com/subject/999/">missing title structure</a></div>`;
  assert.throws(
    () => parseDoubanPage(page(brokenItem, "1-1 / 1")),
    /Only 0 of 1 collection item blocks were parsed/,
  );
});

test("rejects pagination markup drift instead of accepting the first page", async () => {
  const noPager = `<!doctype html><html><body><div class="grid-view">${item("123", "One")}</div><!-- ${"padding ".repeat(80)} --></body></html>`;
  await assert.rejects(
    fetchAllDoubanMovies({
      delayMs: 0,
      fetchImpl: (async () =>
        new Response(noPager, {
          headers: { "content-type": "text/html; charset=utf-8" },
        })) as typeof fetch,
      logger: { log() {}, warn() {} },
    }),
    /pagination metadata is missing/,
  );
});

test("loads exported JSON and dry-runs without changing the output", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "media-update-"));
  try {
    const input = path.join(directory, "movies.json");
    const output = path.join(directory, "media.md");
    await fs.writeFile(
      input,
      JSON.stringify([
        {
          subjectId: "123",
          title: "测试电影 / Test Movie",
          releaseDate: "2025-07-01",
          score: 8,
          collectInfo: { date: "2026-07-10", tags: "cinema", comment: "ok" },
        },
      ]),
      "utf8",
    );
    await fs.writeFile(output, mediaSource, "utf8");
    const imported = await loadMoviesFromInput(input);
    assert.equal(imported[0].rating, "4");
    await runMediaUpdate({ dryRun: true, input, output });
    assert.equal(await fs.readFile(output, "utf8"), mediaSource);
    await runMediaUpdate({ dryRun: false, input, output });
    const written = await fs.readFile(output, "utf8");
    assert.match(written, /douban:123/);
    assert.equal(
      written.slice(written.indexOf("## games")),
      mediaSource.slice(mediaSource.indexOf("## games")),
    );
    assert.deepEqual(
      (await fs.readdir(directory)).filter((name) => name.endsWith(".tmp")),
      [],
    );
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test("rejects invalid dates and non-Douban subject URLs in JSON imports", async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "media-update-invalid-"),
  );
  try {
    const badDate = path.join(directory, "bad-date.json");
    const badUrl = path.join(directory, "bad-url.json");
    await fs.writeFile(
      badDate,
      JSON.stringify([
        { subjectId: "123", title: "Bad", watchedDate: "2026-02-30" },
      ]),
    );
    await fs.writeFile(
      badUrl,
      JSON.stringify([
        { title: "Bad", url: "https://example.com/subject/123/" },
      ]),
    );
    await assert.rejects(loadMoviesFromInput(badDate), /invalid calendar date/);
    await assert.rejects(
      loadMoviesFromInput(badUrl),
      /must use movie\.douban\.com/,
    );
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
