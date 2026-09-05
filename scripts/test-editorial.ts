import assert from "node:assert/strict";
import test from "node:test";
import {
  findTranslation,
  hasReadableBody,
  isPublished,
  writingCategory,
  type ContentRecord,
} from "../src/lib/content-policy";
import { paginateEntries } from "../src/lib/pagination";
const entry = (
  data: ContentRecord["data"] = {},
  collection = "blog",
  body = "A readable entry",
): ContentRecord => ({
  collection,
  slug: "source",
  body,
  data: { lang: "zh-CN", ...data },
});
test("unpublished and unfinished writing does not enter reading indexes", () => {
  assert.equal(isPublished(entry({ draft: true })), false);
  assert.equal(isPublished(entry({ published: false }, "routes")), false);
  assert.equal(
    hasReadableBody(entry({}, "essays", " \n<!-- to write -->\n")),
    false,
  );
  assert.equal(
    hasReadableBody(entry({}, "essays", "<!-- note -->\n正文")),
    true,
  );
});
test("language switching needs one public translation in the same collection", () => {
  const source = entry({ translationKey: "pair" });
  const translated = {
    ...entry({ lang: "en", translationKey: "pair" }),
    slug: "different-slug",
  };
  assert.equal(findTranslation([source, translated], source, "en"), translated);
  assert.equal(
    findTranslation([entry({ lang: "en" })], entry(), "en"),
    undefined,
  );
  assert.equal(
    findTranslation(
      [translated, { ...translated, slug: "duplicate" }],
      source,
      "en",
    ),
    undefined,
  );
  assert.equal(
    findTranslation(
      [{ ...translated, data: { ...translated.data, draft: true } }],
      source,
      "en",
    ),
    undefined,
  );
  assert.equal(
    findTranslation([{ ...translated, collection: "research" }], source, "en"),
    undefined,
  );
});
test("route translations use route identity even when the translation key differs", () => {
  const source = entry(
    { routeId: "route-0123456789ab", translationKey: "one" },
    "routes",
  );
  const translated = entry(
    { lang: "en", routeId: "route-0123456789ab", translationKey: "two" },
    "routes",
  );
  assert.equal(findTranslation([source, translated], source, "en"), translated);
});
test("life filters include essays and travel regardless of their collection", () => {
  assert.equal(writingCategory(entry({ tags: ["Travel"] })), "life");
  assert.equal(writingCategory(entry({}, "essays")), "life");
  assert.equal(writingCategory(entry({}, "research")), "research");
  assert.equal(writingCategory(entry({ tags: ["Linux"] })), "technology");
});
test("filtered pagination preserves all entries and valid return links", () => {
  const entries = Array.from({ length: 23 }, (_, index) => index);
  const pages = paginateEntries(entries, "/blog/topics/life");
  assert.deepEqual(
    pages.flatMap((page) => page.entries),
    entries,
  );
  assert.equal(pages[0].page.prev, undefined);
  assert.equal(pages[1].page.prev, "/blog/topics/life");
  assert.equal(pages[1].page.next, "/blog/topics/life/3");
  assert.equal(pages[2].page.next, undefined);
  assert.equal(pages[2].page.total, 23);
  const empty = paginateEntries([], "/essays");
  assert.equal(empty.length, 1);
  assert.equal(empty[0].page.last, 1);
  assert.equal(empty[0].page.next, undefined);
});
