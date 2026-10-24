export type MediaCategory = "movies" | "tv" | "books" | "games";

export type MediaStatus =
  | "watched"
  | "watching"
  | "want-to-watch"
  | "completed"
  | "playing"
  | "want-to-play"
  | "read"
  | "reading"
  | "want-to-read"
  | "dropped"
  | "on-hold";

export type MediaListItem = {
  id?: string;
  name: string;
  nameEn?: string;
  author?: string;
  year?: number;
  watchedDate?: string;
  poster?: string;
  url?: string;
  urlEn?: string;
  imdb?: string;
  rating: number;
  status: MediaStatus;
  category: MediaCategory;
};

// Never substitute a release year or today's date for a missing viewing date.
export function mediaDate(value: string | undefined): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.valueOf()) &&
    parsed.toISOString().startsWith(value)
    ? value
    : undefined;
}

export function mediaUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

export function mediaTitle(item: MediaListItem, locale: string): string {
  const parts = item.name.split(" / ");
  return locale === "en" ? item.nameEn || parts.at(-1)! : parts[0];
}

export function mediaLink(item: MediaListItem, locale: string) {
  const zh = locale === "zh-CN";
  const query = encodeURIComponent(mediaTitle(item, locale));
  if (item.category === "books") {
    const href =
      (zh ? item.url : item.urlEn) ||
      item.url ||
      `https://books.google.com/books?q=${query}`;
    const googleSearch =
      new URL(href).hostname === "books.google.com" &&
      new URL(href).searchParams.has("q");
    return {
      href,
      label: googleSearch
        ? zh
          ? "在 Google Books 查找"
          : "Find on Google Books"
        : zh
          ? "图书介绍"
          : "About this book",
    };
  }
  if (item.category === "movies" || item.category === "tv") {
    if (zh)
      return {
        href:
          item.url ||
          `https://search.douban.com/movie/subject_search?search_text=${query}`,
        label: item.url ? "豆瓣介绍" : "在豆瓣查找",
      };
    return item.imdb
      ? {
          href: `https://www.imdb.com/title/${item.imdb}/`,
          label: "About on IMDb",
        }
      : {
          href: `https://www.imdb.com/find/?q=${query}${item.year ? `%20${item.year}` : ""}&s=tt`,
          label: "Find on IMDb",
        };
  }
  return item.url
    ? { href: item.url, label: zh ? "作品介绍" : "About this title" }
    : undefined;
}

export function formatMediaDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "zh-CN" ? "zh-CN" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

const categoryAliases: Record<string, MediaCategory> = {
  movie: "movies",
  movies: "movies",
  film: "movies",
  films: "movies",
  电影: "movies",
  tv: "tv",
  series: "tv",
  show: "tv",
  shows: "tv",
  剧集: "tv",
  电视剧: "tv",
  book: "books",
  books: "books",
  书: "books",
  书籍: "books",
  game: "games",
  games: "games",
  游戏: "games",
};

const statusAliases: Record<string, MediaStatus> = {
  watched: "watched",
  已看: "watched",
  看过: "watched",
  watching: "watching",
  在看: "watching",
  "want-to-watch": "want-to-watch",
  "want to watch": "want-to-watch",
  想看: "want-to-watch",
  completed: "completed",
  complete: "completed",
  已完成: "completed",
  已通关: "completed",
  playing: "playing",
  在玩: "playing",
  "want-to-play": "want-to-play",
  "want to play": "want-to-play",
  想玩: "want-to-play",
  read: "read",
  已读: "read",
  读过: "read",
  reading: "reading",
  在读: "reading",
  "want-to-read": "want-to-read",
  "want to read": "want-to-read",
  想读: "want-to-read",
  dropped: "dropped",
  弃了: "dropped",
  弃: "dropped",
  "on-hold": "on-hold",
  "on hold": "on-hold",
  暂停: "on-hold",
};

function normalizeCell(value: string | undefined) {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

function mediaLookupKeys(item: Pick<MediaListItem, "name" | "nameEn" | "year">) {
  const names = [item.name, item.nameEn]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(" / "));
  return names.flatMap((name) => {
    const normalized = name.replace(/\s+/g, " ").trim().toLocaleLowerCase();
    const withoutSeason = normalized
      .replace(/\s+(?:season|第)\s*\d+\s*季?$/i, "")
      .trim();
    return [...new Set([normalized, withoutSeason])].map(
      (value) => `${value}|${item.year ?? ""}`,
    );
  });
}

function normalizeCategory(raw: string): MediaCategory | undefined {
  return categoryAliases[raw.trim().toLowerCase()];
}

function normalizeStatus(raw: string): MediaStatus {
  return statusAliases[raw.trim().toLowerCase()] ?? "watched";
}

function splitTableRow(line: string) {
  const source = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let cell = "";
  let escaped = false;

  for (const character of source) {
    if (escaped) {
      cell += character;
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (character === "|") {
      cells.push(normalizeCell(cell));
      cell = "";
    } else {
      cell += character;
    }
  }

  if (escaped) cell += "\\";
  cells.push(normalizeCell(cell));
  return cells;
}

function isDividerRow(cells: string[]) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

export function parseMediaList(markdown: string): MediaListItem[] {
  const items: MediaListItem[] = [];
  let currentCategory: MediaCategory | undefined;
  let headers: string[] | undefined;

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^#{2,3}\s+(.+)$/);
    if (heading) {
      currentCategory = normalizeCategory(heading[1]);
      headers = undefined;
      continue;
    }

    if (!currentCategory || !line.trim().startsWith("|")) continue;

    const cells = splitTableRow(line);
    if (cells.length < 4 || isDividerRow(cells)) continue;

    if (!headers) {
      headers = cells.map((cell) => cell.toLowerCase());
      continue;
    }

    const valueFor = (...names: string[]) => {
      const index =
        headers?.findIndex((header) => names.includes(header)) ?? -1;
      return index >= 0 ? cells[index] : "";
    };

    const name = valueFor("name", "title", "名称", "名字");
    if (!name) continue;

    const year = Number.parseInt(valueFor("year", "年份"), 10);
    const rating = Number.parseFloat(valueFor("rating", "score", "评分"));

    items.push({
      id: valueFor("id") || undefined,
      name,
      nameEn: valueFor("nameen", "英文名") || undefined,
      author: valueFor("author", "作者") || undefined,
      year: Number.isFinite(year) ? year : undefined,
      watchedDate: mediaDate(valueFor("watcheddate", "watchedat", "观看日期")),
      poster: mediaUrl(valueFor("poster", "cover", "封面", "海报")),
      url: mediaUrl(valueFor("url", "链接")),
      urlEn: mediaUrl(valueFor("urlen", "英文链接")),
      imdb: valueFor("imdb", "imdbid").match(
        /^(?:https:\/\/(?:www\.)?imdb\.com\/title\/)?(tt\d{7,10})\/?$/,
      )?.[1],
      rating: Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0,
      status: normalizeStatus(valueFor("status", "状态")),
      category: currentCategory,
    });
  }

  const posters = new Map<string, string>();
  for (const item of items) {
    if (!item.poster) continue;
    for (const key of mediaLookupKeys(item)) posters.set(key, item.poster);
  }
  for (const item of items) {
    if (item.poster || item.category !== "tv") continue;
    item.poster = mediaLookupKeys(item)
      .map((key) => posters.get(key))
      .find((poster): poster is string => Boolean(poster));
  }

  // A stable sort preserves the source's order for same-day and undated entries.
  return items.sort((a, b) =>
    (b.watchedDate ?? "").localeCompare(a.watchedDate ?? ""),
  );
}
