import {
  readFile,
  writeFile,
  mkdir,
  realpath,
  readdir,
  stat,
  link,
  rm,
} from "node:fs/promises";
import {
  resolve,
  dirname,
  basename,
  extname,
  relative,
  join,
  isAbsolute,
} from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { parse, stringify } from "yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";
import sharp from "sharp";

export const formats = ["note", "guide", "essay"];
export function unpack(raw) {
  const match = raw
    .replace(/^\uFEFF/, "")
    .match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return {
    data: match ? (parse(match[1]) ?? {}) : {},
    body: match ? raw.replace(/^\uFEFF/, "").slice(match[0].length) : raw,
  };
}
export function pack(data, body) {
  return `---\n${stringify(data)}---\n\n${body.trim()}\n`;
}
function inside(root, path) {
  const r = relative(root, path);
  return r === "" || (!r.startsWith("..") && !isAbsolute(r));
}
async function external(path, repo) {
  const actual = await realpath(path);
  if (inside(await realpath(repo), actual))
    throw new Error("私人笔记和审核包必须保存在网站仓库之外。");
  return actual;
}
function walk(node, callback) {
  callback(node);
  for (const child of node.children ?? []) walk(child, callback);
}
export function references(body) {
  const tree = unified().use(remarkParse).parse(body);
  const refs = [];
  walk(tree, (node) => {
    if (["image", "link", "definition"].includes(node.type)) refs.push(node);
  });
  return refs;
}
export function inspect(data, body) {
  const errors = [],
    warnings = [];
  if (typeof data.title !== "string" || !data.title.trim())
    errors.push("缺少标题。");
  if (!formats.includes(data.format))
    errors.push("format 必须为 note、guide 或 essay。");
  if (!["zh-CN", "en"].includes(data.lang))
    errors.push("lang 必须为 zh-CN 或 en。");
  if (Number.isNaN(new Date(data.date).valueOf()))
    errors.push("date 不是有效日期。");
  if (
    data.maturity &&
    !["seed", "growing", "evergreen"].includes(data.maturity)
  )
    errors.push("maturity 值无效。");
  if (!body.trim()) errors.push("正文为空。");
  if (
    /-----BEGIN .*PRIVATE KEY-----|\b(?:AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,})\b/i.test(
      body,
    ) ||
    /(?:api[_ -]?key|password|secret|token)\s*[:=]\s*["']?[^\s"']{8,}/i.test(
      body,
    )
  )
    errors.push(
      "发现疑似凭据，请在私人原稿中删除后重新准备（不显示匹配内容）。",
    );
  if (
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\/Users\/|C:\\Users\\)|\b(?:10\.|192\.168\.)\d+\.\d+/i.test(
      body,
    )
  )
    warnings.push("可能包含邮箱、本机路径或内网地址，请人工检查。");
  if (/!\[\[|(?<!!)\[\[/.test(body))
    errors.push(
      "请将 Obsidian 双链改为标准 Markdown 图片或链接；不会搜索整个 Vault。",
    );
  if (/<(?:script|iframe|img)\b|^import\s|^export\s/m.test(body))
    errors.push(
      "导入只接受普通 Markdown；请去掉可执行代码、原始 HTML 图片或 MDX 导入。",
    );
  warnings.push(
    "请人工核对事实、命令、图片授权与隐私；自动检查不判断实验是否真实。",
  );
  return { errors, warnings };
}
export async function createNote({
  inbox,
  title,
  format = "note",
  lang = "zh-CN",
  repo,
}) {
  const root = await external(inbox, repo);
  if (!formats.includes(format)) throw new Error("未知内容类型。");
  const slug = `${
    title
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 55) || "note"
  }-${randomUUID().slice(0, 8)}`;
  const file = join(root, `${slug}.md`);
  await writeFile(
    file,
    pack(
      {
        title,
        date: new Date().toISOString(),
        lang,
        format,
        slug,
        draft: true,
      },
      "",
    ),
    { flag: "wx", mode: 0o600 },
  );
  return file;
}
export async function prepare({ file, inbox, repo, format }) {
  const root = await external(inbox, repo);
  const source = await external(file, repo);
  const raw = await readFile(source, "utf8");
  const original = unpack(raw);
  const title =
    original.data.title ||
    original.body.match(/^#\s+(.+)$/m)?.[1] ||
    basename(source, extname(source));
  const slug =
    original.data.slug ||
    `${
      title
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 55) || "note"
    }-${createHash("sha256").update(source).digest("hex").slice(0, 8)}`;
  if (!/^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u.test(slug))
    throw new Error("slug 只能包含文字、数字、短横线或下划线。");
  const data = {
    title,
    date: original.data.date || new Date().toISOString(),
    lang: original.data.lang || "zh-CN",
    format: format || original.data.format || "note",
    slug,
    draft: true,
  };
  for (const key of [
    "description",
    "tags",
    "maturity",
    "updated",
    "translationKey",
  ])
    if (original.data[key] !== undefined) data[key] = original.data[key];
  let body = original.body;
  const problems = inspect(data, body);
  if (problems.errors.length) throw new Error(problems.errors.join("\n"));
  const folder = join(root, "prepared", `${slug}-${randomUUID().slice(0, 8)}`);
  await mkdir(join(root, "prepared"), { recursive: true, mode: 0o700 });
  await external(join(root, "prepared"), repo);
  await mkdir(folder, { mode: 0o700 });
  await mkdir(join(folder, "assets"), { mode: 0o700 });
  try {
    const assets = [];
    for (const node of references(body).reverse()) {
      if (/^(https?:|mailto:|#)/i.test(node.url)) continue;
      if (node.url.startsWith("/")) continue; // Site-relative references are checked before approval.
      if (node.type === "link") {
        problems.warnings.push(`相对文章链接需要改为网站路径：${node.url}`);
        continue;
      }
      const path = await realpath(
        resolve(dirname(source), decodeURIComponent(node.url)),
      );
      if (!inside(await realpath(dirname(source)), path))
        throw new Error(
          "图片必须位于原稿同级目录或子目录，且不能通过符号链接越界。",
        );
      if (!/\.(png|jpe?g|webp|avif|gif)$/i.test(path))
        throw new Error("本地图片支持 PNG、JPEG、WebP、AVIF 和 GIF。");
      if ((await stat(path)).size > 20 * 1024 * 1024)
        throw new Error("图片超过 20 MB，请先压缩。");
      const bytes = await sharp(path, {
        animated: true,
        limitInputPixels: 60_000_000,
      })
        .webp({ quality: 85 })
        .toBuffer();
      const name = `${createHash("sha256").update(bytes).digest("hex").slice(0, 20)}.webp`;
      await writeFile(join(folder, "assets", name), bytes, { mode: 0o600 });
      assets.push(name);
      const replacement = `assets/${name}`;
      const start = node.position.start.offset,
        end = node.position.end.offset;
      const segment = body.slice(start, end).replace(node.url, replacement);
      body = body.slice(0, start) + segment + body.slice(end);
    }
    await writeFile(join(folder, "article.md"), pack(data, body), {
      flag: "wx",
      mode: 0o600,
    });
    await writeFile(
      join(folder, "review.md"),
      `# 发布前审核\n\n原稿保留不变。当前包仍是私人草稿。\n\n- 类型：${data.format}\n- 标题：${title}\n- 图片：${new Set(assets).size} 张（转为 WebP 并移除 EXIF）\n\n${problems.warnings.map((x) => `- ${x}`).join("\n")}\n\n请修改 article.md 审核公开措辞。确认后运行 content:approve；该步骤只将审核稿加入本地网站，Git 提交和推送另行确认。\n`,
      { mode: 0o600 },
    );
    return folder;
  } catch (error) {
    await rm(folder, { recursive: true, force: true });
    throw error;
  }
}
export async function check({ file, repo }) {
  const { data, body } = unpack(await readFile(file, "utf8"));
  const result = inspect(data, body);
  for (const node of references(body)) {
    if (/^(https?:|mailto:|#)/i.test(node.url)) continue;
    if (node.url.startsWith("/")) {
      const pathname = decodeURIComponent(node.url.split(/[?#]/)[0]);
      if (node.type === "image" || /\.[a-z0-9]+$/i.test(pathname)) {
        const path = resolve(repo, "public", `.${pathname}`);
        if (!inside(resolve(repo, "public"), path))
          result.errors.push("资源路径越界。");
        else
          try {
            await stat(path);
          } catch {
            result.errors.push(`资源不存在：${pathname}`);
          }
      } else {
        const route = pathname.match(
          /^\/(zh-CN|en)\/(blog|essays|research|projects)\/([^/]+)\/?$/,
        );
        if (route) {
          const entries = await readdir(join(repo, "src/content", route[2]));
          let found = false;
          for (const name of entries.filter((x) => /\.mdx?$/.test(x))) {
            const { data: target } = unpack(
              await readFile(join(repo, "src/content", route[2], name), "utf8"),
            );
            const slug =
              target.slug ||
              basename(name, extname(name)).toLowerCase().replace(/ /g, "-");
            if (
              slug === route[3] &&
              (target.lang || "zh-CN") === route[1] &&
              !target.draft &&
              (target.publication === "approved" || (!target.publication && !target.format))
            )
              found = true;
          }
          if (!found) result.errors.push(`文章链接不存在或未公开：${pathname}`);
        } else result.warnings.push(`请在本地预览确认内部路径：${pathname}`);
      }
    } else if (node.type === "link")
      result.errors.push(`请将相对文章链接改为网站绝对路径：${node.url}`);
    else {
      try {
        const path = await realpath(
          resolve(dirname(file), decodeURIComponent(node.url)),
        );
        if (!inside(await realpath(dirname(file)), path)) throw new Error();
        await stat(path);
      } catch {
        result.errors.push(`图片不存在或越界：${node.url}`);
      }
    }
  }
  return result;
}
export async function approve({ file, repo }) {
  await external(file, repo);
  const snapshot = await readFile(file, "utf8");
  const result = await check({ file, repo });
  if (result.errors.length) throw new Error(result.errors.join("\n"));
  if (snapshot !== await readFile(file, "utf8")) throw new Error("审核稿检查期间发生变化，请重新检查后确认。");
  const { data, body } = unpack(snapshot);
  if (!/^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u.test(data.slug || ""))
    throw new Error("缺少安全且稳定的 slug。");
  // Re-encoding at approval also strips metadata from any images replaced during review.
  const copies = new Map();
  let output = body;
  for (const node of references(body).reverse()) {
    if (/^(https?:|mailto:|\/|#)/i.test(node.url) || node.type === "link")
      continue;
    const path = await realpath(
      resolve(dirname(file), decodeURIComponent(node.url)),
    );
    if (!inside(await realpath(dirname(file)), path))
      throw new Error("图片越界。");
    const bytes = await sharp(path, {
      animated: true,
      limitInputPixels: 60_000_000,
    })
      .webp({ quality: 85 })
      .toBuffer();
    const name = `${createHash("sha256").update(bytes).digest("hex").slice(0, 20)}.webp`;
    copies.set(name, bytes);
    const start = node.position.start.offset,
      end = node.position.end.offset;
    output =
      output.slice(0, start) +
      output
        .slice(start, end)
        .replace(node.url, `/writing-images/${data.slug}/${name}`) +
      output.slice(end);
  }
  const collection = join(repo, "src/content/blog");
  await mkdir(collection, { recursive: true });
  for (const name of await readdir(collection)) {
    if (!/\.mdx?$/.test(name)) continue;
    const { data: existing } = unpack(
      await readFile(join(collection, name), "utf8"),
    );
    const existingSlug =
      existing.slug ||
      basename(name, extname(name)).toLowerCase().replace(/ /g, "-");
    if (existingSlug === data.slug && (existing.lang || "zh-CN") === data.lang)
      throw new Error(
        "EEXIST: 此语言的 slug 已存在。请让 Codex 对照已有文章做定向更新，或改用新 slug。",
      );
  }
  const target = join(collection, `${data.slug}.${data.lang}.md`);
  const assetDir = join(repo, "public/writing-images", data.slug);
  // Publish a complete file atomically; the exclusive link never replaces an article.
  await mkdir(dirname(target), { recursive: true });
  const { open } = await import("node:fs/promises");
  const temporary = join(collection, `.${randomUUID()}.tmp`);
  const handle = await open(temporary, "wx", 0o600);
  let createdAssets = false;
  try {
    if (copies.size) {
      await mkdir(dirname(assetDir), { recursive: true });
      await mkdir(assetDir);
      createdAssets = true;
      for (const [name, bytes] of copies)
        await writeFile(join(assetDir, name), bytes, { flag: "wx" });
    }
    await handle.writeFile(
      pack({ ...data, draft: false, publication: "approved" }, output),
    );
    await handle.chmod(0o644);
    await link(temporary, target);
  } catch (error) {
    if (createdAssets) await rm(assetDir, { recursive: true, force: true });
    throw error;
  } finally {
    await handle.close();
    await rm(temporary, { force: true });
  }
  return { target, assets: [...copies.keys()], warnings: result.warnings };
}
