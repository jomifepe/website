import type { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";

type PageLayoutProps = {
  children: ReactNode;
};

export function PageLayout(props: PageLayoutProps) {
  const { children } = props;
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <main id="main-content" className="flex flex-col max-w-5xl w-full gap-4 py-12 px-5">
        {children}
      </main>
    </div>
  );
}
