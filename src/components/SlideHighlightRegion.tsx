import {
  createContext,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "~/lib/cn";

type SlideBackdropRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type SlideHighlightRegionProps = {
  className?: string;
  backdropClassName?: string;
  groupAriaLabel?: string;
  children: ReactNode;
} & ({ variant: "navigation"; "aria-label": string } | { variant?: "panel" });

type SlideHighlightContextValue = {
  onInteract: (e: MouseEvent<Element> | FocusEvent<Element>) => void;
};

const SlideHighlightContext = createContext<SlideHighlightContextValue | null>(null);

export function SlideHighlightRegion(props: SlideHighlightRegionProps) {
  const { className, backdropClassName, children, groupAriaLabel } = props;
  const navigationAriaLabel =
    props.variant === "navigation" ? (props as { "aria-label": string })["aria-label"] : undefined;

  const rootRef = useRef<HTMLElement | null>(null);
  const activeTargetRef = useRef<HTMLElement | null>(null);
  const [backdrop, setBackdrop] = useState<SlideBackdropRect | null>(null);
  const [backdropVisible, setBackdropVisible] = useState(false);

  const measureActive = useCallback(() => {
    const target = activeTargetRef.current;
    const rootEl = rootRef.current;
    if (!target || !rootEl) return;

    const rootBox = rootEl.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    setBackdrop({
      left: targetBox.left - rootBox.left,
      top: targetBox.top - rootBox.top,
      width: targetBox.width,
      height: targetBox.height,
    });
  }, []);

  const activate = useCallback(
    (activeEl: HTMLElement | null) => {
      activeTargetRef.current = activeEl;
      if (activeEl === null) {
        setBackdropVisible(false);
        return;
      }
      window.requestAnimationFrame(() => {
        measureActive();
        setBackdropVisible(true);
      });
    },
    [measureActive],
  );

  const onInteract = useCallback(
    (event: FocusEvent<Element> | MouseEvent<Element>) => {
      activate(event.currentTarget as HTMLElement);
    },
    [activate],
  );

  const ctxValue = useMemo(() => ({ onInteract }), [onInteract]);

  useEffect(() => {
    if (!backdropVisible || activeTargetRef.current === null) return;

    window.addEventListener("resize", measureActive);
    window.addEventListener("scroll", measureActive, true);

    const resizeObserver = rootRef.current && new ResizeObserver(measureActive);
    if (rootRef.current && resizeObserver) {
      resizeObserver.observe(rootRef.current);
    }

    return () => {
      window.removeEventListener("resize", measureActive);
      window.removeEventListener("scroll", measureActive, true);
      resizeObserver?.disconnect();
    };
  }, [backdropVisible, measureActive]);

  const blurCaptureRoot = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      const nextTarget = event.relatedTarget;
      const nextEl = nextTarget instanceof HTMLElement ? nextTarget : null;
      if (!rootRef.current?.contains(nextEl)) activate(null);
    },
    [activate],
  );

  const setRootRef = (element: HTMLElement | null) => {
    rootRef.current = element;
  };

  const backdropNode = (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-0 rounded-lg bg-foreground/10 shadow-none",
        "transition-[left,top,width,height,opacity] duration-300 ease-out",
        "motion-reduce:transition-none motion-reduce:duration-150",
        backdropClassName,
        backdropVisible ? "opacity-100" : "opacity-0",
      )}
      style={
        backdrop !== null
          ? {
              left: backdrop.left,
              top: backdrop.top,
              width: backdrop.width,
              height: backdrop.height,
            }
          : undefined
      }
    />
  );

  const slideChildren = (
    <>
      {backdropNode}
      {children}
    </>
  );

  return (
    <SlideHighlightContext.Provider value={ctxValue}>
      {props.variant === "navigation" ? (
        <nav
          className={className}
          onBlurCapture={blurCaptureRoot}
          onMouseLeave={() => activate(null)}
          ref={setRootRef}
          aria-label={navigationAriaLabel}
        >
          {slideChildren}
        </nav>
      ) : (
        <fieldset
          aria-label={groupAriaLabel ?? undefined}
          className={cn(
            className,
            // Reset native fieldset chrome; we only need the grouping landmark.
            "min-w-0 border-0 p-0 [-webkit-appearance:none]",
          )}
          onBlurCapture={blurCaptureRoot}
          onMouseLeave={() => activate(null)}
          ref={setRootRef}
        >
          {slideChildren}
        </fieldset>
      )}
    </SlideHighlightContext.Provider>
  );
}

export function useSlideHighlightRegion() {
  return useContext(SlideHighlightContext);
}
