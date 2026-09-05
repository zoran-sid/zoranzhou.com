# ZORAN ZHOU

技术写作与个人生活记录的双语博客，线上地址为 [zoranzhou.com](https://zoranzhou.com)。使用 Astro 5、MDX、TypeScript、Tailwind CSS 4 和 MapLibre GL，静态构建至 `dist/`，由 Cloudflare Pages 托管。

## 网站结构

- **首页**：个人定位 → 精选文章（含博客构建）→ 最近记录 → TypeScript 学习 → 生活照片 → 联系与订阅。
- **文章 `/blog`**：聚合 Blog、Essays、Research，按技术、研究、生活筛选，支持静态分页。原有详情地址及 `/essays`、`/research` 列表保留。
- **实践 `/projects`**：项目、实践文章与研究笔记，并提供独立 WEB3 LAB 入口。
- **生活 `/life`**：摄影、足迹、随笔、书影音与游戏的统一入口。
- **关于 `/about`**：个人介绍、工作方式与技能方向。
- **WEB3 LAB `/lab`**：独立深色子站，以当前 TypeScript 学习为起点，依次展开学习路线、钱包平台规划与安全研究笔记；学习状态与验证状态分别呈现。

以上路径都带 `/zh-CN` 或 `/en` 语言前缀。根路径仅负责语言选择与跳转。

## 本地开发与检查

```sh
npm ci
npm run dev
```

本地预览默认位于 `http://127.0.0.1:4321/zh-CN/`。

```sh
npm run lint
npm run test:editorial
npm run test:language-routing
npm run build
npm run test:site-build
```

受限环境中可设置 `ASTRO_TELEMETRY_DISABLED=1` 后运行 Astro 命令。完整维护约束见 [Agent.md](Agent.md)。

## 内容与视觉维护

- 正文位于 `src/content/`，在原集合内维护，不为聚合页面复制文章。
- 首页精选引用配置位于 `src/lib/writing.ts`；标题、摘要和日期从正文读取。引用不存在时构建报错，避免留下空入口。
- 普通文章的双语版本通过相同 `translationKey` 配对；路线继续通过 `routeId` 配对。缺少译文时切换到目标语言的对应列表，不猜测详情地址。
- 空正文文章保留原详情地址，并显示整理中说明，不进入文章流、标签、搜索和 RSS。
- `src/i18n/editorial.ts` 维护主站叙事文案；原集合与工具文案仍位于 `zh-CN.ts` 和 `en.ts`。
- `global.css` 维护主题与公共组件；`home.css`、`collections.css`、`reading.css` 分别负责首页、入口页面与阅读体验。地图样式在 `maps.css` 内，通过 `BaseLayout` 的 `mapStyles` 按需加载。Lab 样式保持独立。
- 首页山景来自原有川西游记图片：`https://e5d9f02.webp.fi/b83f5dd6937798b1cae03b3c062f8691.jpg`。本地副本 `src/assets/images/sichuan-mountains.jpg` 由 Astro 生成响应式图片。

设计依据见 [重构方案](docs/refactor-proposal-2026-09-05.md)，本轮变更与验收记录见 [重构记录](docs/refactor-implementation-2026-09-05.md)。旧 Route v2 修改说明已原文移至 [历史记录](docs/history/route-system-v2-2026-07-11.md)；其中新旧集合并存的描述仅代表历史过程，当前运行时只读取 `routes`。

## 文章更新订阅

`/subscribe` 提供邮件订阅说明和 RSS 阅读器入口。通知源为各语言的 `/rss.xml`，仅收录已发布、非空正文的 Blog / Essays / Research。摄影、跑步路线、项目和 LAB 更新均排除。读者通过 Blogtrottr 的公开页面自行填写邮箱、确认和退订，本站不收集邮箱；免费方案带广告。部署后第三方才能读取新版内容源。

## 发布

构建命令为 `npm run build`，发布目录为 `dist`。`public/_routes.json` 将 Cloudflare Pages Function 限定在根路径 `/`。内容编辑器、备份、导入器和设置文件均为本地维护工具，不属于生产站点。提交、推送和部署由站点维护者明确执行。

## 本地更新 Media

Media 数据是构建时读取的静态文件 `src/content/media.md`。网站构建、Cloudflare 部署和页面请求都不会访问豆瓣，也不会运行更新脚本。游戏及其他非电影分区继续手工维护。

在 Windows 本机仓库根目录手动运行：

```powershell
npm run media:update
```

如果 PowerShell 的执行策略阻止 `npm.ps1`，使用等价命令 `npm.cmd run media:update`。

脚本使用普通浏览器 User-Agent 和请求间隔，基于上面的“看过”列表地址请求其 grid 视图（以取得海报和评分），并依次读取所有分页。它会合并稳定的豆瓣 ID/slug，避免重复条目，保留已有非空字段、未知列、未匹配的手工电影条目，并原样保留游戏等其他分区。完整抓取和校验成功后，脚本先写临时文件，再原子替换 `media.md`；失败或数据不完整时不会修改正式文件，也不会自动提交或推送 Git。

只验证抓取和合并、不写文件：

```powershell
npm run media:update -- --dry-run
```

豆瓣可能返回 403、418、429、验证码或异常请求页。豆瓣的分页总数有时也会包含已删除或私密的收藏记录，但页面不会提供对应条目；脚本会明确警告并继续完整分页，这类不可见记录无法导入。遇到反爬限制时，在浏览器中把每个分页分别保存为 HTML 文件并放进同一个目录，然后运行：

```powershell
npm run media:update -- --input C:\path\to\douban-pages
```

也可以传入单个导出 JSON 文件。JSON 顶层应为数组，或包含 `movies`/`items` 数组；每条至少需要豆瓣 subject ID（`subjectId`、`doubanId` 或 `id`）或 `movie.douban.com/subject/...` URL，以及 `name`/`title`。支持 `year`/`releaseDate`、`rating`/`score`、`poster`/`cover`、`watchedDate`/`date`、`tags`、`comment` 和 `metadata`/`rawInfos`。若保存的 HTML 数量少于页面声明的收藏总数，脚本会拒绝部分更新。

更新后请检查差异并运行：

```powershell
npm run test:media-update
npm run lint
npm run build
```

## 本地内容编辑器

Blog、Essays 及相同 Markdown/MDX 内容集合可以通过仅限本机的浏览器编辑器维护：

```powershell
npm run editor
```

编辑器只监听 `127.0.0.1:4322`，直接读写本仓库中明确允许的内容目录，并在覆盖、重命名或删除前把备份写入被 Git 忽略的 `tools/content-editor/backups/`。它不会自动提交或推送，也不会被 Astro 构建或 Cloudflare 部署包含。完整说明见 `tools/content-editor/README.md`。

界面默认使用类似 Typora 的可视化正文编辑，另保留源码 / MDX 与阅读预览模式；文章信息、格式、素材和常用操作都可直接用鼠标完成。复杂 MDX/JSX 会自动回退到源码模式，避免转换时改坏内容：

- 图片：第一次使用时点击右上角“设置”，只填写本机 `PicGo.exe` 的完整路径；之后可点击“图片”、把图片拖入正文或直接粘贴，编辑器会调用本机 PicGo 上传并插入返回的 Markdown 链接。PicGo 本身仍需提前配置好目标图床。
- GPX：点击“GPX”选择文件，编辑器会校验后原子写入 `public/routes/` 并插入链接；“素材库”可以查看、复用、删除（删除前备份）或在 Windows 资源管理器中打开 GPX 目录，也可一键复用现有 Route importer 生成/更新符合项目 schema 的路线内容。
- 设置和临时上传文件仅保存在被 Git 忽略的 `tools/content-editor/` 本地文件中，不会进入生产站点。

“快速检查”运行 Astro 内容/schema 与类型检查；“部署前构建”运行完整 `npm run build`，生成 Cloudflare 发布使用的 `dist/`。生产构建不是 GPX 导入命令，日常编辑不必每次运行；远程图片处理可能耗时，编辑器会持续显示运行状态、耗时和增量日志。GPX 转 Route Markdown 请使用编辑器“素材库”，或单独运行 `npm run import:routes`。

## 设计与交付资料

- [重构实现与验收记录](docs/refactor-implementation-2026-09-05.md)
- [GitHub 个人主页 README](docs/github-profile-README.md)：独立交付文件，由作者手动同步到 `zoran-sid/zoran-sid`。
- WEB3 LAB 图标以 `public/web3-lab-favicon.svg` 为唯一来源，修改后运行 `npm run icons:lab` 生成 64 px 与 180 px PNG，并更新 `src/lib/lab.ts` 中的 `LAB_ICON_REVISION`。页头与浏览器图标使用同一设计。
- 长期内容与发布约定见 [Agent.md](Agent.md)。
