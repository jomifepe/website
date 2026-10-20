import { createFileRoute } from "@tanstack/react-router";
import { syncWorkoutsStore } from "~/lib/workouts-store";

export const Route = createFileRoute("/api/strava-sync")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret) {
          const authHeader = request.headers.get("authorization");
          if (authHeader !== `Bearer ${cronSecret}`) {
            return new Response("Unauthorized", { status: 401 });
          }
        }

        try {
          const doc = await syncWorkoutsStore();
          return Response.json({
            ok: true,
            activityCount: doc.activities.length,
            backfillComplete: doc.backfillComplete,
            updatedAt: doc.updatedAt,
          });
        } catch (error) {
          console.error("Strava sync failed:", error);
          return Response.json({ ok: false, error: "Sync failed" }, { status: 500 });
        }
      },
    },
  },
});
