// Production integration: temporary synthetic fixtures are removed in finally.
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  readdir,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
import { prepare, approve } from "./core.mjs";
import { privacyCheck } from "./privacy.mjs";
const repo = process.cwd();
const inbox = await mkdtemp(join(tmpdir(), "garden-build-"));
const tag = `garden-acceptance-${Date.now()}`;
const targets = [];
const privateFile = join(repo, "src/content/blog", `${tag}-private.md`);
async function files(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
      ),
    )
  ).flat();
}
try {
  await sharp({
    create: { width: 48, height: 24, channels: 3, background: "#abc" },
  })
    .png()
    .toFile(join(inbox, "diagram.png"));
  for (const format of ["note", "guide"]) {
    const file = join(inbox, `${format}.md`);
    await writeFile(
      file,
      `---\ntitle: Acceptance ${format}\nslug: ${tag}-${format}\n---\n第一句话。\n\n第二句话。\n\n第三句话。\n${format === "guide" ? "\n## Steps\n\n```ts\nconst answer = 42;\n```\n\n![Diagram](diagram.png)" : ""}`,
    );
    const prepared = await prepare({ repo, inbox, file, format });
    const result = await approve({ repo, file: join(prepared, "article.md") });
    targets.push(result.target);
  }
  const sentinel = `PRIVATE_${tag}`;
  await writeFile(
    privateFile,
    `---\ntitle: ${sentinel}\ndate: 2026-10-23\nformat: note\ndraft: false\nlang: zh-CN\n---\n${sentinel}`,
  );
  await privacyCheck();
  const result = spawnSync(
    process.execPath,
    ["node_modules/astro/astro.js", "build"],
    {
      cwd: repo,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
      encoding: "utf8",
    },
  );
  await writeFile(
    "/tmp/zoran-garden-acceptance-build.log",
    result.stdout + result.stderr,
  );
  assert.equal(result.status, 0, "See /tmp/zoran-garden-acceptance-build.log");
  const note = await readFile(
    join(repo, "dist/zh-CN/blog", `${tag}-note/index.html`),
    "utf8",
  );
  assert.ok(note.includes("article-shell--note"));
  assert.ok(!note.includes('class="article-mobile-toc'));
  const guide = await readFile(
    join(repo, "dist/zh-CN/blog", `${tag}-guide/index.html`),
    "utf8",
  );
  assert.ok(guide.includes("<pre"));
  assert.ok(guide.includes("writing-images/"));
  assert.ok(guide.includes("Steps"));
  for (const file of await files(join(repo, "dist"))) {
    if (/\.(html|json|xml|js|css|txt)$/.test(file))
      assert.ok(
        !(await readFile(file, "utf8")).includes(sentinel),
        `Draft leaked: ${file}`,
      );
  }
  console.log(
    "PASS: approved Note and Guide rendered; code and image retained; unapproved draft absent from all public output.",
  );
} finally {
  for (const file of [...targets, privateFile]) await rm(file, { force: true });
  for (const format of ["note", "guide"])
    await rm(join(repo, "public/writing-images", `${tag}-${format}`), {
      recursive: true,
      force: true,
    });
  await rm(inbox, { recursive: true, force: true });
}
