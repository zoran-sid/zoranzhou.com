import { defineMiddleware } from "astro:middleware";
import { defaultLocale, locales, LANG_COOKIE, type Locale } from "./i18n/utils";

/**
 * Get the preferred locale based on:
 * 1. Cookie (user manually selected)
 * 2. Accept-Language header (browser preference)
 * 3. Default locale (zh-CN)
 */
function getPreferredLocale(request: Request): Locale {
  // 1. Check cookie
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim().split("="))
    .find(([key]) => key === LANG_COOKIE);
  if (cookie?.[1] && locales.includes(cookie[1] as Locale)) {
    return cookie[1] as Locale;
  }

  // 2. Check Accept-Language
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    // Parse the first preferred language
    const preferred = acceptLang.split(",")[0]?.trim()?.slice(0, 2).toLowerCase();
    if (preferred === "en") return "en";
    if (preferred === "zh") return "zh-CN";
  }

  // 3. Default
  return defaultLocale;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;
  const { pathname } = url;

  // Only redirect on the root path "/"
  if (pathname === "/") {
    const preferredLocale = getPreferredLocale(request);
    const target = `/${preferredLocale}/`;
    return new Response(null, {
      status: 302,
      headers: {
        Location: target,
        "Cache-Control": "no-cache",
      },
    });
  }

  return next();
});
