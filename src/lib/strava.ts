import { defineCachedFunction } from "nitro/cache";
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

export type SportType = (typeof sportTypeValues)[number];

// Strava Token Response Schema
const StravaTokenResponseSchema = z.object({
  token_type: z.string(),
  expires_at: z.number(),
  expires_in: z.number(),
  refresh_token: z.string(),
  access_token: z.string(),
  athlete: z
    .object({
      id: z.number(),
      username: z.string().optional(),
      firstname: z.string().optional(),
      lastname: z.string().optional(),
    })
    .optional(),
});

export type StravaTokenResponse = z.infer<typeof StravaTokenResponseSchema>;

// Strava Activity Schema
export const StravaActivitySchema = z.object({
  id: z.number(),
  sport_type: z.enum(sportTypeValues),
  start_date_local: z.string(),
  distance: z.number(),
  moving_time: z.number(),
  elapsed_time: z.number().optional(),
  total_elevation_gain: z.number(),
  map: z
    .object({
      id: z.string(),
      summary_polyline: z.string().nullable(),
    })
    .optional()
    .nullable(),
  private: z.boolean(),
  has_heartrate: z.boolean().optional(),
  average_heartrate: z.number().optional(),
  max_heartrate: z.number().optional(),
  average_speed: z.number().optional(),
  max_speed: z.number().optional(),
  average_cadence: z.number().optional(),
  pr_count: z.number().optional(),
  suffer_score: z.number().optional(),
  achievement_count: z.number().optional(),
  kilojoules: z.number().optional(),
  average_watts: z.number().optional(),
  max_watts: z.number().optional(),
  weighted_average_watts: z.number().optional(),
  device_watts: z.boolean().optional(),
});

export type StravaActivity = z.infer<typeof StravaActivitySchema>;

// Detailed activity (from GET /activities/{id}) — adds calories
export const StravaActivityDetailSchema = StravaActivitySchema.extend({
  calories: z.number().optional(),
});

export type StravaActivityDetail = z.infer<typeof StravaActivityDetailSchema>;

async function refreshAccessToken(): Promise<StravaTokenResponse> {
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

  console.log("Token refresh successful:", {
    expires_at: tokenData.expires_at,
    expires_in: tokenData.expires_in,
    athlete: tokenData.athlete?.firstname,
  });

  if (tokenData.refresh_token !== process.env.STRAVA_REFRESH_TOKEN) {
    console.warn("⚠️  Strava refresh token has changed. Update STRAVA_REFRESH_TOKEN in your environment.");
  }

  return tokenData;
}

async function fetchActivitiesRaw(page: number, perPage: number = 10): Promise<StravaActivity[]> {
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

  console.log(`Fetched ${activities.length} activities from Strava (page ${page})`);

  return activities;
}

/** Non-reversible FNV-1a hash of the activity's start time — used as a URL slug. */
export function activitySlug(startDateLocal: string): string {
  let h = 2166136261;
  for (let i = 0; i < startDateLocal.length; i++) {
    h = Math.imul(h ^ startDateLocal.charCodeAt(i), 16777619) >>> 0;
  }
  return h.toString(36);
}

export const fetchActivities = defineCachedFunction(fetchActivitiesRaw, {
  name: "strava-activities",
  maxAge: 60 * 60, // 1 hour
  getKey: (page: number, perPage: number = 10) => `p${page}-pp${perPage}`,
});

async function fetchActivityDetailRaw(id: number): Promise<StravaActivityDetail> {
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

export const fetchActivityDetail = defineCachedFunction(fetchActivityDetailRaw, {
  name: "strava-activity-detail",
  maxAge: 60 * 60,
  getKey: (id: number) => `id${id}`,
});

// ─── Sanitized activity (safe for the client) ─────────────────────────────────
// Strips: id, start_date_local, map.summary_polyline (GPS coords), private.
// All time/location-derived values are computed server-side before sending.

export type SanitizedActivity = {
  slug: string;
  sport_type: SportType;
  timeOfDay: "morning" | "afternoon" | "evening";
  dateDisplay: string;
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

function computeTimeOfDay(startDateLocal: string): SanitizedActivity["timeOfDay"] {
  const h = new Date(startDateLocal).getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function computeDateDisplay(startDateLocal: string): string {
  return new Date(startDateLocal)
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toLowerCase();
}

const RUN_SPORT_SET = new Set<SportType>(["Run", "TrailRun", "VirtualRun"]);
const RUN_PREFIX: Partial<Record<SportType, string>> = { TrailRun: "trail", VirtualRun: "virtual" };

function computeTitle(sportType: SportType, distance: number, startDateLocal: string): string {
  const tod = computeTimeOfDay(startDateLocal);

  let sportLabel: string;
  if (RUN_SPORT_SET.has(sportType)) {
    const prefix = RUN_PREFIX[sportType] ? `${RUN_PREFIX[sportType]} ` : "";
    if (distance >= 42_195) sportLabel = `${prefix}marathon`;
    else if (distance >= 21_097.5) sportLabel = `${prefix}half marathon`;
    else if (distance > 15_000) sportLabel = `${prefix}long run`;
    else sportLabel = `${prefix}run`;
  } else {
    sportLabel = sportType
      .replace(/([A-Z])/g, " $1")
      .trim()
      .toLowerCase();
  }

  return `${tod} ${sportLabel}`;
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
    sport_type: a.sport_type,
    timeOfDay: computeTimeOfDay(a.start_date_local),
    dateDisplay: computeDateDisplay(a.start_date_local),
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
