import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary border border-secondary-foreground/5 text-secondary-foreground",
        destructive: "bg-destructive text-primary-foreground",
        outline: "text-foreground border",
        ghost: "bg-transparent text-foreground",
        gold: "bg-amber-500/20 text-amber-500",
        purple: "bg-purple-500/20 text-purple-400",
        green: "bg-green-500/20 text-green-700",
        red: "bg-red-500/20 text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge(props: BadgeProps) {
  const { className, variant, ...rest } = props;
  return <div className={cn(badgeVariants({ variant }), className)} {...rest} />;
}

export { Badge, badgeVariants };
