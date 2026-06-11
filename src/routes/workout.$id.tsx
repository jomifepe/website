import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ActivityDialog } from "~/components/WorkoutCard";
import { Dialog } from "~/components/ui/dialog";
import { getActivities, getActivityDetail } from "~/lib/server-activities";
import { activitySlug } from "~/lib/strava";

export const Route = createFileRoute("/workout/$id")({
  loader: async ({ params }) => {
    const activities = await getActivities();
    const match = activities.find((a) => activitySlug(a.start_date_local) === params.id);
    if (!match) throw redirect({ to: "/workout" });
    const detail = await getActivityDetail({ data: { id: match.id } });
    return { detail };
  },
  component: WorkoutActivityDialog,
});

function WorkoutActivityDialog() {
  const { detail } = Route.useLoaderData();
  const navigate = useNavigate();

  function handleOpenChange(open: boolean) {
    if (!open) navigate({ to: "/workout" });
  }

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <ActivityDialog
        activity={detail}
        open={true}
        onOpenChange={handleOpenChange}
        preloadedCalories={detail.calories ?? null}
      />
    </Dialog>
  );
}
