import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  collections,
  parseContent,
  segments,
  translationPlan,
} from "./translation/content.js";
import { translateTexts } from "./translation/deepl.js";
import { parseArgs, prepare, run, writeArticle } from "./translate.js";
import { normalizedNumbers } from "./translation/normalization.js";
import { reportHtml, reviewTranslation } from "./translation/review.js";
import { unzipSync, strFromU8 } from "fflate";

const source = `---
title: 中文标题
date: '2026-09-05'
lang: zh-CN
slug: example
status: planned
verificationStatus: theoretical
unknownField: keep-me
---

# 学习笔记

现在学习 TypeScript，尚未部署。
`;
const defaults = {
  dryRun: false,
  retranslate: false,
  maxCharacters: 20_000,
  write: true,
};
const fakeProvider = async (texts: string[]) =>
  texts.map(
    (text) =>
      `English ${text.match(/\d+(?:[.,]\d+)*/g)?.join(" ") ?? "translation"}`,
  );
async function fixture(t: any) {
  const project = await fs.mkdtemp(path.join(os.tmpdir(), "blog-translation-"));
  t.after(() => fs.rm(project, { recursive: true, force: true }));
  for (const collection of collections)
    await fs.mkdir(path.join(project, "src/content", collection), {
      recursive: true,
    });
  await fs.writeFile(
    path.join(project, ".env.translation"),
    "DEEPL_AUTH_KEY=test-local-only:fx\n",
  );
  const file = path.join(project, "src/content/blog/example.md");
  const target = path.join(project, "src/content/blog/example.en.md");
  await fs.writeFile(file, source);
  return { project, file, target };
}

test("Markdown structure, code, images, links, references, HTML and numbers survive translation", async () => {
  const body = `# 中文标题\n\n中文 **重点** 与 [中文链接](https://example.com/a?q=1 "untouched")，版本 2.0。\n\n\`const 中文 = 1\`\n\n\`\`\`ts\nconst secret = "中文";\n\`\`\`\n\n![原始说明](https://example.com/photo.png)\n\n<!-- 中文注释 -->\n\n| 中文表头 | 中文内容 |\n| --- | --- |\n| 内容 | 保持 |\n\n[参考链接][ref]\n\n[ref]: https://example.com/source\n`;
  const plan = segments(body, false);
  assert.ok(
    !plan.texts.some((text) => text.includes("const") || text.includes("注释")),
  );
  const result = plan.apply(await fakeProvider(plan.texts));
  for (const untouched of [
    'const secret = "中文";',
    "`const 中文 = 1`",
    "![原始说明](https://example.com/photo.png)",
    "https://example.com/a?q=1",
    "<!-- 中文注释 -->",
    "[ref]: https://example.com/source",
  ])
    assert.ok(result.includes(untouched));
});

test("MDX code and JSX remain intact", async () => {
  const body =
    'import Widget from "./Widget";\n\n# 中文标题\n\n<Widget title="中文属性">中文组件内容</Widget>\n\n正文文字。\n';
  const plan = segments(body, true);
  assert.deepEqual(plan.texts, ["中文标题", "正文文字。"]);
  const result = plan.apply(await fakeProvider(plan.texts));
  assert.ok(result.includes('<Widget title="中文属性">中文组件内容</Widget>'));
});

test("provider punctuation cannot inject Markdown or MDX", () => {
  const plan = segments("中文正文。\n", true);
  assert.doesNotThrow(() =>
    plan.apply(["**bold** <script>{alert(1)}</script> [plain text]"]),
  );
  assert.throws(
    () => plan.apply(["[injected link](https://bad.example)"]),
    /结构/,
  );
});

test("metadata sync preserves dates, status, unknown fields and existing English slug", async () => {
  const original = parseContent(source);
  const existing = parseContent(
    source
      .replace("lang: zh-CN", "lang: en")
      .replace(
        "slug: example",
        "slug: stable-english-url\ntargetOnly: preserved",
      ),
  );
  const plan = translationPlan(original, false, existing);
  const result = parseContent(plan.render(await fakeProvider(plan.texts)));
  assert.equal(result.data.lang, "en");
  assert.equal(result.data.slug, "stable-english-url");
  for (const field of ["date", "status", "verificationStatus", "unknownField"])
    assert.equal(result.data[field], original.data[field]);
  assert.equal(result.data.targetOnly, "preserved");
  assert.equal(result.data.translation.provider, "deepl");
});

test("unrequested book-title emphasis stays plain in title and body", () => {
  const plan = translationPlan(parseContent(source), false);
  const result = parseContent(
    plan.render(plan.texts.map(() => "A review of *Fortress Besieged*")),
  );
  assert.equal(result.data.title, "A review of Fortress Besieged");
  assert.ok(!result.body.includes("*"));
});

test("translated numbered prose stays text, not a new list", () => {
  assert.doesNotThrow(() =>
    segments("中文 1。\n", false).apply(["1. An observation."]),
  );
});

test("numerical changes and missing translations fail validation", () => {
  const plan = translationPlan(
    parseContent(source.replace("尚未部署", "已有 12 次练习")),
    false,
  );
  assert.throws(() => plan.render(plan.texts.map(() => "English")), /数字/);
  assert.throws(() => plan.render([]), /数量/);
});

test("dry-run needs no credential, never calls API and leaves all files unchanged", async (t) => {
  const { project, file } = await fixture(t);
  await fs.rm(path.join(project, ".env.translation"));
  await run({ ...defaults, dryRun: true }, project, async () => {
    throw new Error("must not call");
  });
  assert.equal(await fs.readFile(file, "utf8"), source);
  await assert.rejects(fs.stat(path.join(project, ".local")));
});

test("create → unchanged → stale → manual protection, stable identity and rename pairing", async (t) => {
  const { project, file, target } = await fixture(t);
  await run(defaults, project, fakeProvider);
  const first = parseContent(await fs.readFile(file, "utf8"));
  const en = parseContent(await fs.readFile(target, "utf8"));
  assert.equal(first.data.translationKey, en.data.translationKey);
  assert.equal((await prepare(defaults, project))[0].status, "synced");
  await run(defaults, project, async () => {
    throw new Error("unchanged must not call");
  });
  const moved = path.join(project, "src/content/blog/renamed.md");
  await fs.rename(file, moved);
  assert.equal((await prepare(defaults, project))[0].targetFile, target);
  await fs.appendFile(moved, "\n新的学习记录。\n");
  assert.equal((await prepare(defaults, project))[0].status, "stale");
  await run(defaults, project, fakeProvider);
  assert.equal(
    parseContent(await fs.readFile(moved, "utf8")).data.translationKey,
    first.data.translationKey,
  );
  await fs.appendFile(target, "\nManual English edit.\n");
  assert.equal(
    (await prepare(defaults, project))[0].status,
    "manual-preserved",
  );
  await run(defaults, project, async () => {
    throw new Error("manual must not call");
  });
});

test("legacy English is preserved; explicit single-file retranslation adopts it", async (t) => {
  const { project, file, target } = await fixture(t);
  const original = source
    .replace("lang: zh-CN", "lang: en")
    .replace("slug: example", "slug: legacy");
  await fs.writeFile(target, original);
  await run(defaults, project, async () => {
    throw new Error("legacy must not call");
  });
  assert.equal(await fs.readFile(target, "utf8"), original);
  await run({ ...defaults, file, retranslate: true }, project, fakeProvider);
  assert.equal(
    parseContent(await fs.readFile(target, "utf8")).data.slug,
    "legacy",
  );
  assert.equal((await prepare(defaults, project))[0].status, "synced");
});

test("drafts, empty bodies, English inputs and unrelated collections are excluded", async (t) => {
  const { project, file } = await fixture(t);
  await fs.writeFile(
    file,
    source.replace("lang: zh-CN", "lang: zh-CN\ndraft: true"),
  );
  assert.equal((await prepare(defaults, project))[0].status, "draft-skipped");
  await fs.writeFile(file, source.slice(0, source.lastIndexOf("---") + 4));
  assert.equal((await prepare(defaults, project))[0].status, "empty-skipped");
  await assert.rejects(
    prepare({ ...defaults, file: "src/content/routes/test.md" }, project),
  );
  assert.throws(() => parseArgs(["--collection", "photos"]));
  assert.throws(() => parseArgs(["--retranslate"]));
  assert.throws(() => parseArgs(["--max-characters", "NaN"]));
});

test("duplicate translation keys fail before network", async (t) => {
  const { project, file } = await fixture(t);
  const duplicate = source.replace(
    "lang: zh-CN",
    "lang: zh-CN\ntranslationKey: duplicate",
  );
  await fs.writeFile(file, duplicate);
  await fs.writeFile(
    path.join(project, "src/content/blog/other.md"),
    duplicate,
  );
  await assert.rejects(prepare(defaults, project), /重复/);
});

test("quota guard and provider failure leave source and destination unchanged", async (t) => {
  const { project, file, target } = await fixture(t);
  await assert.rejects(
    run({ ...defaults, maxCharacters: 1 }, project, fakeProvider),
    /上限/,
  );
  await assert.rejects(
    run(defaults, project, async () => {
      throw new Error("provider failed");
    }),
  );
  assert.equal(await fs.readFile(file, "utf8"), source);
  await assert.rejects(fs.stat(target));
  await assert.rejects(fs.stat(path.join(project, ".local/translation/lock")));
});

test("concurrent source edit cancels writing the English result", async (t) => {
  const { project, file, target } = await fixture(t);
  await assert.rejects(
    run(defaults, project, async (texts) => {
      await fs.appendFile(file, "\nConcurrent edit\n");
      return fakeProvider(texts);
    }),
    /被修改/,
  );
  await assert.rejects(fs.stat(target));
  assert.ok((await fs.readFile(file, "utf8")).endsWith("Concurrent edit\n"));
});

test("transaction refuses to overwrite a changed file", async (t) => {
  const { project, file } = await fixture(t);
  await assert.rejects(
    writeArticle(
      [{ file, before: "stale", after: "overwrite" }],
      path.join(project, ".local"),
    ),
    /被修改/,
  );
  assert.equal(await fs.readFile(file, "utf8"), source);
});

test("API uses official Free endpoint, header auth, ZH → EN-US and batches at 50 texts", async () => {
  let requests = 0;
  const request: typeof fetch = async (url, options) => {
    requests++;
    assert.equal(url, "https://api-free.deepl.com/v2/translate");
    assert.equal(
      (options!.headers as any).Authorization,
      "DeepL-Auth-Key fake-key:fx",
    );
    assert.equal(options!.redirect, "error");
    const body = JSON.parse(options!.body as string);
    assert.equal(body.source_lang, "ZH");
    assert.equal(body.target_lang, "EN-US");
    assert.ok(body.text.length <= 50);
    assert.ok(!JSON.stringify(body).includes("fake-key"));
    return Response.json({
      translations: body.text.map(() => ({ text: "English" })),
    });
  };
  assert.equal(
    (
      await translateTexts(
        Array(51).fill("中文"),
        "fake-key:fx",
        "context",
        request,
      )
    ).length,
    51,
  );
  assert.equal(requests, 2);
});

test("API errors never expose body or network exception credentials", async () => {
  const key = "not-a-real-secret:fx";
  for (const status of [403, 456, 500]) {
    await assert.rejects(
      translateTexts(
        ["中文"],
        key,
        "",
        async () => new Response(key, { status }),
      ),
      (error: Error) =>
        !error.message.includes(key) && error.message.includes(String(status)),
    );
  }
  await assert.rejects(
    translateTexts(["中文"], key, "", async () => {
      throw new Error(key);
    }),
    (error: Error) => !error.message.includes(key),
  );
  await assert.rejects(
    translateTexts(["中文"], key, "", async () =>
      Response.json({ translations: [] }),
    ),
    /数量/,
  );
});

test("only transient rate limits retry, with a bounded request count", async () => {
  let calls = 0;
  const result = await translateTexts(["中文"], "fake-key", "", async (url) => {
    assert.equal(url, "https://api.deepl.com/v2/translate");
    return ++calls === 1
      ? new Response(null, { status: 429 })
      : Response.json({ translations: [{ text: "English" }] });
  });
  assert.deepEqual(result, ["English"]);
  assert.equal(calls, 2);
});

test("calendar equivalents preserve meaning without breaking sentences into XML", () => {
  assert.deepEqual(
    normalizedNumbers("20 世纪 30 年代"),
    normalizedNumbers("the 1930s"),
  );
  assert.deepEqual(
    normalizedNumbers("8 月 30 日"),
    normalizedNumbers("August 30"),
  );
});

test("default exports are readable and leave both source languages untouched; repeat uses cache", async (t) => {
  const { project, file, target } = await fixture(t);
  const options = { ...defaults, write: false, all: true };
  const result = await run(options, project, fakeProvider);
  assert.ok(result);
  assert.equal(result.failed, 0);
  assert.equal(await fs.readFile(file, "utf8"), source);
  await assert.rejects(fs.stat(target));
  const html = await fs.readFile(
    path.join(result.folder, "index.html"),
    "utf8",
  );
  assert.ok(html.includes("中文标题") && html.includes("English translation"));
  const zip = unzipSync(
    await fs.readFile(path.join(result.folder, "english-articles.zip")),
  );
  assert.ok(strFromU8(zip["blog/example.en.md"]).includes("lang: en"));
  await run(options, project, async () => {
    throw new Error("cached content must not call the provider");
  });
  assert.equal(parseArgs([]).write, undefined);
  assert.throws(() => parseArgs(["--all", "--write"]));
});

test("export collects per-article failures and still exports the next article", async (t) => {
  const { project, file } = await fixture(t);
  await fs.writeFile(
    path.join(project, "src/content/blog/next.md"),
    source.replace("中文标题", "第二篇中文标题"),
  );
  let calls = 0;
  const result = await run(
    { ...defaults, write: false, all: true },
    project,
    async (texts) => {
      if (++calls === 1) throw new Error("simulated failure");
      return fakeProvider(texts);
    },
  );
  assert.equal(result?.failed, 1);
  assert.equal(result?.entries.filter((e) => e.download).length, 1);
  assert.equal(await fs.readFile(file, "utf8"), source);
  assert.ok(
    (
      await fs.readFile(path.join(result!.folder, "index.html"), "utf8")
    ).includes("simulated failure"),
  );
});

test("report flags semantic risks without rewriting Chinese and escapes untrusted content", () => {
  assert.ok(
    reviewTranslation(
      "尚未验证钱包集成。",
      "Wallet integration is verified.",
    ).some((i) => i.code === "negation"),
  );
  assert.ok(
    reviewTranslation("计划开发钱包。", "A wallet has been developed.").some(
      (i) => i.code === "planned-status",
    ),
  );
  assert.ok(
    reviewTranslation("技术写作。", "技术 writing.").some(
      (i) => i.code === "remaining-chinese",
    ),
  );
  const html = reportHtml(
    [
      {
        title: '<script>alert("bad")</script>',
        sourceFile: "src/content/blog/test.md",
        targetFile: "test.en.md",
        status: "new",
        rows: [],
        issues: [],
      },
    ],
    "today",
  );
  assert.ok(!html.includes('<script>alert("bad")</script>'));
  assert.ok(html.includes("&lt;script&gt;"));
});
