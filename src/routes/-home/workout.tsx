import { WorkoutCard } from "~/components/WorkoutCard";
import { SlideHighlightRegion } from "~/components/SlideHighlightRegion";
import { CardViewMoreLink } from "./work";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { SanitizedActivity } from "~/lib/strava";

type RecentWorkoutCardProps = {
  activities: SanitizedActivity[];
};

export function RecentWorkoutCard(props: RecentWorkoutCardProps) {
  const { activities } = props;

  return (
    <Card
      className="border-border bg-foreground/4 text-foreground shadow-none h-full flex flex-col gap-4 p-5 md:p-6 group/workout"
      style={{ viewTransitionName: "workout-card" }}
    >
      <CardHeader className="p-0">
        <CardTitle className="text-foreground text-sm font-medium tracking-wider">
          <span className="relative inline-block">
            work
            <span
              aria-hidden
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full origin-left scale-x-0 bg-foreground group-hover/workout:scale-x-100 transition-transform duration-300 ease-in-out motion-reduce:transition-none mt-px"
            />
          </span>
          out
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 p-0 min-h-0">
        <SlideHighlightRegion className="relative flex flex-1 flex-col gap-2 min-h-0" variant="panel">
          {activities.map((activity) => (
            <WorkoutCard key={activity.slug} activity={activity} variant="small" dialog="local" />
          ))}
        </SlideHighlightRegion>
        <CardViewMoreLink
          to="/workout"
          ariaLabel="view all workouts"
          label="view more workouts"
          hoverLabel="💪"
          preload="render"
        />
      </CardContent>
    </Card>
  );
}
