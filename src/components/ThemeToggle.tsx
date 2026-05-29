import { type IconProps, IconMoon, IconSun, IconSunMoon } from "@tabler/icons-react";
import { motion } from "motion/react";
import { type ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { Theme } from "~/hooks/useTheme";
import { useTheme } from "~/hooks/useTheme";

const springTransition = {
  type: "spring",
  stiffness: 500,
  damping: 28,
  opacity: { duration: 0.1, ease: "easeOut" },
} as const;

type ThemeOption = {
  theme: Theme;
  Icon: (props: IconProps) => ReactNode;
};

const themeOptions: ThemeOption[] = [
  { theme: "dark", Icon: IconMoon },
  { theme: "light", Icon: IconSun },
  { theme: "system", Icon: IconSunMoon },
];

const themeNameMap: Record<Theme, string> = {
  dark: "dark",
  light: "light",
  system: "system",
};

const visible = { scale: 1, opacity: 1, rotate: 0 };
const hidden = { scale: 0, opacity: 0, rotate: 90 };

export function ThemeToggle() {
  const { theme: currentTheme, toggle: toggleTheme } = useTheme();
  const mounted = useIsMounted();

  const nextLabel = mounted ? getNextLabel(currentTheme) : "Toggle theme";

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <motion.button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/10 focus-visible:bg-foreground/10 transition-[background-color] focus-visible:outline-none overflow-hidden cursor-pointer"
          onClick={toggleTheme}
          aria-label={nextLabel}
          whileTap={{ scale: 0.88 }}
        >
          {mounted && (
            <>
              {themeOptions.map(({ theme, Icon }) => (
                <motion.span
                  key={theme}
                  className="absolute inset-0 flex items-center justify-center"
                  initial={false}
                  transition={springTransition}
                  // keep all the options mounted to avoid color transition bugs
                  animate={theme === currentTheme ? visible : hidden}
                >
                  <Icon className="text-foreground/60" size={17} strokeWidth={1.75} />
                </motion.span>
              ))}
            </>
          )}
        </motion.button>
      </TooltipTrigger>
      {mounted && <TooltipContent side="bottom">{themeNameMap[currentTheme]}</TooltipContent>}
    </Tooltip>
  );
}

function getNextLabel(theme: Theme): string {
  const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (theme === "system") return systemIsDark ? "switch to light mode" : "switch to dark mode";
  if (theme === "dark") return systemIsDark ? "switch to automatic mode" : "switch to light mode";
  return systemIsDark ? "switch to dark mode" : "switch to automatic mode";
}

// useLayoutEffect on the client (runs synchronously before paint, so the browser
// never renders the wrong icon). Falls back to useEffect on the server to avoid
// the SSR "useLayoutEffect does nothing" warning.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function useIsMounted() {
  const [mounted, setMounted] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
