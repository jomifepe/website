import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "José Pereira",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
});

type RootDocumentProps = {
	children: ReactNode;
};

function CloudflareWebAnalyticsBeacon() {
	const token = import.meta.env.VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN;
	if (!token) {
		return null;
	}
	return (
		<script
			defer
			src="https://static.cloudflareinsights.com/beacon.min.js"
			data-cf-beacon={JSON.stringify({ token })}
		/>
	);
}

function RootDocument(props: RootDocumentProps) {
	const { children } = props;
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="bg-black">
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded focus:font-medium"
				>
					Skip to main content
				</a>
				{children}
				{process.env.NODE_ENV !== "production" && (
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "josé pereira",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				)}
				<CloudflareWebAnalyticsBeacon />
				<Scripts />
			</body>
		</html>
	);
}
