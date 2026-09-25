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
    nitro({ preset: "vercel" }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    // no prerender: it freezes Strava data at build time. pages are SSR'd and CDN-cached via
    // the Cache-Control header in routes/_strava.tsx
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
