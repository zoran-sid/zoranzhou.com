type DateStyle = Intl.DateTimeFormatOptions["dateStyle"];

export function formatDate(
  date: string | Date,
  dateStyle: DateStyle = "long",
  locale = "en-US",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { dateStyle }).format(d);
}

export function readingTime(text: string): number {
  const { cjk, words } = countReadableUnits(text);
  return Math.max(1, Math.ceil(cjk / 450 + words / 200));
}

export function wordCount(text: string): number {
  const { cjk, words } = countReadableUnits(text);
  return cjk + words;
}

function countReadableUnits(text: string): { cjk: number; words: number } {
  const plainText = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ");
  const cjk =
    plainText.match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
  const words =
    plainText
      .replace(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g, " ")
      .match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return { cjk, words };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function groupBy<T>(items: T[], key: keyof T): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = String(item[key]);
    const group = map.get(k) ?? [];
    group.push(item);
    map.set(k, group);
  }
  return map;
}
