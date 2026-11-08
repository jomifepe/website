import type { ComponentProps } from "react";

import { cn } from "~/lib/utils";

function Card(props: ComponentProps<"div">) {
  const { className, ...rest } = props;
  return (
    <div
      data-slot="card"
      className={cn("flex flex-col rounded-xl border border-border bg-foreground/4 text-foreground", className)}
      {...rest}
    />
  );
}

function CardHeader(props: ComponentProps<"div">) {
  const { className, ...rest } = props;
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...rest}
    />
  );
}

function CardTitle(props: ComponentProps<"div">) {
  const { className, ...rest } = props;
  return (
    <div
      data-slot="card-title"
      className={cn("text-sm font-medium tracking-wider text-foreground", className)}
      {...rest}
    />
  );
}

function CardDescription(props: ComponentProps<"div">) {
  const { className, ...rest } = props;
  return <div data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...rest} />;
}

function CardAction(props: ComponentProps<"div">) {
  const { className, ...rest } = props;
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...rest}
    />
  );
}

function CardContent(props: ComponentProps<"div">) {
  const { className, ...rest } = props;
  return <div data-slot="card-content" className={cn("px-6", className)} {...rest} />;
}

function CardFooter(props: ComponentProps<"div">) {
  const { className, ...rest } = props;
  return <div data-slot="card-footer" className={cn("flex items-center px-6 [.border-t]:pt-6", className)} {...rest} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
