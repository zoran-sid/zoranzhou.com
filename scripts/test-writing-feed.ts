import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import rss from "@astrojs/rss";
import { writingFeedItem } from "../src/lib/writing-feed";
import type { WritingEntry } from "../src/lib/writing-entry";

const site = new URL("https://zoranzhou.com");

function entry(body: string): WritingEntry {
  return {
    collection: "blog",
    id: "demo.md",
    slug: "demo",
    body,
    data: {
      title: "Demo & details",
      description: "A short summary",
      date: new Date("2026-01-01T00:00:00Z"),
      lang: "zh-CN",
      tags: [],
      author: "Zoran",
      featured: false,
      draft: false,
      publication: "approved",
    },
  };
}

test("RSS renders full Markdown content and absolute resource URLs", async () => {
  const item = await writingFeedItem(
    {
      collection: "blog",
      id: "blog/demo",
      slug: "demo",
      body: [
        "# Heading",
        "",
        '<span id="overview" />',
        "",
        "![Photo](/writing-images/notes/photo.webp)",
        "",
        "[A local article](/zh-CN/blog/other)",
        "",
        "[A relative section](#heading)",
      ].join("\n"),
      data: {
        title: "Demo",
        date: new Date("2026-01-01T00:00:00Z"),
        lang: "zh-CN",
        tags: [],
        draft: false,
        publication: "approved",
      },
    } as never,
    site,
  );

  assert.match(item.content ?? "", /<h2 id="heading">Heading<\/h2>/);
  assert.match(item.content ?? "", /<span id="overview">/);
  assert.match(
    item.content ?? "",
    /<img src="https:\/\/zoranzhou\.com\/writing-images\/notes\/photo\.webp" alt="Photo">/,
  );
  assert.match(
    item.content ?? "",
    /<a href="https:\/\/zoranzhou\.com\/zh-CN\/blog\/other">A local article<\/a>/,
  );
  assert.match(item.content ?? "", /href="#heading"/);
});

test("HTML images and links also work outside the website", async () => {
  const item = await writingFeedItem(
    entry(
      [
        '<figure><img src="./photo.gif" alt="Animated photo"><figcaption>Caption</figcaption></figure>',
        '<a href="../other/?a=1&amp;b=2">Another article</a>',
        '<img src="//images.example.com/photo.png" alt="Remote photo">',
        '<a href="mailto:hello@example.com">Email</a>',
      ].join("\n"),
    ),
    site,
  );
  assert.match(
    item.content!,
    /src="https:\/\/zoranzhou.com\/zh-CN\/blog\/demo\/photo.gif"/,
  );
  assert.match(
    item.content!,
    /href="https:\/\/zoranzhou.com\/zh-CN\/blog\/other\/\?a=1&#x26;b=2"/,
  );
  assert.match(item.content!, /src="https:\/\/images.example.com\/photo.png"/);
  assert.match(item.content!, /<figcaption>Caption<\/figcaption>/);
  assert.match(item.content!, /href="mailto:hello@example.com"/);
});

test("reader HTML keeps article formatting while removing executable markup", async () => {
  const item = await writingFeedItem(
    entry(
      [
        "## Details",
        "",
        "- **An item**",
        "",
        "| Column | Value |",
        "| --- | --- |",
        "| Row | 1 |",
        "",
        "```html",
        '<script>alert("code sample")</script>',
        "```",
        "",
        '<script>alert("live script")</script>',
        "<style>body { display: none }</style>",
        '<iframe src="https://example.com">Embedded page</iframe>',
        '<img src="/photo.png" onerror="alert(1)" style="width: 9999px">',
        '<a href="javascript:alert(1)">Unsafe link</a>',
        "",
        "The final paragraph is also included.",
      ].join("\n"),
    ),
    site,
  );
  assert.match(item.content!, /<ul>[\s\S]*<strong>An item<\/strong>/);
  assert.match(item.content!, /<table>[\s\S]*<td>1<\/td>/);
  assert.match(item.content!, /<pre><code class="language-html">&#x3C;script>/);
  assert.match(item.content!, /The final paragraph is also included\./);
  assert.doesNotMatch(
    item.content!,
    /<script|<style|<iframe|onerror=|style=|javascript:|live script|Embedded page/,
  );
});

test("current MDX article keeps its anchors, diagram source and complete text", async () => {
  const body = readFileSync(
    "src/content/research/cloudflare-zero-trust.mdx",
    "utf8",
  ).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const item = await writingFeedItem(entry(body), site);
  assert.match(item.content!, /id="overview"/);
  assert.match(item.content!, /id="dns-filtering"/);
  assert.match(item.content!, /<code class="language-mermaid">/);
  assert.match(item.content!, /这些策略作用于 DNS 解析阶段/);
});

test("full content preserves legacy IDs and stable revision dates in both locales", async () => {
  for (const lang of ["zh-CN", "en"] as const) {
    const original = entry("A full article.\n\nLast paragraph.");
    original.data.lang = lang;
    const legacy = await writingFeedItem(original, site);
    assert.equal(legacy.customData, undefined);
    assert.equal(legacy.link, `https://zoranzhou.com/${lang}/blog/demo/`);
    assert.equal(legacy.pubDate.toISOString(), "2026-01-01T00:00:00.000Z");

    original.data.updated = new Date("2026-02-01T00:00:00Z");
    if (lang === "en") {
      original.data.translation = {
        provider: "deepl",
        sourceHash: "source",
        outputHash: "output",
        rulesVersion: "1",
        translatedAt: new Date("2026-03-01T00:00:00Z"),
      };
    }
    const revised = await writingFeedItem(original, site);
    assert.equal(
      revised.pubDate.toISOString(),
      lang === "en" ? "2026-03-01T00:00:00.000Z" : "2026-02-01T00:00:00.000Z",
    );
    assert.equal(revised.link, legacy.link);
    assert.match(revised.customData!, /<guid isPermaLink="false">/);
    original.body = original.body.replaceAll("\n", "\r\n");
    assert.equal(
      (await writingFeedItem(original, site)).customData,
      revised.customData,
    );
    original.body += "\n\nA new section.";
    assert.notEqual(
      (await writingFeedItem(original, site)).customData,
      revised.customData,
    );
  }
});

test("RSS serializes the full body separately from the summary", async () => {
  const item = await writingFeedItem(
    entry("## Full article\n\nFinal paragraph & details."),
    site,
  );
  const response = await rss({
    title: "Writing",
    description: "Writing feed",
    site,
    items: [item],
  });
  const xml = await response.text();
  assert.match(
    xml,
    /xmlns:content="http:\/\/purl.org\/rss\/1.0\/modules\/content\/"/,
  );
  assert.match(xml, /<description>A short summary<\/description>/);
  assert.match(
    xml,
    /<content:encoded>[\s\S]*Final paragraph[\s\S]*<\/content:encoded>/,
  );
  assert.match(
    xml,
    /<guid[^>]*>https:\/\/zoranzhou.com\/zh-CN\/blog\/demo\/<\/guid>/,
  );
});
