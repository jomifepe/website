import { createServerFn } from "@tanstack/react-start";
import { fetchActivities, type SportType, type StravaActivity } from "./strava";

export const getActivities = createServerFn({ method: "GET" })
	.inputValidator((data?: { page?: number; perPage?: number }) => ({
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

function attachWorkoutCardDisplay(
	activity: StravaActivity,
): WorkoutCardActivity {
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

	const displayTitle = `${timeOfDay} ${sportTypeLabel(activity.sport_type)}`;

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



/** Converts `TrailRun` → `trail run` etc. */
function sportTypeLabel(sportType: SportType): string {
	return sportType
		.replace(/([A-Z])/g, " $1")
		.trim()
		.toLowerCase();
}