import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	resolve: {
		alias: {
			"~": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	plugins: [
		devtools(),
		nitro({
			preset: "vercel",
			// One render per hour per edge, then served instantly from the edge cache.
			// https://v3.nitro.build/deploy/providers/vercel#on-demand-incremental-static-regeneration-isr
			routeRules: {
				"/": { isr: 3600 },
				"/workout": { isr: 3600 },
			},
		}),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart({
			// ISR (see nitro routeRules above) handles freshness for / and /workout,
			// so we intentionally skip build-time prerender for them.
			prerender: { enabled: false },
		}),
		viteReact(),
	],
});

export default config;
