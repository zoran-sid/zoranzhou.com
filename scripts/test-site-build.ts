import assert from "node:assert/strict";
import { parseMediaList } from "../src/lib/media/list";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
const root = join(process.cwd(), "dist");
assert.ok(existsSync(root), "Run npm run build first");
const files = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(directory, entry.name))
      : [join(directory, entry.name)],
  );
const allFiles = files(root);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));
const origin = "https://zoranzhou.com";
const sourceBooks = parseMediaList(
  readFileSync("src/content/media.md", "utf8"),
).filter((item) => item.category === "books");
const htmlAt = (path: string) =>
  readFileSync(join(root, path, "index.html"), "utf8");
const pathExists = (path: string) =>
  (path === "/" && existsSync(join(process.cwd(), "functions/index.ts"))) ||
  (existsSync(join(root, decodeURIComponent(path))) &&
    statSync(join(root, decodeURIComponent(path))).isFile()) ||
  existsSync(join(root, decodeURIComponent(path), "index.html"));
const attrs = (tag: string) =>
  Object.fromEntries(
    [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((match) => [
      match[1],
      match[2].replaceAll("&amp;", "&"),
    ]),
  );
const failures: string[] = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const path = "/" + relative(root, file).replace(/index\.html$/, "");
  if (html.includes('<body class="site-body"')) {
    for (const name of ["theme-color", "color-scheme"]) {
      assert.equal(
        [...html.matchAll(new RegExp(`<meta\\s[^>]*name="${name}"[^>]*>`, "g"))]
          .length,
        1,
        `${path}: one ${name} declaration for browser chrome`,
      );
    }
  }
  assert.equal(
    (html.match(/<h1\b/g) ?? []).length,
    1,
    `${path}: one page title`,
  );
  assert.ok(
    !/netguard/i.test(html),
    `${path}: excluded project must remain private`,
  );
  const links = [
    ...html
      .replace(/<script\b[\s\S]*?<\/script>/g, "")
      .matchAll(/<(?:a|link)\s[^>]*>/g),
  ]
    .map((match) => attrs(match[0]))
    .filter((tag) => tag.href);
  for (const link of links) {
    const url = new URL(link.href, origin + path);
    if (url.origin !== origin) continue;
    if (!pathExists(url.pathname)) failures.push(`${path} -> ${link.href}`);
  }
  for (const match of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  ))
    JSON.parse(match[1]);
}
assert.deepEqual(
  [...new Set(failures)],
  [],
  "Every internal link and hreflang must resolve to a built file",
);
for (const locale of ["zh-CN", "en"]) {
  const home = htmlAt(locale);
  assert.equal((home.match(/<h1\b/g) ?? []).length, 1);
  // The Notes entry point stays available before the first published note.
  assert.ok(home.includes("<dialog"));
  assert.ok(!home.includes("hero-radar"));
  const selected = home.slice(
    home.indexOf('id="selected"'),
    home.indexOf("life-feature"),
  );
  assert.ok(
    selected.includes("/blog/building-blog"),
    "Homepage selects the blog construction article",
  );
  assert.ok(
    !selected.includes("/blog/openwrt-building"),
    "OpenWrt is not a homepage selection",
  );
  assert.ok(
    home.includes('id="notes-heading"') && home.includes(`/${locale}/blog/formats/note`),
    "Homepage introduces Notes with a working archive link",
  );
  assert.ok(!home.includes('href="#"'));
  assert.ok(!home.includes("maplibre-gl.css"));
  assert.ok(home.includes('id="library"') && home.includes('id="running"'));
  assert.ok(
    !home.includes(".gpx") && !home.includes("data-map-item="),
    "Homepage routes are text-only links",
  );
  const library = htmlAt(`${locale}/library`);
  assert.equal(
    (library.match(/data-media-item/g) ?? []).length,
    sourceBooks.length,
  );
  assert.ok(library.includes("data-media-cover"));
  const media = htmlAt(`${locale}/media`);
  assert.ok(
    media.includes("data-media-browser") && media.includes("data-media-more"),
  );
  assert.match(
    media,
    /data-watched-date="\d{4}-\d{2}-\d{2}"/,
    "Viewing dates remain internal metadata",
  );
  assert.ok(
    media.includes(
      locale === "en"
        ? "https://www.imdb.com/title/"
        : "https://movie.douban.com/subject/",
    ),
  );
  for (const page of [home, library, media]) {
    for (const match of page.matchAll(/src="(\/media\/covers\/[^\"]+)"/g)) {
      assert.ok(pathExists(match[1]), `Local cover exists: ${match[1]}`);
    }
  }
  assert.ok(
    !media.includes('class="media-card__date"'),
    "Viewing dates are not visible",
  );
  assert.ok(home.includes('class="garden-mark"'));
  assert.match(home, /<dialog[^>]*id="mobile-menu"/);
  assert.ok(home.includes('class="subscribe-pill"'));
  assert.ok(home.includes('class="hero-ball"'));
  const about = htmlAt(`${locale}/about`);
  assert.ok(
    !/Volkswagen|Huawei Global|Sangfor|State Grid|6959 6879|HF1|HF2/.test(
      about,
    ),
    "Private CV details stay out of the public profile",
  );
  assert.ok(htmlAt(`${locale}/now`).includes('class="moment-list"'));
  assert.ok(htmlAt(`${locale}/map`).includes("maplibre-gl.css"));
  for (const section of [
    "about",
    "now",
    "subscribe",
    "life",
    "projects",
    "blog/formats/note",
    "blog/formats/guide",
    "blog/formats/essay",
    "blog/topics/technology",
    "blog/topics/research",
    "blog/topics/life",
  ])
    assert.ok(pathExists(`/${locale}/${section}`));
  const subscription = htmlAt(`${locale}/subscribe`);
  assert.ok(subscription.includes(`https://zoranzhou.com/${locale}/rss.xml`));
  assert.ok(subscription.includes('href="https://blogtrottr.com/"'));
  assert.ok(subscription.includes("data-copy-feed"));
  assert.ok(
    (selected.match(/<time\b/g) ?? []).length === 3,
    "Selected writing retains publication dates",
  );
  const index = JSON.parse(
    readFileSync(join(root, locale, "search-index.json"), "utf8"),
  ) as { url: string; collection: string }[];
  assert.ok(
    index.every(
      (entry) => entry.url.startsWith(`/${locale}/`) && pathExists(entry.url),
    ),
  );
  assert.equal(new Set(index.map((entry) => entry.url)).size, index.length);
  assert.ok(!JSON.stringify(index).toLowerCase().includes("netguard"));
  assert.ok(
    index.some((entry) =>
      entry.url.includes("/lab/learning/typescript-foundations"),
    ),
  );
  if (locale === "zh-CN")
    assert.ok(index.some((entry) => entry.collection === "essays"));
  const feed = readFileSync(join(root, locale, "rss.xml"), "utf8");
  const links = [
    ...feed.matchAll(/<item>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<\/item>/g),
  ].map((match) => new URL(match[1]));
  assert.ok(links.length > 0);
  assert.ok(
    links.every(
      (link) =>
        link.pathname.startsWith(`/${locale}/`) &&
        /^\/(zh-CN|en)\/(blog|essays|research)\//.test(link.pathname) &&
        pathExists(link.pathname),
    ),
  );
  const lab = htmlAt(`${locale}/lab`);
  assert.ok(lab.includes("<title>WEB3 LAB</title>"));
  assert.equal((lab.match(/data-state="current"/g) ?? []).length, 1);
  assert.equal((lab.match(/data-state="pending"/g) ?? []).length, 4);
  assert.equal((lab.match(/aria-current="step"/g) ?? []).length, 1);
  assert.ok(lab.indexOf('id="learning"') < lab.indexOf('id="builds"'));
  assert.ok(lab.includes("/lab/learning/typescript-foundations"));
  const learning = htmlAt(
    `${locale}/lab/learning/typescript-foundations${locale === "en" ? "-en" : ""}`,
  );
  assert.ok(learning.includes("| WEB3 LAB</title>"));
  assert.ok(learning.includes(locale === "en" ? "Learning now" : "学习中"));
  assert.ok(
    learning.indexOf('class="lab-entry__content"') <
      learning.indexOf('class="lab-entry__rail"'),
  );
  assert.ok(learning.includes('class="lab-mobile-toc"'));
  assert.ok(lab.includes("web3-lab-favicon"));
  assert.ok(!lab.includes('class="site-header"'));
}
const source = htmlAt("zh-CN/blog/agentshield-deep-analysis");
assert.ok(
  /hreflang="en"[^>]+href="https:\/\/zoranzhou\.com\/en\/blog\/agentshield-deep-analysis-en"/.test(
    source,
  ),
  "Known article translation must point to the translated slug",
);
assert.ok(
  !htmlAt("zh-CN/blog/2025-12-31").includes('hreflang="en"'),
  "Do not invent translations for unpaired writing",
);
assert.ok(
  !allFiles.some((file) =>
    /content-editor|\.env$|settings\.json$|backups\//.test(file),
  ),
  "Local maintenance files must never be published",
);
const routing = JSON.parse(readFileSync(join(root, "_routes.json"), "utf8"));
assert.deepEqual(routing.include, ["/"]);
console.log(
  `PASS: ${htmlFiles.length} built pages, internal links, metadata, bilingual search/RSS, Lab isolation and production boundaries`,
);
