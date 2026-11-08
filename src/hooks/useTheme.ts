import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", isDark);
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light" || stored === "system") return stored;
  } catch {}
  return "system";
}

/**
 * Cycle order depends on the system preference so every click visibly changes the theme:
 *   system-light: system → dark → light → system
 *   system-dark:  system → light → dark → system
 */
export function getNextTheme(current: Theme, systemIsDark: boolean): Theme {
  if (current === "system") return systemIsDark ? "light" : "dark";
  if (current === "dark") return systemIsDark ? "system" : "light";
  return systemIsDark ? "dark" : "system";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return readStoredTheme();
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (readStoredTheme() === "system") applyTheme("system");
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const toggle = useCallback(() => {
    const next = getNextTheme(theme, systemPrefersDark());
    try {
      localStorage.setItem("theme", next);
    } catch {}
    applyTheme(next);
    setTheme(next);
  }, [theme]);

  return { theme, toggle };
}
