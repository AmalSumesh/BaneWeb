export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "bae-theme";

export const THEME_META_COLORS: Record<Theme, string> = {
  light: "#f7f4ef",
  dark: "#07070a",
};

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

export function getPreferredTheme(): Theme {
  const stored = getStoredTheme();
  if (stored) return stored;

  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", THEME_META_COLORS[theme]);
  }
}
