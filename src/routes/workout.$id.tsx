import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ActivityDialog } from "~/components/WorkoutCard";
import { Dialog } from "~/components/ui/dialog";
import { getActivityDetailBySlug } from "~/lib/server-activities";

export const Route = createFileRoute("/workout/$id")({
  loader: async ({ params }) => {
    try {
      const detail = await getActivityDetailBySlug({ data: { slug: params.id } });
      return { detail };
    } catch {
      throw redirect({ to: "/workout" });
    }
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
      <ActivityDialog activity={detail} />
    </Dialog>
  );
}
