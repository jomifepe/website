import { z } from "zod";

import { decodePolyline, polylineToSvgPath } from "./polyline";

/** https://developers.strava.com/docs/reference/#api-models-SportType */
const sportTypeValues = [
  "AlpineSki",
  "BackcountrySki",
  "Badminton",
  "Canoeing",
  "Crossfit",
  "EBikeRide",
  "Elliptical",
  "EMountainBikeRide",
  "Golf",
  "GravelRide",
  "Handcycle",
  "HighIntensityIntervalTraining",
  "Hike",
  "IceSkate",
  "InlineSkate",
  "Kayaking",
  "Kitesurf",
  "MountainBikeRide",
  "NordicSki",
  "Pickleball",
  "Pilates",
  "Racquetball",
  "Ride",
  "RockClimbing",
  "RollerSki",
  "Rowing",
  "Run",
  "Sail",
  "Skateboard",
  "Snowboard",
  "Snowshoe",
  "Soccer",
  "Squash",
  "StairStepper",
  "StandUpPaddling",
  "Surfing",
  "Swim",
  "TableTennis",
  "Tennis",
  "TrailRun",
  "Velomobile",
  "VirtualRide",
  "VirtualRow",
  "VirtualRun",
  "Walk",
  "WeightTraining",
  "Wheelchair",
  "Windsurf",
  "Workout",
  "Yoga",
] as const;

// one new sport type from Strava would otherwise fail the whole activity list
export const SportTypeSchema = z.enum(sportTypeValues).catch("Workout");

export type SportType = z.infer<typeof SportTypeSchema>;

const StravaTokenResponseSchema = z.object({
  refresh_token: z.string(),
  access_token: z.string(),
});

const StravaActivitySchema = z.object({
  id: z.number(),
  sport_type: SportTypeSchema,
  start_date_local: z.string(),
  distance: z.number(),
  moving_time: z.number(),
  elapsed_time: z.number().optional(),
  total_elevation_gain: z.number(),
  map: z
    .object({
      summary_polyline: z.string().nullable(),
    })
    .optional()
    .nullable(),
  private: z.boolean(),
  has_heartrate: z.boolean().optional(),
  average_heartrate: z.number().optional(),
  max_heartrate: z.number().optional(),
  average_speed: z.number().optional(),
  average_cadence: z.number().optional(),
  pr_count: z.number().optional(),
  suffer_score: z.number().optional(),
  kilojoules: z.number().optional(),
  average_watts: z.number().optional(),
  max_watts: z.number().optional(),
  weighted_average_watts: z.number().optional(),
  device_watts: z.boolean().optional(),
});

export type StravaActivity = z.infer<typeof StravaActivitySchema>;

const StravaBestEffortSchema = z.object({
  distance: z.number(),
  elapsed_time: z.number(),
});

/** GET /activities/{id} returns the summary fields plus calories and run best efforts. */
const StravaActivityDetailSchema = StravaActivitySchema.extend({
  calories: z.number().optional(),
  best_efforts: z.array(StravaBestEffortSchema).optional(),
});

export type StravaActivityDetail = z.infer<typeof StravaActivityDetailSchema>;

async function refreshAccessToken() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Strava environment variables");
  }

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Strava token refresh failed:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`Failed to refresh Strava access token: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const tokenData = StravaTokenResponseSchema.parse(data);

  if (tokenData.refresh_token !== process.env.STRAVA_REFRESH_TOKEN) {
    console.warn("⚠️  Strava refresh token has changed. Update STRAVA_REFRESH_TOKEN in your environment.");
  }

  return tokenData;
}

export async function fetchActivities(page: number, perPage: number) {
  const tokenData = await refreshAccessToken();

  const url = new URL("https://www.strava.com/api/v3/athlete/activities");
  url.searchParams.append("page", page.toString());
  url.searchParams.append("per_page", perPage.toString());

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Strava activities fetch failed:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`Failed to fetch Strava activities: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const activities = z
    .array(StravaActivitySchema)
    .parse(data)
    .filter((activity) => !activity.private);

  return activities;
}

export async function fetchAllPublicActivities(perPage = 200) {
  const all: StravaActivity[] = [];
  for (let page = 1; page <= 50; page++) {
    const batch = await fetchActivities(page, perPage);
    all.push(...batch);
    if (batch.length < perPage) break;
  }
  return all;
}

/** Non-reversible FNV-1a hash of the activity's start time — used as a URL slug. */
export function activitySlug(startDateLocal: string): string {
  let h = 2166136261;
  for (let i = 0; i < startDateLocal.length; i++) {
    h = Math.imul(h ^ startDateLocal.charCodeAt(i), 16777619) >>> 0;
  }
  return h.toString(36);
}

export async function fetchActivityDetail(id: number) {
  const tokenData = await refreshAccessToken();

  const response = await fetch(`https://www.strava.com/api/v3/activities/${id}`, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Strava activity ${id}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return StravaActivityDetailSchema.parse(data);
}

/**
 * The client-safe shape of an activity. Strips id, start_date_local, map.summary_polyline
 * (GPS coords) and private; all time- and location-derived values are computed server-side.
 */
export type SanitizedActivity = {
  slug: string;
  startDate: string; // YYYY-MM-DD in athlete's local timezone
  sport_type: SportType;
  timeOfDay: "morning" | "afternoon" | "evening";
  dateDisplay: string;
  /** same date without the year, for narrow layouts */
  dateDisplayShort: string;
  title: string;
  moving_time: number;
  elapsed_time?: number;
  distance: number;
  total_elevation_gain: number;
  /** Pre-computed SVG path strings — no coordinates reachable from the client. */
  routeSvgPaths: { card: string; dialog: string } | null;
  has_heartrate?: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  average_speed?: number;
  average_cadence?: number;
  pr_count?: number;
  suffer_score?: number;
  kilojoules?: number;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number;
  device_watts?: boolean;
};

export type SanitizedActivityDetail = SanitizedActivity & { calories?: number | null };

// start_date_local is the athlete's wall-clock time with a misleading "Z" suffix, so it is read
// in UTC to get that wall-clock time back regardless of the server's timezone
function computeTimeOfDay(startDateLocal: string): SanitizedActivity["timeOfDay"] {
  const h = new Date(startDateLocal).getUTCHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function computeDateDisplay(startDateLocal: string, options: Intl.DateTimeFormatOptions = {}): string {
  return new Date(startDateLocal)
    .toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC", ...options })
    .toLowerCase();
}

/**
 * YYYY-MM-DD in the local timezone. Activities carry `startDate` derived from Strava's
 * `start_date_local`, so week boundaries have to be local too — going through
 * `toISOString()` would shift the date by a day whenever local time is offset from UTC.
 */
function toLocalDateString(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function groupActivitiesByWeek(
  activities: SanitizedActivity[],
  now: Date = new Date(),
): { current: SanitizedActivity[]; last: SanitizedActivity[] } {
  const offsetFromMonday = (now.getDay() - 1 + 7) % 7;

  const currentMondayDate = new Date(now);
  currentMondayDate.setDate(now.getDate() - offsetFromMonday);
  const currentMonday = toLocalDateString(currentMondayDate);

  const lastMondayDate = new Date(currentMondayDate);
  lastMondayDate.setDate(currentMondayDate.getDate() - 7);
  const lastMonday = toLocalDateString(lastMondayDate);

  const current: SanitizedActivity[] = [];
  const last: SanitizedActivity[] = [];

  for (const activity of activities) {
    if (activity.startDate >= currentMonday) current.push(activity);
    else if (activity.startDate >= lastMonday) last.push(activity);
  }

  return { current, last };
}

export function computeSportSet(sportType: SportType) {
  switch (sportType) {
    case "Run":
    case "TrailRun":
    case "VirtualRun": {
      return "run";
    }
    case "Ride":
    case "EBikeRide":
    case "EMountainBikeRide":
    case "MountainBikeRide":
    case "GravelRide":
    case "VirtualRide":
    case "Velomobile":
    case "Handcycle": {
      return "ride";
    }
    case "WeightTraining": {
      return "lift";
    }
    default:
      return undefined;
  }
}

function computeTitle(sportType: SportType, distance: number, startDateLocal: string) {
  return `${computeTimeOfDay(startDateLocal)} ${computeSportLabel(sportType, distance)}`;
}

function computeSportLabel(sportType: SportType, distance: number) {
  if (computeSportSet(sportType) !== "run") {
    return sportType
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
      .replace(/([a-z\d])([A-Z])/g, "$1 $2")
      .trim()
      .toLowerCase();
  }

  let prefix = "";
  if (sportType === "TrailRun") prefix = "trail ";
  if (sportType === "VirtualRun") prefix = "virtual ";

  if (distance >= 42_195) return `${prefix}marathon`;
  if (distance >= 21_097.5) return `${prefix}half marathon`;
  if (distance > 15_000) return `${prefix}long run`;
  return `${prefix}run`;
}

function computeRouteSvgPaths(summaryPolyline: string | null | undefined): SanitizedActivity["routeSvgPaths"] {
  if (!summaryPolyline) return null;
  const coords = decodePolyline(summaryPolyline);
  if (coords.length === 0) return null;
  return {
    card: polylineToSvgPath({ coords, w: 100, h: 100, padding: 5 }),
    dialog: polylineToSvgPath({ coords, w: 400, h: 200, padding: 16 }),
  };
}

export function sanitizeActivity(a: StravaActivity): SanitizedActivity {
  return {
    slug: activitySlug(a.start_date_local),
    startDate: a.start_date_local.slice(0, 10),
    sport_type: a.sport_type,
    timeOfDay: computeTimeOfDay(a.start_date_local),
    dateDisplay: computeDateDisplay(a.start_date_local, { year: "numeric" }),
    dateDisplayShort: computeDateDisplay(a.start_date_local),
    title: computeTitle(a.sport_type, a.distance, a.start_date_local),
    moving_time: a.moving_time,
    elapsed_time: a.elapsed_time,
    distance: a.distance,
    total_elevation_gain: a.total_elevation_gain,
    routeSvgPaths: computeRouteSvgPaths(a.map?.summary_polyline),
    has_heartrate: a.has_heartrate,
    average_heartrate: a.average_heartrate,
    max_heartrate: a.max_heartrate,
    average_speed: a.average_speed,
    average_cadence: a.average_cadence,
    pr_count: a.pr_count,
    suffer_score: a.suffer_score,
    kilojoules: a.kilojoules,
    average_watts: a.average_watts,
    max_watts: a.max_watts,
    weighted_average_watts: a.weighted_average_watts,
    device_watts: a.device_watts,
  };
}

export function sanitizeActivityDetail(a: StravaActivityDetail): SanitizedActivityDetail {
  return { ...sanitizeActivity(a), calories: a.calories };
}
