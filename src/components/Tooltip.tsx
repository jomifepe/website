import type { ReactNode } from "react";
import { cn } from "~/lib/cn";

type TooltipProps = {
	className?: string;
	content: string;
	children: ReactNode;
	side?: "top" | "bottom" | "left" | "right";
};

export function Tooltip(props: TooltipProps) {
	const { content, children, side = "top", className } = props;

	const sideClasses = {
		top: "bottom-full mb-2",
		bottom: "top-full mt-2",
		left: "right-full mr-2",
		right: "left-full ml-2",
	};

	return (
		<div className={cn("relative inline-block group", className)}>
			{children}
			<div
				className={`absolute ${sideClasses[side]} left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10`}
			>
				<div className="bg-white text-black text-xs font-medium px-2 py-1 rounded whitespace-nowrap">
					{content}
				</div>
			</div>
		</div>
	);
}
