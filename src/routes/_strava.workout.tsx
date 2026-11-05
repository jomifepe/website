import { createFileRoute, Link, Outlet, useLoaderData } from "@tanstack/react-router";
import { FaMedal } from "react-icons/fa";
import { TbActivity, TbBrandStrava, TbChevronLeft, TbClock, TbRoute } from "react-icons/tb";

import { PageLayout } from "~/components/PageLayout";
import { SlideHighlightRegion } from "~/components/SlideHighlightRegion";
import { SocialLink } from "~/components/SocialLink";
import { Badge } from "~/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { WorkoutCard } from "~/components/WorkoutCard";
import { BEST_EFFORT_TARGETS, formatDurationNoSeconds, type BestEfforts } from "~/lib/best-efforts";
import { formatMovingTime } from "~/lib/format";
import { groupActivitiesByWeek, type SanitizedActivity } from "~/lib/strava";
import { cn } from "~/lib/utils";
import { categorizeCurrentWeek, categorizeWeek } from "~/lib/workout-week";

export const Route = createFileRoute("/_strava/workout")({
  component: WorkoutPage,
});

function WorkoutPage() {
  const { activities, bestEfforts } = useLoaderData({ from: "/_strava" });
  const { current, last } = groupActivitiesByWeek(activities);

  const weeks = [
    { label: "current week", activities: current, category: categorizeCurrentWeek(current) },
    ...(last.length > 0 ? [{ label: "last week", activities: last, category: categorizeWeek(last) }] : []),
  ];

  return (
    <PageLayout headerLeft={<BackButton />} align="start">
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
        {/* 2xl negative margin = Best efforts w-44 + row gap so week columns stay aligned with the heading */}
        <div
          className={cn(
            "flex flex-col items-stretch gap-8",
            bestEfforts && "lg:flex-row lg:items-start lg:gap-6 2xl:-ml-[12.5rem]",
          )}
        >
          {bestEfforts && <BestEffortsCard bestEfforts={bestEfforts} />}
          <div className={cn("flex min-w-0 flex-col gap-8", bestEfforts && "flex-1")}>
            {weeks.map(({ label, activities: weekActivities, category }) => (
              // the negative margin at 2xl widens the row past the max-w-5xl column so the
              // summary lands in the viewport gutter while staying in flow (-mr = card + gap)
              <div key={label} className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start 2xl:-mr-48">
                <Card className="min-w-0 flex-1 gap-4 overflow-hidden p-4 lg:p-6">
                  <CardHeader className="p-0">
                    <div className="flex flex-row flex-wrap items-center gap-3">
                      <CardTitle>{label}</CardTitle>
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
            ))}
          </div>
        </div>
      </section>
      <Outlet />
    </PageLayout>
  );
}

type BestEffortsCardProps = {
  bestEfforts: BestEfforts;
};

function BestEffortsCard(props: BestEffortsCardProps) {
  const { bestEfforts } = props;

  return (
    <Card className="-order-1 shrink-0 gap-3 p-4 lg:order-0 lg:sticky lg:top-4 lg:w-44 lg:self-start">
      <CardHeader className="p-0">
        <CardTitle>Best efforts</CardTitle>
        <CardAction className="row-span-1 self-center">
          <FaMedal aria-hidden className="text-amber-500" size={12} />
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        <dl className="flex flex-col gap-2">
          {BEST_EFFORT_TARGETS.map((target) => {
            const elapsed = bestEfforts[target.key];
            const value = elapsed !== undefined ? formatDurationNoSeconds(elapsed) : "—";

            return (
              <div key={target.key} className="flex items-baseline justify-between gap-2 text-sm whitespace-nowrap">
                <dt className="min-w-0 truncate text-foreground/60">{target.label}</dt>
                <dd className="shrink-0 font-medium tabular-nums text-foreground">{value}</dd>
              </div>
            );
          })}
        </dl>
      </CardContent>
    </Card>
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
    <Card className="-order-1 shrink-0 gap-0 p-4 lg:order-0 lg:sticky lg:top-4 lg:w-44">
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
