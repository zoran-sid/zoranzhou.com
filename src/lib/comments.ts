import {
  commentAvatarCount,
  commentAvatarPath,
  commentOptions,
} from "./comment-config";
import type { Locale } from "../i18n/utils";
import type { LikeState } from "./comment-like";

function hashComment(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function isDefaultAvatar(src: string): boolean {
  try {
    const url = new URL(src, window.location.href);
    return (
      /(?:gravatar|cravatar)\./i.test(url.hostname) ||
      /\/avatar(?:\/|$)/i.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function applyAnonymousAvatars(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".wl-card-item").forEach((card) => {
    const avatar = card.querySelector<HTMLImageElement>(".wl-user-avatar");
    if (!avatar || !isDefaultAvatar(avatar.src)) return;
    const key = `${card.id}:${card.querySelector(".wl-nick")?.textContent ?? ""}`;
    avatar.src = commentAvatarPath(hashComment(key) % commentAvatarCount);
    avatar.dataset.anonymousAvatar = "true";
  });
}

export function initComments() {
  document.querySelectorAll<HTMLElement>("[data-comments]").forEach((root) => {
    const target = root.querySelector<HTMLElement>("[data-comments-widget]");
    const loader = root.querySelector<HTMLElement>("[data-comments-load]");
    const button = root.querySelector<HTMLButtonElement>(
      "[data-comments-button]",
    );
    const status = root.querySelector<HTMLElement>("[data-comments-status]");
    if (!target || !loader || !button || !status || root.dataset.initialized)
      return;
    root.dataset.initialized = "true";
    const locale: Locale = root.dataset.locale === "en" ? "en" : "zh-CN";
    let loading = false;
    let instance: import("@waline/client").WalineInstance | null = null;
    let observer: IntersectionObserver | undefined;
    let avatarObserver: MutationObserver | undefined;
    const feedback = document.createElement("p");
    feedback.className = "comments__feedback";
    feedback.setAttribute("role", "status");
    target.after(feedback);
    const onLikeFeedback = (event: Event) => {
      const { id, state, liked } = (
        event as CustomEvent<{
          id: string | number;
          state: LikeState;
          liked: boolean;
        }>
      ).detail;
      const card = document.getElementById(String(id));
      if (!card || !target.contains(card)) return;
      const like = card.querySelector<HTMLButtonElement>(".wl-like");
      if (!like) return;
      like.disabled =
        state === "pending" || state === "liked" || state === "unknown";
      like.title = liked
        ? locale === "zh-CN"
          ? "已点赞"
          : "Liked"
        : locale === "zh-CN"
          ? "点赞"
          : "Like";
      like.setAttribute("aria-pressed", String(liked));
      like.setAttribute("aria-busy", String(state === "pending"));
      if (state === "pending") {
        feedback.textContent = "";
        feedback.dataset.error = "false";
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          like
            .querySelector("svg")
            ?.animate?.(
              [
                { transform: "scale(1)" },
                { transform: "scale(1.25)", offset: 0.4 },
                { transform: "scale(1)" },
              ],
              { duration: 280, easing: "ease-out" },
            );
        }
      } else {
        feedback.textContent =
          locale === "zh-CN"
            ? ({
                liked: "已点赞",
                ready: "",
                login: "登录后即可点赞，每条评论只需点一次。",
                unknown: "暂时无法确认点赞状态，请刷新核对。",
                error: "点赞未能保存，请稍后重试。",
              }[state] ?? "")
            : ({
                liked: "Liked",
                ready: "",
                login: "Sign in to like. Each account can like a comment once.",
                unknown:
                  "Like status could not be confirmed. Refresh to check.",
                error: "Your like could not be saved. Please try again.",
              }[state] ?? "");
        feedback.dataset.error = String(
          ["error", "unknown", "login"].includes(state),
        );
        if (state === "login") {
          target
            .querySelector<HTMLElement>(
              ".wl-login-nick, .wl-login-info a, .wl-info .wl-btn",
            )
            ?.focus();
        }
      }
    };
    document.addEventListener("waline:like-feedback", onLikeFeedback);
    const load = async () => {
      if (loading || instance) return;
      loading = true;
      button.disabled = true;
      target.setAttribute("aria-busy", "true");
      status.textContent =
        locale === "zh-CN" ? "正在加载评论…" : "Loading comments…";
      try {
        const { init } = await import("@waline/client");
        if (!root.isConnected) return;
        instance = init({
          el: target,
          ...commentOptions(root.dataset.path ?? location.pathname, locale),
        });
        if (!instance) throw new Error("Comment widget did not mount");
        applyAnonymousAvatars(target);
        avatarObserver = new MutationObserver(() =>
          applyAnonymousAvatars(target),
        );
        avatarObserver.observe(target, { childList: true, subtree: true });
        observer?.disconnect();
        // Move focus only when the reader explicitly focused the loader button.
        if (document.activeElement === button)
          target.querySelector<HTMLElement>("textarea, input")?.focus();
        loader.hidden = true;
      } catch {
        button.textContent =
          locale === "zh-CN" ? "重新加载评论" : "Retry loading comments";
        status.textContent =
          locale === "zh-CN"
            ? "评论暂时没有加载成功，可以重试。"
            : "Comments could not be loaded. Please try again.";
      } finally {
        loading = false;
        button.disabled = false;
        target.removeAttribute("aria-busy");
      }
    };
    button.addEventListener("click", load);
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            void load();
          }
        },
        { rootMargin: "200px" },
      );
      observer.observe(root);
    }
    document.addEventListener(
      "astro:before-swap",
      () => {
        observer?.disconnect();
        avatarObserver?.disconnect();
        document.removeEventListener("waline:like-feedback", onLikeFeedback);
        feedback.remove();
        instance?.destroy();
      },
      { once: true },
    );
  });
}
