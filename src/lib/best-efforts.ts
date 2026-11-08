import { computeSportSet, type SportType } from "./strava";

export const BEST_EFFORT_TARGETS = [
  { key: "halfMarathon", meters: 21_097.5, label: "Half" },
  { key: "km15", meters: 15_000, label: "15km" },
  { key: "km10", meters: 10_000, label: "10km" },
  { key: "km5", meters: 5_000, label: "5km" },
  { key: "km1", meters: 1_000, label: "1km" },
] as const;

export type BestEffortKey = (typeof BEST_EFFORT_TARGETS)[number]["key"];

/** Elapsed seconds per distance, for one run or the best across all runs. */
export type BestEfforts = Partial<Record<BestEffortKey, number>>;

const DISTANCE_MATCH_TOLERANCE_METERS = 50;

type BestEffortSegment = {
  distance: number;
  elapsed_time: number;
};

export function extractRunBestEfforts(segments: BestEffortSegment[] | undefined): BestEfforts {
  if (!segments?.length) return {};

  const result: BestEfforts = {};
  for (const target of BEST_EFFORT_TARGETS) {
    const match = segments.find(
      (segment) => Math.abs(segment.distance - target.meters) <= DISTANCE_MATCH_TOLERANCE_METERS,
    );
    if (match) result[target.key] = match.elapsed_time;
  }
  return result;
}

type ActivityWithRunEfforts = {
  sport_type: SportType;
  runBestEfforts?: BestEfforts;
};

export function reduceAllTimeBestEfforts(activities: ActivityWithRunEfforts[]): BestEfforts {
  const result: BestEfforts = {};

  for (const activity of activities) {
    if (computeSportSet(activity.sport_type) !== "run") continue;
    if (!activity.runBestEfforts) continue;
    for (const target of BEST_EFFORT_TARGETS) {
      const elapsed = activity.runBestEfforts[target.key];
      if (elapsed === undefined) continue;
      const current = result[target.key];
      if (current === undefined || elapsed < current) {
        result[target.key] = elapsed;
      }
    }
  }

  return result;
}

/** Rounds to the nearest minute; no seconds in the output. */
export function formatDurationNoSeconds(totalSeconds: number): string {
  const totalMinutes = Math.round(totalSeconds / 60);
  if (totalMinutes <= 0) return "0m";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
