import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const KEY = "genjutsu-theme";
const THEME_COLOR: Record<Theme, string> = { dark: "#070812", light: "#f5f6fb" };

export function currentTheme(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle("light", theme === "light");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => apply(theme), [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* 隐私模式下忽略 */
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
