import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

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
      // Vercel ISR: served from cache; after `expiration` seconds the next hit triggers a background re-render.
      // allowQuery: [] so ?utm_… and bot query strings share one cache entry instead of each writing their own
      routeRules: {
        "/": { isr: { expiration: 60 * 60, allowQuery: [] } },
        "/workout": { isr: { expiration: 60 * 60, allowQuery: [] } },
      },
    }),
    tailwindcss(),
    // no prerender: it freezes Strava data at build time and never refreshes. ISR above handles it
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
