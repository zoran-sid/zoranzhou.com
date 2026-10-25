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

test("large notes expose bounded text and a deduplicated album in original order", () => {
  const photos = Array.from(
    { length: 12 },
    (_, i) => `![photo ${i}](/writing-images/notes/${i}.jpg)`,
  );
  const result = notePreview(
    `${"长文字。".repeat(300)}\n\n${photos.join("\n\n")}`,
    180,
    { src: "/writing-images/notes/0.jpg", alt: "cover" },
  );
  assert.equal(Array.from(result.text).length, 181);
  assert.equal(result.truncated, true);
  assert.equal(result.imageCount, 12);
  assert.equal(result.images.length, 12);
  assert.equal(result.images[0].alt, "cover");
  assert.equal(result.coverIsInline, true);
  assert.equal(result.images[11].src, "/writing-images/notes/11.jpg");
});

test("a separate cover is counted once and remains available on the full note", () => {
  const result = notePreview("![photo](/photos/body.webp)", 180, {
    src: "/photos/cover.webp",
  });
  assert.equal(result.imageCount, 2);
  assert.equal(result.coverIsInline, false);
  assert.equal(result.images[0].src, "/photos/cover.webp");
});

test("reference photos resolve once; relative photos stay available on the full note", () => {
  const result = notePreview(
    "![相册][Sky]\n\n![重复][sky]\n\n![本地](./hill.webp)\n\n[sky]: /writing-images/sky.webp\n",
  );
  assert.equal(result.imageCount, 2);
  assert.equal(result.images.length, 1);
  assert.equal(result.images[0].src, "/writing-images/sky.webp");
  assert.equal(result.text, "");
  assert.equal(
    notePreview("![unsafe](data:image/png;base64,abc)").imageCount,
    0,
  );
});
