# 手动翻译与中英对照导出

只维护中文原文，手动执行翻译，在 HTML 中集中查看结果。默认行为是**导出文件，不修改网站内的中文或英文源文件**。工具不会自动提交、推送、部署，也不在保存、构建、CI 或定时任务中运行。

## 推荐用法

需要 Node.js 22 或更新版本。在仓库根目录执行：

```sh
# 预览全部文章，不联网、不写文件
npm run translate -- --all --dry-run

# 导出全部文章，包括已经有英文的文章
npm run translate -- --all --max-characters 50000

# 只导出新增或过期的译文
npm run translate

# 限定集合或单篇
npm run translate -- --collection lab --all
npm run translate -- --file "src/content/lab/typescript-foundations.md" --retranslate
```

Windows PowerShell 若阻止 `npm.ps1`，使用 `npm.cmd`。文件路径含空格时必须加引号。

支持 Blog、Essays、Research、Lab 的公开中文 Markdown/MDX。草稿、空正文会在报告中解释跳过原因，不编造内容。摄影、跑步路线、项目、书影音、站点 UI 不在范围内。Lab 不会因此进入文章 RSS。

## 导出内容

控制台会打印实际目录，位于被 Git 忽略的 `.local/translation/exports/<时间与ID>/`：

- `index.html`：可离线打开的中英对照报告，支持搜索、只看含提示的文章、逐篇下载和整包下载。
- `english/`：按原集合和路径组织的英文 Markdown/MDX，可直接用于现有 Astro 内容结构。
- `english-articles.zip`：全部成功导出的英文文件。
- `review.json`：结构化核对记录，包含原文、译文、提示与本地修正说明，不含密钥。

直接双击 HTML 即可查看，不必逐个打开 Markdown，也不要求为了迁就翻译而改写中文。报告按可翻译的字段与正文文本片段对照，代码和图片不作为译文段落重复展示。导出的英文文件保留全文结构。

提示来自规则检测，**不是确定的错误判断，也不是“翻译已百分之百正确”的认证**。它会指出残留中文、可能丢失的否定词、规划状态、额外数字、术语变化、明显过短的译文。文学引文是译文，不代表某个出版译本的官方原文。本次由助手做的核对与修正记录会单独显示；以后单独运行 CLI 不会自动调用另一个审校模型。

## 翻译逻辑

1. 解析 YAML 与 Markdown/MDX，只提取含中文的文本、标题、摘要、封面说明，以及 Lab 当前阶段、功能与限制说明。
2. 使用标题、摘要及正文文字作为上下文，最多 12,000 个字符；不会将代码、密钥配置或本机路径当作上下文发送。
3. 数字、产品名和本地术语表中的表达用 XML `keep` 标签保护，显式使用 DeepL XML v2 与 `ignore_tags`。术语表在 `scripts/translation/protection.ts`，不创建远程术语库。
4. 每次对最多 25 个未缓存片段调用翻译提供者；底层请求仍限制在 50 段、120,000 字节以内，目标为美式英语。
5. 校验受保护内容、返回数量、原有数字和 Markdown/MDX 结构。失败会进入报告，不能悄悄删除数字或破坏代码。中文数词转为新的阿拉伯数字只作提示，不强迫用户修改中文。
6. 逐篇导出英文文件，并更新报告。某篇失败不阻止其他文章导出，最终进程返回非零状态提醒未全部完成。

代码块、行内代码、链接与图片地址、图片 Markdown 说明、HTML、MDX 组件/属性/表达式/import 均按原样保留。组件或代码中的中文会作为保护内容提示。标签、分类、状态枚举、技术栈、未知 frontmatter 不擅自改名。报告还会提示保留的中文标签。

粗体或链接会让句子分成多个文本片段；增加上下文可以缓解但不能消除断句问题。原有站内链接目标保留；若某个链接指向翻译后标题的自动锚点，仍需注意导航关系。

## 缓存、修正与额度

`.local/translation/cache/` 按规则版本、术语表、文章上下文及源片段的摘要缓存结果。再次导出相同内容会复用缓存，不重复请求 DeepL。`--all` 的含义是包含全部文章，不是忽略缓存。改变术语表、规则版本或上下文后相关缓存会失效。

缓存可以保存助手核对后的 `target` 与 `correction` 说明，后续导出和明确写入均复用该修正。修正与具体原文和上下文绑定，不会硬套到已改写的文章。用户日常无需打开这些 JSON 文件操作；需要调整译法时可让助手按报告定位修正。

默认单次源文字上限为 20,000 字符，可通过 `--max-characters` 明确提高；全量现有文章可用 50,000。该值是保守范围限制，包含已缓存片段；因此大批量即使全部命中缓存，也应保留相应参数。术语展开、XML 标签和提供者计费规则可能使实际用量与估算不同；它不是账户余额查询。429 最多尝试三次，网络异常或超时不自动重试，以免重复计费。API 成功但后续校验失败仍可能计费；成功批次会缓存，重跑可继续利用。

## 明确写入网站时

导出与写入分开，不需要用户手工复制或改写中文正文。确认需要将结果用于网站时运行：

```sh
# 写入新增/过期且没有手工英文冲突的文章
npm run translate -- --write

# 明确更新一篇已有英文，包括它的手工修订
npm run translate -- --file "src/content/lab/typescript-foundations.md" --retranslate --write
```

`--write` 会直接写入网站文件。`--retranslate --write` 会替换指定英文正文，因此必须指定 `--file`；不允许 `--all --write` 批量覆盖历史英文。写入复用同一缓存；没有缓存时仍可能请求 DeepL。它不提交或推送 Git。

普通模式保持历史英文和人工修改过的英文；`--all` 可以重新导出它们，但不会覆盖源文件。`new` 表示无配对，`stale` 表示原文或规则变化，`synced` 表示已同步，`existing-preserved` 表示历史英文，`manual-preserved` 表示人工修改过的生成译文。

写入前检查原文/目标快照，避免覆盖正在编辑的文件；备份位于 `.local/translation/backups/<ID>/journal.json`，成功后有 `complete` 标记。每个文件原子替换，捕获写入错误会回滚；多文件不是断电安全事务。被强制终止后，应检查未完成备份与 Git 差异，确认无运行任务后才删除 `.local/translation/lock`。

## 配对与日期

已有 `translationKey` 保留。缺少时，从集合与相对路径生成稳定标识并放进导出的英文。**导出不写回中文**；只有明确 `--write` 成功时才自动补中文缺少的配对字段，不改中文正文。已有标识不随标题或文件名改变，同集合、同语言不允许重复。

先按 `translationKey` 匹配已有英文，再识别常规 `.en.md` / `.en.mdx` 命名；其他历史命名需要明确配对，工具不猜测。保留已有英文位置和 slug；新英文显式 slug 使用中文 slug 加 `-en`。原文的 `date` / `updated` 同步，翻译时间单独记录在 `translation.translatedAt`，不冒充发布日期。

`translation` 中的 sourceHash、outputHash 和 rulesVersion 仅为维护数据，不含密钥。输出摘要不包括翻译记录本身。人为修改英文后会被保护；中文或其格式变化会触发后续更新判断。

## 密钥与安全边界

密钥只从本机根目录 `.env.translation` 的 `DEEPL_AUTH_KEY` 或同名进程环境变量读取，环境变量优先。不要加 `PUBLIC_` 前缀。`.env.translation.example` 仅含占位符。本机凭据仅当前用户可读写。

- `.env.translation` 与整个 `.local/translation/` 均被 Git 忽略，普通 `git add .` 不会加入；不要强制添加它们。
- 密钥只发送到官方 `api-free.deepl.com`（`:fx`）或 `api.deepl.com` 的 Authorization 请求头，拒绝重定向。
- 报告、英文文件、缓存和压缩包都不应包含密钥；日志不输出请求头、API 响应正文或嵌套网络异常。
- 不创建 GitHub Secret、Action、定时任务或生产 API。CI/Cloudflare 环境拒绝执行翻译。
- 导出的 HTML 不加载外部资源；内容转义后显示，原文中的 HTML/脚本不会在报告中执行。

```sh
git check-ignore .env.translation .local/translation/lock
```

## 维护验证

```sh
npm run test:translation
npm run lint
npx tsc --noEmit --module nodenext --moduleResolution nodenext --target es2022 --skipLibCheck --strict scripts/translate.ts scripts/translation.test.ts
git diff --check
```

内容或运行时 schema 变更还需检查语言切换、静态构建和站点测试。本地翻译测试使用模拟 API，不消耗真实额度。更改提取/术语/翻译规则时更新 `RULES_VERSION` 并验证缓存与保护逻辑。CLI 不导入网站运行时，网站也不导入 CLI。

DeepL 依据：[翻译接口](https://developers.deepl.com/api-reference/translate)、[XML 与保护标签](https://developers.deepl.com/docs/translate/translating-xml)。
