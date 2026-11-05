import { describe, expect, it } from "vitest";

import {
  activitySlug,
  computeSportSet,
  groupActivitiesByWeek,
  sanitizeActivity,
  SportTypeSchema,
  type SanitizedActivity,
  type StravaActivity,
} from "./strava";

function makeActivity(overrides: Partial<StravaActivity>): StravaActivity {
  return {
    id: 1,
    sport_type: "Run",
    start_date_local: "2026-09-10T07:42:45Z",
    distance: 5000,
    moving_time: 1500,
    total_elevation_gain: 0,
    map: null,
    private: false,
    ...overrides,
  };
}

describe("activitySlug", () => {
  it("is stable, since slugs are public URLs", () => {
    expect(activitySlug("2026-09-10T17:42:45Z")).toBe("1p5rvd8");
    expect(activitySlug("2026-09-09T10:30:54Z")).toBe("192tnwm");
  });
});

describe("SportTypeSchema", () => {
  it("falls back to Workout for sport types Strava adds later", () => {
    expect(SportTypeSchema.parse("Run")).toBe("Run");
    expect(SportTypeSchema.parse("Padel")).toBe("Workout");
  });
});

describe("computeSportSet", () => {
  it("groups sport types", () => {
    expect(computeSportSet("TrailRun")).toBe("run");
    expect(computeSportSet("GravelRide")).toBe("ride");
    expect(computeSportSet("WeightTraining")).toBe("lift");
    expect(computeSportSet("Yoga")).toBeUndefined();
  });
});

describe("sanitizeActivity", () => {
  it.each([
    [{ distance: 5000 }, "morning run"],
    [{ distance: 21_097.5 }, "morning half marathon"],
    [{ distance: 42_195 }, "morning marathon"],
    [{ distance: 16_000 }, "morning long run"],
    [{ sport_type: "TrailRun" as const }, "morning trail run"],
    [{ sport_type: "WeightTraining" as const }, "morning weight training"],
    [{ sport_type: "RockClimbing" as const, start_date_local: "2026-09-10T18:00:00Z" }, "evening rock climbing"],
    [{ sport_type: "Ride" as const, start_date_local: "2026-09-10T13:00:00Z" }, "afternoon ride"],
  ])("titles %o as %s", (overrides, title) => {
    expect(sanitizeActivity(makeActivity(overrides)).title).toBe(title);
  });

  it("reads the athlete's wall-clock time regardless of the server timezone", () => {
    const sanitized = sanitizeActivity(makeActivity({ start_date_local: "2026-09-10T23:30:00Z" }));
    expect(sanitized.timeOfDay).toBe("evening");
    expect(sanitized.dateDisplay).toBe("sep 10, 2026");
    expect(sanitized.dateDisplayShort).toBe("sep 10");
  });

  it("does not leak ids, raw dates or coordinates", () => {
    const sanitized = sanitizeActivity(makeActivity({ map: { summary_polyline: "_p~iF~ps|U_ulLnnqC" } }));
    expect(sanitized).not.toHaveProperty("id");
    expect(sanitized).not.toHaveProperty("start_date_local");
    expect(sanitized).not.toHaveProperty("map");
    expect(sanitized.startDate).toBe("2026-09-10");
    expect(sanitized.routeSvgPaths?.card).toMatch(/^M/);
  });
});

function withDate(startDate: string) {
  return { startDate } as SanitizedActivity;
}

describe("groupActivitiesByWeek", () => {
  it("splits activities into the current and last Monday-based week", () => {
    const now = new Date(2026, 8, 10, 12); // Thursday, Sept 10
    const activities = ["2026-09-10", "2026-09-07", "2026-09-06", "2026-08-31", "2026-08-30"].map(withDate);

    const { current, last } = groupActivitiesByWeek(activities, now);

    expect(current.map((a) => a.startDate)).toEqual(["2026-09-10", "2026-09-07"]);
    expect(last.map((a) => a.startDate)).toEqual(["2026-09-06", "2026-08-31"]);
  });

  it("treats Sunday as the end of the week", () => {
    const now = new Date(2026, 8, 13, 23); // Sunday, Sept 13
    const { current } = groupActivitiesByWeek([withDate("2026-09-07")], now);
    expect(current).toHaveLength(1);
  });
});
