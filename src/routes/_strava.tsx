import { createFileRoute } from "@tanstack/react-router";

import { getActivities } from "~/lib/server-activities";

export const Route = createFileRoute("/_strava")({
  loader: () => getActivities(),
  staleTime: 5 * 60 * 1000,
});
