import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  readdir,
  rm,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { prepare, check, approve, unpack, createNote } from "./core.mjs";
import { privacyCheck } from "./privacy.mjs";
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "garden-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const repo = join(root, "repo"),
    inbox = join(root, "inbox");
  await mkdir(join(repo, "src/content/blog"), { recursive: true });
  await mkdir(inbox);
  return { root, repo, inbox };
}
test("A: three sentences become a private Note, then explicitly approved content; collisions preserve original", async (t) => {
  const f = await fixture(t),
    file = join(f.inbox, "三句话.md");
  await writeFile(file, "第一句话。\n\n第二句话。\n\n第三句话。");
  const folder = await prepare({ ...f, file });
  const prepared = join(folder, "article.md");
  assert.deepEqual(await readdir(join(f.repo, "src/content/blog")), []);
  const data = unpack(await readFile(prepared, "utf8")).data;
  assert.equal(data.format, "note");
  assert.equal(data.draft, true);
  assert.equal(data.cover, undefined);
  assert.equal((await check({ ...f, file: prepared })).errors.length, 0);
  const result = await approve({ ...f, file: prepared });
  assert.equal(
    unpack(await readFile(result.target, "utf8")).data.publication,
    "approved",
  );
  await assert.rejects(approve({ ...f, file: prepared }), /EEXIST/);
  assert.equal(
    await readFile(file, "utf8"),
    "第一句话。\n\n第二句话。\n\n第三句话。",
  );
});
test("B: guide preserves headings and code; copies only referenced image and strips metadata", async (t) => {
  const f = await fixture(t),
    file = join(f.inbox, "Guide.md");
  await sharp({
    create: { width: 20, height: 10, channels: 3, background: "#123456" },
  })
    .png()
    .toFile(join(f.inbox, "image.png"));
  await writeFile(join(f.inbox, "private.md"), "DO NOT IMPORT");
  const code = "```ts\nconst x = 1;\n```";
  await writeFile(file, `# 标题\n\n## 步骤\n\n${code}\n\n![图](image.png)`);
  const folder = await prepare({ ...f, file, format: "guide" });
  const prepared = join(folder, "article.md");
  const raw = await readFile(prepared, "utf8");
  assert.ok(raw.includes(code));
  assert.ok(raw.includes("## 步骤"));
  assert.ok(raw.includes("assets/"));
  const result = await approve({ ...f, file: prepared });
  assert.ok(
    (await readFile(result.target, "utf8")).includes("/writing-images/"),
  );
  assert.equal((await readdir(join(f.repo, "src/content/blog"))).length, 1);
});
test("C: draft assets, traversal and repository inbox are rejected", async (t) => {
  const f = await fixture(t),
    file = join(f.inbox, "private.md");
  await writeFile(file, "# private\n![x](../secret.png)");
  await writeFile(join(f.root, "secret.png"), "secret");
  await assert.rejects(prepare({ ...f, file }), /同级/);
  await assert.rejects(
    createNote({ ...f, inbox: f.repo, title: "private" }),
    /仓库之外/,
  );
  await writeFile(
    join(f.repo, "src/content/blog/draft.md"),
    "---\ntitle: draft\ndraft: true\n---\n![private](/private.png)",
  );
  await assert.rejects(privacyCheck(join(f.repo, "src/content")), /草稿含/);
});
test("sensitive literals are blocked without echo; local symlinks and broken links fail", async (t) => {
  const f = await fixture(t),
    file = join(f.inbox, "unsafe.md");
  await writeFile(file, '# Secret\npassword = "example-not-a-real-secret"');
  await assert.rejects(
    prepare({ ...f, file }),
    (e) => /疑似凭据/.test(e.message) && !e.message.includes("example-not"),
  );
  await symlink(join(f.root, "outside"), join(f.inbox, "escape"));
  await writeFile(file, "# Bad\n[bad](/zh-CN/blog/nonexistent)");
  const folder = await prepare({ ...f, file });
  assert.ok(
    (await check({ ...f, file: join(folder, "article.md") })).errors.length,
  );
});
