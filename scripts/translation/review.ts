import { hasChinese } from "./content.js";
import { glossary } from "./protection.js";
import { normalizedNumbers } from "./normalization.js";

export type Issue = {
  level: "warning" | "info";
  code: string;
  message: string;
  segment?: number;
};
export function reviewTranslation(source: string, target: string): Issue[] {
  const issues: Issue[] = [];
  const add = (code: string, message: string) =>
    issues.push({ level: "warning", code, message });
  if (hasChinese(target))
    add("remaining-chinese", "译文仍含中文，请确认是否为专名或遗漏。");
  if (
    /尚未|还没有|不声称|不使用|未经|未验证|并非|不能|不支持|没有|不要/.test(
      source.replace(/有没有/g, "是否"),
    ) &&
    !/\b(no|not|none|never|without|neither|cannot|can't|don't|doesn't|hasn't|haven't|isn't|aren't|unverified|unaudited|unauthorized|incomplete|lack\w*|yet|rather than)\b/i.test(
      target,
    )
  )
    add(
      "negation",
      "原文含否定或限制，译文未检测到常见对应词；这是规则提示，需结合整句判断。",
    );
  if (
    /计划中|计划(?:开发|构建|实现|推出|验证)|将会|未来|候选|规划|尚待/.test(
      source,
    ) &&
    !/\b(plan\w*|will|future|candidate|intend\w*|propos\w*|aim\w*|expect\w*|upcoming|next|prospect\w*)\b/i.test(
      target,
    )
  )
    add("planned-status", "原文涉及规划或未来状态，请确认没有被译为已完成。");
  const chineseLength = (source.match(/\p{Script=Han}/gu) ?? []).length;
  if (chineseLength > 40 && target.length < chineseLength * 0.8)
    add("possible-omission", "译文明显短于原文，可能存在内容遗漏。");
  for (const [term, english] of Object.entries(glossary)) {
    if (
      source.includes(term) &&
      !target.toLowerCase().includes(english.toLowerCase())
    )
      add("terminology", `术语“${term}”未出现约定表达“${english}”。`);
  }
  const numbers = normalizedNumbers;
  const remaining = numbers(source);
  for (const n of numbers(target, source)) {
    const index = remaining.indexOf(n);
    if (index >= 0) remaining.splice(index, 1);
    else {
      if (/\d/.test(target))
        issues.push({
          level: "info",
          code: "number-format",
          message:
            "中英文的数字表达方式不同（如中文数词转数字或计量单位换算），可结合本段核对含义。",
        });
      break;
    }
  }
  return issues;
}

export type ReviewRow = {
  source: string;
  target: string;
  label: string;
  issues: Issue[];
  correction?: string;
};
export type ExportEntry = {
  title: string;
  sourceFile: string;
  targetFile: string;
  status: string;
  download?: string;
  error?: string;
  rows: ReviewRow[];
  issues: Issue[];
};
export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function reportHtml(entries: ExportEntry[], date: string) {
  const ready = entries.filter((e) => e.download).length;
  const warnings = entries.reduce(
    (n, e) =>
      n +
      e.issues.filter((i) => i.level === "warning").length +
      e.rows.reduce(
        (s, r) => s + r.issues.filter((i) => i.level === "warning").length,
        0,
      ),
    0,
  );
  const corrections = entries.reduce(
    (n, e) => n + e.rows.filter((r) => r.correction).length,
    0,
  );
  const showIssues = (issues: Issue[]) =>
    issues
      .map((i) => `<p class="issue ${i.level}">${escapeHtml(i.message)}</p>`)
      .join("");
  const articles = entries
    .map((entry, i) => {
      const flagged =
        entry.issues.some((i) => i.level === "warning") ||
        entry.rows.some((r) => r.issues.some((i) => i.level === "warning")) ||
        !!entry.error;
      return `<article id="article-${i}" data-flagged="${flagged}"><header><div><span class="eyebrow">${escapeHtml(entry.sourceFile.split("/")[2] ?? "")}</span><h2>${escapeHtml(entry.title)}</h2><p class="path">${escapeHtml(entry.sourceFile)}</p></div><span class="badge">${entry.download ? "译文已导出" : "未生成译文"}</span></header>${entry.download ? `<a class="download" href="${escapeHtml(encodeURI(entry.download))}" download>下载这篇英文文件 ↗</a>` : ""}${entry.error ? `<p class="issue warning">${escapeHtml(entry.error)}</p>` : ""}${showIssues(entry.issues)}<div class="column-head"><span>中文原文</span><span>英文译文</span></div>${entry.rows.map((row, j) => `<section class="row" id="article-${i}-segment-${j}"><p class="label">${escapeHtml(row.label)}</p><div class="pair"><div lang="zh-CN">${escapeHtml(row.source)}</div><div lang="en">${escapeHtml(row.target)}</div></div>${showIssues(row.issues)}${row.correction ? `<p class="correction">已核对修正：${escapeHtml(row.correction)}</p>` : ""}</section>`).join("")}</article>`;
    })
    .join("");
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>文章译文 · 中英对照核对报告</title><style>
:root{color-scheme:light;--ink:#22302c;--muted:#65736b;--line:#dbe1d9;--paper:#f5f5ef;--green:#285844}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.85 system-ui,-apple-system,"PingFang SC",sans-serif}main{max-width:1300px;padding:60px 30px;margin:auto}h1{font-size:clamp(32px,4vw,52px);line-height:1.2;letter-spacing:-.04em;margin:12px 0 24px}h2{margin:4px 0;font-size:25px;line-height:1.5}.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--green)}.intro{max-width:820px;color:var(--muted)}.stats{display:flex;gap:32px;margin:32px 0}.stats strong{font-size:32px;display:block;color:var(--green)}.stats span{font-size:13px;color:var(--muted)}.toolbar{display:flex;gap:16px;flex-wrap:wrap;align-items:center;padding:18px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:32px}input[type=search]{padding:10px 14px;border:1px solid #b8c4b9;border-radius:6px;font:inherit;min-width:260px}a{color:var(--green);text-underline-offset:4px}.button{background:var(--green);color:#fff;padding:8px 16px;border-radius:5px;text-decoration:none}article{background:#fff;border:1px solid var(--line);border-radius:10px;padding:28px;margin:24px 0}article header{display:flex;gap:16px;justify-content:space-between}.path{font-size:12px;color:var(--muted);overflow-wrap:anywhere;margin:4px 0}.badge{white-space:nowrap;font-size:12px;color:var(--green)}.download{display:inline-block;margin:14px 0}.column-head,.pair{display:grid;grid-template-columns:1fr 1fr;gap:32px}.column-head{font-size:12px;color:var(--muted);margin-top:16px;padding:12px 0;border-bottom:1px solid var(--line)}.row{padding:18px 0;border-bottom:1px solid #e8ece6}.row:last-child{border:0}.label{font-size:11px;color:var(--muted);margin:0 0 8px}.pair>div{white-space:pre-wrap;overflow-wrap:anywhere}.pair>div[lang=en]{font-family:Georgia,serif;font-size:17px}.issue{font-size:13px;padding:8px 12px;margin:12px 0 0;border-radius:4px}.warning{background:#fff2da;color:#765116}.info{background:#f1f4f2;color:var(--muted)}.correction{font-size:13px;color:var(--green);background:#eef6ef;padding:8px 12px}footer{color:var(--muted);font-size:13px}nav{display:flex;flex-wrap:wrap;gap:8px 18px;font-size:13px}[hidden]{display:none!important}@media(max-width:720px){main{padding:30px 16px}article{padding:18px}.pair,.column-head{grid-template-columns:1fr;gap:14px}.column-head{display:none}.pair>div[lang=en]{border-left:2px solid var(--line);padding-left:14px}article header{display:block}.stats{gap:22px}}@media print{.toolbar,.download,nav{display:none}body{background:#fff}main{padding:0}article{break-before:page;border:0}.row{break-inside:avoid}}
</style></head><body><main><span class="eyebrow">ZORAN ZHOU / TRANSLATION REVIEW</span><h1>同一篇记录，两种语言。</h1><p class="intro">中英对照阅读、英文文件下载与核对提示集中在这里。此次导出没有修改网站中的中文或英文原文件。提示来自自动规则，并不等于确定存在错误；语义准确性仍需结合上下文判断。代码、链接与组件按原样保留，不要求你为翻译去改写中文。</p><p class="path">生成时间：${escapeHtml(date)} · 目标语言：美式英语</p><div class="stats"><div><strong>${ready}</strong><span>篇英文文件</span></div><div><strong>${warnings}</strong><span>条待关注提示</span></div><div><strong>${corrections}</strong><span>处核对修正</span></div></div><div class="toolbar"><input id="search" type="search" placeholder="搜索文章或译文" aria-label="搜索文章或译文"><label><input type="checkbox" id="flagged"> 只看含提示的文章</label><a class="button" href="english-articles.zip" download>下载全部英文文件</a><a href="review.json" download>下载完整核对记录</a></div><nav>${entries.map((e, i) => `<a href="#article-${i}">${escapeHtml(e.title)}</a>`).join("")}</nav>${articles}<footer>译文及报告均在本机生成。报告不加载外部服务、不包含翻译密钥。正文引文是译文，不代表某一出版译本的原文。</footer></main><script>const search=document.getElementById('search'),flagged=document.getElementById('flagged');function filter(){const q=search.value.toLocaleLowerCase();for(const article of document.querySelectorAll('article'))article.hidden=!(article.textContent.toLocaleLowerCase().includes(q)&&(!flagged.checked||article.dataset.flagged==='true'));}search.addEventListener('input',filter);flagged.addEventListener('change',filter);</script></body></html>`;
}
