import { motion } from "motion/react";
import { useLayoutEffect, useState, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { TbMoon, TbSun, TbSunMoon } from "react-icons/tb";

import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { getNextTheme, type Theme, useTheme } from "~/hooks/useTheme";
import { cn } from "~/lib/utils";

type PageLayoutProps = {
  children: ReactNode;
  headerLeft?: ReactNode;
  /** "center" vertically centers the content; "start" pins it under the header. */
  align?: "center" | "start";
};

export function PageLayout(props: PageLayoutProps) {
  const { children, headerLeft, align = "center" } = props;
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="flex w-full max-w-5xl items-center justify-between px-5 pt-5 md:pt-8">
        <div className="flex items-center gap-2">{headerLeft}</div>
        <ThemeToggle />
      </header>
      <main
        id="main-content"
        className={cn("flex flex-1 flex-col max-w-5xl w-full gap-4 px-5 py-8", align === "center" && "justify-center")}
      >
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

const visible = { scale: 1, opacity: 1, rotate: 0 };
const hidden = { scale: 0, opacity: 0, rotate: 90 };

function ThemeToggle() {
  const { theme: currentTheme, toggle: toggleTheme } = useTheme();
  const mounted = useIsMounted();

  const nextLabel = mounted ? getNextLabel(currentTheme) : "Toggle theme";

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <motion.button
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/10 bg-foreground/5 focus-visible:bg-foreground/10 transition-[background-color] focus-visible:outline-none overflow-hidden cursor-pointer"
          onClick={toggleTheme}
          aria-label={nextLabel}
          whileTap={{ scale: 0.88 }}
        >
          {mounted &&
            themeOptions.map(({ theme, Icon }) => (
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
        </motion.button>
      </TooltipTrigger>
      {mounted && <TooltipContent side="bottom">{currentTheme}</TooltipContent>}
    </Tooltip>
  );
}

function getNextLabel(theme: Theme) {
  const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const next = getNextTheme(theme, systemIsDark);
  return `switch to ${next === "system" ? "automatic" : next} mode`;
}

function useIsMounted() {
  const [mounted, setMounted] = useState(false);

  // layout effect so the browser never paints the wrong theme icon
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
