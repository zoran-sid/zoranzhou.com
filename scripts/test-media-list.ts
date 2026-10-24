import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import {
  parseMediaList,
  mediaDate,
  mediaLink,
  mediaTitle,
} from "../src/lib/media/list";
import { replaceMoviesTable } from "./media/markdown";
import { initMediaBrowser } from "../src/lib/media/browser";

const source = `## movies
| name | year | rating | status | watchedDate | poster | url | imdb |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Old favourite / Older film | 1997 | 4 | watched | 2026-10-24 | https://images.example/film.jpg | https://movie.douban.com/subject/123/ | tt0118884 |
| New release | 2026 | 3 | watched | 2026-09-03 | | | |
| Same day B | 2000 | | watched | 2026-09-03 | | | |
| No date | 2027 | | watched | | | | |
| Invalid date | 2028 | | watched | 2026-02-30 | | | |`;

test("viewing date outranks release year, with stable ties and undated records last", () => {
  const items = parseMediaList(source);
  assert.deepEqual(
    items.map((item) => item.name),
    [
      "Old favourite / Older film",
      "New release",
      "Same day B",
      "No date",
      "Invalid date",
    ],
  );
  assert.equal(items[0].year, 1997);
  assert.equal(items[0].watchedDate, "2026-10-24");
  assert.equal(items[0].poster, "https://images.example/film.jpg");
  assert.equal(items.at(-1)?.watchedDate, undefined);
  assert.equal(mediaDate("2024-02-29"), "2024-02-29");
  assert.equal(mediaDate("2025-02-29"), undefined);
  assert.equal(mediaDate("2026"), undefined);
});

test("localized links use verified IDs or explicitly labelled title search", () => {
  const [film, unknown] = parseMediaList(source);
  assert.equal(mediaTitle(film, "en"), "Older film");
  assert.equal(mediaLink(film, "zh-CN")?.href, film.url);
  assert.equal(
    mediaLink(film, "en")?.href,
    "https://www.imdb.com/title/tt0118884/",
  );
  assert.equal(mediaLink(unknown, "en")?.label, "Find on IMDb");
  assert.equal(
    new URL(mediaLink(unknown, "en")!.href).searchParams.get("q"),
    "New release 2026",
  );
});

test("unsafe image and detail URLs are omitted; legacy tables and escaped pipes still work", () => {
  const entries = parseMediaList(`## books
| name | year | rating | status | poster | url | urlEn |
| --- | --- | --- | --- | --- | --- | --- |
| A \\| B | 2000 | 7 | read | javascript:alert(1) | data:text/html,x | https://books.google.com/books?q=test |
## games
| name | year | rating | status |
| --- | --- | --- | --- |
| Game | 2024 | | completed |`);
  assert.equal(entries[0].name, "A | B");
  assert.equal(entries[0].rating, 5);
  assert.equal(entries[0].poster, undefined);
  assert.equal(entries[0].url, undefined);
  assert.equal(
    mediaLink(entries[0], "en")?.href,
    "https://books.google.com/books?q=test",
  );
  assert.equal(entries[1].category, "games");
});

test("manual media updates preserve viewing dates, IMDb IDs and the entire books section", () => {
  const before =
    source +
    "\n\n## books\n\n| name | year | rating | status |\n| --- | --- | --- | --- |\n| Book | 2000 | 5 | read |\n";
  const merged = replaceMoviesTable(before, [
    {
      id: "douban:123",
      slug: "douban-123",
      name: "Older film",
      status: "watched",
      url: "https://movie.douban.com/subject/123/",
      year: "1997",
      watchedDate: "2026-10-25",
    },
  ]);
  const original = parseMediaList(merged).find((item) =>
    item.url?.includes("/123/"),
  )!;
  assert.equal(original.watchedDate, "2026-10-24");
  assert.equal(original.imdb, "tt0118884");
  assert.equal(
    merged.slice(merged.indexOf("## books")),
    before.slice(before.indexOf("## books")),
  );
});

test("the real library has covers and source links without rewriting personal history", () => {
  const data = readFileSync(
    new URL("../src/content/media.md", import.meta.url),
    "utf8",
  );
  const entries = parseMediaList(data);
  const books = entries.filter((item) => item.category === "books");
  const cache: Record<string, string> = JSON.parse(
    readFileSync(
      new URL("../src/data/media-covers.json", import.meta.url),
      "utf8",
    ),
  );
  assert.ok(books.length > 0);
  for (const book of books) {
    assert.ok(
      book.poster && cache[book.poster],
      `${book.name}: locally cached cover`,
    );
    assert.ok(
      existsSync(new URL(`../public${cache[book.poster!]}`, import.meta.url)),
    );
    assert.equal(new URL(book.url!).hostname, "book.douban.com");
    assert.equal(book.watchedDate, undefined);
  }
  const dated = entries.filter((item) => item.watchedDate);
  assert.ok(dated.length > 0);
  assert.equal(
    dated[0].watchedDate,
    [...dated]
      .map((item) => item.watchedDate!)
      .sort()
      .at(-1),
  );
});

// Small DOM fixture exercises the interaction; no browser or screenshots required.
class Element {
  hidden = false;
  value = "";
  textContent = "";
  focused = false;
  attrs: Record<string, string> = {};
  handlers: Record<string, (() => void)[]> = {};
  constructor(public dataset: Record<string, string> = {}) {}
  addEventListener(name: string, callback: () => void) {
    (this.handlers[name] ??= []).push(callback);
  }
  setAttribute(name: string, value: string) {
    this.attrs[name] = value;
  }
  fire(name: string) {
    this.handlers[name]?.forEach((callback) => callback());
  }
  querySelector() {
    return this;
  }
  focus() {
    this.focused = true;
  }
}

test("category, search, load more and empty states operate together", () => {
  const cards = Array.from(
    { length: 31 },
    (_, index) =>
      new Element({
        category: index === 30 ? "books" : "movies",
        search: `Title ${index} 片名`,
      }),
  );
  const tabs = ["all", "movies", "books"].map((cat) => new Element({ cat }));
  const search = new Element();
  const more = new Element();
  const count = new Element({ template: "{shown}/{total}" });
  const empty = new Element();
  const controls = new Element();
  const nodes: Record<string, Element> = {
    "#media-search": search,
    "[data-media-more]": more,
    "[data-media-count]": count,
    "[data-media-empty]": empty,
    "[data-media-controls]": controls,
  };
  const root = {
    querySelectorAll: (selector: string) =>
      selector === "[data-media-item]" ? cards : tabs,
    querySelector: (selector: string) => nodes[selector],
  };
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const fakeWindow = {
    location: { href: "https://zoranzhou.com/en/media/?category=movies" },
    history: {
      replaceState: (_a: unknown, _b: unknown, url: URL) => {
        fakeWindow.location.href = String(url);
      },
    },
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: fakeWindow,
  });
  try {
    initMediaBrowser(root as unknown as HTMLElement);
    assert.equal(count.textContent, "24/30");
    assert.equal(cards[30].hidden, true);
    more.fire("click");
    assert.equal(count.textContent, "30/30");
    assert.equal(cards[24].focused, true);
    tabs[2].fire("click");
    assert.equal(count.textContent, "1/1");
    assert.equal(cards[30].hidden, false);
    assert.ok(fakeWindow.location.href.includes("category=books"));
    search.value = "absent";
    search.fire("input");
    assert.equal(empty.hidden, false);
    assert.equal(count.textContent, "0/0");
    search.value = "片名";
    search.fire("input");
    assert.equal(empty.hidden, true);
    tabs[0].fire("click");
    assert.equal(count.textContent, "24/31");
  } finally {
    if (originalWindow)
      Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

test("TV inherits viewing metadata from a unique catalogue match, preserving manual values", () => {
  const entries = parseMediaList(`## movies
| name | year | rating | status | watchedDate | poster | url | imdb |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 第一季 / Story Season 1 | 2024 | 3 | watched | 2026-09-10 | https://example.com/one.jpg | https://example.com/one | tt1234567 |
| 第二季 / Story Season 2 | 2024 | 3 | watched | 2026-10-10 | https://example.com/two.jpg | https://example.com/two | tt1234568 |
## tv
| name | year | rating | status | watchedDate |
| --- | --- | --- | --- | --- |
| 第二季 / Story  Season 2 | 2024 | 5 | watching | |
| Story | 2024 | 4 | watched | 2026-01-01 |`);
  const tv = entries.filter((item) => item.category === "tv");
  assert.equal(tv[0].poster, "https://example.com/two.jpg");
  assert.equal(tv[0].watchedDate, "2026-10-10");
  assert.equal(tv[0].rating, 5);
  assert.equal(tv[0].status, "watching");
  assert.equal(tv[1].poster, "https://example.com/one.jpg");
  assert.equal(tv[1].watchedDate, "2026-01-01");
});

test("ambiguous TV metadata stays unmatched instead of borrowing an arbitrary poster", () => {
  const entries = parseMediaList(`## movies
| name | year | rating | status | poster |
| --- | --- | --- | --- | --- |
| Shared title | 2020 | | watched | https://example.com/a.jpg |
| Shared title | 2020 | | watched | https://example.com/b.jpg |
## tv
| name | year | rating | status |
| --- | --- | --- | --- |
| Shared title | 2020 | | watched |`);
  assert.equal(entries.at(-1)?.poster, undefined);
});

test("all existing TV and game covers have local files", () => {
  const entries = parseMediaList(readFileSync("src/content/media.md", "utf8"));
  const cache = JSON.parse(readFileSync("src/data/media-covers.json", "utf8"));
  for (const item of entries.filter((item) =>
    ["tv", "games"].includes(item.category),
  )) {
    assert.ok(
      item.poster &&
        cache[item.poster] &&
        existsSync(`public${cache[item.poster]}`),
      item.name,
    );
  }
});
