import { WorkoutCard } from "~/components/WorkoutCard";
import { CardViewMoreLink } from "./work";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { StravaActivity } from "~/lib/strava";

type RecentWorkoutCardProps = {
  activities: StravaActivity[];
};

export function RecentWorkoutCard(props: RecentWorkoutCardProps) {
  const { activities } = props;

  return (
    <Card className="border-border bg-foreground/4 text-foreground shadow-none h-full flex flex-col gap-4 p-6">
      <CardHeader className="p-0">
        <CardTitle className="text-foreground text-sm font-medium tracking-wider">workout</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 p-0 min-h-0">
        <div className="flex flex-1 flex-col gap-2 min-h-0">
          {activities.map((activity, index) => (
            <WorkoutCard
              key={activity.id}
              activity={activity}
              variant="small"
              isLastItemInList={index === activities.length - 1}
            />
          ))}
        </div>
        <CardViewMoreLink to="/workout" ariaLabel="view all workouts" label="view more workouts" hoverLabel="💪" />
      </CardContent>
    </Card>
  );
}
