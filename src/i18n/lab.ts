import type { Locale } from "./utils";

export interface LabTrackCopy {
  code: string;
  title: string;
  description: string;
  topics: string[];
}

export interface LabCopy {
  siteName: string;
  siteTagline: string;
  returnToSite: string;
  switchLanguage: string;
  nav: {
    overview: string;
    learning: string;
    builds: string;
    security: string;
    about: string;
  };
  hero: {
    kicker: string;
    title: string;
    description: string;
    primary: string;
    secondary: string;
    systemTitle: string;
    codeBoundary: string;
  };
  boundaries: string[];
  tracks: {
    label: string;
    title: string;
    description: string;
    items: LabTrackCopy[];
  };
  builds: {
    label: string;
    title: string;
    description: string;
    featured: string;
    status: string;
    phase: string;
    candidateStack: string;
    implemented: string;
    noImplemented: string;
    view: string;
  };
  learning: {
    label: string;
    title: string;
    description: string;
    log: string;
    verified: string;
    evidence: string[];
    noPublicOutcomes: string;
    nextGate: string;
  };
  security: {
    label: string;
    title: string;
    description: string;
    theoryNotice: string;
    view: string;
  };
  about: {
    label: string;
    title: string;
    paragraphs: string[];
    principles: string[];
  };
  detail: {
    backToLab: string;
    status: string;
    verification: string;
    track: string;
    phase: string;
    lastVerified: string;
    candidateStack: string;
    technologies: string;
    implemented: string;
    noImplemented: string;
    limitations: string;
    relatedProject: string;
    evidenceBoundary: string;
    evidenceBoundaryText: string;
  };
  statusLabels: Record<string, string>;
  verificationLabels: Record<string, string>;
  typeLabels: Record<string, string>;
  trackLabels: Record<string, string>;
  badges: {
    educational: string;
    testnetOnly: string;
    unaudited: string;
    noRealFunds: string;
  };
  footer: {
    boundary: string;
    returnToSite: string;
  };
}

const en: LabCopy = {
  siteName: "WEB3 LAB",
  siteTagline: "Build · Test · Document",
  returnToSite: "Zoran Zhou",
  switchLanguage: "中文",
  nav: {
    overview: "Overview",
    learning: "Learning",
    builds: "Builds",
    security: "Security",
    about: "About",
  },
  hero: {
    kicker: "INDEPENDENT TECHNICAL SUBSITE / V1",
    title: "Building secure systems for the onchain world.",
    description:
      "Wallet Integration · Backend Engineering · Product Security · Solution Architecture",
    primary: "Inspect the featured build",
    secondary: "View learning outcomes",
    systemTitle: "SECURE EVENT HANDLER",
    codeBoundary: "REFERENCE PATTERN · NOT AN IMPLEMENTATION CLAIM",
  },
  boundaries: [
    "BUILDING IN PUBLIC",
    "STATIC TECH LAB",
    "TESTNET PROJECTS",
    "NO REAL FUNDS",
  ],
  tracks: {
    label: "04 / TECHNICAL TRACKS",
    title: "Four technical domains. One engineering system.",
    description:
      "The Lab organizes work by the systems being built and validated, not by market narratives or token activity.",
    items: [
      {
        code: "01 / INTEGRATION",
        title: "Wallet Integration",
        description:
          "Connect product workflows to wallet APIs, custody interfaces, RPC providers, webhooks, and transaction lifecycles.",
        topics: [
          "Wallet APIs",
          "Blockchain RPC",
          "Webhooks",
          "Transaction lifecycle",
        ],
      },
      {
        code: "02 / BACKEND",
        title: "Backend Engineering",
        description:
          "Design predictable asset workflows with explicit state, consistency boundaries, retries, and recovery paths.",
        topics: ["TypeScript", "NestJS", "PostgreSQL", "Idempotency"],
      },
      {
        code: "03 / SECURITY",
        title: "Product Security",
        description:
          "Test authorization, signatures, wallet business logic, threat boundaries, and security regressions.",
        topics: [
          "API security",
          "Threat modeling",
          "Signature security",
          "Regression tests",
        ],
      },
      {
        code: "04 / SOLUTIONS",
        title: "Solutions",
        description:
          "Turn requirements into explainable proofs of concept, architecture decisions, and technical documentation.",
        topics: [
          "Architecture",
          "Integration design",
          "Proof of concept",
          "Documentation",
        ],
      },
    ],
  },
  builds: {
    label: "BUILD / 001",
    title: "Featured build",
    description:
      "The long-term center of the Lab: implementations, evidence, constraints, and decisions that can be inspected.",
    featured: "FEATURED BUILD",
    status: "STATUS",
    phase: "CURRENT PHASE",
    candidateStack: "CANDIDATE STACK",
    implemented: "IMPLEMENTED",
    noImplemented: "No features are claimed as implemented yet.",
    view: "Open build record",
  },
  learning: {
    label: "LEARNING / PUBLIC OUTCOMES",
    title: "Learning outcomes, published when they can be verified.",
    description:
      "Public entries focus on concrete outputs, problems encountered, security findings, related code, and the date each result was last verified.",
    log: "EVIDENCE LOG",
    verified: "verified public outcomes",
    evidence: ["IMPLEMENTATION", "TESTS", "SECURITY FINDINGS", "DOCUMENTATION"],
    noPublicOutcomes:
      "No learning outcome is currently claimed as verified. Entries will appear only after there is a concrete implementation or documented result.",
    nextGate: "NEXT PUBLICATION GATE / IMPLEMENT → TEST → DOCUMENT",
  },
  security: {
    label: "SECURITY / ATTACK SURFACE",
    title: "Security work stays attached to real workflows.",
    description:
      "Analysis is separated from tested evidence. A case becomes tested or verified only when reproduction and regression evidence exists.",
    theoryNotice: "THEORETICAL ANALYSIS · NOT IMPLEMENTATION-TESTED",
    view: "Read the security case",
  },
  about: {
    label: "ABOUT / OPERATING PRINCIPLES",
    title: "A technical record of builds, validation, and system boundaries.",
    paragraphs: [
      "Web3 Lab is an independent technical subsite for documenting wallet integration, digital asset backend engineering, product security, and solution architecture through concrete work.",
      "The Lab prioritizes practical implementation, security validation, architecture decisions, and documented engineering outcomes. Learning, building, testing, and completed work are labeled separately.",
      "Current work is educational, testnet-oriented, unaudited, and does not handle real funds.",
    ],
    principles: [
      "Build concrete prototypes",
      "Validate security claims",
      "Document decisions and limits",
      "Keep evidence boundaries explicit",
    ],
  },
  detail: {
    backToLab: "Back to Web3 Lab",
    status: "STATUS",
    verification: "VERIFICATION",
    track: "TRACK",
    phase: "CURRENT PHASE",
    lastVerified: "LAST VERIFIED",
    candidateStack: "CANDIDATE STACK",
    technologies: "TECHNOLOGIES",
    implemented: "IMPLEMENTED FEATURES",
    noImplemented: "No implementation is claimed for this entry yet.",
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
    boundary: "STATIC-FIRST · EDUCATIONAL · TESTNET-ORIENTED · NO REAL FUNDS",
    returnToSite: "Return to the personal website",
  },
};

const zhCN: LabCopy = {
  siteName: "WEB3 LAB",
  siteTagline: "构建 · 测试 · 记录",
  returnToSite: "Zoran Zhou",
  switchLanguage: "English",
  nav: {
    overview: "概览",
    learning: "学习",
    builds: "构建",
    security: "安全",
    about: "关于",
  },
  hero: {
    kicker: "独立技术子站 / V1",
    title: "构建并保护面向链上世界的数字资产系统。",
    description: "钱包集成 · 后端工程 · 产品安全 · 解决方案架构",
    primary: "查看重点构建",
    secondary: "查看学习成果",
    systemTitle: "安全事件处理示例",
    codeBoundary: "参考模式 · 不代表已完成实现",
  },
  boundaries: ["公开构建", "静态技术实验室", "测试网项目", "不使用真实资金"],
  tracks: {
    label: "04 / 技术方向",
    title: "四个技术能力域，一套工程系统。",
    description:
      "Lab 按照正在构建和验证的系统组织内容，而不是围绕市场叙事或代币活动组织。",
    items: [
      {
        code: "01 / 集成",
        title: "钱包集成",
        description:
          "将产品流程连接到钱包 API、托管接口、RPC 服务、Webhook 与交易生命周期。",
        topics: ["钱包 API", "区块链 RPC", "Webhook", "交易生命周期"],
      },
      {
        code: "02 / 后端",
        title: "后端工程",
        description:
          "通过明确的状态、事务边界、重试与恢复路径，设计可预测的数字资产流程。",
        topics: ["TypeScript", "NestJS", "PostgreSQL", "幂等性"],
      },
      {
        code: "03 / 安全",
        title: "产品安全",
        description: "测试授权、签名、钱包业务逻辑、信任边界与安全回归。",
        topics: ["API 安全", "威胁建模", "签名安全", "回归测试"],
      },
      {
        code: "04 / 方案",
        title: "解决方案",
        description: "把需求转化为可解释的概念验证、架构决策与技术文档。",
        topics: ["架构设计", "集成设计", "概念验证", "技术文档"],
      },
    ],
  },
  builds: {
    label: "构建 / 001",
    title: "重点构建",
    description: "Lab 的长期核心：展示可以检查的实现、证据、边界与工程决策。",
    featured: "重点构建",
    status: "状态",
    phase: "当前阶段",
    candidateStack: "候选技术栈",
    implemented: "已实现",
    noImplemented: "目前没有声称任何功能已经实现。",
    view: "打开构建记录",
  },
  learning: {
    label: "学习 / 公开成果",
    title: "学习成果，仅在可以验证时发布。",
    description:
      "公开条目聚焦具体产出、遇到的问题、安全发现、相关代码，以及每项结果的最后验证日期。",
    log: "证据记录",
    verified: "项已验证公开成果",
    evidence: ["具体实现", "测试结果", "安全发现", "技术文档"],
    noPublicOutcomes:
      "目前没有学习成果被标记为已验证。只有在存在具体实现或可记录结果后，公开条目才会出现。",
    nextGate: "下一发布门槛 / 实现 → 测试 → 记录",
  },
  security: {
    label: "安全 / 攻击面",
    title: "安全工作始终依附于真实流程。",
    description:
      "分析与测试证据明确分开。只有具备复现和回归证据，安全案例才会标记为已测试或已验证。",
    theoryNotice: "理论分析 · 尚未通过实现测试",
    view: "阅读安全案例",
  },
  about: {
    label: "关于 / 实践原则",
    title: "记录数字资产系统的构建、验证与工程边界。",
    paragraphs: [
      "Web3 Lab 是一个独立技术子站，通过具体工作记录钱包集成、数字资产后端工程、产品安全与解决方案架构。",
      "Lab 优先展示实践实现、安全验证、架构决策与可记录的工程成果，并明确区分学习、构建、测试和完成状态。",
      "当前工作用于教育与测试网环境，未经审计，也不处理真实资金。",
    ],
    principles: [
      "构建具体原型",
      "验证安全结论",
      "记录决策与限制",
      "明确证据边界",
    ],
  },
  detail: {
    backToLab: "返回 Web3 Lab",
    status: "状态",
    verification: "验证状态",
    track: "技术方向",
    phase: "当前阶段",
    lastVerified: "最后验证",
    candidateStack: "候选技术栈",
    technologies: "技术",
    implemented: "已实现功能",
    noImplemented: "此条目目前不声称存在已完成实现。",
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
    boundary: "静态优先 · 教育用途 · 面向测试网 · 不使用真实资金",
    returnToSite: "返回个人网站",
  },
};

const labTranslations: Record<Locale, LabCopy> = {
  "zh-CN": zhCN,
  en,
};

export function getLabTranslations(locale: Locale): LabCopy {
  return labTranslations[locale] ?? labTranslations["zh-CN"];
}
