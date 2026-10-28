import assert from "node:assert/strict";
import test from "node:test";
import { writingFeedItem } from "../src/lib/writing-feed";

const site = new URL("https://zoranzhou.com");

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
  assert.match(item.content ?? "", /<span id="overview" \/>/);
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
