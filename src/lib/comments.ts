import { commentOptions } from "./comment-config";
import type { Locale } from "../i18n/utils";

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
        instance?.destroy();
      },
      { once: true },
    );
  });
}
