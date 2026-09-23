import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { zipSync, strToU8 } from "fflate";
import { hash, hasChinese, parseContent, RULES_VERSION } from "./content.js";
import { glossary } from "./protection.js";
import { normalizeTranslation } from "./normalization.js";
import { reportHtml, reviewTranslation, type ExportEntry } from "./review.js";
import type { prepare } from "../translate.js";
import type { translateTexts } from "./deepl.js";

export function cacheId(text: string, context: string) {
  return hash(JSON.stringify([RULES_VERSION, glossary, context, text]));
}
type Cached = {
  source: string;
  target: string;
  correction?: string;
  resolvedCodes?: string[];
};
export async function cachedTranslations(
  texts: string[],
  key: string,
  context: string,
  local: string,
  provider: typeof translateTexts,
) {
  const directory = path.join(local, "cache");
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  const results: (Cached | undefined)[] = await Promise.all(
    texts.map(async (source) => {
      try {
        const data = JSON.parse(
          await fs.readFile(
            path.join(directory, `${cacheId(source, context)}.json`),
            "utf8",
          ),
        );
        return data.source === source &&
          typeof data.target === "string" &&
          data.target.trim()
          ? (data as Cached)
          : undefined;
      } catch (error: any) {
        if (error.code === "ENOENT" || error instanceof SyntaxError)
          return undefined;
        throw error;
      }
    }),
  );
  const missing = results.flatMap((item, i) => (item ? [] : [i]));
  for (let offset = 0; offset < missing.length; offset += 25) {
    const batch = missing.slice(offset, offset + 25);
    const translated = await provider(
      batch.map((i) => texts[i]),
      key,
      context,
    );
    if (translated.length !== batch.length)
      throw new Error("翻译片段数量不一致，未导出此篇。");
    for (let j = 0; j < batch.length; j++) {
      const i = batch[j];
      const value: Cached = {
        source: texts[i],
        target: translated[j],
      };
      if (JSON.stringify(value).includes(key))
        throw new Error("翻译结果包含凭据，已拒绝保存。");
      const file = path.join(directory, `${cacheId(texts[i], context)}.json`);
      const temp = `${file}.${randomUUID()}.tmp`;
      await fs.writeFile(temp, JSON.stringify(value, null, 2), {
        mode: 0o600,
        flag: "wx",
      });
      await fs.rename(temp, file);
      results[i] = value;
    }
    console.log(
      `  翻译进度：${Math.min(offset + 25, missing.length)}/${missing.length} 个未缓存片段`,
    );
  }
  return results as Cached[];
}

export async function exportJobs(
  jobs: Awaited<ReturnType<typeof prepare>>,
  project: string,
  local: string,
  key: string,
  provider: typeof translateTexts,
) {
  const createdAt = new Date().toISOString();
  const folder = path.join(
    local,
    "exports",
    `${createdAt.replace(/[:.]/g, "-")}-${randomUUID().slice(0, 6)}`,
  );
  await fs.mkdir(folder, { recursive: true, mode: 0o700 });
  const entries: ExportEntry[] = [];
  const zipFiles: Record<string, Uint8Array> = {};
  let failed = 0;
  for (const job of jobs) {
    const entry: ExportEntry = {
      title: job.article.data.title,
      sourceFile: job.relative,
      targetFile: path.relative(project, job.targetFile),
      status: job.status,
      rows: [],
      issues: [],
    };
    entries.push(entry);
    if (!job.plan) {
      entry.issues.push({
        level: "info",
        code: job.status,
        message:
          job.status === "empty-skipped"
            ? "原文暂无正文，不生成或虚构译文。"
            : job.status === "draft-skipped"
              ? "草稿未发送到翻译服务。"
              : "本篇本次未重译；使用 --all 可导出全部文章的新译文。",
      });
      continue;
    }
    console.log(`正在导出：${job.relative}`);
    try {
      const cached = await cachedTranslations(
        job.plan.texts,
        key,
        job.plan.context,
        local,
        provider,
      );
      const translated = cached.map((t) =>
        normalizeTranslation(t.source, t.target),
      );
      entry.rows = job.plan.texts.map((source, i) => ({
        source,
        target: translated[i],
        label: job.plan!.labels[i],
        issues: reviewTranslation(source, translated[i]).map((issue) =>
          cached[i].resolvedCodes?.includes(issue.code)
            ? {
                ...issue,
                level: "info" as const,
                message: `${issue.message}（本次已核对，详见修正说明。）`,
              }
            : issue,
        ),
        correction: cached[i].correction,
      }));
      const target = job.plan.render(translated);
      if (target.includes(key)) throw new Error("译文包含凭据，已拒绝导出。");
      if ((await fs.readFile(job.file, "utf8")) !== job.original)
        throw new Error("翻译期间原文被修改，未导出过期结果；请重新执行。");
      const relative = path.relative(
        path.join(project, "src/content"),
        job.targetFile,
      );
      if (relative.startsWith("..") || path.isAbsolute(relative))
        throw new Error("英文文件路径超出内容目录。");
      const destination = path.join(folder, "english", relative);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, target, { flag: "wx", mode: 0o600 });
      entry.download = path
        .relative(folder, destination)
        .split(path.sep)
        .join("/");
      zipFiles[relative.split(path.sep).join("/")] = strToU8(target);
      if (hasChinese(parseContent(target).body))
        entry.issues.push({
          level: "info",
          code: "protected-content",
          message:
            "文件仍包含受保护内容中的中文（如代码、图片说明或组件）；这些部分按设计保留原样。具体正文遗漏会在对应片段单独提示。",
        });
      if (
        job.article.data.tags?.some(
          (tag: unknown) => typeof tag === "string" && hasChinese(tag),
        )
      )
        entry.issues.push({
          level: "info",
          code: "tags",
          message: "标签作为站点分类标识保持原样，未自动改名。",
        });
    } catch (error) {
      failed++;
      entry.status = "failed";
      entry.error = (
        error instanceof Error ? error.message : "本篇导出失败。"
      ).replaceAll(key, "[已隐藏]");
      console.log(`  本篇未导出：${entry.error}`);
    }
    // A report is available even if a later article fails or the run is interrupted.
    await saveReport();
  }
  await saveReport();
  console.log(`报告：${path.join(folder, "index.html")}`);
  console.log(`英文文件包：${path.join(folder, "english-articles.zip")}`);
  console.log(
    `导出 ${entries.filter((e) => e.download).length} 篇；失败 ${failed} 篇。网站中英文原文件均未修改。`,
  );
  return { folder, entries, failed };

  async function saveReport() {
    const json = JSON.stringify(
      { version: 1, createdAt, rulesVersion: RULES_VERSION, entries },
      null,
      2,
    );
    const html = reportHtml(entries, createdAt);
    if (json.includes(key) || html.includes(key))
      throw new Error("报告包含凭据，拒绝保存。");
    for (const [file, data] of [
      ["review.json", json],
      ["index.html", html],
      ["english-articles.zip", zipSync(zipFiles)],
    ] as const) {
      const temp = path.join(folder, `${file}.tmp`);
      await fs.writeFile(temp, data, { mode: 0o600 });
      await fs.rename(temp, path.join(folder, file));
    }
  }
}
