import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { PageLayout } from "~/components/PageLayout";
import { cn } from "~/lib/cn";

import { getActivities } from "~/lib/server-activities";
import { getRecentlyPlayed } from "~/lib/server-statsfm";

import { HeroParagraph, pickSentences } from "./-home/sentences";
import { WorkCard } from "./-home/work";
import { RecentWorkoutCard } from "./-home/workout";
import { SocialLinksGroup } from "./-home/social-links";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [activities, recentTrack] = await Promise.all([getActivities(), getRecentlyPlayed()]);
    return {
      recentWorkouts: activities.slice(0, 2),
      recentTrack,
      sentences: pickSentences(),
    };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
  }),
  staleTime: 60 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
  component: HomePage,
});

function HomePage() {
  const { recentWorkouts, recentTrack, sentences } = useLoaderData({ from: "/" });

  return (
    <PageLayout>
      <h1 className="sr-only">josé pereira - software engineer</h1>
      <p className="text-foreground">
        <strong>josé pereira</strong> is a{" "}
        <span className="underline underline-offset-4 decoration-dotted">software engineer</span>
      </p>
      <HeroParagraph sentences={sentences} />
      <div
        className={cn("grid w-full gap-4 mt-8 md:mt-16 self-stretch", recentWorkouts.length > 0 && "md:grid-cols-2")}
      >
        <WorkCard />
        {recentWorkouts.length > 0 && <RecentWorkoutCard activities={recentWorkouts} />}
      </div>
      <SocialLinksGroup recentTrack={recentTrack} />
    </PageLayout>
  );
}
