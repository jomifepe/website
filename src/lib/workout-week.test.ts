import { describe, expect, it } from "vitest";

import type { SanitizedActivity, SportType } from "./strava";
import { categorizeCurrentWeek, categorizeWeek } from "./workout-week";

const week = (...sportTypes: SportType[]) => sportTypes.map((sport_type) => ({ sport_type }) as SanitizedActivity);

describe("categorizeCurrentWeek", () => {
  it("reports progress so far", () => {
    expect(categorizeCurrentWeek(week("Run"))).toEqual({
      label: "in progress",
      color: "secondary",
      description: "trained 1 day so far",
    });
    expect(categorizeCurrentWeek(week()).description).toBe("trained 0 days so far");
  });
});

describe("categorizeWeek", () => {
  it("is outstanding when the run and lift goal is met", () => {
    const category = categorizeWeek(
      week("Run", "TrailRun", "VirtualRun", "WeightTraining", "WeightTraining", "WeightTraining"),
    );
    expect(category.label).toBe("outstanding 🥇");
    expect(category.description).toBe("trained 6 days. reached goal of 3+ runs and 3+ lifts");
  });

  it.each([
    [week("Walk", "Walk", "Walk", "Walk", "Walk"), "strong"],
    [week("Run", "Run", "Run"), "good"],
    [week("Run", "Ride"), "okay"],
    [week("Yoga"), "slacking 😴"],
    [week(), "slacking 😴"],
  ])("labels %# by activity count", (activities, label) => {
    expect(categorizeWeek(activities).label).toBe(label);
  });

  it("pluralizes the day count", () => {
    expect(categorizeWeek(week("Yoga")).description).toBe("trained 1 day");
    expect(categorizeWeek(week("Run", "Ride")).description).toBe("trained 2 days");
  });
});
