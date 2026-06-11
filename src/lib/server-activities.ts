import { createServerFn } from "@tanstack/react-start";
import { fetchActivities, fetchActivityDetail } from "./strava";

type InputData = {
  page?: number;
  perPage?: number;
};

export const getActivities = createServerFn({ method: "GET" })
  .inputValidator((data?: InputData) => ({
    page: data?.page ?? 1,
    // 28 covers the worst realistic case for /workout's "current + last week"
    // grouping: 14 days × up to 2 activities/day.
    perPage: data?.perPage ?? 28,
  }))
  .handler(async ({ data }) => {
    return fetchActivities(data.page, data.perPage);
  });

export const getActivityDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return fetchActivityDetail(data.id);
  });
