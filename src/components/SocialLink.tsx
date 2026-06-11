import {
  type FocusEvent,
  type FocusEventHandler,
  forwardRef,
  type MouseEvent,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { useSlideHighlightRegion } from "~/components/SlideHighlightRegion";
import { cn } from "~/lib/cn";

const hoverColorClass = {
  green: "hover:text-green-400 focus-visible:text-green-400",
  orange: "hover:text-orange-400 focus-visible:text-orange-400",
  purple: "hover:text-purple-400 focus-visible:text-purple-400",
  red: "hover:text-red-400 focus-visible:text-red-400",
  blue: "hover:text-blue-400 focus-visible:text-blue-400",
  white: "hover:text-foreground/80 focus-visible:text-foreground/80",
} as const;

export type SocialLinkHoverColor = keyof typeof hoverColorClass;

export type SocialLinkProps = {
  name: string;
  url: string;
  icon: ReactNode;
  title: string;
  hoverColor?: SocialLinkHoverColor;
  /** When false, do not integrate with SlideHighlight (standalone hover/fill). */
  useSlideHighlight?: boolean;
  omitHoverBackdrop?: boolean;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
  onFocus?: FocusEventHandler<HTMLAnchorElement>;
  className?: string;
};

export const SocialLink = forwardRef<HTMLAnchorElement, SocialLinkProps>((props, ref) => {
  const {
    name,
    url,
    icon,
    title,
    hoverColor = "white",
    useSlideHighlight = true,
    omitHoverBackdrop = false,
    onFocus: onFocusProp,
    onMouseEnter: onMouseEnterProp,
    className: classNameProp,
  } = props;

  const slideHighlightCtx = useSlideHighlightRegion();

  const slideHighlight = useSlideHighlight && slideHighlightCtx !== null ? slideHighlightCtx : null;
  const suppressBackdropFill = omitHoverBackdrop || slideHighlight !== null;
  const isExternal = !url.startsWith("mailto:");

  const handleFocus = (event: FocusEvent<HTMLAnchorElement>) => {
    onFocusProp?.(event);
    slideHighlight?.onInteract(event);
  };

  const handleMouseEnter = (event: MouseEvent<HTMLAnchorElement>) => {
    onMouseEnterProp?.(event);
    slideHighlight?.onInteract(event);
  };

  return (
    <a
      ref={ref}
      className={cn(
        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground/60 hover:text-foreground focus-visible:text-foreground",
        "transition-colors motion-reduce:transition-none focus-visible:outline-none",
        hoverColorClass[hoverColor],
        !suppressBackdropFill && "focus-visible:bg-foreground/7 hover:bg-foreground/7",
        classNameProp,
      )}
      href={url}
      title={title}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onFocus={handleFocus}
      onMouseEnter={handleMouseEnter}
      aria-label={`${name}${isExternal ? " (opens in new tab)" : ""}`}
    >
      {icon}
    </a>
  );
});
