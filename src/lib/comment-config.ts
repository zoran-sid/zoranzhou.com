import { commentEmoji, searchCommentEmoji } from "./comment-emoji";
import type { Locale } from "../i18n/utils";

export const commentServer = "https://zorancomment.xyz";
export const commentAvatarCount = 100;

export function commentAvatarPath(index: number): string {
  const normalized =
    ((index % commentAvatarCount) + commentAvatarCount) % commentAvatarCount;
  return `/comment-avatars/avatar-${String(normalized + 1).padStart(3, "0")}.png`;
}

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
    search: { search: searchCommentEmoji, default: () => searchCommentEmoji() },
    emoji: commentEmoji(locale),
    reaction: false,
    pageview: false,
    comment: false,
    locale: {
      like: locale === "zh-CN" ? "点赞" : "Like",
      cancelLike: locale === "zh-CN" ? "已点赞" : "Liked",
      admin: locale === "zh-CN" ? "博主" : "Author",
      sofa:
        locale === "zh-CN" ? "来聊聊你的想法吧。" : "Start the conversation.",
      placeholder:
        locale === "zh-CN"
          ? "读到这里，有什么想说的？"
          : "What’s on your mind after reading?",
    },
  };
}
