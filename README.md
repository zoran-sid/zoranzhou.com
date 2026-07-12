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

| 文件 | 修改内容 | 修改原因 |
|---|---|---|
| `package.json` | 新增 `import:routes` 命令 | 提供统一的 GPX 导入入口，不增加依赖 |
| `scripts/import-route.ts` | 新增 Route v2 导入器 | 扫描 GPX、解析数据、反向地理编码、创建或安全更新 Markdown |
| `src/content/config.ts` | 定义唯一的 `routes` collection 和 Route schema | Route 页面只读取已提交的 v2 内容 |
| `src/content/routes/.gitkeep` | 新增空目录占位文件 | 保证新 Route 内容目录进入版本控制 |
| `src/lib/routes/gpx.ts` | 新增通用 GPX / GeoJSON 解析模块 | 浏览器和导入脚本共用同一套解析逻辑，避免重复实现和格式写死 |
| `src/lib/routes/content.ts` | 新增 Route 内容兼容与格式化工具 | 统一处理新旧 collection、字段别名、可见性和显示格式 |
| `src/components/MapExplorer.astro` | 改为使用共享解析器，并优化按需加载 | 保持原地图总览风格，同时避免路线增多后一次性下载全部 GPX |
| `src/components/RouteMap.astro` | 新增路线详情地图、起终点、经停点和海拔图 | 提供旅行日志需要的路线视觉信息，不展示敏感运动指标 |
| `src/layouts/RoutePostLayout.astro` | 新增 Route 专用详情布局 | 按旅行记录结构展示封面、摘要、路线信息、Story 和 Photos |
| `src/pages/[locale]/map/index.astro` | 同时读取新旧 Route collection | 保持旧内容兼容，并让新导入路线自动进入地图总览 |
| `src/pages/[locale]/map/[slug].astro` | 改用 Route 专用布局与地图组件 | 详情页从普通博客文章升级为 Travel Journal 结构 |