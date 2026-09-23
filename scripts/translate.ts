import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { parseEnv } from "node:util";
import {
  collections,
  hash,
  outputHash,
  parseContent,
  RULES_VERSION,
  serialize,
  translationPlan,
} from "./translation/content.js";
import { translateTexts } from "./translation/deepl.js";
import { cachedTranslations, exportJobs } from "./translation/export.js";
import { normalizeTranslation } from "./translation/normalization.js";

const root = fileURLToPath(new URL("../", import.meta.url));
export type Options = {
  dryRun: boolean;
  file?: string;
  collection?: string;
  retranslate: boolean;
  maxCharacters: number;
  all?: boolean;
  write?: boolean;
};
export function parseArgs(args: string[]): Options {
  const options: Options = {
    dryRun: false,
    retranslate: false,
    maxCharacters: 20_000,
  };
  while (args.length) {
    const arg = args.shift();
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--all") options.all = true;
    else if (arg === "--write") options.write = true;
    else if (arg === "--retranslate") options.retranslate = true;
    else if (
      ["--file", "--collection", "--max-characters"].includes(arg ?? "")
    ) {
      const value = args.shift();
      if (!value || value.startsWith("--"))
        throw new Error(`${arg} 缺少参数。`);
      if (arg === "--file") options.file = value;
      else if (arg === "--collection") options.collection = value;
      else options.maxCharacters = Number(value);
    } else throw new Error(`未知参数：${arg}`);
  }
  if (options.collection && !collections.includes(options.collection as any))
    throw new Error("仅支持 blog、essays、research、lab。");
  if (
    !Number.isSafeInteger(options.maxCharacters) ||
    options.maxCharacters <= 0
  )
    throw new Error("字符上限必须为正整数。");
  if (options.retranslate && !options.file)
    throw new Error(
      "重译会替换英文正文，必须同时指定 --file，仅处理一篇文章。",
    );
  if (options.all && options.write)
    throw new Error(
      "--all 仅用于导出全部译文，不批量覆盖已有网站文章。写入已有英文请明确指定 --file 与 --retranslate --write。",
    );
  return options;
}

async function readOptional(file: string): Promise<string | undefined> {
  try {
    return await fs.readFile(file, "utf8");
  } catch (error: any) {
    if (error.code === "ENOENT") return undefined;
    throw error;
  }
}
async function contentFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink())
      throw new Error("内容目录含符号链接，需人工检查后再翻译。");
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await contentFiles(file)));
    else if (/\.mdx?$/.test(entry.name) && !entry.name.startsWith("_"))
      result.push(file);
  }
  return result.sort();
}

export async function prepare(options: Options, project = root) {
  const selected = options.file
    ? path.resolve(project, options.file)
    : undefined;
  let found = !selected;
  const jobs = [];
  for (const collection of collections) {
    if (options.collection && options.collection !== collection) continue;
    const directory = path.join(project, "src/content", collection);
    if ((await fs.lstat(directory)).isSymbolicLink())
      throw new Error("内容集合不能是符号链接。");
    const files = await contentFiles(directory);
    const articles = await Promise.all(
      files.map(async (file) => ({
        file,
        article: parseContent(await fs.readFile(file, "utf8")),
      })),
    );
    // Include drafts when checking identity: publication later must not introduce ambiguity.
    const identities = new Set<string>();
    for (const { article } of articles) {
      if (!article.data.translationKey) continue;
      const identity = `${article.data.lang ?? "zh-CN"}:${article.data.translationKey}`;
      if (identities.has(identity))
        throw new Error(
          `${collection} 存在同语言重复 translationKey，请先修复。`,
        );
      identities.add(identity);
    }
    for (const { file, article } of articles) {
      if (selected && selected !== file) continue;
      found = true;
      if ((article.data.lang ?? "zh-CN") !== "zh-CN") {
        if (selected) throw new Error("--file 必须指向中文原文。");
        continue;
      }
      const relative = path.relative(project, file);
      const candidate = file.replace(/(?:\.zh-CN)?(\.mdx?)$/, ".en$1");
      let target = articles.find(
        (entry) =>
          entry.article.data.lang === "en" &&
          article.data.translationKey &&
          entry.article.data.translationKey === article.data.translationKey,
      );
      const byName = articles.find((entry) => entry.file === candidate);
      if (!target && byName) {
        if (
          byName.article.data.lang !== "en" ||
          (article.data.translationKey &&
            byName.article.data.translationKey &&
            article.data.translationKey !== byName.article.data.translationKey)
        ) {
          throw new Error(`${relative} 的目标文件存在配对冲突。`);
        }
        target = byName;
      }
      const targetFile = target?.file ?? candidate;
      const original = article.raw;
      const key =
        article.data.translationKey ??
        target?.article.data.translationKey ??
        `${collection}-${hash(path.relative(directory, file)).slice(0, 12)}`;
      if (!article.data.translationKey) {
        if (identities.has(`zh-CN:${key}`))
          throw new Error("自动配对标识冲突，请手动指定 translationKey。");
        identities.add(`zh-CN:${key}`);
        article.doc.set("translationKey", key);
        article.raw = serialize(article);
        article.data.translationKey = key;
      }
      const state = target?.article.data.translation;
      let status: string;
      if (article.data.draft === true || article.data.published === false)
        status = "draft-skipped";
      else if (!article.body.trim()) status = "empty-skipped";
      else if (options.retranslate || options.all) status = "retranslate";
      else if (!target) status = "new";
      else if (!state) status = "existing-preserved";
      else if (state.outputHash !== outputHash(target.article.raw))
        status = "manual-preserved";
      else if (
        state.sourceHash === hash(article.raw) &&
        state.rulesVersion === RULES_VERSION
      )
        status = "synced";
      else status = "stale";
      const plan = ["new", "stale", "retranslate"].includes(status)
        ? translationPlan(article, file.endsWith(".mdx"), target?.article)
        : undefined;
      const characters =
        plan?.texts.reduce((sum, text) => sum + [...text].length, 0) ?? 0;
      jobs.push({
        relative,
        file,
        article,
        original,
        targetFile,
        targetOriginal: target?.article.raw,
        status,
        plan,
        characters,
      });
    }
  }
  if (!found)
    throw new Error("未找到指定中文文件，路径必须位于支持的内容集合中。");
  const targets = jobs.filter((job) => job.plan).map((job) => job.targetFile);
  if (new Set(targets).size !== targets.length)
    throw new Error("多篇原文映射到同一英文文件，请先修复配对。");
  return jobs;
}

// Each file is replaced atomically. A journal preserves originals if the process is killed
// between renames; caught failures roll back only files written by this transaction.
export async function writeArticle(
  changes: { file: string; before?: string; after: string }[],
  local: string,
) {
  for (const change of changes) {
    const stat = await fs.lstat(change.file).catch((e) => {
      if (e.code !== "ENOENT") throw e;
      return undefined;
    });
    if (
      stat?.isSymbolicLink() ||
      (await readOptional(change.file)) !== change.before
    )
      throw new Error("文件已在翻译期间被修改，已取消写入，请重新运行。");
  }
  const backup = path.join(local, "backups", `${Date.now()}-${randomUUID()}`);
  await fs.mkdir(backup, { recursive: true, mode: 0o700 });
  await fs.writeFile(
    path.join(backup, "journal.json"),
    JSON.stringify(
      changes.map(({ file, before }) => ({ file, before })),
      null,
      2,
    ),
    { mode: 0o600 },
  );
  const temporary = changes.map((c) =>
    path.join(
      path.dirname(c.file),
      `.${path.basename(c.file)}.${randomUUID()}.tmp`,
    ),
  );
  let completed = 0;
  try {
    for (let i = 0; i < changes.length; i++)
      await fs.writeFile(temporary[i], changes[i].after, {
        flag: "wx",
        mode: 0o600,
      });
    for (let i = 0; i < changes.length; i++) {
      if ((await readOptional(changes[i].file)) !== changes[i].before)
        throw new Error("写入前发现文件变化，停止并回滚。");
      if (changes[i].before === undefined) {
        // link is exclusive: a newly created manual file must never be clobbered.
        await fs.link(temporary[i], changes[i].file);
      } else await fs.rename(temporary[i], changes[i].file);
      completed++;
    }
    await fs.writeFile(path.join(backup, "complete"), "ok\n");
  } catch (error) {
    for (let i = completed - 1; i >= 0; i--) {
      const change = changes[i];
      if ((await readOptional(change.file)) !== change.after) continue;
      if (change.before === undefined) await fs.unlink(change.file);
      else {
        await fs.writeFile(temporary[i], change.before, { mode: 0o600 });
        await fs.rename(temporary[i], change.file);
      }
    }
    throw error;
  } finally {
    await Promise.all(temporary.map((file) => fs.rm(file, { force: true })));
  }
}

async function loadKey(project: string) {
  const env = await readOptional(path.join(project, ".env.translation"));
  const key =
    process.env.DEEPL_AUTH_KEY ||
    (env ? parseEnv(env).DEEPL_AUTH_KEY : undefined);
  if (!key || key === "replace-with-your-own-key" || /\s/.test(key))
    throw new Error("请在本机 .env.translation 中配置 DEEPL_AUTH_KEY。");
  return key;
}

export async function run(
  options: Options,
  project = root,
  provider = translateTexts,
) {
  if (process.env.CI || process.env.CF_PAGES)
    throw new Error(
      "翻译工具仅供本机手动运行，不允许在 CI/Cloudflare 构建中执行。",
    );
  // Dry runs require neither credentials nor network, and create no files or locks.
  if (options.dryRun) {
    const jobs = await prepare(options, project);
    report(jobs);
    console.log("预演结束：未请求 DeepL，未写入任何文件。");
    return;
  }
  const local = path.join(project, ".local/translation");
  await fs.mkdir(local, { recursive: true, mode: 0o700 });
  const lockFile = path.join(local, "lock");
  let lock;
  try {
    lock = await fs.open(lockFile, "wx", 0o600);
  } catch {
    throw new Error(
      "翻译任务锁已存在。确认没有任务运行后，再删除 .local/translation/lock 重试。",
    );
  }
  try {
    await lock.writeFile(
      JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }),
    );
    const jobs = await prepare(options, project);
    const total = report(jobs);
    if (total > options.maxCharacters)
      throw new Error(
        `预计 ${total} 字符，超过本次 ${options.maxCharacters} 字符上限。请缩小范围或明确提高 --max-characters。`,
      );
    const pending = jobs.filter((job) => job.plan);
    if (!options.write) {
      const key = pending.length
        ? await loadKey(project)
        : "__NO_CREDENTIAL_REQUIRED__";
      const result = await exportJobs(jobs, project, local, key, provider);
      return result;
    }
    if (!pending.length) {
      console.log(
        "无需翻译。已有英文如需重译，请指定 --file 和 --retranslate。",
      );
      return;
    }
    const key = await loadKey(project);
    for (const job of pending) {
      const cached = await cachedTranslations(
        job.plan!.texts,
        key,
        job.plan!.context,
        local,
        provider,
      );
      const translated = cached.map((item) =>
        normalizeTranslation(item.source, item.target),
      );
      const target = job.plan!.render(translated);
      if (target.includes(key)) throw new Error("结果包含凭据，拒绝保存。");
      // Check both files even when the source did not need a translationKey insertion.
      if (
        (await readOptional(job.file)) !== job.original ||
        (await readOptional(job.targetFile)) !== job.targetOriginal
      )
        throw new Error("翻译期间内容被修改，未保存本篇译文。");
      const changes = [
        { file: job.targetFile, before: job.targetOriginal, after: target },
      ];
      if (job.original !== job.article.raw)
        changes.push({
          file: job.file,
          before: job.original,
          after: job.article.raw,
        });
      await writeArticle(changes, local);
      console.log(`已生成：${path.relative(project, job.targetFile)}`);
    }
    console.log(
      "完成。请审阅英文与 Git 差异；未自动提交、推送或部署。备份位于 .local/translation/backups/。",
    );
  } finally {
    await lock.close();
    await fs.rm(lockFile, { force: true });
  }
}
function report(jobs: Awaited<ReturnType<typeof prepare>>) {
  for (const job of jobs)
    console.log(
      `[${job.status}] ${job.relative}${job.plan ? ` — ${job.characters} 字符` : ""}`,
    );
  const total = jobs.reduce((sum, job) => sum + job.characters, 0);
  console.log(
    `待翻译 ${jobs.filter((job) => job.plan).length} 篇；预计 ${total} 个正文及字段字符（不含上下文，实际计费以 DeepL 为准）。`,
  );
  return total;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.argv.includes("--help"))
    console.log(`手动中文 → 英文翻译（DeepL）
  npm run translate -- --dry-run
  npm run translate -- --file "src/content/blog/example.md"
  npm run translate -- --collection lab
  npm run translate -- --all --max-characters 50000
  npm run translate -- --file "src/content/blog/example.md" --write
  npm run translate -- --file "src/content/blog/example.md" --retranslate
  npm run translate -- --max-characters 30000

默认：导出 HTML 中英对照报告与英文文件包，不改网站中英文原文件。
范围：公开的 blog / essays / research / lab，跳过草稿、空正文。
--dry-run          仅预览，不调用 API、不写文件
--all              包含已有英文，导出全部文章；使用缓存避免重复计费
--write            明确写入网站内容，不能与 --all 合用
--file             指定中文文件
--collection       限定集合
--retranslate      包含指定文章的已有英文；必须搭配 --file，只有 --write 才覆盖
--max-characters   本次字符上限，默认 20000
密钥：本机 .env.translation 中的 DEEPL_AUTH_KEY。不会自动提交或推送。`);
  else
    void (async () => {
      try {
        const result = await run(parseArgs(process.argv.slice(2)));
        if (result?.failed) process.exitCode = 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : "翻译失败。";
        console.error(
          `[translate] ${message.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(?::fx)?/gi, "[已隐藏]")}`,
        );
        process.exitCode = 1;
      }
    })();
}
