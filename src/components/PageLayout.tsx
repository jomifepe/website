import type { IconType } from "react-icons";
import { TbMoon, TbSun, TbSunMoon } from "react-icons/tb";
import { motion } from "motion/react";
import { useLayoutEffect } from "node_modules/@tanstack/react-router/dist/esm/utils";
import { useEffect, useState, type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { Theme, useTheme } from "~/hooks/useTheme";
import { cn } from "~/lib/cn";

type PageLayoutProps = {
  children: ReactNode;
  headerLeft?: ReactNode;
};

export function PageLayout(props: PageLayoutProps) {
  const { children, headerLeft } = props;
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="flex w-full max-w-5xl items-center justify-between px-5 pt-5 md:pt-8">
        <div className="flex items-center gap-2">{headerLeft}</div>
        <ThemeToggle />
      </header>
      <main id="main-content" className="flex flex-1 flex-col justify-center max-w-5xl w-full gap-4 px-5 py-8">
        {children}
      </main>
    </div>
  );
}

const springTransition = {
  type: "spring",
  stiffness: 500,
  damping: 28,
  opacity: { duration: 0.1, ease: "easeOut" },
} as const;

type ThemeOption = {
  theme: Theme;
  Icon: IconType;
};

const themeOptions: ThemeOption[] = [
  { theme: "dark", Icon: TbMoon },
  { theme: "light", Icon: TbSun },
  { theme: "system", Icon: TbSunMoon },
];

const themeNameMap: Record<Theme, string> = {
  dark: "dark",
  light: "light",
  system: "system",
};

const visible = { scale: 1, opacity: 1, rotate: 0 };
const hidden = { scale: 0, opacity: 0, rotate: 90 };

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle(props: ThemeToggleProps) {
  const { className } = props;
  const { theme: currentTheme, toggle: toggleTheme } = useTheme();
  const mounted = useIsMounted();

  const nextLabel = mounted ? getNextLabel(currentTheme) : "Toggle theme";

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <motion.button
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/10 bg-foreground/5 focus-visible:bg-foreground/10 transition-[background-color] focus-visible:outline-none overflow-hidden cursor-pointer",
            className,
          )}
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
                  <Icon className="text-foreground/60" size={20} strokeWidth={2} />
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
