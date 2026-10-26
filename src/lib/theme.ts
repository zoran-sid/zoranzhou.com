const THEME_KEY = "pref-theme";
export const THEME_TRANSITION_MS = 1800;
export type Theme = "dark" | "light";
let userChoice: Theme | null = null;
let active: { target: Theme; finish: () => void } | null = null;
let initialized = false;

export function getStoredTheme(): Theme | null {
  if (userChoice) return userChoice;
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
}

export function setStoredTheme(theme: Theme): void {
  userChoice = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // The current page still honors an explicit choice when storage is unavailable.
  }
}

export function getSystemTheme(): Theme {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Keep browser chrome in step with the committed theme and scroll backdrop. */
export function syncBrowserTheme(): void {
  const root = document.documentElement;
  const color = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  // The Lab owns its independent, fixed browser colour.
  if (!color?.dataset.light) return;
  const dark = root.classList.contains("dark");
  const theme = dark ? "dark" : "light";
  const backdrop =
    root.style.getPropertyValue(`--browser-${dark ? "night" : "day"}`).trim() ||
    color.dataset[theme];
  if (backdrop && color.content !== backdrop) color.content = backdrop;
  if (root.style.colorScheme !== theme) root.style.colorScheme = theme;
  const scheme = document.querySelector<HTMLMetaElement>(
    'meta[name="color-scheme"]',
  );
  if (scheme && scheme.content !== theme) scheme.content = theme;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  syncBrowserTheme();
  document
    .getElementById("theme-toggle")
    ?.setAttribute("aria-pressed", String(theme === "dark"));
}

export function transitionTheme(theme: Theme): void {
  const interrupted = active !== null;
  active?.finish();
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const night = document.querySelector<HTMLElement>("[data-sky-night]");
  const dusk = document.querySelector<HTMLElement>("[data-sky-dusk]");
  const sun = document.querySelector<HTMLElement>("[data-theme-sun]");
  if (
    interrupted ||
    reduced.matches ||
    document.hidden ||
    !night?.animate ||
    !dusk ||
    !sun
  ) {
    applyTheme(theme);
    return;
  }

  const toDark = theme === "dark";
  const options: KeyframeAnimationOptions = {
    duration: THEME_TRANSITION_MS,
    direction: toDark ? "normal" : "reverse",
    fill: "both",
    easing: "linear",
  };
  root.dataset.themeTransition = toDark ? "to-dark" : "to-light";
  const animations = [
    night.animate(
      [
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: 0.42 },
        { opacity: 0.5, offset: 0.56 },
        { opacity: 1, offset: 0.74 },
        { opacity: 1, offset: 1 },
      ],
      options,
    ),
    dusk.animate(
      [
        { opacity: 0, offset: 0 },
        { opacity: 0.85, offset: 0.36 },
        { opacity: 1, offset: 0.48 },
        { opacity: 0.35, offset: 0.75 },
        { opacity: 0, offset: 1 },
      ],
      options,
    ),
    sun.animate(
      [
        {
          opacity: 0,
          transform: "translate(-24px, -14vh) scale(0.9)",
          offset: 0,
        },
        {
          opacity: 1,
          transform: "translate(-18px, -10vh) scale(1)",
          offset: 0.14,
        },
        { opacity: 1, transform: "translate(0, 10vh) scale(1)", offset: 0.42 },
        {
          opacity: 0.4,
          transform: "translate(18px, 24vh) scale(0.9)",
          offset: 0.66,
        },
        {
          opacity: 0,
          transform: "translate(32px, 35vh) scale(0.8)",
          offset: 0.85,
        },
        {
          opacity: 0,
          transform: "translate(32px, 35vh) scale(0.8)",
          offset: 1,
        },
      ],
      options,
    ),
  ];
  // Commit the reading theme as the sky becomes dark, not at the start of sunset.
  const commit = window.setTimeout(
    () => applyTheme(theme),
    THEME_TRANSITION_MS * (toDark ? 0.62 : 0.38),
  );
  let settled = false;
  function finish() {
    if (settled) return;
    settled = true;
    window.clearTimeout(commit);
    applyTheme(theme);
    animations.forEach((animation) => animation.cancel());
    delete root.dataset.themeTransition;
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", finish);
    reduced.removeEventListener("change", onReduction);
    active = null;
  }
  function onVisibility() {
    if (document.hidden) finish();
  }
  function onReduction() {
    if (reduced.matches) finish();
  }
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", finish);
  reduced.addEventListener("change", onReduction);
  active = { target: theme, finish };
  Promise.all(animations.map((animation) => animation.finished))
    .then(finish)
    .catch(() => {});
}

export function toggleTheme(): Theme {
  const current =
    active?.target ??
    (document.documentElement.classList.contains("dark") ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  setStoredTheme(next);
  transitionTheme(next);
  return next;
}

export function initTheme(): void {
  if (initialized) return;
  initialized = true;
  applyTheme(getStoredTheme() ?? getSystemTheme());
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      if (!getStoredTheme()) applyTheme(event.matches ? "dark" : "light");
    });
}
