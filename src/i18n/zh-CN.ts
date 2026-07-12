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
  navMedia: "媒体",
  navEssays: "随笔",
  navResearch: "研究",
  navProjects: "项目",
  navHomelab: "实验室",
  navGear: "装备",
  navPhotos: "摄影",
  navMap: "足迹",
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
  heroDescription: "网络与安全工程师，专注于安全基础设施、自动化与应用研究。",
  heroReadBlog: "阅读博客",
  heroGetInTouch: "联系我",

  // ── Homepage: About ──
  aboutLabel: "关于",
  aboutHeadline: "网络与安全工程师",
  aboutParagraphs: [
    "我设计并运营安全、弹性的网络基础设施，关注可靠性与安全工程的交叉领域。",
    "我的技术实践涵盖网络工程、Web 安全测试、终端安全运营、系统加固与实用自动化。",
    "这个网站是我记录技术研究、工作实践、学习过程与生活经历的地方。",
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
  projectsViewAll: "查看全部项目",

  // ── Homepage: Skills ──
  skillsLabel: "专业技能",
  skillsHeading: "技能与技术",
  skillsGroups: [
    {
      category: "进攻性安全与 Web 测试",
      items: [
        "Web 应用渗透测试",
        "Burp Suite",
        "Metasploit",
        "SQLMap",
        "身份认证与权限测试",
        "业务逻辑测试",
        "漏洞评估",
        "安全配置审查",
        "修复验证",
        "安全代码审查基础",
      ],
    },
    {
      category: "网络工程与多厂商平台",
      items: [
        "BGP / MPLS / VLAN",
        "路由与交换",
        "网络分段",
        "园区网络设计",
        "SDN 部署概念",
        "防火墙策略设计",
        "网络流量分析",
        "Cisco / Huawei / ZTE / H3C",
      ],
    },
    {
      category: "系统、自动化与安全运营",
      items: [
        "Python / Shell / PowerShell",
        "Windows 与 Linux 运维",
        "终端安全运营",
        "Trellix ePO 管理",
        "终端策略编排",
        "安全部署自动化",
        "IDS / IPS 与 SIEM 运营",
        "漏洞修复流程",
        "事件响应支持",
      ],
    },
  ],

  // ── Homepage: Timeline ──
  timelineLabel: "旅程",
  timelineHeading: "时间线",

  // ── Homepage: Contact ──
  contactLabel: "联系",
  contactHeadline: "一起合作吧。",
  contactSubtext: "欢迎合作、咨询和有意义的交流。通过邮件或在以下平台找到我。",

  // ── Blog ──
  blogTitle: "博客",
  blogDescription:
    "教程、实践经验与技术观点。重在清晰解释和立即可用，不要求完整的实验论证。",
  blogEmpty: "暂无文章。",
  blogMinRead: "分钟阅读",

  // ── Essays ──
  essaysTitle: "随笔",
  essaysDescription: "书评、反思和阅读笔记。",
  essaysEmpty: "暂无随笔。",

  // ── Media ──
  mediaTitle: "影音",
  mediaDescription: "电影、剧集、书籍与游戏——我所欣赏的作品。",
  mediaIntro:
    "这里记录了我看过的电影、追过的剧集、读过的书和玩过的游戏。这是我的输入，塑造了我的思考与品味。",
  mediaCategoryMovies: "电影",
  mediaCategoryTV: "剧集",
  mediaCategoryBooks: "书籍",
  mediaCategoryGames: "游戏",
  mediaAll: "全部",
  mediaEmpty: "暂无内容。",
  mediaName: "名称",
  mediaYear: "年份",
  mediaRating: "评分",
  mediaStatus: "状态",
  mediaType: "类型",
  mediaTotal: "共 {count} 个条目",
  mediaStatusWatched: "已看",
  mediaStatusWatching: "在看",
  mediaStatusWantToWatch: "想看",
  mediaStatusCompleted: "已通关",
  mediaStatusPlaying: "在玩",
  mediaStatusWantToPlay: "想玩",
  mediaStatusRead: "已读",
  mediaStatusReading: "在读",
  mediaStatusWantToRead: "想读",
  mediaStatusDropped: "弃了",
  mediaStatusOnHold: "暂停",
  mediaDirector: "导演",
  mediaAuthor: "作者",
  mediaDeveloper: "开发商",
  mediaPublisher: "发行商",
  mediaCountry: "国家/地区",
  mediaGenres: "类型",
  mediaRuntime: "时长",
  mediaLanguage: "语言",
  mediaSeasons: "季",
  mediaPages: "页",
  mediaPlatform: "平台",
  mediaWatchedDate: "观看日期",
  mediaOriginalTitle: "原名",
  mediaMyReview: "我的评价",
  mediaStory: "剧情",
  mediaCharacters: "角色",
  mediaVisuals: "画面",
  mediaMusic: "音乐",
  mediaPersonalThoughts: "个人感想",
  mediaRecommendation: "推荐",
  mediaRelated: "相关推荐",
  mediaBackToMedia: "← 返回影音",

  // ── Research ──
  researchPageTitle: "研究",
  researchPageDescription:
    "问题驱动的深度分析：记录方法、数据、实验、来源与边界，让结论可以被追溯和复核。",
  researchPageEmpty: "暂无已发布的研究。",
  researchStatusInProgress: "進行中",
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

  // ── Homelab ──
  homelabPageTitle: "实验室",
  homelabPageDescription:
    "真实环境的持续运行日志：记录网络与服务器的拓扑、配置、变更、故障和复盘。",
  homelabEmpty: "暂无实验室记录。",
  homelabAreaNetwork: "网络",
  homelabAreaServer: "服务器",
  homelabAreaSecurity: "安全",
  homelabAreaAutomation: "自动化",
  homelabAreaStorage: "存储",
  homelabAreaObservability: "可观测性",
  homelabStatusPlanned: "计划中",
  homelabStatusBuilding: "搭建中",
  homelabStatusRunning: "运行中",
  homelabStatusRetired: "已退役",

  // ── Gear ──
  gearPageTitle: "装备",
  gearPageDescription: "我正在使用、测试或惦记的数码、摄影与运动装备。",
  gearEmpty: "暂无装备记录。",
  gearCategoryComputer: "电脑",
  gearCategoryCamera: "相机",
  gearCategoryPhone: "手机",
  gearCategoryAudio: "音频",
  gearCategoryNetwork: "网络",
  gearCategoryEdc: "EDC",
  gearCategorySport: "运动",
  gearCategoryOther: "其他",
  gearStatusUsing: "使用中",
  gearStatusTesting: "测试中",
  gearStatusRetired: "已退役",
  gearStatusWishlist: "愿望清单",

  // ── Photos ──
  photosPageTitle: "摄影",
  photosPageDescription: "一些日常、旅行、街头和运动中的照片记录。",
  photosEmpty: "暂无摄影记录。",
  photosLocation: "地点",
  photosCamera: "器材",

  // ── Map ──
  mapPageTitle: "足迹",
  mapPageDescription: "记录我跑过的线路、走过的城市、旅行过的地方。",
  mapEmpty: "暂无已标记的地图足迹。",
  mapKindRun: "跑步",
  mapKindHike: "徒步",
  mapKindRide: "骑行",
  mapKindTravel: "旅行",
  mapKindPhotoWalk: "扫街",
  mapDistance: "距离",
  mapDuration: "时长",

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
  searchNoResults: '未找到与 "{query}" 相关的结果',
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
