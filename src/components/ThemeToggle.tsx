import { IconMoon, IconProps, IconSun, IconSunMoon } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { Theme } from "~/hooks/useTheme";
import { useTheme } from "~/hooks/useTheme";

const springTransition = {
  type: "spring",
  stiffness: 500,
  damping: 28,
  opacity: { duration: 0.1, ease: "easeOut" },
} as const;

export function ThemeToggle() {
  const appTheme = useTheme();
  const mounted = useIsMounted();
  const tooltip = usePersistentTooltipHover();

  const themeValues = getThemeValues({ theme: appTheme.theme, mounted });

  return (
    <Tooltip open={mounted && tooltip.open}>
      <TooltipTrigger asChild>
        <motion.button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/10 focus:bg-foreground/10 transition-colors focus:outline-none overflow-hidden cursor-pointer"
          onClick={appTheme.toggle}
          onMouseEnter={tooltip.handleMouseEnter}
          onMouseLeave={tooltip.handleMouseLeave}
          aria-label={themeValues.nextLabel}
          whileTap={{ scale: 0.88 }}
        >
          {mounted && (
            <AnimatePresence mode="sync" initial={false} custom={themeValues.step}>
              <motion.span
                key={appTheme.theme}
                className="absolute inset-0 flex items-center justify-center"
                custom={themeValues.step}
                initial={{ scale: 0, rotate: 90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: -90, opacity: 0 }}
                transition={springTransition}
              >
                <themeValues.IconComponent className="text-foreground" size={17} strokeWidth={1.75} />
              </motion.span>
            </AnimatePresence>
          )}
        </motion.button>
      </TooltipTrigger>
      {mounted && <TooltipContent side="bottom">{themeValues.name}</TooltipContent>}
    </Tooltip>
  );
}

const CYCLE: Theme[] = ["dark", "light", "system"];

const ICONS: Record<Theme, (props: IconProps) => ReactNode> = {
  dark: IconMoon,
  light: IconSun,
  system: IconSunMoon,
};

const NAMES: Record<Theme, string> = {
  dark: "dark",
  light: "light",
  system: "system",
};

function getNextLabel(theme: Theme): string {
  const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (theme === "system") return systemIsDark ? "switch to light mode" : "switch to dark mode";
  if (theme === "dark") return systemIsDark ? "switch to automatic mode" : "switch to light mode";
  return systemIsDark ? "switch to dark mode" : "switch to automatic mode";
}

type GetThemeValuesArgs = {
  theme: Theme;
  mounted: boolean;
};

function getThemeValues({ theme, mounted }: GetThemeValuesArgs) {
  const nextLabel = mounted ? getNextLabel(theme) : "Toggle theme";
  const step = mounted ? CYCLE.indexOf(theme) : 0;
  const IconComponent = ICONS[theme];
  const name = NAMES[theme];

  return { IconComponent, name, nextLabel, step };
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

function usePersistentTooltipHover() {
  const [open, setTooltipOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setTooltipOpen(true), 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setTooltipOpen(false);
  };

  return { open, handleMouseEnter, handleMouseLeave };
}
