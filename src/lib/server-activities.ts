import { createServerFn } from "@tanstack/react-start";
import { loadActivityDetailBySlug, loadWorkoutsForSite } from "./workouts-store";

export const getActivities = createServerFn({ method: "GET" }).handler(async () => loadWorkoutsForSite());

export const getActivityDetailBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => loadActivityDetailBySlug(data.slug));
