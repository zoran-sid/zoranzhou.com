export const DOUBAN_COLLECTION_URL =
  "https://movie.douban.com/people/223079570/collect?sort=time&tags_sort=count&filter=all&start=0&mode=list&type=all";

export const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export interface DoubanMovie {
  id: string;
  slug: string;
  name: string;
  year?: string;
  rating?: string;
  status: "watched";
  poster?: string;
  url: string;
  watchedDate?: string;
  tags?: string;
  comment?: string;
  metadata?: string;
}

export interface ParsedDoubanPage {
  movies: DoubanMovie[];
  itemBlockCount: number;
  omittedCount: number;
  total?: number;
  rangeStart?: number;
  rangeEnd?: number;
  nextStart?: number;
  terminal: boolean;
}

export interface FetchDoubanOptions {
  delayMs?: number;
  fetchImpl?: typeof fetch;
  logger?: Pick<Console, "log" | "warn">;
  maxPages?: number;
  url?: string;
  userAgent?: string;
}

const BLOCK_PAGE_PATTERNS = [
  /sec\.douban\.com/i,
  /captcha/i,
  /检测到有异常请求/,
  /异常请求/,
  /访问受限/,
  /登录豆瓣.*继续/i,
];

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    hellip: "…",
    ldquo: "“",
    lt: "<",
    middot: "·",
    nbsp: " ",
    quot: '"',
    rdquo: "”",
  };

  return value.replace(
    /&(#x[\da-f]+|#\d+|[a-z]+);/gi,
    (entity, code: string) => {
      if (code.startsWith("#x")) {
        return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
      }
      if (code.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
      }
      return named[code.toLowerCase()] ?? entity;
    },
  );
}

function cleanText(html: string): string {
  return decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function attribute(openingTag: string, name: string): string | undefined {
  const match = openingTag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  const value = match?.[1] ?? match?.[2] ?? match?.[3];
  return value ? decodeHtml(value) : undefined;
}

function hasClass(openingTag: string, className: string): boolean {
  return (attribute(openingTag, "class") ?? "")
    .split(/\s+/)
    .includes(className);
}

function extractBalancedElement(
  html: string,
  tagName: string,
  openingIndex: number,
): { outer: string; inner: string; opening: string } | undefined {
  const tagPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "gi");
  tagPattern.lastIndex = openingIndex;
  let depth = 0;
  let opening = "";
  let innerStart = -1;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(html))) {
    const token = match[0];
    const isClosing = token.startsWith("</");
    if (!isClosing) {
      if (depth === 0) {
        opening = token;
        innerStart = tagPattern.lastIndex;
      }
      depth += 1;
    } else {
      depth -= 1;
      if (depth === 0 && innerStart >= 0) {
        return {
          outer: html.slice(openingIndex, tagPattern.lastIndex),
          inner: html.slice(innerStart, match.index),
          opening,
        };
      }
    }
  }
  return undefined;
}

function findElementByClass(
  html: string,
  tagName: string,
  className: string,
): { outer: string; inner: string; opening: string } | undefined {
  const openingPattern = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  let match: RegExpExecArray | null;
  while ((match = openingPattern.exec(html))) {
    if (hasClass(match[0], className)) {
      return extractBalancedElement(html, tagName, match.index);
    }
  }
  return undefined;
}

function findElementByClassInTags(
  html: string,
  className: string,
  tagNames: string[],
): { outer: string; inner: string; opening: string } | undefined {
  for (const tagName of tagNames) {
    const element = findElementByClass(html, tagName, className);
    if (element) return element;
  }
  return undefined;
}

function normalizeUrl(
  value: string | undefined,
  baseUrl: string,
): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, baseUrl);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

function normalizeCalendarDate(value: string): string | undefined {
  const match = value.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseItem(
  itemHtml: string,
  sourceUrl: string,
): DoubanMovie | undefined {
  const titleElement = findElementByClassInTags(itemHtml, "title", [
    "li",
    "div",
  ]);
  const titleAnchor = titleElement?.inner.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/i);
  if (!titleAnchor) return undefined;

  const url = normalizeUrl(attribute(titleAnchor[1], "href"), sourceUrl);
  const subjectId = url?.match(/\/subject\/(\d+)/)?.[1];
  if (!url || !subjectId || new URL(url).hostname !== "movie.douban.com")
    return undefined;

  const emphasizedTitle = titleAnchor[2].match(
    /<em\b[^>]*>([\s\S]*?)<\/em>/i,
  )?.[1];
  const name = cleanText(emphasizedTitle ?? titleAnchor[2]);
  if (!name) {
    throw new Error(
      `Douban item ${subjectId} has no title; its HTML may have changed.`,
    );
  }

  const intro = cleanText(
    findElementByClassInTags(itemHtml, "intro", ["li", "span", "div"])?.inner ??
      "",
  );
  const year = intro.match(/(?:^|[^\d])((?:18|19|20)\d{2})(?:[^\d]|$)/)?.[1];

  const ratingClass = itemHtml.match(
    /class\s*=\s*["'][^"']*\brating([1-5])-t\b[^"']*["']/i,
  )?.[1];
  const pic = findElementByClass(itemHtml, "div", "pic")?.inner ?? itemHtml;
  const image = pic.match(/<img\b([^>]*)>/i)?.[1];
  const poster = normalizeUrl(
    image
      ? (attribute(image, "src") ?? attribute(image, "data-src"))
      : undefined,
    sourceUrl,
  );
  const watchedDateText = cleanText(
    findElementByClassInTags(itemHtml, "date", ["span", "div"])?.inner ?? "",
  );
  const watchedDate = normalizeCalendarDate(watchedDateText);
  const tags = cleanText(
    findElementByClassInTags(itemHtml, "tags", ["span", "div"])?.inner ?? "",
  )
    .replace(/^标签\s*[:：]\s*/, "")
    .trim();
  const comment = cleanText(
    findElementByClassInTags(itemHtml, "comment", ["span", "div"])?.inner ?? "",
  );

  return {
    id: `douban:${subjectId}`,
    slug: `douban-${subjectId}`,
    name,
    ...(year ? { year } : {}),
    ...(ratingClass ? { rating: ratingClass } : {}),
    status: "watched",
    ...(poster ? { poster } : {}),
    url,
    ...(watchedDate ? { watchedDate } : {}),
    ...(tags ? { tags } : {}),
    ...(comment ? { comment } : {}),
    ...(intro ? { metadata: intro } : {}),
  };
}

function findItemBlocksForTag(html: string, tagName: string): string[] {
  const result: string[] = [];
  const openingPattern = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  let match: RegExpExecArray | null;
  while ((match = openingPattern.exec(html))) {
    if (!hasClass(match[0], "item")) continue;
    const item = extractBalancedElement(html, tagName, match.index);
    if (item) {
      result.push(item.outer);
      openingPattern.lastIndex = match.index + item.outer.length;
    }
  }
  return result;
}

function findItemBlocks(html: string): string[] {
  // Current mode=list uses <li class="item"> while mode=grid uses div.item.
  const listItems = findItemBlocksForTag(html, "li");
  return listItems.length > 0 ? listItems : findItemBlocksForTag(html, "div");
}

function assertUsableHtml(html: string, source: string): void {
  if (!html.trim()) {
    throw new Error(`Douban returned an empty response for ${source}.`);
  }
  if (html.length < 500) {
    throw new Error(
      `Douban returned an unexpectedly short response for ${source}.`,
    );
  }
  if (BLOCK_PAGE_PATTERNS.some((pattern) => pattern.test(html))) {
    throw new Error(
      `Douban blocked the request for ${source}. Save the collection pages in a browser and use --input instead.`,
    );
  }
}

export function parseDoubanPage(
  html: string,
  sourceUrl = DOUBAN_COLLECTION_URL,
): ParsedDoubanPage {
  assertUsableHtml(html, sourceUrl);

  const subjectLinks =
    html.match(/(?:https?:\/\/movie\.douban\.com)?\/subject\/\d+\/?/gi) ?? [];
  const itemBlocks = findItemBlocks(html);
  const movies = itemBlocks
    .map((item) => parseItem(item, sourceUrl))
    .filter((movie): movie is DoubanMovie => Boolean(movie));

  const subjectNum = findElementByClass(html, "span", "subject-num");
  const totalText = cleanText(subjectNum?.inner ?? "");
  const range = totalText.match(/(\d+)\s*-\s*(\d+)\s*\/\s*(\d+)/);
  const rangeStart = Number.parseInt(range?.[1] ?? "", 10);
  const rangeEnd = Number.parseInt(range?.[2] ?? "", 10);
  const total = Number.parseInt(
    range?.[3] ?? totalText.match(/\/\s*(\d+)/)?.[1] ?? "",
    10,
  );
  const advertisedCount =
    Number.isFinite(rangeStart) && Number.isFinite(rangeEnd)
      ? rangeEnd - rangeStart + 1
      : itemBlocks.length;
  if (movies.length === 0 && !Number.isFinite(rangeStart)) {
    throw new Error(
      subjectLinks.length > 0
        ? `Found Douban subject links but could not parse any collection items in ${sourceUrl}; the HTML structure may have changed.`
        : `No watched movies or valid advertised range were found in ${sourceUrl}; refusing an empty or partial update.`,
    );
  }
  if (itemBlocks.length > advertisedCount) {
    throw new Error(
      `Douban page ${sourceUrl} contains ${itemBlocks.length} item blocks for an advertised range of ${advertisedCount}; the HTML structure may have changed.`,
    );
  }
  if (itemBlocks.length !== movies.length) {
    throw new Error(
      `Only ${movies.length} of ${itemBlocks.length} collection item blocks were parsed in ${sourceUrl}; the HTML structure may have changed.`,
    );
  }
  const nextElement = findElementByClass(html, "span", "next");
  const next = nextElement?.inner.match(/<a\b([^>]*)>/i);
  const nextUrl = next
    ? normalizeUrl(attribute(next[1], "href"), sourceUrl)
    : undefined;
  const nextStart = nextUrl
    ? Number.parseInt(new URL(nextUrl).searchParams.get("start") ?? "", 10)
    : Number.NaN;

  return {
    movies,
    itemBlockCount: itemBlocks.length,
    omittedCount: Math.max(0, advertisedCount - itemBlocks.length),
    terminal: Boolean(nextElement && !next),
    ...(Number.isFinite(total) ? { total } : {}),
    ...(Number.isFinite(rangeStart) ? { rangeStart } : {}),
    ...(Number.isFinite(rangeEnd) ? { rangeEnd } : {}),
    ...(Number.isFinite(nextStart) ? { nextStart } : {}),
  };
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchPage(
  url: string,
  fetchImpl: typeof fetch,
  userAgent: string,
): Promise<string> {
  class NonRetryableDoubanError extends Error {}
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
          "Cache-Control": "no-cache",
          Referer: "https://movie.douban.com/",
          "User-Agent": userAgent,
        },
        redirect: "follow",
        signal: AbortSignal.timeout(25_000),
      });

      if (response.status === 429) {
        throw new NonRetryableDoubanError(
          "Douban rate-limited the request (HTTP 429). Wait before trying again, or use saved pages with --input.",
        );
      }
      if (response.status === 403 || response.status === 418) {
        throw new NonRetryableDoubanError(
          `Douban blocked the request (HTTP ${response.status}). Use saved pages with --input.`,
        );
      }
      if (!response.ok) {
        throw new Error(
          `Douban returned HTTP ${response.status} ${response.statusText}.`,
        );
      }
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType && !contentType.includes("html")) {
        throw new Error(
          `Douban returned unexpected content type ${contentType}.`,
        );
      }
      const html = await response.text();
      assertUsableHtml(html, url);
      return html;
    } catch (error) {
      lastError = error;
      if (error instanceof NonRetryableDoubanError) throw error;
      if (attempt < 3) await delay(attempt * 1_500);
    }
  }
  const message =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `Unable to fetch ${url} after 3 attempts: ${message} Use --input with saved HTML/JSON if Douban is blocking automated requests.`,
  );
}

export async function fetchAllDoubanMovies(
  options: FetchDoubanOptions = {},
): Promise<DoubanMovie[]> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const logger = options.logger ?? console;
  const delayMs = options.delayMs ?? 2_000;
  const maxPages = options.maxPages ?? 100;
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  const firstUrl = new URL(options.url ?? DOUBAN_COLLECTION_URL);
  // Grid currently exposes poster and rating fields that list mode omits. Keep
  // every other parameter from the configured collection URL unchanged.
  firstUrl.searchParams.set("mode", "grid");
  let nextStart =
    Number.parseInt(firstUrl.searchParams.get("start") ?? "0", 10) || 0;
  let expectedTotal: number | undefined;
  let parsedCount = 0;
  let omittedCount = 0;
  let advertisedEnd: number | undefined;
  let pageNumber = 0;
  let completed = false;
  const movies = new Map<string, DoubanMovie>();
  const pageSignatures = new Set<string>();

  while (pageNumber < maxPages) {
    const pageUrl = new URL(firstUrl);
    pageUrl.searchParams.set("start", String(nextStart));
    logger.log(
      `[media:update] Fetching Douban page ${pageNumber + 1}: ${pageUrl.href}`,
    );
    const html = await fetchPage(pageUrl.href, fetchImpl, userAgent);
    const page = parseDoubanPage(html, pageUrl.href);
    pageNumber += 1;
    if (
      expectedTotal !== undefined &&
      page.total !== undefined &&
      page.total !== expectedTotal
    ) {
      throw new Error(
        `Douban collection total changed from ${expectedTotal} to ${page.total} during the update; retry to avoid a mixed snapshot.`,
      );
    }
    expectedTotal = page.total ?? expectedTotal;
    if (page.rangeStart !== undefined && page.rangeEnd !== undefined) {
      if (
        advertisedEnd !== undefined &&
        page.rangeStart !== advertisedEnd + 1
      ) {
        throw new Error(
          `Douban pagination jumped from record ${advertisedEnd} to ${page.rangeStart}; refusing a partial or overlapping page range.`,
        );
      }
      advertisedEnd = page.rangeEnd;
    }
    parsedCount += page.movies.length;
    omittedCount += page.omittedCount;

    const signature = `${page.rangeStart ?? "?"}-${page.rangeEnd ?? "?"}:${page.movies
      .map((movie) => movie.id)
      .join(",")}`;
    if (pageSignatures.has(signature)) {
      throw new Error(
        `Douban repeated a pagination page at start=${nextStart}; refusing a partial update.`,
      );
    }
    pageSignatures.add(signature);
    const uniqueBefore = movies.size;
    for (const movie of page.movies) movies.set(movie.id, movie);
    const newUnique = movies.size - uniqueBefore;
    const duplicateCount = page.movies.length - newUnique;
    logger.log(
      `[media:update] Page ${pageNumber}: parsed ${page.movies.length}, added ${newUnique} unique${duplicateCount ? `, deduplicated ${duplicateCount}` : ""}${page.omittedCount ? `, ${page.omittedCount} source record omitted by Douban` : ""}; totals ${parsedCount} parsed / ${movies.size} unique${expectedTotal !== undefined ? ` / ${expectedTotal} advertised` : ""}.`,
    );

    const reachedAdvertisedEnd =
      expectedTotal !== undefined &&
      advertisedEnd !== undefined &&
      advertisedEnd >= expectedTotal;
    const reachedTotalWithoutRanges =
      expectedTotal !== undefined &&
      advertisedEnd === undefined &&
      parsedCount >= expectedTotal;
    if (reachedAdvertisedEnd || reachedTotalWithoutRanges) {
      completed = true;
      break;
    }
    if (page.nextStart !== undefined) {
      nextStart = page.nextStart;
    } else if (expectedTotal !== undefined && parsedCount < expectedTotal) {
      nextStart = page.rangeEnd ?? nextStart + page.movies.length;
    } else if (page.terminal) {
      completed = true;
      break;
    } else {
      throw new Error(
        `Douban pagination metadata is missing at start=${nextStart}; the HTML may have changed. Refusing a partial update.`,
      );
    }

    await delay(delayMs + Math.floor(Math.random() * 400));
  }

  if (!completed && pageNumber >= maxPages) {
    throw new Error(
      expectedTotal === undefined
        ? `Stopped after ${maxPages} pages before reaching a recognized final page.`
        : `Stopped after ${maxPages} pages before reaching ${expectedTotal} movies.`,
    );
  }
  if (
    expectedTotal !== undefined &&
    (advertisedEnd !== undefined
      ? advertisedEnd < expectedTotal
      : parsedCount < expectedTotal)
  ) {
    throw new Error(
      `Only parsed ${parsedCount} records through advertised position ${advertisedEnd ?? "unknown"} of ${expectedTotal}; refusing a partial update.`,
    );
  }
  if (movies.size === 0)
    throw new Error("Douban returned no movies; refusing an empty update.");
  if (omittedCount > 0) {
    logger.warn(
      `[media:update] Douban advertised ${omittedCount} record${omittedCount === 1 ? "" : "s"} that had no item block (usually deleted or private); those records cannot be imported.`,
    );
  }
  if (movies.size < parsedCount) {
    logger.warn(
      `[media:update] ${parsedCount} parsed records normalized to ${movies.size} unique subject IDs. Duplicate subjects will be written once.`,
    );
  }

  return [...movies.values()];
}
