import type { ReactNode } from "react";

import { useSlideHighlightRegion } from "~/components/SlideHighlightRegion";
import { cn } from "~/lib/utils";

export const hoverColorClass = {
  green: "hover:text-green-400 focus-visible:text-green-400",
  orange: "hover:text-orange-400 focus-visible:text-orange-400",
  purple: "hover:text-purple-400 focus-visible:text-purple-400",
  red: "hover:text-red-400 focus-visible:text-red-400",
  blue: "hover:text-blue-400 focus-visible:text-blue-400",
  white: "hover:text-foreground/80 focus-visible:text-foreground/80",
} as const;

export type HoverColor = keyof typeof hoverColorClass;

export type SocialLinkProps = {
  name: string;
  url: string;
  icon: ReactNode;
  title: string;
  hoverColor?: HoverColor;
  /** When false, do not integrate with SlideHighlight (standalone hover/fill). */
  useSlideHighlight?: boolean;
};

export function SocialLink(props: SocialLinkProps) {
  const { name, url, icon, title, hoverColor = "white", useSlideHighlight = true } = props;

  const slideHighlightCtx = useSlideHighlightRegion();
  const slideHighlight = useSlideHighlight ? slideHighlightCtx : null;
  const isExternal = !url.startsWith("mailto:");

  return (
    <a
      className={cn(
        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground/60 hover:text-foreground focus-visible:text-foreground",
        "transition-colors motion-reduce:transition-none focus-visible:outline-none",
        hoverColorClass[hoverColor],
        slideHighlight === null && "focus-visible:bg-foreground/7 hover:bg-foreground/7",
      )}
      href={url}
      title={title}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onFocus={slideHighlight?.onInteract}
      onMouseEnter={slideHighlight?.onInteract}
      aria-label={`${name}${isExternal ? " (opens in new tab)" : ""}`}
    >
      {icon}
    </a>
  );
}
