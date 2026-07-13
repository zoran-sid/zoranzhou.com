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
  name: string;
  year?: number;
  rating: number;
  status: MediaStatus;
  category: MediaCategory;
};

const categoryAliases: Record<string, MediaCategory> = {
  movie: "movies",
  movies: "movies",
  film: "movies",
  films: "movies",
  "电影": "movies",
  tv: "tv",
  series: "tv",
  show: "tv",
  shows: "tv",
  "剧集": "tv",
  "电视剧": "tv",
  book: "books",
  books: "books",
  "书": "books",
  "书籍": "books",
  game: "games",
  games: "games",
  "游戏": "games",
};

const statusAliases: Record<string, MediaStatus> = {
  watched: "watched",
  "已看": "watched",
  "看过": "watched",
  watching: "watching",
  "在看": "watching",
  "want-to-watch": "want-to-watch",
  "want to watch": "want-to-watch",
  "想看": "want-to-watch",
  completed: "completed",
  complete: "completed",
  "已完成": "completed",
  "已通关": "completed",
  playing: "playing",
  "在玩": "playing",
  "want-to-play": "want-to-play",
  "want to play": "want-to-play",
  "想玩": "want-to-play",
  read: "read",
  "已读": "read",
  "读过": "read",
  reading: "reading",
  "在读": "reading",
  "want-to-read": "want-to-read",
  "want to read": "want-to-read",
  "想读": "want-to-read",
  dropped: "dropped",
  "弃了": "dropped",
  "弃": "dropped",
  "on-hold": "on-hold",
  "on hold": "on-hold",
  "暂停": "on-hold",
};

function normalizeCell(value: string | undefined) {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
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
      const index = headers?.findIndex((header) => names.includes(header)) ?? -1;
      return index >= 0 ? cells[index] : "";
    };

    const name = valueFor("name", "title", "名称", "名字");
    if (!name) continue;

    const year = Number.parseInt(valueFor("year", "年份"), 10);
    const rating = Number.parseFloat(valueFor("rating", "score", "评分"));

    items.push({
      name,
      year: Number.isFinite(year) ? year : undefined,
      rating: Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0,
      status: normalizeStatus(valueFor("status", "状态")),
      category: currentCategory,
    });
  }

  return items.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.name.localeCompare(b.name));
}
