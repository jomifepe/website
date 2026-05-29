import type { FocusEvent, MouseEvent } from "react";
import { createContext } from "react";

export type SlideHighlightContextValue = {
  onInteract: (e: MouseEvent<Element> | FocusEvent<Element>) => void;
};

export const SlideHighlightContext = createContext<SlideHighlightContextValue | null>(null);
