# Route System v2 修改说明

项目：`zoranzhou.com`  
范围：仅 Route / 地图 / 足迹系统  
版本日期：2026-07-11

## 1. 本次修改目标

本次修改在保留网站现有视觉风格和旧路线兼容性的前提下，将 Route 系统升级为适合长期维护的 **Route System v2**。

核心定位不是运动应用，而是：

- Travel Journal（旅行记录）
- Life Log（生活记录）
- Photo Story（摄影记录）

本次没有修改博客、照片、Media、Research、Projects 等其他页面。

## 2. 架构与兼容策略

### 新旧内容集合并存

- 新路线 Markdown：`src/content/routes/`
- 旧路线 Markdown：`src/content/map/`
- GPX：`public/routes/`

页面会同时读取 `routes` 和旧的 `map` 集合，因此：

- 现有 `src/content/map/*.md` 不需要立即迁移。
- 旧内容已通过一次性迁移命令转换为 `gpx` 字段；运行时只读取 `routes` collection。
- 新路线优先使用 `gpx` 字段。
- 旧路线 URL 和现有 Markdown 正文可以继续使用。
- 若新旧集合出现相同语言和相同 slug，新 `routes` 条目优先，避免重复页面。

### 通用 GPX 解析

解析逻辑基于 GPX 内部结构，而不是依赖文件名或特定厂商格式。支持：

- 标准 GPX
- Apple Health 导出的 GPX
- Keep
- RunGap
- Garmin
- Coros
- GPX Studio
- 其他符合 GPX 结构的文件

解析内容包括：

- 日期与时间
- GPS 点和多段轨迹
- 距离
- 总耗时
- 累计爬升与下降
- 最低和最高海拔
- 起点与终点
- Waypoints / 经停点
- 来源应用与 GPX creator

文件名只在 GPX 内缺少日期、距离或耗时等信息时作为辅助回退，不作为主要数据来源。

## 3. 修改过的文件

| 文件                                  | 修改内容                                       | 修改原因                                                   |
| ------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| `package.json`                        | 新增 `import:routes` 命令                      | 提供统一的 GPX 导入入口，不增加依赖                        |
| `scripts/import-route.ts`             | 新增 Route v2 导入器                           | 扫描 GPX、解析数据、反向地理编码、创建或安全更新 Markdown  |
| `src/content/config.ts`               | 定义唯一的 `routes` collection 和 Route schema | Route 页面只读取已提交的 v2 内容                           |
| `src/content/routes/.gitkeep`         | 新增空目录占位文件                             | 保证新 Route 内容目录进入版本控制                          |
| `src/lib/routes/gpx.ts`               | 新增通用 GPX / GeoJSON 解析模块                | 浏览器和导入脚本共用同一套解析逻辑，避免重复实现和格式写死 |
| `src/lib/routes/content.ts`           | 新增 Route 内容兼容与格式化工具                | 统一处理新旧 collection、字段别名、可见性和显示格式        |
| `src/components/MapExplorer.astro`    | 改为使用共享解析器，并优化按需加载             | 保持原地图总览风格，同时避免路线增多后一次性下载全部 GPX   |
| `src/components/RouteMap.astro`       | 新增路线详情地图、起终点、经停点和海拔图       | 提供旅行日志需要的路线视觉信息，不展示敏感运动指标         |
| `src/layouts/RoutePostLayout.astro`   | 新增 Route 专用详情布局                        | 按旅行记录结构展示封面、摘要、路线信息、Story 和 Photos    |
| `src/pages/[locale]/map/index.astro`  | 同时读取新旧 Route collection                  | 保持旧内容兼容，并让新导入路线自动进入地图总览             |
| `src/pages/[locale]/map/[slug].astro` | 改用 Route 专用布局与地图组件                  | 详情页从普通博客文章升级为 Travel Journal 结构             |

## 4. 本地更新 Media

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

## 5. 本地内容编辑器

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
