# 全站设计检查 · 2026-10-23

本次实际修改主站与 Web3 Lab，保留 Astro 5 静态架构、原文和中英配对。
设计源文件见 `DESIGN.md`，工作流见 `digital-garden.md`。

## 设计流程

- Impeccable：运行 context、concept-seed，按 Read 模式完成新方向和 craft-floor
  检查；确定性检测器无发现。独立 reviewer 按 finish-reviewer 协议检查实际截图；
  此运行环境没有专用 agent_type，因此使用独立代理加载 degraded review 协议。
- Taste：实际 draw 三种方向，再按真实素材约束选定 type-only；运行 source lint、
  浏览器 inspect，并查看桌面、平板、手机的首屏及全页截图，完成两轮 look-and-fix。
- UI UX Pro Max：运行设计系统生成和持久化，以及 UX / Astro 知识库检索。
  生成建议作为研究输入，最终取舍已合并到 `design-system/zoran-journal/MASTER.md`。
- Frontend Design：用于具体字体、页面构图和内容层级；Web Design Guidelines 用于
  键盘、焦点、可读性和触控检查。专业文案应用 anti-defensive-writing。
- React Bits 经评估不引入：本站没有需要 React 动画运行时的交互。
  当前提供的技能目录中没有 Emil Design Engineering。

## 浏览器验证范围

基于本地静态构建预览，不代表线上已经部署。

- 首页：1440 / 768 / 390px，署名、精选文章、生活照片、页脚；实际字体成功加载。
- 主页面：Writing、Projects、Life、About、Lab 桌面截图；Home、Writing、Life、Lab
  手机截图。采样页面 scrollWidth 等于 viewport，不存在页面横向溢出。
- 英文 Guides 与中文 Guides 互相切换仍在当前形式；英文搜索返回英文文章；
  搜索和手机导航可用 Escape 关闭。
- 长文章：移动端深色阅读、展开目录、代码复制成功；历史 H1 在渲染时转为 H2，
  新增站点检查确保每个 HTML 页面只有一个 H1。
- 书影音：书籍筛选显示七条，分类总数随筛选更新并通过 aria-live 通知。
- 摄影：大图从 1/33 切到 2/33，Escape 关闭。
- 足迹：徒步筛选切到西湖，距离、用时、详情链接与起终点同步更新。
- 英文订阅：复制得到 `/en/rss.xml` 对应地址；未向第三方提交邮箱或验证实际投递。

## 检查的边界

Taste 自动结果仍为 5 FAIL / 4 WARN，不能描述成全通过：阅读站主动不填充图片、
视频和动画配额；已有长标题允许在手机多行显示。两个 eyebrow 检测对应实际操作
链接和真实摄影 caption。其字体建议因公开仓库分发许可改为 OFL Newsreader。
灰色正文检查测得对比度 5.4，通过正文 4.5 的标准。细节见
`.taste-skill/direction-notes.md`；source lint 是 0 FAIL / 0 WARN。

构建访问部分既有远程文章图片时出现重新验证警告，已使用现有缓存成功生成图片。
本次未清空缓存验证这些远程图源的可用性；摄影原图和第三方地图仍依赖原有服务。
截图和完整代理报告在被忽略的 `.impeccable/review/`，不会混入公开资源。
