import zhCN from "./zh-CN";
import en from "./en";

export const locales = ["zh-CN", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh-CN";

/** Map of locale to its display name (shown in language switcher) */
export const localeLabels: Record<Locale, string> = {
  "zh-CN": "中文",
  en: "English",
};

/** All UI string keys with their types */
export interface UIStrings {
  siteTitle: string;
  siteDescription: string;
  siteAuthor: string;
  siteTagline: string;
  navHome: string;
  navBlog: string;
  navMedia: string;
  navEssays: string;
  navResearch: string;
  navProjects: string;
  navHomelab: string;
  navGear: string;
  navPhotos: string;
  navMap: string;
  navTags: string;
  navTools: string;
  navSearch: string;
  langLabel: string;
  langZhCN: string;
  langEn: string;
  themeToggle: string;
  themeLight: string;
  themeDark: string;
  heroBadge: string;
  heroKicker: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  heroReadBlog: string;
  heroGetInTouch: string;
  aboutLabel: string;
  aboutHeadline: string;
  aboutParagraphs: string[];
  latestArticlesLabel: string;
  latestArticlesHeading: string;
  latestArticlesViewAll: string;
  latestArticlesEmpty: string;
  latestArticlesMinRead: string;
  researchLabel: string;
  researchHeading: string;
  researchDeck: string;
  researchViewAll: string;
  researchEmpty: string;
  workingOnLabel: string;
  workingOnHeading: string;
  workingOnDeck: string;
  workingOnResearchQueue: string;
  workingOnBuildQueue: string;
  workingOnNoActiveResearch: string;
  workingOnNoActiveProjects: string;
  projectsLabel: string;
  projectsHeading: string;
  projectsEmpty: string;
  projectsViewAll: string;
  skillsLabel: string;
  skillsHeading: string;
  skillsGroups: Array<{ category: string; items: string[] }>;
  timelineLabel: string;
  timelineHeading: string;
  contactLabel: string;
  contactHeadline: string;
  contactSubtext: string;
  blogTitle: string;
  blogDescription: string;
  blogEmpty: string;
  blogMinRead: string;
  essaysTitle: string;
  essaysDescription: string;
  essaysEmpty: string;
  mediaTitle: string;
  mediaDescription: string;
  mediaIntro: string;
  mediaCategoryMovies: string;
  mediaCategoryTV: string;
  mediaCategoryBooks: string;
  mediaCategoryGames: string;
  mediaAll: string;
  mediaEmpty: string;
  mediaName: string;
  mediaYear: string;
  mediaRating: string;
  mediaStatus: string;
  mediaType: string;
  mediaTotal: string;
  mediaStatusWatched: string;
  mediaStatusWatching: string;
  mediaStatusWantToWatch: string;
  mediaStatusCompleted: string;
  mediaStatusPlaying: string;
  mediaStatusWantToPlay: string;
  mediaStatusRead: string;
  mediaStatusReading: string;
  mediaStatusWantToRead: string;
  mediaStatusDropped: string;
  mediaStatusOnHold: string;
  mediaDirector: string;
  mediaAuthor: string;
  mediaDeveloper: string;
  mediaPublisher: string;
  mediaCountry: string;
  mediaGenres: string;
  mediaRuntime: string;
  mediaLanguage: string;
  mediaSeasons: string;
  mediaPages: string;
  mediaPlatform: string;
  mediaWatchedDate: string;
  mediaOriginalTitle: string;
  mediaMyReview: string;
  mediaStory: string;
  mediaCharacters: string;
  mediaVisuals: string;
  mediaMusic: string;
  mediaPersonalThoughts: string;
  mediaRecommendation: string;
  mediaRelated: string;
  mediaBackToMedia: string;
  researchPageTitle: string;
  researchPageDescription: string;
  researchPageEmpty: string;
  researchStatusInProgress: string;
  researchStatusCompleted: string;
  researchStatusArchived: string;
  projectsPageTitle: string;
  projectsPageDescription: string;
  toolsPageTitle: string;
  toolsPageDescription: string;
  toolsCategoryCli: string;
  toolsCategoryGui: string;
  toolsCategorySaas: string;
  toolsCategoryLibrary: string;
  toolsCategoryHardware: string;
  toolsPricingFree: string;
  toolsPricingFreemium: string;
  toolsPricingPaid: string;
  toolsPricingOpenSource: string;
  homelabPageTitle: string;
  homelabPageDescription: string;
  homelabEmpty: string;
  homelabAreaNetwork: string;
  homelabAreaServer: string;
  homelabAreaSecurity: string;
  homelabAreaAutomation: string;
  homelabAreaStorage: string;
  homelabAreaObservability: string;
  homelabStatusPlanned: string;
  homelabStatusBuilding: string;
  homelabStatusRunning: string;
  homelabStatusRetired: string;
  gearPageTitle: string;
  gearPageDescription: string;
  gearEmpty: string;
  gearCategoryComputer: string;
  gearCategoryCamera: string;
  gearCategoryPhone: string;
  gearCategoryAudio: string;
  gearCategoryNetwork: string;
  gearCategoryEdc: string;
  gearCategorySport: string;
  gearCategoryOther: string;
  gearStatusUsing: string;
  gearStatusTesting: string;
  gearStatusRetired: string;
  gearStatusWishlist: string;
  photosPageTitle: string;
  photosPageDescription: string;
  photosEmpty: string;
  photosLocation: string;
  photosCamera: string;
  mapPageTitle: string;
  mapPageDescription: string;
  mapEmpty: string;
  mapKindRun: string;
  mapKindHike: string;
  mapKindRide: string;
  mapKindTravel: string;
  mapKindPhotoWalk: string;
  mapDistance: string;
  mapDuration: string;
  tagsTitle: string;
  tagsDescription: string;
  tagsEmpty: string;
  tagsPostCount: (n: number) => string;
  tagsNoPosts: string;
  postTableOfContents: string;
  postPrevious: string;
  postNext: string;
  postRelatedArticles: string;
  postMinRead: string;
  postWords: string;
  postUpdated: string;
  postAuthor: string;
  notFoundTitle: string;
  notFoundHeading: string;
  notFoundBackHome: string;
  searchPlaceholder: string;
  searchLoading: string;
  searchNoResults: string;
  searchTypePrompt: string;
  searchNavigate: string;
  searchOpen: string;
  searchButton: string;
  paginationPrev: string;
  paginationNext: string;
  paginationPage: string;
  footerRss: string;
  copyright: string;
  commonAnd: string;
  commonBy: string;
  commonReadMore: string;
  commonViewAll: string;
}

const translations: Record<Locale, UIStrings> = {
  "zh-CN": zhCN,
  en,
};

/**
 * Get the translated UI strings for a given locale.
 * Falls back to default locale if the requested locale is not supported.
 */
export function getTranslations(locale: Locale): UIStrings {
  return translations[locale] ?? translations[defaultLocale];
}

/**
 * Get a single translation string by key.
 * Supports simple interpolation of `{key}` placeholders.
 */
export function t(
  locale: Locale,
  key: keyof UIStrings,
  params?: Record<string, string | number>,
): string {
  const strings = getTranslations(locale);
  const value = strings[key];
  if (typeof value === "function") {
    // If it's a function like tagsPostCount, call it with the first param value
    const num =
      typeof params?.n === "number" ? params.n : Number(params?.n) || 0;
    return (value as (n: number) => string)(num);
  }
  if (typeof value === "string" && params) {
    return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
  }
  if (Array.isArray(value)) {
    return value.join("\n");
  }
  return String(value);
}

/** Get the locale from a URL pathname */
export function getLocaleFromPath(pathname: string): Locale {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return defaultLocale;
}

/** Get the path without the locale prefix */
export function stripLocalePrefix(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
    if (pathname === `/${locale}`) {
      return "/";
    }
  }
  return pathname;
}

/** Build a localized URL path */
export function localizePath(path: string, locale: Locale): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const stripped = stripLocalePrefix(cleanPath);
  const normalized =
    stripped === "/"
      ? ""
      : stripped.startsWith("/")
        ? stripped
        : `/${stripped}`;
  return `/${locale}${normalized || "/"}`;
}

/**
 * Get the alternative locale URL for a given path.
 * Returns null if the target URL would be the same.
 */
export function getAlternateUrl(
  currentPath: string,
  targetLocale: Locale,
): string {
  return localizePath(currentPath, targetLocale);
}

/** Language names for hreflang tags */
export const hreflangMap: Record<Locale, string> = {
  "zh-CN": "zh-Hans",
  en: "en",
};

/**
 * COOKIE_NAME for storing user language preference
 */
export const LANG_COOKIE = "pref-lang";
