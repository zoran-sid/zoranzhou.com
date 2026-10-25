# 从手机笔记到个人网站

## 随记 / Notes

首页原来的“近况”现在叫“随记”，显示当前语言最近发布的一条随记的文字预览和配图。
点击“所有随记”进入 `/zh-CN/blog/formats/note/`，按发布时间从新到旧浏览，每页 10 条。
英文对应 `/en/blog/formats/note/`。中文独立发布即可，翻译可后补；英文页只展示真实存在的英文内容。
`/now/` 继续保留学习近况和时间线。

随记适合几句话、一张照片、一个刚遇到的问题。无需摘要、分类、标签、封面或英文翻译。
内部仍用 `format: note`，一条记录仍有独立链接。正文照片使用普通 Markdown 图片。
首页只展示最新一条：中文最多 180 字符、英文 320 字符，最多 5 行文字和 3 张照片。
随记列表每条中文最多 300 字符、英文 600 字符，最多 8 行文字和 6 张照片。
预览图按正文顺序排列；若有封面，优先显示并去掉重复图片。多余照片用 `+N` 提示，点击缩略图或
“查看全文 · 全部照片”进入详情，保留完整文字、代码、排版和所有图片。预览不会修改 Markdown 原稿。
列表只输出需要展示的图片，并使用延迟加载；没有显示的图片留到详情页再加载。
单图完整放入固定比例画框，多图采用方形缩略图，详情保持原图比例。预留图片尺寸，减少加载时跳动。
相对路径图片由详情页的 Astro 内容渲染器处理，计入照片数量，但不直接用作预览图。
发布后修改正文不会把旧记录顶到最前面；顺序依据 `date`，同一天多条请保留时分与时区。
目前 RSS 仍包含已公开的随记，与其他 Writing 内容一致；摄影和路线集合仍不进入文章 RSS。

### 手机或电脑直接发布（首次需要连接）

项目已准备好 `.pages.yml`，使用 [Pages CMS 在线编辑器](https://app.pagescms.org/)。
配置随项目保存在 GitHub；首次使用仍需你的账号授权。首次连接：

1. 将本次代码与 `.pages.yml` 一起提交到 GitHub，进入实际用于发布网站的分支。
2. 打开 Pages CMS，用 GitHub 登录，安装它的 GitHub App，选择授权 `zoran-sid/zoranzhou.com`。
3. 在编辑器中选择该仓库和生产分支。确认 Cloudflare Pages 已连接这个分支并启用自动构建。
4. 打开“随记”，新建记录，写几句话，用编辑器中的图片功能添加照片，然后保存。

日期和时间自动填写，按香港／北京时间（UTC+8）保存；跨时区旅行时请按这个时区调整。
标题预填“随记”，可以直接保留；语言默认中文。修改旧记录时保留原时间，就能保留初次发布顺序。
新记录使用稳定的唯一链接，修改标题和正文不会改地址。中文可以先发，英文不需要同步完成。
以后在手机浏览器打开同一入口即可，也可以把它加入主屏幕；电脑用同一账号登录。

**保存就是提交公开内容。** 编辑器把 Markdown 和图片写入你选中的 GitHub 分支；生产分支的新提交
触发既有 Cloudflare 构建，构建成功后出现在网站，不需要电脑开机，也不必手动执行 Git 命令。
这不是即时消息服务，网站更新要等构建完成。选了其他分支时，不会更新生产网站。
如果 Cloudflare 目前仅接受手动上传，先在其控制台连接 GitHub 自动构建；本次没有改动生产部署设置。

编辑入口只列出随记，普通长文章仍按原工作流管理。这个配置只是界面范围，GitHub App 的实际仓库权限
以 GitHub 授权页为准。无需在网站或配置中填写 GitHub Token、DeepL Key 或其他密钥。

### 地点（可选）

编辑器新增“地点”和“地图链接”，都可以留空。例如地点填“香港 · 西贡”，地图链接粘贴地图 App 的分享网址。
只填地点时显示地点文字；加上链接后可以点开地图；只填地图链接则显示“查看地点”。
首页预览、随记列表和完整详情都会显示。链接只接受 `http://` 或 `https://`，不会在页面嵌入地图。
这是手动填写的地点，不调用手机 GPS，不自动读取照片定位；城市、区域或具体地点由你决定。

### 照片与未完成内容

照片直接保存在 `public/writing-images/notes/`，文件名随机生成以避免同名覆盖。
支持 JPG、PNG、WebP、AVIF、GIF；HEIC 请先转为 JPG。图片上传本身也会写入公开 GitHub 仓库，
即使还没保存文字也已公开；只上传准备公开的图片。在线上传没有接入本地的 EXIF 清理流程，
iPhone 分享照片时请先在“选项”中关闭位置信息，或使用已移除定位的副本。
私人草稿继续放在手机备忘录或仓库外 Inbox。删除网页内容不能抹掉 Git 历史。

### 已有 Markdown 和长文

仍可将一份文件交给 Codex：

> 将这份原文整理为中文随记，保留原意，不扩写、不翻译。先给我看准备发布的内容，确认后加入网站。
> Git 提交与推送由我另行确认。

下面的本地审核流程继续适用。`npm run editor` 是电脑本地编辑器，不要修改监听地址把它暴露到公网。

参考：[Pages CMS 快速开始](https://pagescms.org/docs/quick-start/)、
[富文本与配图](https://pagescms.org/docs/configuration/fields/rich-text/)、
[自动日期](https://pagescms.org/docs/configuration/fields/date/)。

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

当前 Notes 与公开 Projects 为空，网站会诚实呈现空状态。手机直接发布使用以上 Pages CMS 入口；本地 Inbox 适合需要整理和审核的内容。
