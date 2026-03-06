import { z } from "zod";

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
	total_elevation_gain: z.number(),
	map: z
		.object({
			id: z.string(),
			summary_polyline: z.string().nullable(),
		})
		.optional()
		.nullable(),
});

export type StravaActivity = z.infer<typeof StravaActivitySchema>;

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
		throw new Error(
			`Failed to refresh Strava access token: ${response.status} ${response.statusText}`,
		);
	}

	const data = await response.json();
	const tokenData = StravaTokenResponseSchema.parse(data);

	console.log("Token refresh successful:", {
		expires_at: tokenData.expires_at,
		expires_in: tokenData.expires_in,
		athlete: tokenData.athlete?.firstname,
	});

	// TODO: If refresh_token changed, update .env or store in database
	if (tokenData.refresh_token !== process.env.STRAVA_REFRESH_TOKEN) {
		console.warn(
			"⚠️  Strava refresh token has changed. Update STRAVA_REFRESH_TOKEN in your environment.",
		);
	}

	return tokenData;
}

export async function fetchActivities(
	page: number,
	perPage: number = 10,
): Promise<StravaActivity[]> {
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
		throw new Error(
			`Failed to fetch Strava activities: ${response.status} ${response.statusText}`,
		);
	}

	const data = await response.json();
	const activities = z.array(StravaActivitySchema).parse(data);

	console.log(
		`Fetched ${activities.length} activities from Strava (page ${page})`,
	);

	return activities;
}
