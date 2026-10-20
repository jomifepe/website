export const BEST_EFFORT_TARGETS = [
  { key: "halfMarathon", meters: 21_097.5, label: "Half Marathon" },
  { key: "km15", meters: 15_000, label: "15km" },
  { key: "km10", meters: 10_000, label: "10km" },
  { key: "km5", meters: 5_000, label: "5km" },
  { key: "km1", meters: 1_000, label: "1km" },
] as const;

export type BestEffortKey = (typeof BEST_EFFORT_TARGETS)[number]["key"];

export type RunBestEfforts = Partial<Record<BestEffortKey, number>>;

export type AllTimeBestEfforts = Partial<Record<BestEffortKey, number>>;

const DISTANCE_MATCH_TOLERANCE_METERS = 50;

type BestEffortSegment = {
  distance: number;
  elapsed_time: number;
};

export function extractRunBestEfforts(segments: BestEffortSegment[] | undefined): RunBestEfforts {
  if (!segments?.length) return {};

  const result: RunBestEfforts = {};
  for (const target of BEST_EFFORT_TARGETS) {
    const match = segments.find(
      (segment) => Math.abs(segment.distance - target.meters) <= DISTANCE_MATCH_TOLERANCE_METERS,
    );
    if (match) result[target.key] = match.elapsed_time;
  }
  return result;
}

type ActivityWithRunEfforts = {
  sport_type: string;
  runBestEfforts?: RunBestEfforts;
};

const RUN_SPORT_TYPES = new Set(["Run", "TrailRun", "VirtualRun"]);

export function reduceAllTimeBestEfforts(activities: ActivityWithRunEfforts[]): AllTimeBestEfforts {
  const result: AllTimeBestEfforts = {};

  for (const activity of activities) {
    if (!RUN_SPORT_TYPES.has(activity.sport_type)) continue;
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
