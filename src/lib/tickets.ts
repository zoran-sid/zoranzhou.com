import { getCollection } from "astro:content";
import type { Locale } from "../i18n/utils";
import { isPublished } from "./content-policy";
import { newestTickets } from "./ticket-model";

export async function getTickets(locale?: Locale) {
  return newestTickets(
    await getCollection(
      "tickets",
      (entry) => isPublished(entry) && (!locale || entry.data.lang === locale),
    ),
  );
}
