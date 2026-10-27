import {
  hasReadableBody,
  isPublished,
  type ContentRecord,
} from "./content-policy";
import type { Locale } from "../i18n/utils";

export const ticketTypes = [
  "movie",
  "concert",
  "theatre",
  "comedy",
  // Kept for older ticket entries that used one broad performance category.
  "performance",
  "exhibition",
  "sport",
  "train",
  "flight",
  "receipt",
  "dining",
  "invoice",
  "travel",
  "other",
] as const;
export type TicketType = (typeof ticketTypes)[number];

export const ticketTypeLabels: Record<Locale, Record<TicketType, string>> = {
  "zh-CN": {
    movie: "电影",
    concert: "音乐会",
    theatre: "戏剧",
    comedy: "喜剧",
    performance: "演出",
    exhibition: "展览",
    sport: "赛事",
    train: "火车",
    flight: "机票",
    receipt: "消费小票",
    dining: "餐饮小票",
    invoice: "发票",
    travel: "旅行",
    other: "其他",
  },
  en: {
    movie: "Film",
    concert: "Concerts",
    theatre: "Theatre",
    comedy: "Comedy",
    performance: "Live shows",
    exhibition: "Exhibitions",
    sport: "Sports",
    train: "Rail",
    flight: "Flights",
    receipt: "Receipts",
    dining: "Dining receipts",
    invoice: "Invoices",
    travel: "Travel",
    other: "Other",
  },
};

/** Tickets record a calendar day, independent of the browser/build time zone. */
export function ticketDay(value: unknown): string | undefined {
  if (value instanceof Date) {
    if (!Number.isFinite(value.valueOf())) return undefined;
    const iso = value.toISOString();
    return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : undefined;
  }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.valueOf()) &&
    date.toISOString().slice(0, 10) === value
    ? value
    : undefined;
}

export function displayTicketDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === "zh-CN" ? "zh-CN" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function newestTickets<T extends { slug: string; data: { date: Date } }>(
  entries: T[],
): T[] {
  return [...entries].sort(
    (a, b) =>
      b.data.date.valueOf() - a.data.date.valueOf() ||
      a.slug.localeCompare(b.slug),
  );
}

/** Resolve the exact selected note; ambiguous, draft and removed notes have no link. */
export function linkedNote<T extends ContentRecord>(
  slug: string | undefined,
  notes: T[],
): T | undefined {
  if (!slug) return undefined;
  const matches = notes.filter(
    (note) => note.collection === "blog" && note.slug === slug,
  );
  if (matches.length !== 1) return undefined;
  const note = matches[0];
  return note.data.format === "note" &&
    isPublished(note) &&
    hasReadableBody(note)
    ? note
    : undefined;
}
