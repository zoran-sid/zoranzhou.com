# 从手机笔记到个人网站

## 每天只做三件事

1. 在 iPhone 的 Obsidian、iCloud 文件或任意 Markdown 编辑器里记下来。一段话、代码或一张图片都可以。
2. 回到 Mac，把**一份文件的路径**交给 Codex：请整理为短笔记，保留原意、代码和不确定性，先给我审核稿。
3. 看完审核稿再确认加入网站；预览满意后，分别确认 Git 提交和推送预览分支。

无需安装 Obsidian，也不需要翻译。中文和英文各自发布，继续通过可选 `translationKey` 配对。

## 一次性准备

在网站仓库外建立私人 Inbox。可以是 iCloud 同步目录中的子目录，也可以是普通本地文件夹。请先在“文件”/Finder 中确认同步完整。
复制 `.env.content.example` 为 `.env.content`，只修改 `CONTENT_INBOX` 为该目录的绝对路径；带空格的路径用双引号包住。此设置被 Git 忽略。
工具只读取指定文件和其中引用的同级/子目录图片，不搜索或导入整个 Vault。

## 准备一份笔记

```sh
npm run content:new -- --title "一个还没完全想明白的问题"
# 编辑输出路径里的私人 Markdown，也可以跳过 new，直接用已有原稿。
npm run content:prepare -- --file "/你的私人目录/笔记.md"
# 技术文档改用 --type guide，长篇分析与随笔使用 --type essay。
```

prepare 输出私人 `prepared/文章名-标识/`，包含 `article.md`、`review.md` 和 `assets/`。
日期、标题、类型、中文语言和稳定 slug 自动生成；摘要、封面、标签和成熟度都可省略。
原标题、段落和代码保持原样；AI 整理是你与 Codex 的显式对话，不调用外部付费 API。

请让 Codex只编辑审核包，建议标题、结构、标签，并将未确认的事实列在 review.md，不能擅自补写成你的经历。
正文里的疑似凭据会阻止准备；邮箱、本机路径等会提示人工检查。检测不能代替隐私审核。
图片支持 PNG/JPEG/WebP/AVIF/GIF，转为 WebP 并移除 EXIF；远程图片保留原 URL，不下载。Obsidian 双链需先改为标准 Markdown。

## 审核后加入网站

```sh
npm run content:check -- --file "/私人目录/prepared/文章包/article.md"
npm run content:approve -- --file "/私人目录/prepared/文章包/article.md" --confirm
npm run dev
```

`approve --confirm` 表示你已审核内容、图片和公开措辞。它把一份文章放入 `src/content/blog`，仅复制引用图片到 `public/writing-images`，设置 `publication: approved`。原稿和审核包保留。
这个命令会让文章进入下一次网站构建，但不执行 Git、不部署、不发邮件。不要在确认前运行。
重复 slug 会拒绝写入，保护旧文章。修改已有文章时，告诉 Codex **具体已有文件**，对照审核稿定向更新并展示差异；重要更新填写 `updated`。不要为更新创建第二篇同 URL 文章。

内容形式：

| 形式 | 适用内容 | 阅读方式 |
| --- | --- | --- |
| note | 一段话、一个问题、小段代码 | 轻量单栏，无目录 |
| guide | 教程、配置、部署、实验记录 | 目录、代码复制、关联文章 |
| essay | 分析、反思、读书与生活随笔 | 长文排版、引用与图文 |

可选 `maturity: seed / growing / evergreen` 只描述内容状态，不代表水平或更新承诺。
旧文章不需要批量修改：原 URL、日期、翻译关系保留。技术 Blog 默认视作 Guide，生活、研究和 Essays 默认视作 Essay；可经审核显式调整。

## 隐私边界

本仓库为公开 GitHub 仓库。新私人原稿、审核包和原始图片始终保存在仓库外。
新格式内容必须显式标记 `publication: approved` 才能出现在详情、列表、搜索、RSS 和 Sitemap 中；`draft: true` 始终优先隐藏。
旧的 `draft` 过滤继续有效，但 Git 历史仍公开，不能把它用作私人保险箱。
构建前检查会阻止带图片或导入资源的仓库草稿，避免 Astro 编译/复制草稿专属资源。`public/`、`src/assets/photos/` 是公开资源区，私人文件不能放进去。
Cloudflare 预览构建使用相同的隐私规则。预览链接和 robots/noindex 都不等于访问控制。

## 预览与发布

```sh
npm run content:check -- --file "src/content/blog/已审核文章.zh-CN.md"
npm run lint
npm run test:content
npm run test:editorial
npm run build
npm run test:site-build
npm run preview
```

Codex 应展示待公开的文章与图片清单、Git 差异、构建结果，然后询问本次提交和推送许可。推荐推送 `codex/文章主题` 分支并创建 PR，由你检查预览后合并；不自动推送 main、不自动合并。
仓库配置为 Astro 静态站、`dist` 输出。Cloudflare 项目名为 `zoran-zhou-blog`。GitHub 默认分支为 main；Cloudflare 控制台中实际的生产分支和预览开关需由你确认，工具不修改它们。
Git 集成开启分支预览时，同仓库的 PR/分支推送可以产生独立的 Pages 预览地址。预览部署默认可被访问，需要保密时使用 Cloudflare Access，而不是只加 noindex。
参考：[Cloudflare Preview Deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)。

## 维护入口

- `src/data/now.ts`：近期关注，中英文独立文字；不自动更新日期。
- `src/lib/writing.ts`：精选长文和文章聚合；`content-policy.ts`：公开规则与形式分类。
- `src/content/config.ts`：元数据校验。
- `scripts/content/`：外部笔记工具、草稿资源保护、测试。
- `DESIGN.md`：沿用品牌的设计规范。

当前 Notes 与公开 Projects 为空，网站会诚实呈现空状态。后续可补增按周回顾、关联知识链接；先用真实内容验证需要，再增加管理界面。
