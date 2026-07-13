import type { DoubanMovie } from "./douban";

export type MediaRow = Record<string, string>;

export interface MediaTable {
  headers: string[];
  rows: MediaRow[];
}

const DOUBAN_HEADERS = [
  "id",
  "slug",
  "name",
  "year",
  "rating",
  "status",
  "poster",
  "url",
  "watchedDate",
  "tags",
  "comment",
  "metadata",
];

function splitMarkdownRow(line: string): string[] {
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
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += character;
    }
  }
  if (escaped) cell += "\\";
  cells.push(cell.trim());
  return cells;
}

function isDivider(cells: string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

export function parseMediaTable(tableLines: string[]): MediaTable {
  const rawRows = tableLines
    .filter((line) => line.trim().startsWith("|"))
    .map(splitMarkdownRow);
  if (rawRows.length < 2 || !isDivider(rawRows[1])) {
    throw new Error(
      "The movies section does not contain a valid Markdown table.",
    );
  }

  const headers = rawRows[0];
  const rows = rawRows
    .slice(2)
    .map((cells) =>
      Object.fromEntries(
        headers.map((header, index) => [header, cells[index] ?? ""]),
      ),
    );
  return { headers, rows };
}

function escapeCell(value: string | undefined): string {
  return (value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ")
    .trim();
}

function serializeMediaTable(table: MediaTable): string[] {
  return [
    `| ${table.headers.join(" | ")} |`,
    `| ${table.headers.map(() => "---").join(" | ")} |`,
    ...table.rows.map(
      (row) =>
        `| ${table.headers.map((header) => escapeCell(row[header])).join(" | ")} |`,
    ),
  ];
}

function normalizeIdentity(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/&(?:nbsp|amp);/g, "")
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

function titleAliases(value: string): string[] {
  return [...new Set(value.split("/").map(normalizeIdentity).filter(Boolean))];
}

function doubanSubjectId(row: MediaRow): string | undefined {
  return (
    row.id?.match(/^douban:(\d+)$/)?.[1] ??
    row.url?.match(/\/subject\/(\d+)/)?.[1]
  );
}

function findExistingRow(
  movie: DoubanMovie,
  rows: MediaRow[],
  used: Set<MediaRow>,
): MediaRow | undefined {
  const subjectId = movie.id.replace(/^douban:/, "");
  const exact = rows.find(
    (row) => !used.has(row) && doubanSubjectId(row) === subjectId,
  );
  if (exact) return exact;

  const movieAliases = titleAliases(movie.name);
  return rows.find((row) => {
    if (used.has(row)) return false;
    if (row.year && movie.year && row.year !== movie.year) return false;
    const aliases = titleAliases(row.name ?? "");
    return aliases.some((alias) => movieAliases.includes(alias));
  });
}

function mergeMovie(
  movie: DoubanMovie,
  existing: MediaRow | undefined,
): MediaRow {
  const imported: MediaRow = Object.fromEntries(
    Object.entries(movie).map(([key, value]) => [key, value ?? ""]),
  );
  if (!existing) return imported;

  // Existing non-empty values may be intentional manual edits. Fill gaps from
  // Douban without silently replacing those fields or any unknown columns.
  const merged: MediaRow = { ...imported, ...existing };
  for (const [key, value] of Object.entries(existing)) {
    if (!value) merged[key] = imported[key] ?? "";
  }
  // The stable Douban identity is always safe to add after a title-based first import.
  merged.id ||= imported.id;
  merged.slug ||= imported.slug;
  merged.url ||= imported.url;
  merged.status ||= "watched";
  return merged;
}

function deduplicateRows(rows: MediaRow[]): MediaRow[] {
  const result: MediaRow[] = [];
  const ids = new Set<string>();
  const fallbackKeys = new Set<string>();

  for (const row of rows) {
    const id = doubanSubjectId(row);
    const fallback = `${normalizeIdentity(row.name ?? "")}::${row.year ?? ""}`;
    if ((id && ids.has(id)) || (!id && fallbackKeys.has(fallback))) continue;
    if (id) ids.add(id);
    fallbackKeys.add(fallback);
    result.push(row);
  }
  return result;
}

export function replaceMoviesTable(
  markdown: string,
  movies: DoubanMovie[],
): string {
  if (movies.length === 0)
    throw new Error("Refusing to replace the movies table with no movies.");

  const lines = markdown.split(/\r?\n/);
  const headingIndex = lines.findIndex((line) =>
    /^##\s+movies\s*$/i.test(line.trim()),
  );
  if (headingIndex < 0)
    throw new Error('Could not find the "## movies" section in media.md.');

  const nextHeadingIndex = lines.findIndex(
    (line, index) => index > headingIndex && /^##\s+/.test(line.trim()),
  );
  const sectionEnd = nextHeadingIndex < 0 ? lines.length : nextHeadingIndex;
  const tableStart = lines.findIndex(
    (line, index) =>
      index > headingIndex && index < sectionEnd && line.trim().startsWith("|"),
  );
  if (tableStart < 0)
    throw new Error('Could not find the movies table below "## movies".');
  let tableEnd = tableStart;
  while (tableEnd < sectionEnd && lines[tableEnd].trim().startsWith("|"))
    tableEnd += 1;

  const existing = parseMediaTable(lines.slice(tableStart, tableEnd));
  const used = new Set<MediaRow>();
  const importedRows = movies.map((movie) => {
    const match = findExistingRow(movie, existing.rows, used);
    if (match) used.add(match);
    return mergeMovie(movie, match);
  });
  const unmatchedManualRows = existing.rows.filter((row) => !used.has(row));
  const headers = [
    ...DOUBAN_HEADERS,
    ...existing.headers.filter((header) => !DOUBAN_HEADERS.includes(header)),
  ];
  const table = serializeMediaTable({
    headers,
    rows: deduplicateRows([...importedRows, ...unmatchedManualRows]),
  });

  const eol = markdown.includes("\r\n") ? "\r\n" : "\n";
  return [
    ...lines.slice(0, tableStart),
    ...table,
    ...lines.slice(tableEnd),
  ].join(eol);
}
