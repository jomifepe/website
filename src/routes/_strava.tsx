import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getActivities } from "~/lib/server-activities";

export const Route = createFileRoute("/_strava")({
  loader: async () => getActivities(),
  staleTime: 5 * 60 * 1000, // 5 minutes
  component: () => <Outlet />,
});
