# 2026-10-23 仓库审计与实施记录

- 实际安装：Astro 5.18.2 / MDX 4.3.14 / Tailwind 4.3.1 / TypeScript 5.9.3；npm，静态构建。
- 路由：`/[locale]`，zh-CN/en；Blog/Essays/Research/Projects/Photos/Map/Media/Lab；BaseLayout、BlogPostLayout 和独立 LabLayout。
- 内容文件：Blog 20、Essays 11、Research 2、Projects 1（NetGuard 草稿）、Photos 3、Routes 14、Lab 6；保留全部旧文件。
- 配对：同 collection 下公开且唯一的 translationKey；路线按 routeId；找不到译文时退回语言列表。
- SEO：BaseLayout canonical/hreflang/OG/JSON-LD；sitemap 集成；中英文独立 RSS，仅文章聚合；搜索 JSON 过滤草稿。
- Cloudflare：wrangler.toml 的 pages_build_output_dir=dist；只有根语言重定向 Pages Function；仓库没有网站部署工作流，Git 集成实际生产分支需在控制台确认。
- Git：公开仓库、默认 main；开始时只有 src/content/media.md 未提交，本轮保留其内容。
- 图片：Astro assets、本地照片自动发现、远程文章图；public 资源会直接公开。新捕获文件和图片必须放在外部 Inbox。

## 文件级实现

1. `scripts/content/{core,cli,privacy}.mjs`、`content.test.mjs`、package scripts：私人捕获、单篇准备、检查、显式审核与图片复制。
2. `content/config.ts`、`lib/content-policy.ts`、各内容 consumer：可选形式与成熟度，新格式需要 approved，旧格式兼容。
3. `blog/formats/[format]/[...page].astro`、WritingArchive、ArticleRow、BlogPostLayout：独立形式入口和轻量 Notes 阅读。
4. HeroSection、首页、now.ts、home.css/reading.css：身份与 Now、Notes、精选长文、真实实践与生活。
5. `docs/digital-garden.md`、PRODUCT.md、DESIGN.md、Agent.md：长期维护与审核发布流程。

## Skills

可用：frontend-design、ui-ux-pro-max、react-bits、impeccable、karpathy-guidelines、web-design-guidelines、design-system、ui-styling。
emil-design-eng 未在提供的技能目录中发现，未安装。主要采用 frontend-design / ui-ux-pro-max / impeccable，工程采用 karpathy；规范按 web-design-guidelines 审查。React Bits 仅评估：此 Astro 阅读站不需要增加 React 动画运行时。design-system / ui-styling 的职责由现有 tokens 与主要设计技能覆盖。
