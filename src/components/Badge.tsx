import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/cn";

const badgeVariants = cva(
	"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground",
				secondary: "bg-secondary text-secondary-foreground",
				destructive: "bg-destructive text-primary-foreground",
				outline: "text-foreground border",
				ghost: "bg-transparent text-foreground",
				gold: "bg-amber-500/20 text-amber-400",
				purple: "bg-purple-500/20 text-purple-400",
				green: "bg-green-500/20 text-green-400",
				red: "bg-red-500/20 text-red-400",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
