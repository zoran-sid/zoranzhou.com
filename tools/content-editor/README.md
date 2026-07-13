# 本地内容管理台

这是一个零数据库、零账号的本地 Node.js + 浏览器编辑器，用于直接维护仓库中的 Markdown / MDX。它不属于 Astro 站点，也不会进入 Cloudflare 构建或提供公网写文件接口。

## 启动

在仓库根目录运行：

```powershell
npm run editor
```

Windows 会自动打开 `http://127.0.0.1:4322`。PowerShell 若阻止 `npm.ps1`，改用：

```powershell
npm.cmd run editor
```

设置 `EDITOR_NO_OPEN=1` 可以禁止自动打开浏览器；设置 `EDITOR_PORT` 可以更换端口。若提示端口被占用，请在旧编辑器终端按 `Ctrl+C`，或换一个端口再启动。

## 日常操作

- 左侧选择 Blog、Essays、Research、Projects、Photos 或 Routes；可以搜索、编辑、重命名和删除。Routes 必须从 GPX 生成，避免创建缺少必填路线字段的空内容。
- 标题、日期、语言、摘要、标签等使用表单填写。正文默认进入类似 Typora 的“可视化”模式，可用鼠标设置标题、粗体、斜体、删除线、引用、列表、链接和表格，也可插入图片与 GPX。
- “源码 / MDX”始终保留项目原有 Markdown / MDX 作为唯一存储格式；“阅读预览”用于保存前检查效果，不会执行 MDX 组件。
- 若正文包含 JSX/HTML、MDX 表达式、指令、脚注、任务/嵌套列表、数学公式、表格对齐等无法可靠双向转换的语法，工具会自动停留在“源码 / MDX”并说明原因。转换失败时会阻止保存；只有明确确认后才会放弃未转换的可视化修改，不会静默重写高级语法。
- 可视化模式保存的是语义等价的规范化 Markdown，可能统一空行、列表符号等源码排版；需要逐字符控制源码时请直接使用“源码 / MDX”。未编辑正文时不会触发可视化重写。
- `Ctrl+S` 保存，`Ctrl+B` / `Ctrl+I` 设置粗体 / 斜体。切换文章、关闭页面或刷新时会提示未保存修改。
- 高级 frontmatter 会保留未知、嵌套和 collection 专用字段。覆盖、重命名和删除内容前都会备份。
- “Git / 检查”只显示内容 Git 状态，或手动运行项目检查；不会 commit、push 或发布。“快速检查”验证 Astro 内容/schema 和类型；“部署前构建（较慢）”编译完整网站到 Cloudflare 发布目录 `dist/`，并实时显示耗时和增量日志。

`npm run build` 不是 GPX 转 Markdown 命令，日常写作不必每次运行，部署前再运行即可。GPX 转 Route 内容请使用“素材库”的“生成/更新路线”，或在仓库根目录运行 `npm run import:routes`。

## PicGo 图片

1. 在 PicGo 中先配置好自己的图床。
2. 点击编辑器右上角“设置”。
3. 只填写本机 `PicGo.exe` 的绝对路径并保存。
4. 点击“图片”、把图片拖进可视化或源码正文，或直接粘贴剪贴板图片。

编辑器优先使用 PicGo 的本机 `127.0.0.1:36677` 接口；如果接口没有开启，会自动调用官方的 `PicGo.exe upload <file>` 命令，并读取 PicGo 写入剪贴板的链接。原始临时图片无论成功或失败都会删除。支持 PNG、JPEG、GIF、WebP、AVIF 和 BMP，单张最多 20 MiB。PicGo 路径只保存在被 Git 忽略的 `tools/content-editor/local-settings.json`。

## GPX 素材

点击“GPX”可把文件安全导入 `public/routes/` 并在当前正文插入链接。“素材库”可查看已有 GPX、复用链接、打开 Windows 资源管理器或删除文件。选择路线语言后点击“生成/更新路线”，编辑器会调用项目现有 Route importer，解析距离、时间、海拔、起终点等字段并创建或更新 `src/content/routes/`；已有路线正文不会被 importer 覆盖，更新前会先备份现有 Route 内容。

- 只接受完整 UTF-8 GPX XML，单个文件最多 25 MiB。
- 同名或大小写冲突会被拒绝，不会静默覆盖。
- 写入时先完成同目录临时文件，再原子发布。
- 删除前备份到 `tools/content-editor/backups/`；删除仍可能使引用该文件的路线页面失效，请先确认引用关系。

## 安全边界

- HTTP 服务只绑定 `127.0.0.1`，不绑定 `0.0.0.0`。
- POST 请求要求同源、随机会话令牌和 JSON；Host、路径、扩展名、文件类型与大小都经过检查。
- 内容写入只允许 `src/content/` 下的明确 collection；GPX 只允许 `public/routes/`。路径穿越、符号链接和 junction 会被拒绝。
- CI 或 Cloudflare Pages 环境变量存在时，服务器会拒绝启动。
- `tools/content-editor/` 没有被 Astro import，也没有放在 `src/pages`、`public` 或 Cloudflare Functions 中。
- 本地设置、临时文件和备份都已加入工具目录自己的 `.gitignore`。

开发或升级编辑器后可运行 `npm run test:editor`，它会临时验证浏览器资源、内容 CRUD、ISO 日期/未知 frontmatter 保留、坏文件隔离，以及 GPX 导入、Route 生成和备份清理；测试内容会在结束时删除。
