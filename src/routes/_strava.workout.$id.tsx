import { useEffect } from "react";
import { createFileRoute, useLoaderData, useNavigate, useParams } from "@tanstack/react-router";
import { ActivityDialog } from "~/components/WorkoutCard";
import { getActivityDetailBySlug } from "~/lib/server-activities";

export const Route = createFileRoute("/_strava/workout/$id")({
  loader: async ({ params }) => {
    // Not awaited: the fast summary data (from the shared /_strava list) is
    // enough to open the dialog immediately. This only supplies supplementary
    // fields (e.g. calories), streamed in via use() once it resolves.
    const deferredDetail = getActivityDetailBySlug({ data: { slug: params.id } });
    return { deferredDetail };
  },
  component: WorkoutActivityDialog,
});

function WorkoutActivityDialog() {
  const { id } = useParams({ from: "/_strava/workout/$id" });
  const activities = useLoaderData({ from: "/_strava" });
  const { deferredDetail } = Route.useLoaderData();
  const navigate = useNavigate();

  const activity = activities.find((a) => a.slug === id);

  useEffect(() => {
    if (!activity) navigate({ to: "/workout", replace: true });
  }, [activity, navigate]);

  if (!activity) return null;

  function handleOpenChange(open: boolean) {
    if (!open) navigate({ to: "/workout", resetScroll: false });
  }

  return (
    <ActivityDialog activity={activity} deferredDetail={deferredDetail} open={true} onOpenChange={handleOpenChange} />
  );
}
