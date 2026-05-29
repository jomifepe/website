import { createServerFn } from "@tanstack/react-start";
import { fetchActivities, type SportType, type StravaActivity } from "./strava";

type InputData = {
  page?: number;
  perPage?: number;
};

export const getActivities = createServerFn({ method: "GET" })
  .inputValidator((data?: InputData) => ({
    page: data?.page ?? 1,
    // 28 covers the worst realistic case for /workout's "current + last week"
    // grouping: 14 days × up to 2 activities/day.
    perPage: data?.perPage ?? 28,
  }))
  .handler(async ({ data }) => {
    const activities = await fetchActivities(data.page, data.perPage);
    return activities.map(attachWorkoutCardDisplay);
  });

export type WorkoutCardActivity = StravaActivity & {
  displayTitle: string;
  displayDateStr: string;
};

function attachWorkoutCardDisplay(activity: StravaActivity): WorkoutCardActivity {
  const date = new Date(activity.start_date_local);
  const hour = date.getHours();

  let timeOfDay: string;
  if (hour < 12) {
    timeOfDay = "morning";
  } else if (hour < 17) {
    timeOfDay = "afternoon";
  } else {
    timeOfDay = "evening";
  }

  const displayTitle = `${timeOfDay} ${runLabel(activity.sport_type, activity.distance) ?? sportTypeLabel(activity.sport_type)}`;

  const displayDateStr = date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toLowerCase();

  return {
    ...activity,
    displayTitle,
    displayDateStr,
  };
}

const RUN_SPORT_TYPES = new Set<SportType>(["Run", "TrailRun", "VirtualRun"]);

const RUN_PREFIXES: Partial<Record<SportType, string>> = {
  TrailRun: "trail",
  VirtualRun: "virtual",
};

/**
 * Returns a distance-aware label for run sport types, or `null` for non-runs.
 * Distance thresholds (distance is in metres):
 *   ≥ 42 195 m → marathon
 *   ≥ 21 097.5 m → half marathon
 *   > 10 000 m → long run
 *   otherwise → run
 */
function runLabel(sportType: SportType, distanceMetres: number): string | null {
  if (!RUN_SPORT_TYPES.has(sportType)) return null;

  const prefix = RUN_PREFIXES[sportType] ? `${RUN_PREFIXES[sportType]} ` : "";

  if (distanceMetres >= 42_195) return `${prefix}marathon`;
  if (distanceMetres >= 21_097.5) return `${prefix}half marathon`;
  if (distanceMetres > 10_000) return `${prefix}long run`;
  return `${prefix}run`;
}

/** Converts `TrailRun` → `trail run` etc. */
function sportTypeLabel(sportType: SportType): string {
  return sportType
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toLowerCase();
}
