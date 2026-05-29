import { createServerFn } from "@tanstack/react-start";
import { fetchRecentlyPlayed } from "./statsfm";

export const getRecentlyPlayed = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await fetchRecentlyPlayed("jomifepe");
  } catch {
    return null;
  }
});
