import type { Locale } from "./utils";

const en = {
  siteName: "WEB3 LAB",
  siteTagline: "Learn · Build · Document",
  returnToSite: "Zoran Zhou",
  switchLanguage: "中文",
  nav: {
    overview: "Overview",
    learning: "Learning",
    builds: "Plans",
    security: "Security",
    about: "About",
  },
  stack: {
    groups: {
      server: "SERVER",
      onchain: "ONCHAIN",
      data: "DATA",
      contracts: "CONTRACTS",
      network: "NETWORK",
    },
    note: "PLANNED SELECTION · NOT IMPLEMENTED OR VERIFIED",
  },
  detail: {
    backToLab: "Back to Web3 Lab",
    status: "STATUS",
    verification: "VERIFICATION",
    track: "TRACK",
    phase: "CURRENT PHASE",
    lastVerified: "LAST VERIFIED",
    candidateStack: "PLANNED STACK",
    technologies: "TECHNOLOGIES",
    implemented: "IMPLEMENTED FEATURES",
    noImplemented:
      "No implementation outcomes are published for this entry yet.",
    limitations: "KNOWN LIMITATIONS",
    relatedProject: "RELATED BUILD",
    evidenceBoundary: "EVIDENCE BOUNDARY",
    evidenceBoundaryText:
      "Status and verification labels describe only the evidence published on this page. They are not production-readiness or audit claims.",
  },
  statusLabels: {
    planned: "PLANNED",
    building: "BUILDING",
    prototype: "PROTOTYPE",
    testnet: "TESTNET",
    "security-review": "SECURITY REVIEW",
    completed: "COMPLETED",
    blocked: "BLOCKED",
    revised: "REVISED",
    archived: "ARCHIVED",
  },
  verificationLabels: {
    unverified: "UNVERIFIED",
    documented: "DOCUMENTED",
    tested: "TESTED",
    verified: "VERIFIED",
    theoretical: "THEORETICAL / NOT TESTED",
  },
  typeLabels: {
    learning: "LEARNING",
    build: "BUILD",
    security: "SECURITY",
    architecture: "ARCHITECTURE",
    note: "NOTE",
  },
  trackLabels: {
    integration: "WALLET INTEGRATION",
    backend: "BACKEND ENGINEERING",
    "product-security": "PRODUCT SECURITY",
    solutions: "SOLUTIONS",
  },
  badges: {
    educational: "EDUCATIONAL",
    testnetOnly: "TESTNET ONLY",
    unaudited: "UNAUDITED",
    noRealFunds: "NO REAL FUNDS",
  },
  footer: {
    returnToSite: "Return to the personal website",
  },
  home: {
    kicker: "LEARNING NOTES & ENGINEERING EXPLORATIONS",
    title: ["Starting with TypeScript.", "Growing into Web3."],
    intro:
      "A record of learning blockchain technology: building a foundation in the language, then taking questions into wallet integration, backend engineering and product security.",
    current: "CURRENT STAGE",
    learning: "Learning now",
    pending: "Up next",
    focusDeck:
      "Currently learning TypeScript. Building the foundations step by step, with exercises and observations to follow here.",
    readFocus: "Read the current learning notes",
    viewRoute: "Explore the route ahead",
    routeTitle: "Build a foundation. Then take the next step.",
    routeDeck:
      "A route to work through gradually. I am at the first stage; later directions will evolve through practice.",
    stages: [
      {
        tech: "TypeScript",
        title: "Language & types",
        outcome:
          "Types, asynchronous flows and modules, followed by typed event handling.",
      },
      {
        tech: "viem",
        title: "Connect to onchain data",
        outcome:
          "RPC interaction, log decoding and ERC-20 event normalization.",
      },
      {
        tech: "Solidity",
        title: "Understand contracts",
        outcome: "Contract foundations and a replay-protected event registry.",
      },
      {
        tech: "Foundry",
        title: "Verify through tests",
        outcome: "Unit, fuzz and invariant testing.",
      },
      {
        tech: "Sepolia",
        title: "Document the practice",
        outcome:
          "Testnet deployments, transaction hashes and verification reports.",
      },
    ],
    buildTitle: "Take the learning into a concrete project.",
    buildDeck:
      "The wallet platform is a direction for future practice, currently a record of scope and architecture plans.",
    buildLink: "Read the project plan",
    stack: "CANDIDATE STACK",
    stackNote: "Future selections, not implemented or verified.",
    securityTitle: "Keep asking security questions.",
    securityDeck:
      "Record the questions first, then reproduce and test them against an actual implementation.",
    securityLink: "Read the research note",
    aboutTitle: "Understand. Experiment. Keep a record.",
    aboutDeck:
      "WEB3 LAB is an independent space for learning and engineering notes. The current focus is TypeScript, with a longer-term interest in wallet integration, backend engineering, product security and solution design. Learning, planned projects and verified outcomes are labeled separately.",
    boundary:
      "Projects are educational, testnet-oriented, unaudited and do not handle real funds.",
    domains: [
      "Wallet integration",
      "Backend engineering",
      "Product security",
      "Solution design",
    ],
    entryTOC: "ON THIS PAGE",
    learningNotice: "LEARNING RECORD",
    learningBoundary:
      "This page records the current learning stage and next steps. Exercise code and verification results will be added when they exist.",
  },
};

export type LabCopy = typeof en;

const zhCN: LabCopy = {
  siteName: "WEB3 LAB",
  siteTagline: "学习 · 构建 · 记录",
  returnToSite: "Zoran Zhou",
  switchLanguage: "English",
  nav: {
    overview: "概览",
    learning: "学习",
    builds: "项目规划",
    security: "安全",
    about: "关于",
  },
  stack: {
    groups: {
      server: "服务端",
      onchain: "链上交互",
      data: "数据层",
      contracts: "合约与测试",
      network: "测试网络",
    },
    note: "规划选型 · 尚未实现或验证",
  },
  detail: {
    backToLab: "返回 Web3 Lab",
    status: "状态",
    verification: "验证状态",
    track: "技术方向",
    phase: "当前阶段",
    lastVerified: "最后验证",
    candidateStack: "规划技术栈",
    technologies: "技术",
    implemented: "已实现功能",
    noImplemented: "此条目尚未发布实现成果。",
    limitations: "已知限制",
    relatedProject: "关联构建",
    evidenceBoundary: "证据边界",
    evidenceBoundaryText:
      "状态和验证标签只描述本页公开的证据，不代表生产就绪或完成安全审计。",
  },
  statusLabels: {
    planned: "计划中",
    building: "构建中",
    prototype: "原型",
    testnet: "测试网",
    "security-review": "安全评审",
    completed: "已完成",
    blocked: "受阻",
    revised: "已修订",
    archived: "已归档",
  },
  verificationLabels: {
    unverified: "未验证",
    documented: "已记录",
    tested: "已测试",
    verified: "已验证",
    theoretical: "理论分析 / 未测试",
  },
  typeLabels: {
    learning: "学习",
    build: "构建",
    security: "安全",
    architecture: "架构",
    note: "笔记",
  },
  trackLabels: {
    integration: "钱包集成",
    backend: "后端工程",
    "product-security": "产品安全",
    solutions: "解决方案",
  },
  badges: {
    educational: "教育用途",
    testnetOnly: "仅限测试网",
    unaudited: "未经审计",
    noRealFunds: "不使用真实资金",
  },
  footer: {
    returnToSite: "返回个人网站",
  },
  home: {
    kicker: "学习笔记与工程探索",
    title: ["从 TypeScript 出发，", "逐步走进链上世界。"],
    intro:
      "这里记录我学习区块链技术的过程：先打好语言基础，再把问题带进钱包集成、后端工程与产品安全的实践中。",
    current: "当前阶段",
    learning: "学习中",
    pending: "后续计划",
    focusDeck:
      "当前在学习 TypeScript。一步一步建立基础，练习与思考会在这里持续记录。",
    readFocus: "阅读当前学习记录",
    viewRoute: "看看后续方向",
    routeTitle: "先把基础打牢，再向前一步。",
    routeDeck:
      "一条逐步推进的学习路线。当前处于第一阶段，后续方向会随实践继续调整。",
    stages: [
      {
        tech: "TypeScript",
        title: "语言与类型基础",
        outcome: "类型系统、异步流程与模块组织；逐步练习类型化事件处理。",
      },
      {
        tech: "viem",
        title: "连接链上数据",
        outcome: "RPC 交互、日志解析与 ERC-20 事件标准化。",
      },
      {
        tech: "Solidity",
        title: "理解合约边界",
        outcome: "合约基础与防重放事件登记。",
      },
      {
        tech: "Foundry",
        title: "用测试验证",
        outcome: "单元测试、模糊测试与不变量测试。",
      },
      {
        tech: "Sepolia",
        title: "留下实践记录",
        outcome: "测试网部署、交易哈希与验证报告。",
      },
    ],
    buildTitle: "把学习带进一个具体项目。",
    buildDeck: "钱包平台是后续实践的载体，目前保留为范围与架构规划。",
    buildLink: "阅读项目规划",
    stack: "候选技术栈",
    stackNote: "后续选型，尚未实现或验证。",
    securityTitle: "带着安全问题继续学习。",
    securityDeck: "先记录值得验证的问题，等有实际实现后再复现和测试。",
    securityLink: "阅读研究笔记",
    aboutTitle: "理解系统，动手尝试，认真记录。",
    aboutDeck:
      "WEB3 LAB 是一个独立的学习与工程记录空间。当前重心是 TypeScript，长期关注钱包集成、后端工程、产品安全与解决方案设计。学习过程、项目规划和已验证的结果会分别标明。",
    boundary: "项目用于教育与测试网探索，未经审计，不涉及真实资金。",
    domains: ["钱包集成", "后端工程", "产品安全", "解决方案"],
    entryTOC: "本页目录",
    learningNotice: "学习状态记录",
    learningBoundary:
      "本页记录当前学习阶段与后续计划。练习代码和验证结果将在实际产出后补充。",
  },
};

export function getLabTranslations(locale: Locale): LabCopy {
  return locale === "en" ? en : zhCN;
}
