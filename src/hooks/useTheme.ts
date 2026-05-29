import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";

function getEffectiveTheme(theme: Theme): "dark" | "light" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyTheme(theme: Theme) {
  const effective = getEffectiveTheme(theme);
  document.documentElement.classList.toggle("dark", effective === "dark");
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light" || stored === "system") return stored;
  } catch {}
  return "system";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return readStoredTheme();
  });

  // Re-apply when system preference changes and theme is "system"
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (readStoredTheme() === "system") applyTheme("system");
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      // Cycle order depends on system preference:
      //   system-light: system → dark → light → system
      //   system-dark:  system → light → dark → system
      let next: Theme;
      if (current === "system") {
        next = systemIsDark ? "light" : "dark";
      } else if (current === "dark") {
        next = systemIsDark ? "system" : "light";
      } else {
        next = systemIsDark ? "dark" : "system";
      }
      try {
        localStorage.setItem("theme", next);
      } catch {}
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
