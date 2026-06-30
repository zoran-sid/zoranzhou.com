import type { UIStrings } from "./utils";

const zhCN: UIStrings = {
  // ── Site ──
  siteTitle: "Coding构筑世界 · 以文字记录一路所学",
  siteDescription: "网络与网络安全工程师。构建弹性系统，分享一路所学。",
  siteAuthor: "Zoran Zhou",
  siteTagline: "构建弹性系统，分享一路所学。",

  // ── Navigation ──
  navHome: "首页",
  navBlog: "博客",
  navEssays: "随笔",
  navResearch: "研究",
  navProjects: "项目",
  navTags: "标签",
  navTools: "工具",
  navSearch: "搜索",

  // ── Language ──
  langLabel: "语言",
  langZhCN: "中文",
  langEn: "English",

  // ── Theme ──
  themeToggle: "切换主题",
  themeLight: "浅色",
  themeDark: "深色",

  // ── Homepage: Hero ──
  heroBadge: "寻求机会中",
  heroKicker: "网络安全工程师",
  heroTitleLine1: "Coding构筑世界",
  heroTitleLine2: "以文字记录一路所学",
  heroDescription: "网络与网络安全工程师。我构建弹性基础设施，进行威胁狩猎，并记录一路所学。",
  heroReadBlog: "阅读博客",
  heroGetInTouch: "联系我",

  // ── Homepage: About ──
  aboutLabel: "关于",
  aboutHeadline: "网络与安全工程师",
  aboutParagraphs: [
    "我为大型企业环境设计和运营安全、弹性的网络架构。持有 Cisco Enterprise 和 CISP-PTE 认证，专注于基础设施可靠性与进攻性安全的交叉领域。",
    "在日常运维之外，我参与了多个国家级网络安全项目——威胁狩猎、系统加固，并构建了可规模化落地的防御工具。",
    "这个网站是我记录技术深度研究、分享经验教训、探索网络、安全与系统工程边界的地方。",
  ],

  // ── Homepage: Latest Articles ──
  latestArticlesLabel: "近期文章",
  latestArticlesHeading: "来自博客",
  latestArticlesViewAll: "查看全部文章",
  latestArticlesEmpty: "暂无文章。",
  latestArticlesMinRead: "分钟阅读",

  // ── Homepage: Featured Research ──
  researchLabel: "研究",
  researchHeading: "深度研究与分析",
  researchDeck: "深入的技术调查、架构评审和安全研究。",
  researchViewAll: "查看全部研究",
  researchEmpty: "暂无已发布的研究。",

  // ── Homepage: Working On ──
  workingOnLabel: "正在进行",
  workingOnHeading: "当前研究与项目",
  workingOnDeck: "正在进行的研究和我正在构建的工具。",
  workingOnResearchQueue: "研究队列",
  workingOnBuildQueue: "构建队列",
  workingOnNoActiveResearch: "暂无活跃研究。",
  workingOnNoActiveProjects: "暂无活跃项目。",

  // ── Homepage: Projects ──
  projectsLabel: "项目",
  projectsHeading: "我构建的东西",
  projectsEmpty: "暂无项目。",

  // ── Homepage: Skills ──
  skillsLabel: "专业技能",
  skillsHeading: "技能与技术",

  // ── Homepage: Timeline ──
  timelineLabel: "旅程",
  timelineHeading: "时间线",

  // ── Homepage: Contact ──
  contactLabel: "联系",
  contactHeadline: "一起合作吧。",
  contactSubtext: "欢迎合作、咨询和有意义的交流。通过邮件或在以下平台找到我。",

  // ── Blog ──
  blogTitle: "博客",
  blogDescription: "思考、教程和个人笔记。",
  blogEmpty: "暂无文章。",
  blogMinRead: "分钟阅读",

  // ── Essays ──
  essaysTitle: "随笔",
  essaysDescription: "书评、反思和阅读笔记。",
  essaysEmpty: "暂无随笔。",

  // ── Research ──
  researchPageTitle: "研究",
  researchPageDescription: "深度研究、分析和技术调查。",
  researchPageEmpty: "暂无已发布的研究。",
  researchStatusInProgress: "进行中",
  researchStatusCompleted: "已完成",
  researchStatusArchived: "已归档",

  // ── Projects ──
  projectsPageTitle: "项目",
  projectsPageDescription: "我构建和参与的东西。",

  // ── Tools ──
  toolsPageTitle: "工具",
  toolsPageDescription: "我使用和推荐的工具和软件。",
  toolsCategoryCli: "命令行",
  toolsCategoryGui: "图形界面",
  toolsCategorySaas: "SaaS",
  toolsCategoryLibrary: "库",
  toolsCategoryHardware: "硬件",
  toolsPricingFree: "免费",
  toolsPricingFreemium: "增值",
  toolsPricingPaid: "付费",
  toolsPricingOpenSource: "开源",

  // ── Tags ──
  tagsTitle: "标签",
  tagsDescription: "按主题浏览内容。",
  tagsEmpty: "暂无标签。",
  tagsPostCount: (n: number) => `${n} 篇文章`,
  tagsNoPosts: "未找到文章。",

  // ── Blog Post ──
  postTableOfContents: "目录",
  postPrevious: "← 上一篇",
  postNext: "下一篇 →",
  postRelatedArticles: "相关文章",
  postMinRead: "分钟阅读",
  postWords: "字",
  postUpdated: "更新于",
  postAuthor: "作者",

  // ── 404 ──
  notFoundTitle: "404 — 未找到",
  notFoundHeading: "页面未找到。",
  notFoundBackHome: "← 返回首页",

  // ── Search ──
  searchPlaceholder: "搜索文章...",
  searchLoading: "加载中...",
  searchNoResults: "未找到与 \"{query}\" 相关的结果",
  searchTypePrompt: "输入标题搜索",
  searchNavigate: "导航",
  searchOpen: "打开",
  searchButton: "搜索",

  // ── Pagination ──
  paginationPrev: "← 上一页",
  paginationNext: "下一页 →",
  paginationPage: "第 {current} 页，共 {total} 页",

  // ── Footer ──
  footerRss: "RSS 订阅",
  copyright: "CC BY-SA 4.0",

  // ── Common ──
  commonAnd: "和",
  commonBy: "作者",
  commonReadMore: "阅读更多",
  commonViewAll: "查看全部",
};

export default zhCN;
