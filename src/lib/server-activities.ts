import { createServerFn } from "@tanstack/react-start";
import { fetchActivities, fetchActivityDetail, sanitizeActivity, sanitizeActivityDetail, activitySlug } from "./strava";

type InputData = {
  page?: number;
  perPage?: number;
};

export const getActivities = createServerFn({ method: "GET" })
  .inputValidator((data?: InputData) => ({
    page: data?.page ?? 1,
    perPage: data?.perPage ?? 28,
  }))
  .handler(async ({ data }) => {
    const raw = await fetchActivities(data.page, data.perPage);
    return raw.map(sanitizeActivity);
  });

export const getActivityDetailBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const activities = await fetchActivities(1, 28);
    const match = activities.find((a) => activitySlug(a.start_date_local) === data.slug);
    if (!match) throw new Error(`Activity not found: ${data.slug}`);

    const detail = await fetchActivityDetail(match.id);
    return sanitizeActivityDetail(detail);
  });
