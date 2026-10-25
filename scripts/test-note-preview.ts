import assert from "node:assert/strict";
import test from "node:test";
import { notePreview } from "../src/lib/note-preview";

test("a casual note keeps paragraphs and link text without Markdown syntax", () => {
  const result = notePreview(
    "今天沿着河边跑了一会儿。\n\n读到 **有意思** 的 [文章](https://example.com)。",
  );
  assert.equal(result.text, "今天沿着河边跑了一会儿。\n读到 有意思 的 文章。");
});

test("previews omit raw HTML, comments and code blocks; image-only notes still have a cover", () => {
  const result = notePreview(
    "<!-- internal -->\n<script>alert(1)</script>\n\n```js\nconsole.log(1)\n```\n\n![傍晚的天空](/writing-images/sky.webp)",
  );
  assert.equal(result.text, "");
  assert.deepEqual(result.image, {
    src: "/writing-images/sky.webp",
    alt: "傍晚的天空",
  });
  assert.equal(notePreview("![image](javascript:alert)").image, undefined);
  assert.equal(notePreview("![image](./local.webp)").image, undefined);
});

test("preview shortening keeps emoji intact and explicit line breaks readable", () => {
  assert.equal(notePreview("出门🏃然后回家", 3).text, "出门🏃…");
  assert.equal(notePreview("第一行  \n第二行").text, "第一行\n第二行");
});
