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
      // Vercel ISR: served from cache; after `isr` seconds the next hit triggers a background re-render
      routeRules: {
        "/": { isr: 60 * 60 },
        "/workout": { isr: 60 * 60 },
      },
    }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    // no prerender: it freezes Strava data at build time and never refreshes. ISR above handles it
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
