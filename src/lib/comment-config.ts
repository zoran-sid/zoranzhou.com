import type { Locale } from "../i18n/utils";

export const commentServer = "https://zorancomment.xyz";

/** A query, fragment or trailing slash must not split a page's discussion. */
export function commentPath(path: string): string {
  return (
    new URL(path, "https://zoranzhou.com").pathname.replace(/\/+$/, "") || "/"
  );
}

export function commentOptions(path: string, locale: Locale) {
  return {
    serverURL: commentServer,
    path: commentPath(path),
    lang: locale,
    dark: "html.dark",
    meta: ["nick"] as "nick"[],
    requiredMeta: ["nick"] as "nick"[],
    login: "enable" as const,
    pageSize: 10,
    wordLimit: 2000,
    commentSorting: "latest" as const,
    imageUploader: false,
    search: false,
    emoji: false,
    reaction: false,
    pageview: false,
    comment: false,
    locale: {
      placeholder:
        locale === "zh-CN"
          ? "读到这里，有什么想说的？"
          : "What’s on your mind after reading?",
    },
  };
}
