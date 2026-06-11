import {
  IconActivity,
  IconBarbell,
  IconBike,
  IconMountain,
  IconRun,
  IconSwimming,
  IconWalk,
  IconArrowUp,
  IconHeart,
  IconFlame,
  IconBolt,
  IconTrophy,
  IconZzz,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/cn";
import { decodePolyline, polylineToSvgPath } from "~/lib/polyline";
import { getActivityDetail } from "~/lib/server-activities";
import { useSlideHighlightRegion } from "./SlideHighlightRegion";
import type { SportType, StravaActivity } from "../lib/strava";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type WorkoutCardVariant = "default" | "small";

type WorkoutCardProps = {
  activity: StravaActivity;
  isLastItemInList?: boolean;
  /** Compact route preview and spacing (e.g. home card grid). */
  variant?: WorkoutCardVariant;
};

export function WorkoutCard(props: WorkoutCardProps) {
  const { activity, isLastItemInList = false, variant = "default" } = props;
  const [open, setOpen] = useState(false);
  const isSmall = variant === "small";
  const slideHighlight = useSlideHighlightRegion();

  const title = formatActivityTitle(activity);
  const dateStr = formatActivityDate(activity.start_date_local);
  const timeStr = formatMovingTime(activity.moving_time);
  const distanceKm = activity.distance / 1000;
  const showDistance = shouldShowDistance(activity.sport_type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className={cn(
            "flex items-start gap-3 md:gap-4 rounded-lg relative group/card cursor-pointer transition-colors",
            isSmall ? "py-2 px-2 -mx-2" : "p-2 -mx-2 md:p-3 md:-mx-3",
            slideHighlight != null ? "z-10" : "hover:bg-foreground/5 focus-visible:bg-foreground/5",
            activity.map?.summary_polyline && isLastItemInList && (isSmall ? "mb-6" : "mb-10"),
          )}
          onMouseEnter={slideHighlight?.onInteract}
          onFocus={slideHighlight?.onInteract}
        >
          <div className="text-muted-foreground mt-0.5">{getWorkoutIcon(activity.sport_type)}</div>
          <div className="flex-1">
            <div className="flex flex-row items-baseline gap-2 mb-1 flex-wrap">
              <span className="text-foreground font-medium text-sm md:text-base">{title}</span>
              <span className="text-foreground/60">·</span>
              <span className="text-foreground/80 text-sm md:text-base">{dateStr}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/60 text-sm flex-wrap">
              <span>{timeStr}</span>
              {showDistance && <span>·</span>}
              {showDistance && <span>{distanceKm.toFixed(1)} km</span>}
              {activity.total_elevation_gain > 0 && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <IconArrowUp size={12} /> {Math.round(activity.total_elevation_gain)}m
                  </span>
                </>
              )}
            </div>
          </div>
          {activity.map?.summary_polyline && (
            <RoutePreview encoded={activity.map.summary_polyline} size={isSmall ? "small" : "default"} />
          )}
        </div>
      </DialogTrigger>
      <ActivityDialog activity={activity} open={open} />
    </Dialog>
  );
}

// ─── Activity Dialog ─────────────────────────────────────────────────────────

type ActivityDialogProps = {
  activity: StravaActivity;
  open: boolean;
};

function ActivityDialog({ activity, open }: ActivityDialogProps) {
  const [calories, setCalories] = useState<number | null>(null);
  const [caloriesLoading, setCaloriesLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    setCaloriesLoading(true);
    getActivityDetail({ data: { id: activity.id } })
      .then((detail) => {
        setCalories(detail.calories ?? null);
      })
      .catch(() => {
        setCalories(null);
      })
      .finally(() => {
        setCaloriesLoading(false);
      });
  }, [open, activity.id]);

  const title = formatActivityTitle(activity);
  const dateStr = formatActivityDate(activity.start_date_local);
  const showDistance = shouldShowDistance(activity.sport_type);
  const isRunLike = isRunSport(activity.sport_type);

  const stats = buildStats(activity, isRunLike, showDistance, calories, caloriesLoading);

  return (
    <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
      <DialogHeader className="mb-4">
        <div className="flex items-center gap-2 pr-6">
          <span className="text-muted-foreground">{getWorkoutIcon(activity.sport_type)}</span>
          <div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{dateStr}</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {activity.map?.summary_polyline && (
        <div className="mb-5 rounded-lg overflow-hidden bg-foreground/4 flex items-center justify-center">
          <RoutePreview encoded={activity.map.summary_polyline} size="dialog" />
        </div>
      )}

      {stats.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-foreground/40 flex items-center gap-1">
                {stat.icon}
                {stat.label}
              </dt>
              <dd className="text-sm text-foreground font-medium">{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </DialogContent>
  );
}

type StatEntry = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

function buildStats(
  activity: StravaActivity,
  isRunLike: boolean,
  showDistance: boolean,
  calories: number | null,
  caloriesLoading: boolean,
): StatEntry[] {
  const stats: StatEntry[] = [];

  stats.push({ label: "moving time", value: formatMovingTime(activity.moving_time) });

  if (activity.elapsed_time && activity.elapsed_time > activity.moving_time + 30) {
    stats.push({ label: "elapsed time", value: formatMovingTime(activity.elapsed_time) });
  }

  if (showDistance && activity.distance > 0) {
    stats.push({ label: "distance", value: `${(activity.distance / 1000).toFixed(2)} km` });
  }

  if (activity.average_speed && activity.average_speed > 0) {
    if (isRunLike) {
      stats.push({ label: "avg pace", value: formatPace(activity.average_speed) });
    } else {
      stats.push({ label: "avg speed", value: `${(activity.average_speed * 3.6).toFixed(1)} km/h` });
    }
  }

  if (activity.total_elevation_gain > 0) {
    stats.push({
      label: "elevation",
      value: `${Math.round(activity.total_elevation_gain)} m`,
      icon: <IconArrowUp size={10} />,
    });
  }

  if (activity.has_heartrate && activity.average_heartrate) {
    stats.push({
      label: "avg heart rate",
      value: `${Math.round(activity.average_heartrate)} bpm`,
      icon: <IconHeart size={10} />,
    });
  }

  if (activity.max_heartrate) {
    stats.push({
      label: "max heart rate",
      value: `${Math.round(activity.max_heartrate)} bpm`,
      icon: <IconHeart size={10} />,
    });
  }

  if (activity.average_cadence && activity.average_cadence > 0) {
    stats.push({ label: "cadence", value: `${Math.round(activity.average_cadence)} rpm` });
  }

  if (activity.device_watts && activity.average_watts && activity.average_watts > 0) {
    stats.push({
      label: "avg power",
      value: `${Math.round(activity.average_watts)} W`,
      icon: <IconBolt size={10} />,
    });
  }

  if (activity.device_watts && activity.weighted_average_watts && activity.weighted_average_watts > 0) {
    stats.push({
      label: "norm power",
      value: `${Math.round(activity.weighted_average_watts)} W`,
      icon: <IconBolt size={10} />,
    });
  }

  if (activity.kilojoules && activity.kilojoules > 0) {
    stats.push({
      label: "work done",
      value: `${Math.round(activity.kilojoules)} kJ`,
      icon: <IconBolt size={10} />,
    });
  }

  if (caloriesLoading) {
    stats.push({ label: "calories", value: "…", icon: <IconFlame size={10} /> });
  } else if (calories && calories > 0) {
    stats.push({ label: "calories", value: `${Math.round(calories)} kcal`, icon: <IconFlame size={10} /> });
  }

  if (activity.pr_count && activity.pr_count > 0) {
    stats.push({
      label: "PRs",
      value: activity.pr_count.toString(),
      icon: <IconTrophy size={10} />,
    });
  }

  if (activity.suffer_score && activity.suffer_score > 0) {
    stats.push({
      label: "suffer score",
      value: activity.suffer_score.toString(),
      icon: <IconZzz size={10} />,
    });
  }

  return stats;
}

// ─── Route Preview ────────────────────────────────────────────────────────────

type RoutePreviewSize = "default" | "small" | "dialog";

type RoutePreviewProps = {
  encoded: string;
  size?: RoutePreviewSize;
};

function RoutePreview(props: RoutePreviewProps) {
  const { encoded, size = "default" } = props;
  if (!encoded) return null;

  const coords = decodePolyline(encoded);
  if (coords.length === 0) return null;

  if (size === "dialog") {
    const pathD = polylineToSvgPath({ coords, w: 400, h: 200, padding: 16 });
    return (
      <svg viewBox="0 0 400 200" className="w-full h-40" xmlns="http://www.w3.org/2000/svg">
        <path
          d={pathD}
          stroke="currentColor"
          strokeWidth={1.5}
          fill="none"
          vectorEffect="non-scaling-stroke"
          className="text-orange-500/60"
        />
        <title>route map</title>
      </svg>
    );
  }

  const isSmall = size === "small";
  const pathD = polylineToSvgPath({ coords, w: 100, h: 100, padding: 5 });

  return (
    <div className={cn("absolute top-1/2 -translate-y-1/2 pointer-events-none", isSmall ? "right-2" : "right-4")}>
      <svg viewBox="0 0 100 100" className={isSmall ? "h-12 w-12" : "h-32 w-32"} xmlns="http://www.w3.org/2000/svg">
        <path
          d={pathD}
          stroke="currentColor"
          strokeWidth={isSmall ? 2 : 1.5}
          fill="none"
          vectorEffect="non-scaling-stroke"
          className="text-orange-500/20 group-hover/card:text-orange-500/70 transition-colors"
        />
        <title>route preview</title>
      </svg>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getWorkoutIcon(sportType: SportType) {
  const commonProps = { size: 24, className: "shrink-0" };

  switch (sportType) {
    case "Run":
    case "TrailRun":
    case "VirtualRun":
      return <IconRun {...commonProps} />;
    case "Walk":
      return <IconWalk {...commonProps} />;
    case "Hike":
    case "BackcountrySki":
    case "NordicSki":
    case "RollerSki":
    case "Snowshoe":
      return <IconMountain {...commonProps} />;
    case "Ride":
    case "EBikeRide":
    case "EMountainBikeRide":
    case "MountainBikeRide":
    case "GravelRide":
    case "VirtualRide":
    case "Velomobile":
    case "Handcycle":
      return <IconBike {...commonProps} />;
    case "Swim":
      return <IconSwimming {...commonProps} />;
    case "WeightTraining":
      return <IconBarbell strokeWidth={1.5} {...commonProps} />;
    case "RockClimbing":
      return <BoulderingIcon />;
    default:
      return <IconActivity {...commonProps} />;
  }
}

function BoulderingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 64 64">
      <path d="M32.104 41.533c-.567.209-1.201.33-1.85.33a7.357 7.357 0 0 1-2.017-.263l-7.169 16.474c-.654 1.519-2.456 2.032-4.03 1.148-1.565-.884-2.308-2.821-1.633-4.34l8.789-20.152h11.204v-1.883l5.67-2.639c1.485-.722 3.415.513 3.806 2.086l2.781 11.149a2.94 2.94 0 0 1-2.146 3.57 2.951 2.951 0 0 1-3.584-2.146l-1.769-7.107-8.052 3.773ZM37.268 29.985C49.545 23.898 54.304 3.044 54.304 1.302h-1.688c-.634 4.347-5.906 21.752-15.348 26.8v1.883Z" />
      <path d="M14.616 25.423a2.528 2.528 0 0 0 3.084.979l6.494-2.545v9.003h11.204V22.433L45.44 6.364a2.528 2.528 0 0 0-.79-3.482c-1.174-.736-2.726-.392-3.388.756L32.732 17.29l-5.137.013c-.33 0-.661.054-.992.182l-8.876 3.483-4.576-6.931a2.53 2.53 0 0 0-3.483-.756 2.537 2.537 0 0 0-.762 3.496l5.71 8.645Z" />
      <path d="M29.026 16.38c2.47 0 4.475-1.991 4.475-4.455a4.475 4.475 0 0 0-4.475-4.467 4.473 4.473 0 0 0-4.468 4.467 4.462 4.462 0 0 0 4.468 4.455ZM35.398 61.962V41.863l-1.883.878v19.22h1.883Z" />
      <title>Bouldering</title>
    </svg>
  );
}

function shouldShowDistance(sportType: SportType) {
  switch (sportType) {
    case "Run":
    case "TrailRun":
    case "Walk":
    case "Hike":
    case "Ride":
    case "EBikeRide":
    case "EMountainBikeRide":
    case "MountainBikeRide":
    case "GravelRide":
    case "VirtualRide":
    case "Velomobile":
    case "Handcycle":
    case "Wheelchair":
    case "Swim":
    case "Kayaking":
    case "Canoeing":
    case "StandUpPaddling":
    case "Rowing":
    case "VirtualRow":
    case "Surfing":
    case "Windsurf":
    case "Kitesurf":
    case "Sail":
      return true;
    default:
      return false;
  }
}

const RUN_SPORT_TYPES = new Set<SportType>(["Run", "TrailRun", "VirtualRun"]);

function isRunSport(sportType: SportType): boolean {
  return RUN_SPORT_TYPES.has(sportType);
}

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

function formatActivityTitle(activity: StravaActivity): string {
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

  return `${timeOfDay} ${runLabel(activity.sport_type, activity.distance) ?? sportTypeLabel(activity.sport_type)}`;
}

function formatActivityDate(startDateLocal: string): string {
  return new Date(startDateLocal)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toLowerCase();
}

function formatMovingTime(movingTime: number): string {
  const hours = Math.floor(movingTime / 3600);
  const minutes = Math.floor((movingTime % 3600) / 60);
  const seconds = movingTime % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/** Converts speed in m/s to a min/km pace string like "5:32 /km" */
function formatPace(speedMps: number): string {
  if (speedMps <= 0) return "—";
  const secsPerKm = 1000 / speedMps;
  const mins = Math.floor(secsPerKm / 60);
  const secs = Math.round(secsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, "0")} /km`;
}
