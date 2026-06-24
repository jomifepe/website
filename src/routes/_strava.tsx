import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getActivities } from "~/lib/server-activities";

export const Route = createFileRoute("/_strava")({
  loader: async () => getActivities(),
  staleTime: 5 * 60 * 1000,
  headers: () => ({
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=60",
  }),
  component: () => <Outlet />,
});
