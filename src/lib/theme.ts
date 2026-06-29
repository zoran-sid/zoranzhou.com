// Theme management utilities
const THEME_KEY = "pref-theme";
const DARK = "dark";
const LIGHT = "light";

export type Theme = typeof DARK | typeof LIGHT;

export function getStoredTheme(): Theme | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(THEME_KEY) as Theme | null;
}

export function setStoredTheme(theme: Theme): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(THEME_KEY, theme);
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return LIGHT;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK
    : LIGHT;
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === DARK) {
    root.classList.add(DARK);
  } else {
    root.classList.remove(DARK);
  }
}

export function toggleTheme(): Theme {
  const current = document.documentElement.classList.contains(DARK)
    ? DARK
    : LIGHT;
  const next = current === DARK ? LIGHT : DARK;
  applyTheme(next);
  setStoredTheme(next);
  return next;
}

export function initTheme(): void {
  const stored = getStoredTheme();
  const theme = stored ?? getSystemTheme();
  applyTheme(theme);

  // Listen for system theme changes when no user preference is set
  if (!stored) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", (e) => {
      if (!getStoredTheme()) {
        applyTheme(e.matches ? DARK : LIGHT);
      }
    });
  }
}
