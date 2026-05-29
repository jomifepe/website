import { IconMoon, IconSun, IconSunMoon } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { Theme } from "~/hooks/useTheme";
import { useTheme } from "~/hooks/useTheme";

const CYCLE: Theme[] = ["dark", "light", "system"];

const ICONS: Record<Theme, ReactNode> = {
  dark: <IconMoon size={17} strokeWidth={1.75} />,
  light: <IconSun size={17} strokeWidth={1.75} />,
  system: <IconSunMoon size={17} strokeWidth={1.75} />,
};

const NAMES: Record<Theme, string> = {
  dark: "Dark",
  light: "Light",
  system: "System",
};

function getNextLabel(theme: Theme): string {
  const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (theme === "system") return systemIsDark ? "Switch to light mode" : "Switch to dark mode";
  if (theme === "dark") return systemIsDark ? "Switch to automatic mode" : "Switch to light mode";
  return systemIsDark ? "Switch to dark mode" : "Switch to automatic mode";
}

const springTransition = {
  type: "spring",
  stiffness: 500,
  damping: 28,
  opacity: { duration: 0.1, ease: "easeOut" },
} as const;

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const step = mounted ? CYCLE.indexOf(theme) : 0;

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setTooltipOpen(true), 800);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setTooltipOpen(false);
  };

  return (
    <Tooltip open={mounted && tooltipOpen}>
      <TooltipTrigger asChild>
        <motion.button
          onClick={toggle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label={mounted ? getNextLabel(theme) : "Toggle theme"}
          whileTap={{ scale: 0.88 }}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring overflow-hidden cursor-pointer"
        >
          {/* AnimatePresence only mounts after the layout effect fires, so
					    AnimatePresence.initial={false} skips the enter animation for the
					    first (correct) icon — no spring from wrong→right on load. */}
          {mounted && (
            <AnimatePresence mode="sync" initial={false} custom={step}>
              <motion.span
                key={theme}
                custom={step}
                initial={{ scale: 0, rotate: 90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: -90, opacity: 0 }}
                transition={springTransition}
                className="absolute inset-0 flex items-center justify-center"
              >
                {ICONS[theme]}
              </motion.span>
            </AnimatePresence>
          )}
        </motion.button>
      </TooltipTrigger>
      {mounted && <TooltipContent side="bottom">{NAMES[theme]}</TooltipContent>}
    </Tooltip>
  );
}
