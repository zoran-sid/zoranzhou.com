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
- 现有 `routeFile` 字段继续有效。
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
| `src/content/config.ts` | 新增 `routes` collection，并扩展 Route schema | 同时支持新字段和旧 `map` / `routeFile` 内容 |
| `src/content/routes/.gitkeep` | 新增空目录占位文件 | 保证新 Route 内容目录进入版本控制 |
| `src/lib/routes/gpx.ts` | 新增通用 GPX / GeoJSON 解析模块 | 浏览器和导入脚本共用同一套解析逻辑，避免重复实现和格式写死 |
| `src/lib/routes/content.ts` | 新增 Route 内容兼容与格式化工具 | 统一处理新旧 collection、字段别名、可见性和显示格式 |
| `src/components/MapExplorer.astro` | 改为使用共享解析器，并优化按需加载 | 保持原地图总览风格，同时避免路线增多后一次性下载全部 GPX |
| `src/components/RouteMap.astro` | 新增路线详情地图、起终点、经停点和海拔图 | 提供旅行日志需要的路线视觉信息，不展示敏感运动指标 |
| `src/layouts/RoutePostLayout.astro` | 新增 Route 专用详情布局 | 按旅行记录结构展示封面、摘要、路线信息、Story 和 Photos |
| `src/pages/[locale]/map/index.astro` | 同时读取新旧 Route collection | 保持旧内容兼容，并让新导入路线自动进入地图总览 |
| `src/pages/[locale]/map/[slug].astro` | 改用 Route 专用布局与地图组件 | 详情页从普通博客文章升级为 Travel Journal 结构 |

## 4. 替换步骤

1. 备份当前项目或新建 Git 分支。
2. 解压 `RouteSystem_v2_ModifiedFiles.zip`。
3. 将 `RouteSystem_v2_ModifiedFiles/` 内的文件复制到项目根目录。
4. 选择“合并目录并覆盖同名文件”。
5. **不要删除项目中其他未出现在压缩包里的文件。**
6. 运行：

```bash
npm install
npm run import:routes -- --dry-run
```

`npm install` 不会安装本次新增依赖，因为本次没有增加依赖；它只用于确认现有依赖完整。

## 5. 如何导入 GPX

### 导入 `public/routes/` 中的全部 GPX

```bash
npm run import:routes
```

默认行为：

- 扫描 `public/routes/` 下所有 `.gpx`，包括子目录。
- 优先读取 GPX 内部日期、时间、坐标、海拔等信息。
- 使用路线起点进行 Reverse Geocoding。
- 新 Markdown 写入 `src/content/routes/`。
- 已存在的路线只更新 Frontmatter，不覆盖正文。

### 先预览，不写文件

```bash
npm run import:routes -- --dry-run
```

建议每次批量导入前先执行此命令。

### 只导入指定 GPX

```bash
npm run import:routes -- "public/routes/Morning Run.gpx"
```

也可以传入目录：

```bash
npm run import:routes -- "public/routes/garmin-export"
```

### 无网络或不需要地点查询

```bash
npm run import:routes -- --no-geocode
```

地点会使用 `Unknown`，之后可以手动修改 Markdown 的 `location`，或网络恢复后重新导入。

### 生成英文 Route Markdown

```bash
npm run import:routes -- --lang=en
```

### 默认不发布

```bash
npm run import:routes -- --published=false
```

### 指定输出目录

```bash
npm run import:routes -- --output=src/content/routes
```

## 6. 自动生成的 Markdown

新文件命名格式：

```text
YYYYMMDD_距离_地点.md
```

示例：

```text
20260703_11.5km_shatin.md
```

实际距离以 GPS 轨迹计算结果为准。地点优先通过反向地理编码生成；无法查询时使用 `unknown`。

新 Markdown 示例：

```yaml
---
title: "Sha Tin · 路线记录"
description: "Sha Tin的一段旅行与生活记录。"
date: "2026-07-03T03:12:10.000Z"
location: "Sha Tin, Hong Kong"
distance: 11.5
duration: 6864
elevationGain: 331
gpx: "/routes/Morning Run.gpx"
published: true
tags: ["Route", "Travel Journal"]
lang: "zh-CN"
kind: "travel"
draft: false
photos: []
start: {"lat":22.0,"lng":114.0}
end: {"lat":22.1,"lng":114.1}
metadata: {}
---

## Story

<!-- 在这里写下这段旅程。重新导入 GPX 时，本段正文不会被覆盖。 -->
```

## 7. Frontmatter 维护规则

### 导入器自动维护

- `date`
- `location`（已有明确地点时会保留；`Unknown` 可在重新导入时更新）
- `distance`
- `duration`
- `elevationGain`
- `gpx`
- `start`
- `end`
- `metadata`

### 由你长期维护，重新导入不会覆盖

- `title`
- `description`
- `cover`
- `photos`
- Markdown 正文 / Story

已有 `published` 和 `tags` 也会保留；新文件才使用默认值。

## 8. 如何修改 Story

直接编辑生成的 Markdown 正文：

```markdown
## Story

这一天从沙田出发，沿着河道和山径继续向北……
```

重新运行导入器时，Frontmatter 和正文会分别处理，Story 不会被覆盖。

正文标题不强制必须为 `Story`；可以继续使用旧路线中的 `## Notes`、`## 记录` 或其他 Markdown 结构。

## 9. Cover 与 Photos

### Cover

字符串形式：

```yaml
cover: "/images/routes/shatin-cover.jpg"
```

对象形式：

```yaml
cover:
  src: "/images/routes/shatin-cover.jpg"
  alt: "沙田路线封面"
  caption: "傍晚的城门河"
```

### Photos

字符串数组：

```yaml
photos:
  - "/images/routes/shatin-01.jpg"
  - "/images/routes/shatin-02.jpg"
```

带说明的对象数组：

```yaml
photos:
  - src: "/images/routes/shatin-01.jpg"
    alt: "河边步道"
    caption: "路线前半段"
```

这些字段不会被重新导入覆盖。

## 10. 如何新增路线

1. 将任意名称的 GPX 放入 `public/routes/`：

```text
public/routes/Apple Health Export.gpx
```

2. 预览导入：

```bash
npm run import:routes -- --dry-run
```

3. 正式导入：

```bash
npm run import:routes
```

4. 打开新生成的 `src/content/routes/*.md`。
5. 修改 `title`、`description`、Story、Cover 和 Photos。
6. 运行开发服务器检查页面：

```bash
npm run dev
```

## 11. 如何重新导入路线

保持 Markdown 中的 `gpx` 指向原 GPX：

```yaml
gpx: "/routes/Apple Health Export.gpx"
```

再次运行：

```bash
npm run import:routes
```

导入器会在新旧目录中根据 `gpx` 或旧的 `routeFile` 查找对应 Markdown：

- 找到时：更新 Frontmatter，保留正文和人工维护字段。
- 未找到时：创建新的规范命名 Markdown。
- 不会因为文件名不同而覆盖无关路线。
- 重复运行不会生成同一路线的副本。

## 12. 页面展示结构

详情页顺序：

1. Cover（可选）
2. 标题和一句简介
3. 日期、地点、距离、总耗时、累计爬升
4. 地图
5. 起点、终点和 Waypoints
6. 海拔变化图
7. Story
8. Photos

页面默认不会展示：

- 平均或最大心率
- 卡路里
- 步频
- 配速
- 速度
- 功率
- VO₂ Max
- 训练负荷
- 恢复状态

部分可解析的敏感运动数据只保存在 `metadata.sensitiveMetrics` 中，为未来扩展保留，不进入默认页面。

## 13. 性能与长期维护设计

- 导入脚本和浏览器地图共用 `src/lib/routes/gpx.ts`，避免两套解析规则逐渐不一致。
- 不针对厂商名称编写单独的坐标解析分支，优先使用标准 GPX 元素与命名空间兼容匹配。
- 支持轨迹段、路线点、自闭合点元素和 Waypoints。
- 地图总览只为缺少坐标的旧条目预加载 GPX；新路线点击后再加载完整轨迹。
- 海拔图最多绘制 800 个采样点，完整轨迹仍保留用于统计和地图展示。
- Reverse Geocoding 有本地缓存：`.cache/routes/geocoding.json`。
- 新增数据源时，通常只需让导出结果进入标准 GPX 流程，不需要修改页面。

## 14. 验证结果

已完成：

- 两个现有 GPX 解析测试通过。
- 自闭合 `<trkpt />` GPX 点测试通过。
- 多段轨迹、起终点、距离、耗时和海拔统计通过。
- `scripts/import-route.ts` 与 `src/lib/routes/gpx.ts` 严格 TypeScript 检查通过。
- 实际导入测试通过。
- 重新导入测试通过，没有创建重复 Markdown。
- 旧中英文路线 Markdown 正文哈希在导入前后保持一致。
- 自定义 `title`、`cover`、`photos` 和 Story 在重新导入后保持一致。
- Route 隔离构建通过：共生成 31 个静态页面，包含新旧 Route 详情页和地图索引。
- Route 页面检查未发现心率、卡路里、配速、速度、功率等敏感指标输出。

### 完整项目现有问题

完整项目执行 `astro build` 仍会在原有博客页面 `/zh-CN/blog/2025-06-08/` 失败：

```text
Failed to parse image reference: {"inferSize":true,...}
```

未修改的原始项目也会在相同位置报同样错误，因此不是 Route System v2 引入的问题。为遵守“不要修改网站其他页面”的要求，本次未修复博客图片内容。

完整项目执行 `astro check` 仍有 9 个原有错误，位于：

- `src/components/Header.astro`
- `src/layouts/MediaLayout.astro`
- `src/lib/media/enricher.ts`
- `src/pages/[locale]/essays/[...page].astro`
- `src/pages/[locale]/research/[...page].astro`

本次 Route 相关文件没有新增 Astro TypeScript 错误。

## 15. 进一步优化建议

后续可以按优先级继续做：

1. 增加可选的本地离线地名缓存或手工地点映射表，降低对 Nominatim 的依赖。
2. 为导入器增加自动化测试夹具，分别保存 Apple Health、Garmin、Coros、Keep 等真实匿名样本。
3. Photos 自动关联时，建议通过 Route ID、日期范围和拍摄 GPS 匹配，而不是依赖文件名。
4. Apple Health 接入时，建议先转换为统一的内部 Route 数据模型，再输出 GPX 或 Route Frontmatter，避免页面直接依赖 Apple XML。
5. 大量路线场景下，可以在构建时生成轻量路线索引 JSON，地图总览无需读取完整 Content Entry。
6. 单独修复项目现有博客图片引用和 9 个 TypeScript 错误后，再执行完整仓库 CI 构建作为合并门禁。
