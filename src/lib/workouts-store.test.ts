import { describe, expect, it } from "vitest";

import { selectSiteActivities } from "./workouts-store";

const now = new Date("2026-11-21T12:00:00Z");

describe("selectSiteActivities", () => {
  it("keeps activities from the last 15 days and drops older ones", () => {
    const selected = selectSiteActivities(
      [
        { startDate: "2026-11-20" },
        { startDate: "2026-11-15" },
        { startDate: "2026-11-06" },
        { startDate: "2026-11-05" },
        { startDate: "2026-10-01" },
      ],
      now,
    );

    expect(selected.map((a) => a.startDate)).toEqual(["2026-11-20", "2026-11-15", "2026-11-06"]);
  });

  it("always keeps the two most recent so the home card is never empty", () => {
    const selected = selectSiteActivities(
      [{ startDate: "2026-09-01" }, { startDate: "2026-08-01" }, { startDate: "2026-07-01" }],
      now,
    );

    expect(selected.map((a) => a.startDate)).toEqual(["2026-09-01", "2026-08-01"]);
  });
});
