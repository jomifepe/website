import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { PageLayout } from "~/components/PageLayout";
import { cn } from "~/lib/cn";

import { getRecentlyPlayed } from "~/lib/server-statsfm";

import { HeroParagraph, pickSentences } from "./-home/sentences";
import { WorkCard } from "./-home/work";
import { RecentWorkoutCard } from "./-home/workout";
import { SocialLinksGroup } from "./-home/social-links";

export const Route = createFileRoute("/_strava/")({
  loader: async () => {
    const recentTrack = await getRecentlyPlayed();
    return { recentTrack, sentences: pickSentences() };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=60",
  }),
  staleTime: 5 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
  component: HomePage,
});

function HomePage() {
  const activities = useLoaderData({ from: "/_strava" });
  const { recentTrack, sentences } = useLoaderData({ from: "/_strava/" });
  const recentWorkouts = activities.slice(0, 2);

  return (
    <PageLayout>
      <h1 className="sr-only">josé pereira - software engineer</h1>
      <p className="text-foreground">
        <strong>josé pereira</strong> is a{" "}
        <span className="underline underline-offset-4 decoration-dotted">software engineer</span>
      </p>
      <HeroParagraph sentences={sentences} />
      <div
        className={cn("grid w-full gap-4 mt-6 md:mt-16 self-stretch", recentWorkouts.length > 0 && "md:grid-cols-2")}
      >
        <WorkCard />
        {recentWorkouts.length > 0 && <RecentWorkoutCard activities={recentWorkouts} />}
      </div>
      <SocialLinksGroup recentTrack={recentTrack} />
    </PageLayout>
  );
}
