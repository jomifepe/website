import { defineConfig } from "nitro";

export default defineConfig({
  routeRules: {
    "/": { isr: { expiration: 300 } },
    "/workout/**": { isr: { expiration: 300 } },
    "/_serverFn/**": { isr: { expiration: 300 } },
  },
});
