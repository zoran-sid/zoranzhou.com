import { getWriting, entryPath } from "../lib/writing";
import { getTickets } from "../lib/tickets";
import { commentPath } from "../lib/comment-config";

/** Public discussion titles for the comment service's article-grouped RSS feed. */
export async function GET() {
  const [writing, tickets] = await Promise.all([getWriting(), getTickets()]);
  const pages = [...writing, ...tickets].map((entry) => ({
    path: commentPath(entryPath(entry)),
    title: entry.data.title,
    locale: entry.data.lang,
  }));
  return Response.json({ version: 1, pages });
}
