import { createServerFn } from "@tanstack/react-start";
import { fetchActivities, fetchActivityDetail, sanitizeActivity, sanitizeActivityDetail, activitySlug } from "./strava";
import type { SanitizedActivity } from "./strava";

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

export const getWorkoutPageActivities = createServerFn({ method: "GET" }).handler(async () => {
  const raw = await fetchActivities(1, 28);
  const { currentMonday, lastMonday } = getWeekBounds();

  const current: SanitizedActivity[] = [];
  const last: SanitizedActivity[] = [];

  for (const activity of raw) {
    const date = new Date(activity.start_date_local);
    const sanitized = sanitizeActivity(activity);
    if (date >= currentMonday) current.push(sanitized);
    else if (date >= lastMonday) last.push(sanitized);
  }

  return { current, last };
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

function getWeekBounds() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const offsetFromMonday = (dayOfWeek - 1 + 7) % 7;

  const currentMonday = new Date(today);
  currentMonday.setHours(0, 0, 0, 0);
  currentMonday.setDate(today.getDate() - offsetFromMonday);

  const lastMonday = new Date(currentMonday);
  lastMonday.setDate(currentMonday.getDate() - 7);

  return { currentMonday, lastMonday };
}
