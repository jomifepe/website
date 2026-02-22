import { createServerFn } from "@tanstack/react-start";
import { fetchActivities } from "./strava";

export const getActivities = createServerFn({ method: "GET" })
	.inputValidator((data: { page: number; perPage?: number }) => ({
		page: data.page,
		perPage: data.perPage ?? 10,
	}))
	.handler(async ({ data }) => {
		return fetchActivities(data.page, data.perPage);
	});
