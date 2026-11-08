import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { loadActivityDetailBySlug, loadWorkoutsForSite } from "./workouts-store";

export const getActivities = createServerFn({ method: "GET" }).handler(async () => loadWorkoutsForSite());

export const getActivityDetailBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => loadActivityDetailBySlug(data.slug));
