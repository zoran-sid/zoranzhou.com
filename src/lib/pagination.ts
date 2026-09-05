export interface PageLinks {
  current: number;
  last: number;
  total: number;
  prev?: string;
  next?: string;
}
export function paginateEntries<T>(entries: T[], base: string, size = 10) {
  const last = Math.max(1, Math.ceil(entries.length / size));
  return Array.from({ length: last }, (_, index) => ({
    param: index ? String(index + 1) : undefined,
    entries: entries.slice(index * size, (index + 1) * size),
    page: {
      current: index + 1,
      last,
      total: entries.length,
      prev: index > 0 ? (index === 1 ? base : `${base}/${index}`) : undefined,
      next: index + 1 < last ? `${base}/${index + 2}` : undefined,
    } satisfies PageLinks,
  }));
}
