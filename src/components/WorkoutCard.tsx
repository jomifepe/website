import {
  TbActivity,
  TbArrowUp,
  TbBarbell,
  TbBike,
  TbBolt,
  TbClock,
  TbFlame,
  TbGauge,
  TbHeart,
  TbMountain,
  TbRefresh,
  TbRoute,
  TbRun,
  TbSwimming,
  TbWalk,
  TbZzz,
} from "react-icons/tb";
import { FaMedal } from "react-icons/fa";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "~/lib/cn";
import { getActivityDetailBySlug } from "~/lib/server-activities";
import { CardItem, CardItemContent, useCardItemWrapperProps } from "./CardItem";
import type { SanitizedActivity, SanitizedActivityDetail, SportType } from "../lib/strava";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "~/components/ui/badge";

type WorkoutCardVariant = "default" | "small";

type WorkoutCardProps = {
  activity: SanitizedActivity;
  variant?: WorkoutCardVariant;
  /** "route" (default): clicking navigates to /workout/$id. "local": opens an inline dialog. */
  dialog?: "route" | "local";
};

export function WorkoutCard(props: WorkoutCardProps) {
  const { activity, variant = "default", dialog = "route" } = props;

  const routeWrapperProps = useCardItemWrapperProps("group/card");

  const isSmall = variant === "small";
  const timeStr = formatMovingTime(activity.moving_time);
  const distanceKm = activity.distance / 1000;
  const showDistance = shouldShowDistance(activity.sport_type);

  const icon = (
    <div className="w-12 h-12 rounded-md bg-foreground/8 flex items-center justify-center text-foreground-muted">
      {getWorkoutIcon(activity.sport_type)}
    </div>
  );

  const title = (
    <>
      <span className="text-foreground font-medium">{activity.title}</span>
      <span className="text-foreground/60">·</span>
      <span className="text-foreground/80">{activity.dateDisplay}</span>
    </>
  );

  const subtitle = (
    <div className="flex items-center gap-2 flex-wrap">
      <span>{timeStr}</span>
      {showDistance && <span>·</span>}
      {showDistance && <span>{distanceKm.toFixed(1)} km</span>}
      {activity.total_elevation_gain > 0 && (
        <>
          <span>·</span>
          <span className="flex items-center gap-1">
            <TbArrowUp size={12} /> {Math.round(activity.total_elevation_gain)}m
          </span>
        </>
      )}
    </div>
  );

  const endSlot = activity.routeSvgPaths ? (
    <RoutePreview paths={activity.routeSvgPaths} size={isSmall ? "small" : "default"} />
  ) : null;

  if (dialog === "local") {
    return (
      <ActivityDialog
        activity={activity}
        trigger={<CardItem className="group/card" icon={icon} title={title} subtitle={subtitle} endSlot={endSlot} />}
      />
    );
  }

  return (
    <Link to="/workout/$id" params={{ id: activity.slug }} {...routeWrapperProps}>
      <CardItemContent icon={icon} title={title} subtitle={subtitle} endSlot={endSlot} />
    </Link>
  );
}

type PrMedalsProps = {
  count: number;
};

function PrMedals(props: PrMedalsProps) {
  const { count } = props;
  return (
    <Badge variant="gold">
      <FaMedal size={12} />
      <span className="text-sm font-medium ml-1">{count}</span>
    </Badge>
  );
}

type DialogActivityHeaderProps = {
  sportType: SportType;
  title: string;
  dateDisplay: string;
  prCount?: number;
};

function DialogActivityHeader(props: DialogActivityHeaderProps) {
  const { sportType, title, dateDisplay, prCount } = props;
  return (
    <DialogHeader className="mb-4">
      <div className="flex items-center gap-3 pr-6">
        <div className="w-10 h-10 rounded-md bg-foreground/8 flex items-center justify-center shrink-0 text-foreground/60">
          {getWorkoutIcon(sportType, 18)}
        </div>
        <div className="flex-1 min-w-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{dateDisplay}</DialogDescription>
        </div>
        {!!prCount && <PrMedals count={prCount} />}
      </div>
    </DialogHeader>
  );
}

type RouteMapContainerProps = {
  routeSvgPaths: { card: string; dialog: string } | null;
};

function RouteMapContainer(props: RouteMapContainerProps) {
  const { routeSvgPaths } = props;
  if (!routeSvgPaths) return null;
  return (
    <div className="mb-5 rounded-lg overflow-hidden bg-foreground/4 flex items-center justify-center">
      <RoutePreview paths={routeSvgPaths} size="dialog" />
    </div>
  );
}

type ActivityDialogBodyProps = {
  activity: SanitizedActivity;
};

function ActivityDialogBody(props: ActivityDialogBodyProps) {
  const { activity } = props;
  const showDistance = shouldShowDistance(activity.sport_type);
  const isRunLike = isRunSport(activity.sport_type);
  const stats = buildStats(activity as SanitizedActivityDetail, isRunLike, showDistance);

  return (
    <>
      <DialogActivityHeader sportType={activity.sport_type} title={activity.title} dateDisplay={activity.dateDisplay} prCount={activity.pr_count} />
      <RouteMapContainer routeSvgPaths={activity.routeSvgPaths} />
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
    </>
  );
}

type ActivityDialogProps = {
  activity: SanitizedActivity;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ActivityDialog(props: ActivityDialogProps) {
  const { activity, trigger, open: controlledOpen, onOpenChange } = props;
  const [internalOpen, setInternalOpen] = useState(false);
  const [detail, setDetail] = useState<SanitizedActivityDetail | null>(null);
  const fetchedRef = useRef(false);

  const isOpen = trigger ? internalOpen : (controlledOpen ?? false);
  const handleOpenChange = trigger ? setInternalOpen : (onOpenChange ?? (() => {}));

  useEffect(() => {
    if (!trigger || !isOpen || fetchedRef.current) return;
    fetchedRef.current = true;
    getActivityDetailBySlug({ data: { slug: activity.slug } })
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [isOpen, activity.slug, trigger]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <ActivityDialogBody activity={detail ?? activity} />
      </DialogContent>
    </Dialog>
  );
}

type StatEntry = {
  label: string;
  value: string;
  icon?: ReactNode;
};

function buildStats(activity: SanitizedActivityDetail, isRunLike: boolean, showDistance: boolean): StatEntry[] {
  const stats: StatEntry[] = [];

  stats.push({ label: "moving time", value: formatMovingTime(activity.moving_time), icon: <TbClock size={10} /> });

  if (activity.elapsed_time && activity.elapsed_time > activity.moving_time + 30) {
    stats.push({
      label: "elapsed time",
      value: formatMovingTime(activity.elapsed_time),
      icon: <TbClock size={10} />,
    });
  }

  if (showDistance && activity.distance > 0) {
    stats.push({
      label: "distance",
      value: `${(activity.distance / 1000).toFixed(2)} km`,
      icon: <TbRoute size={10} />,
    });
  }

  if (activity.average_speed && activity.average_speed > 0) {
    if (isRunLike) {
      stats.push({ label: "avg pace", value: formatPace(activity.average_speed), icon: <TbGauge size={10} /> });
    } else {
      stats.push({
        label: "avg speed",
        value: `${(activity.average_speed * 3.6).toFixed(1)} km/h`,
        icon: <TbGauge size={10} />,
      });
    }
  }

  if (activity.total_elevation_gain > 0) {
    stats.push({
      label: "elevation",
      value: `${Math.round(activity.total_elevation_gain)} m`,
      icon: <TbArrowUp size={10} />,
    });
  }

  if (activity.has_heartrate && activity.average_heartrate) {
    stats.push({
      label: "avg heart rate",
      value: `${Math.round(activity.average_heartrate)} bpm`,
      icon: <TbHeart size={10} />,
    });
  }

  if (activity.max_heartrate) {
    stats.push({
      label: "max heart rate",
      value: `${Math.round(activity.max_heartrate)} bpm`,
      icon: <TbHeart size={10} />,
    });
  }

  if (activity.average_cadence && activity.average_cadence > 0) {
    stats.push({
      label: "cadence",
      value: `${Math.round(activity.average_cadence)} rpm`,
      icon: <TbRefresh size={10} />,
    });
  }

  if (activity.device_watts && activity.average_watts && activity.average_watts > 0) {
    stats.push({
      label: "avg power",
      value: `${Math.round(activity.average_watts)} W`,
      icon: <TbBolt size={10} />,
    });
  }

  if (activity.device_watts && activity.weighted_average_watts && activity.weighted_average_watts > 0) {
    stats.push({
      label: "norm power",
      value: `${Math.round(activity.weighted_average_watts)} W`,
      icon: <TbBolt size={10} />,
    });
  }

  if (activity.kilojoules && activity.kilojoules > 0) {
    stats.push({
      label: "work done",
      value: `${Math.round(activity.kilojoules)} kJ`,
      icon: <TbBolt size={10} />,
    });
  }

  if (activity.calories && activity.calories > 0) {
    stats.push({ label: "calories", value: `${Math.round(activity.calories)} kcal`, icon: <TbFlame size={10} /> });
  }

  if (activity.suffer_score && activity.suffer_score > 0) {
    stats.push({
      label: "suffer score",
      value: activity.suffer_score.toString(),
      icon: <TbZzz size={10} />,
    });
  }

  return stats;
}

type RoutePreviewSize = "default" | "small" | "dialog";

type RoutePreviewProps = {
  paths: { card: string; dialog: string };
  size?: RoutePreviewSize;
};

function RoutePreview(props: RoutePreviewProps) {
  const { paths, size = "default" } = props;

  if (size === "dialog") {
    return (
      <svg viewBox="0 0 400 200" className="w-full h-40" xmlns="http://www.w3.org/2000/svg">
        <path
          d={paths.dialog}
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

  return (
    <div className={cn("absolute top-1/2 -translate-y-1/2 pointer-events-none", isSmall ? "right-2" : "right-4")}>
      <svg viewBox="0 0 100 100" className={isSmall ? "h-12 w-12" : "h-32 w-32"} xmlns="http://www.w3.org/2000/svg">
        <path
          d={paths.card}
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

export function getWorkoutIcon(sportType: SportType, size = 24) {
  const commonProps = { size, className: "shrink-0" };

  switch (sportType) {
    case "Run":
    case "TrailRun":
    case "VirtualRun":
      return <TbRun {...commonProps} />;
    case "Walk":
      return <TbWalk {...commonProps} />;
    case "Hike":
    case "BackcountrySki":
    case "NordicSki":
    case "RollerSki":
    case "Snowshoe":
      return <TbMountain {...commonProps} />;
    case "Ride":
    case "EBikeRide":
    case "EMountainBikeRide":
    case "MountainBikeRide":
    case "GravelRide":
    case "VirtualRide":
    case "Velomobile":
    case "Handcycle":
      return <TbBike {...commonProps} />;
    case "Swim":
      return <TbSwimming {...commonProps} />;
    case "WeightTraining":
      return <TbBarbell strokeWidth={1.5} {...commonProps} />;
    case "RockClimbing":
      return <BoulderingIcon />;
    default:
      return <TbActivity {...commonProps} />;
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

function formatMovingTime(movingTime: number): string {
  const hours = Math.floor(movingTime / 3600);
  const minutes = Math.floor((movingTime % 3600) / 60);
  const seconds = movingTime % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatPace(speedMps: number): string {
  if (speedMps <= 0) return "—";
  const secsPerKm = 1000 / speedMps;
  const mins = Math.floor(secsPerKm / 60);
  const secs = Math.round(secsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, "0")} /km`;
}
