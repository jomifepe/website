import { TbActivity, TbBrandStrava, TbChevronLeft, TbClock, TbRoute } from "react-icons/tb";
import { createFileRoute, Link, Outlet, useLoaderData } from "@tanstack/react-router";
import { SlideHighlightRegion } from "~/components/SlideHighlightRegion";
import { SocialLink } from "~/components/SocialLink";
import { Badge } from "../components/ui/badge";
import { PageLayout } from "../components/PageLayout";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { WorkoutCard, formatMovingTime } from "../components/WorkoutCard";
import { computeSportSet, groupActivitiesByWeek, type SanitizedActivity } from "../lib/strava";

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
              label === "current week" ? categorizeCurrentWeek(weekActivities.length) : categorizeWeek(weekActivities);

            return (
              // the negative margin at 2xl widens the row past the max-w-5xl column so the
              // summary lands in the viewport gutter while staying in flow (-mr = card + gap)
              <div key={label} className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start 2xl:-mr-48">
                <Card className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden border-border bg-foreground/4 p-4 text-foreground shadow-none lg:p-6">
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
                <WeekSummaryCard activities={weekActivities} />
              </div>
            );
          })}
        </div>
      </section>
      <Outlet />
    </PageLayout>
  );
}

type WeekSummaryCardProps = {
  activities: SanitizedActivity[];
};

function WeekSummaryCard(props: WeekSummaryCardProps) {
  const { activities } = props;

  const totalDistance = activities.reduce((total, activity) => total + activity.distance, 0);
  const totalMovingTime = activities.reduce((total, activity) => total + activity.moving_time, 0);

  const stats = [
    { label: "activities", value: activities.length.toString(), icon: <TbActivity size={12} /> },
    { label: "distance", value: `${(totalDistance / 1000).toFixed(1)} km`, icon: <TbRoute size={12} /> },
    { label: "time", value: formatMovingTime(totalMovingTime), icon: <TbClock size={12} /> },
  ];

  return (
    <Card className="-order-1 shrink-0 gap-0 border-border bg-foreground/4 p-4 text-foreground shadow-none lg:order-0 lg:sticky lg:top-4 lg:w-44">
      <dl className="flex flex-row flex-wrap gap-x-6 gap-y-3 lg:flex-col">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5">
            <dt className="flex items-center gap-1 text-xs text-foreground/40">
              {stat.icon}
              {stat.label}
            </dt>
            <dd className="text-sm font-medium text-foreground">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
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

function categorizeWeek(activities: SanitizedActivity[]): WeekCategory {
  const activityCount = activities.length;
  const description = `trained ${activityCount} days`;

  const weeklyGoal = checkWeeklyGoal(activities);
  if (weeklyGoal.wasMet) {
    return {
      label: "outstanding 🥇",
      color: "gold",
      description: `${description}. reached goal of ${weeklyGoalDescription}`,
    };
  }

  if (activityCount >= 5) {
    return { label: "strong", color: "purple", description };
  }
  if (activityCount >= 3) {
    return { label: "good", color: "green", description };
  }
  if (activityCount === 2) {
    return { label: "okay", color: "green", description };
  }
  return {
    label: "slacking 😴",
    color: "red",
    description: `trained ${activityCount} day${activityCount === 1 ? "" : "s"}`,
  };
}

/** current weekly goal, adapt as needed */
const weeklyGoal = { run: 3, lift: 3 };
const weeklyGoalDescription = Object.entries(weeklyGoal)
  .map(([key, value]) => `${value}+ ${key}${value === 1 ? "" : "s"}`)
  .join(", ")
  .replace(/, ([^,]*)$/, " and $1");

function checkWeeklyGoal(activities: SanitizedActivity[]) {
  const counts = { run: 0, lift: 0 };
  for (const activity of activities) {
    const sportSet = computeSportSet(activity.sport_type);
    if (sportSet === "run") counts.run++;
    if (sportSet === "lift") counts.lift++;
  }

  return {
    wasMet: Object.entries(counts).every(([key, count]) => count >= weeklyGoal[key as keyof typeof weeklyGoal]),
    description: weeklyGoalDescription,
  };
}
