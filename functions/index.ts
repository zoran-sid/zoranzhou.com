type Locale = "zh-CN" | "en";

const LANG_COOKIE = "pref-lang";
const CHINESE_LOCALE: Locale = "zh-CN";
const ENGLISH_LOCALE: Locale = "en";

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return null;
  }

  for (const item of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = item.trim().split("=");

    if (rawName !== name) {
      continue;
    }

    const rawValue = rawValueParts.join("=");

    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }

  return null;
}

function isSupportedLocale(value: string | null): value is Locale {
  return value === CHINESE_LOCALE || value === ENGLISH_LOCALE;
}

function detectBrowserLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return ENGLISH_LOCALE;
  }

  const languages = acceptLanguage
    .split(",")
    .map((item, index) => {
      const [languagePart, ...parameters] = item.trim().split(";");

      let quality = 1;

      for (const parameter of parameters) {
        const match = parameter.trim().match(/^q=([0-9.]+)$/i);

        if (match) {
          const parsedQuality = Number.parseFloat(match[1]);

          if (Number.isFinite(parsedQuality)) {
            quality = parsedQuality;
          }
        }
      }

      return {
        language: languagePart.trim().toLowerCase(),
        quality,
        index,
      };
    })
    .filter((item) => item.language && item.quality > 0)
    .sort(
      (a, b) =>
        b.quality - a.quality ||
        a.index - b.index,
    );

  for (const preference of languages) {
    const language = preference.language;

    if (language === "zh" || language.startsWith("zh-")) {
      return CHINESE_LOCALE;
    }

    if (language === "en" || language.startsWith("en-")) {
      return ENGLISH_LOCALE;
    }
  }

  return ENGLISH_LOCALE;
}

export function onRequest({
  request,
}: {
  request: Request;
}): Response {
  const savedLocale = getCookie(request, LANG_COOKIE);

  const locale = isSupportedLocale(savedLocale)
    ? savedLocale
    : detectBrowserLocale(request.headers.get("Accept-Language"));

  const destination = new URL(request.url);

  destination.pathname = `/${locale}/`;
  destination.hash = "";

  return new Response(null, {
    status: 302,
    headers: {
      Location: destination.toString(),

      "Cache-Control": "private, no-store",
      Vary: "Cookie, Accept-Language",
    },
  });
}
