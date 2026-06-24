import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "~/lib/utils";
import { useSlideHighlightRegion } from "./SlideHighlightRegion";

type CardItemOwnProps = {
  icon: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  endSlot?: ReactNode;
  className?: string;
};

type CardItemProps<T extends ElementType = "div"> = CardItemOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof CardItemOwnProps | "as">;

type CardItemContentProps = Pick<CardItemOwnProps, "icon" | "title" | "subtitle" | "endSlot">;

/** Inner layout shared by CardItem and custom wrapper elements (e.g. TanStack Router Link). */
export function CardItemContent(props: CardItemContentProps) {
  const { icon, title, subtitle, endSlot } = props;
  return (
    <>
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-row items-baseline gap-2 mb-1 flex-wrap text-sm md:text-base">{title}</div>
        <div className="text-foreground/60 text-sm md:text-base">{subtitle}</div>
      </div>
      {endSlot}
    </>
  );
}

/**
 * Returns consistent wrapper props (className + slide-highlight handlers) for CardItem-style elements.
 * Use when the wrapper must be a specific component (e.g. TanStack Router Link) that loses type
 * safety through the generic `as` prop.
 */
export function useCardItemWrapperProps(className?: string) {
  const slideHighlight = useSlideHighlightRegion();
  return {
    className: cn(
      "relative flex cursor-pointer items-start gap-4 rounded-lg",
      "-mx-2 px-2 py-2 md:-mx-3 md:px-3 md:py-3",
      "transition-colors focus-visible:outline-none",
      slideHighlight != null ? "z-10" : "hover:bg-foreground/7 focus-visible:bg-foreground/7",
      className,
    ),
    onMouseEnter: slideHighlight?.onInteract,
    onFocus: slideHighlight?.onInteract,
  };
}

// The internal Comp cast is necessary because TypeScript can't verify that the inferred
// T's props are compatible with the generic ElementType after narrowing.
// Type safety is enforced at the call site via CardItemProps<T>.
export function CardItem<T extends ElementType = "div">(props: CardItemProps<T>) {
  const { as, icon, title, subtitle, endSlot, className, ...rest } = props;
  const Comp = (as ?? "div") as ElementType<Record<string, unknown>>;
  const wrapperProps = useCardItemWrapperProps(className);

  return (
    <Comp {...rest} {...wrapperProps}>
      <CardItemContent icon={icon} title={title} subtitle={subtitle} endSlot={endSlot} />
    </Comp>
  );
}
