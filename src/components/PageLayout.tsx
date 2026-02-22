import type React from "react";

export function PageLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center">
			{/** biome-ignore lint/correctness/useUniqueElementIds: this is needed */}
			<main
				id="main-content"
				className="flex flex-col max-w-[512px] w-full gap-4 p-4"
			>
				{children}
			</main>
		</div>
	);
}
