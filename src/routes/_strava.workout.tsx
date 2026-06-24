import { TbBrandStrava, TbChevronLeft } from "react-icons/tb";
import { createFileRoute, Link, Outlet, useLoaderData } from "@tanstack/react-router";
import { SlideHighlightRegion } from "~/components/SlideHighlightRegion";
import { SocialLink } from "~/components/SocialLink";
import { Badge } from "../components/ui/badge";
import { PageLayout } from "../components/PageLayout";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { WorkoutCard } from "../components/WorkoutCard";
import type { SanitizedActivity } from "../lib/strava";

export const Route = createFileRoute("/_strava/workout")({
  component: WorkoutPage,
});

function WorkoutPage() {
  const activities = useLoaderData({ from: "/_strava" });
  const { current, last } = groupActivitiesByWeek(activities);

  const weeks = [
    { label: "current week", activities: current },
    { label: "last week", activities: last },
  ];

  return (
    <PageLayout headerLeft={<BackButton />}>
      <section style={{ viewTransitionName: "workout-card" }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-foreground text-sm font-medium tracking-wider">workout</h1>
          <SocialLink
            name="strava"
            url="https://www.strava.com/athletes/jomifepe"
            title="strava"
            hoverColor="orange"
            useSlideHighlight={false}
            icon={<TbBrandStrava size={20} className="shrink-0" aria-hidden />}
          />
        </div>
        <div className="flex flex-col items-stretch gap-8">
          {weeks.map(({ label, activities: weekActivities }) => {
            const category =
              label === "current week"
                ? categorizeCurrentWeek(weekActivities.length)
                : categorizeWeek(weekActivities.length);

            return (
              <Card
                key={label}
                className="flex h-full flex-col gap-4 border-border bg-foreground/4 p-6 text-foreground shadow-none"
              >
                <CardHeader className="p-0">
                  <div className="flex flex-row flex-wrap items-center gap-3">
                    <CardTitle className="font-medium tracking-wider text-sm text-foreground">{label}</CardTitle>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Badge className="cursor-help" variant={category.color}>
                          {category.label}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{category.description}</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="flex min-h-0 flex-1 flex-col gap-2 p-0">
                  {weekActivities.length === 0 ? (
                    <p className="italic text-foreground/40 text-sm">no activities yet, get moving</p>
                  ) : (
                    <SlideHighlightRegion className="relative flex flex-col items-stretch gap-2" variant="panel">
                      {weekActivities.map((activity) => (
                        <WorkoutCard key={activity.slug} activity={activity} />
                      ))}
                    </SlideHighlightRegion>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
      <Outlet />
    </PageLayout>
  );
}

function BackButton() {
  return (
    <Link
      to="/"
      viewTransition
      preload="render"
      className="relative z-10 flex shrink-0 items-center justify-center rounded-lg -mx-2 -my-1 px-2 py-1 text-foreground/60 hover:text-foreground focus-visible:text-foreground hover:bg-foreground/7 focus-visible:bg-foreground/7 transition-colors motion-reduce:transition-none focus-visible:outline-none h-10"
      aria-label="back to home"
    >
      <span className="mr-2">
        <TbChevronLeft size={16} />
      </span>
      back
    </Link>
  );
}

type WeekCategory = {
  label: string;
  color: "gold" | "purple" | "green" | "red" | "secondary";
  description: string;
};

function categorizeCurrentWeek(activityCount: number): WeekCategory {
  return {
    label: "in progress",
    color: "secondary",
    description: `trained ${activityCount} day${activityCount === 1 ? "" : "s"} so far`,
  };
}

function categorizeWeek(activityCount: number): WeekCategory {
  if (activityCount >= 6) {
    return {
      label: "outstanding 🥇",
      color: "gold",
      description: `trained 6 or more days`,
    };
  }
  if (activityCount === 5) {
    return {
      label: "strong",
      color: "purple",
      description: "trained 5 days",
    };
  }
  if (activityCount >= 3) {
    return {
      label: "good",
      color: "green",
      description: `trained ${activityCount} days`,
    };
  }
  if (activityCount === 2) {
    return {
      label: "okay",
      color: "green",
      description: "trained 2 days",
    };
  }
  return {
    label: "slacking 😴",
    color: "red",
    description: `trained ${activityCount} day${activityCount === 1 ? "" : "s"}`,
  };
}

function groupActivitiesByWeek(activities: SanitizedActivity[]): {
  current: SanitizedActivity[];
  last: SanitizedActivity[];
} {
  const today = new Date();
  const offsetFromMonday = (today.getDay() - 1 + 7) % 7;

  const currentMondayDate = new Date(today);
  currentMondayDate.setDate(today.getDate() - offsetFromMonday);
  const currentMonday = currentMondayDate.toISOString().slice(0, 10);

  const lastMondayDate = new Date(currentMondayDate);
  lastMondayDate.setDate(currentMondayDate.getDate() - 7);
  const lastMonday = lastMondayDate.toISOString().slice(0, 10);

  const current: SanitizedActivity[] = [];
  const last: SanitizedActivity[] = [];

  for (const activity of activities) {
    if (activity.startDate >= currentMonday) current.push(activity);
    else if (activity.startDate >= lastMonday) last.push(activity);
  }

  return { current, last };
}
