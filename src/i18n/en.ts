import type { UIStrings } from "./utils";

const en: UIStrings = {
  // ── Site ──
  siteTitle: "Coding the World · Documenting What I Learn",
  siteDescription:
    "Network & cybersecurity engineer. Building resilient systems, sharing what I learn.",
  siteAuthor: "Zoran Zhou",
  siteTagline: "Building resilient systems, sharing what I learn.",

  // ── Navigation ──
  navHome: "Home",
  navBlog: "Blog",
  navEssays: "Essays",
  navResearch: "Research",
  navProjects: "Projects",
  navTags: "Tags",
  navTools: "Tools",
  navSearch: "Search",

  // ── Language ──
  langLabel: "Language",
  langZhCN: "中文",
  langEn: "English",

  // ── Theme ──
  themeToggle: "Toggle theme",
  themeLight: "Light",
  themeDark: "Dark",

  // ── Homepage: Hero ──
  heroBadge: "Available for opportunities",
  heroKicker: "Network security engineer",
  heroTitleLine1: "Coding the World",
  heroTitleLine2: "Documenting what I learn along the way",
  heroDescription:
    "Network & cybersecurity engineer. I build resilient infrastructure, hunt threats, and write about what I learn along the way.",
  heroReadBlog: "Read the blog",
  heroGetInTouch: "Get in touch",

  // ── Homepage: About ──
  aboutLabel: "About",
  aboutHeadline: "Network & Security Engineer",
  aboutParagraphs: [
    "I design and operate secure, resilient network architectures for large-scale enterprise environments. With Cisco Enterprise and CISP-PTE certifications, I focus on the intersection of infrastructure reliability and offensive security.",
    "Beyond day-to-day operations, I've contributed to several national-level cybersecurity initiatives — hunting threats, hardening systems, and building tooling that makes defense practical at scale.",
    "This site is where I document technical deep-dives, share hard-won lessons, and explore ideas at the boundary of networking, security, and systems engineering.",
  ],

  // ── Homepage: Latest Articles ──
  latestArticlesLabel: "Recent Writing",
  latestArticlesHeading: "From the blog",
  latestArticlesViewAll: "View all posts",
  latestArticlesEmpty: "No articles yet.",
  latestArticlesMinRead: "min read",

  // ── Homepage: Featured Research ──
  researchLabel: "Research",
  researchHeading: "Deep dives & analysis",
  researchDeck:
    "In-depth technical investigations, architecture reviews, and security research.",
  researchViewAll: "View all research",
  researchEmpty: "No research published yet.",

  // ── Homepage: Working On ──
  workingOnLabel: "What I'm Working On",
  workingOnHeading: "Current research & projects",
  workingOnDeck: "Active investigations and tools I'm building right now.",
  workingOnResearchQueue: "Research Queue",
  workingOnBuildQueue: "Build Queue",
  workingOnNoActiveResearch: "No active research.",
  workingOnNoActiveProjects: "No active projects.",

  // ── Homepage: Projects ──
  projectsLabel: "Projects",
  projectsHeading: "Things I've built",
  projectsEmpty: "No projects yet.",

  // ── Homepage: Skills ──
  skillsLabel: "Expertise",
  skillsHeading: "Skills & technologies",

  // ── Homepage: Timeline ──
  timelineLabel: "Journey",
  timelineHeading: "Timeline",

  // ── Homepage: Contact ──
  contactLabel: "Contact",
  contactHeadline: "Let's work together.",
  contactSubtext:
    "Open to collaboration, consulting, and interesting conversations. Reach out via email or find me on any platform below.",

  // ── Blog ──
  blogTitle: "Blog",
  blogDescription: "Thoughts, tutorials, and personal notes.",
  blogEmpty: "No articles yet.",
  blogMinRead: "min read",

  // ── Essays ──
  essaysTitle: "Essays",
  essaysDescription: "Book reviews, reflections, and reading notes.",
  essaysEmpty: "No essays yet.",

  // ── Research ──
  researchPageTitle: "Research",
  researchPageDescription:
    "Deep dives, analysis, and technical investigations.",
  researchPageEmpty: "No research published yet.",
  researchStatusInProgress: "in progress",
  researchStatusCompleted: "completed",
  researchStatusArchived: "archived",

  // ── Projects ──
  projectsPageTitle: "Projects",
  projectsPageDescription: "Things I've built and contributed to.",

  // ── Tools ──
  toolsPageTitle: "Tools",
  toolsPageDescription: "Tools and software I use and recommend.",
  toolsCategoryCli: "CLI",
  toolsCategoryGui: "GUI",
  toolsCategorySaas: "SaaS",
  toolsCategoryLibrary: "Library",
  toolsCategoryHardware: "Hardware",
  toolsPricingFree: "Free",
  toolsPricingFreemium: "Freemium",
  toolsPricingPaid: "Paid",
  toolsPricingOpenSource: "Open Source",

  // ── Tags ──
  tagsTitle: "Tags",
  tagsDescription: "Browse content by topic.",
  tagsEmpty: "No tags yet.",
  tagsPostCount: (n: number) => (n === 1 ? "1 post" : `${n} posts`),
  tagsNoPosts: "No posts found.",

  // ── Blog Post ──
  postTableOfContents: "Table of Contents",
  postPrevious: "← Previous",
  postNext: "Next →",
  postRelatedArticles: "Related Articles",
  postMinRead: "min read",
  postWords: "words",
  postUpdated: "Updated",
  postAuthor: "Author",

  // ── 404 ──
  notFoundTitle: "404 — Not Found",
  notFoundHeading: "Page not found.",
  notFoundBackHome: "← Back to Home",

  // ── Search ──
  searchPlaceholder: "Search articles...",
  searchLoading: "Loading...",
  searchNoResults: 'No results for "{query}"',
  searchTypePrompt: "Type to search by title",
  searchNavigate: "Navigate",
  searchOpen: "Open",
  searchButton: "Search",

  // ── Pagination ──
  paginationPrev: "← Previous",
  paginationNext: "Next →",
  paginationPage: "Page {current} of {total}",

  // ── Footer ──
  footerRss: "RSS Feed",
  copyright: "CC BY-SA 4.0",

  // ── Common ──
  commonAnd: "and",
  commonBy: "by",
  commonReadMore: "Read more",
  commonViewAll: "View all",
};

export default en;
