import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  commentAvatarCount,
  commentAvatarPath,
  commentOptions,
  commentPath,
  commentServer,
} from "../src/lib/comment-config";

test("one comment thread per page regardless of trailing slash, query or fragment", () => {
  for (const path of [
    "/zh-CN/blog/example",
    "/zh-CN/blog/example/",
    "/zh-CN/blog/example/?ref=home#comments",
  ]) {
    assert.equal(commentPath(path), "/zh-CN/blog/example");
  }
  assert.notEqual(
    commentPath("/en/blog/example/"),
    commentPath("/zh-CN/blog/example/"),
  );
  assert.notEqual(
    commentPath("/zh-CN/tickets/example/"),
    commentPath("/zh-CN/blog/example/"),
  );
});

test("Waline uses the supplied server, site theme and local page language without pageview tracking", () => {
  assert.equal(commentServer, "https://zorancomment.xyz");
  const zh = commentOptions("/zh-CN/tickets/a/", "zh-CN");
  const en = commentOptions("/en/blog/b/", "en");
  assert.equal(zh.dark, "html.dark");
  assert.equal(zh.lang, "zh-CN");
  assert.equal(en.lang, "en");
  assert.equal(zh.pageview, false);
  assert.equal(zh.imageUploader, false);
  assert.equal(typeof zh.search.search, "function");
  assert.equal(zh.emoji[0].items.length, 24);
  assert.deepEqual(zh.meta, ["nick"]);
  assert.ok(en.locale.placeholder.includes("reading"));
  assert.deepEqual(zh.requiredMeta, ["nick"]);
  const headers = readFileSync(
    new URL("../public/_headers", import.meta.url),
    "utf8",
  );
  assert.match(
    headers,
    /Cross-Origin-Opener-Policy: same-origin-allow-popups/,
    "Waline desktop login needs the popup opener to return login state",
  );
});

test("anonymous avatar pool uses stable, local paths", () => {
  assert.equal(commentAvatarCount, 100);
  assert.equal(commentAvatarPath(0), "/comment-avatars/avatar-001.png");
  assert.equal(commentAvatarPath(100), "/comment-avatars/avatar-001.png");
  assert.equal(commentAvatarPath(-1), "/comment-avatars/avatar-100.png");
});

test("emoji search uses locally hosted assets and accepts Chinese and English", async () => {
  const options = commentOptions("/zh-CN/blog/a", "zh-CN");
  for (const term of ["笑", "smile", "赞", "thumbs"]) {
    const results = await options.search.search(term);
    assert.ok(results.length > 0);
    for (const item of results) {
      assert.ok(item.src.startsWith("https://zoranzhou.com/comment-emojis/"));
      const file = readFileSync(
        new URL(`../public${new URL(item.src).pathname}`, import.meta.url),
        "utf8",
      );
      assert.ok(file.includes("<svg"));
    }
  }
  assert.deepEqual(await options.search.search("nothing-matches-this"), []);
});
