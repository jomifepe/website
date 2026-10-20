import { describe, expect, it } from "vitest";
import {
  BEST_EFFORT_TARGETS,
  extractRunBestEfforts,
  formatDurationNoSeconds,
  reduceAllTimeBestEfforts,
} from "./best-efforts";

describe("extractRunBestEfforts", () => {
  it("maps Strava segment distances to effort keys", () => {
    const efforts = extractRunBestEfforts([
      { distance: 1000, elapsed_time: 240 },
      { distance: 5000, elapsed_time: 1200 },
      { distance: 10000, elapsed_time: 2500 },
    ]);

    expect(efforts.km1).toBe(240);
    expect(efforts.km5).toBe(1200);
    expect(efforts.km10).toBe(2500);
    expect(efforts.halfMarathon).toBeUndefined();
  });
});

describe("reduceAllTimeBestEfforts", () => {
  it("keeps the fastest elapsed time per distance", () => {
    const allTime = reduceAllTimeBestEfforts([
      { sport_type: "Run", runBestEfforts: { km5: 1200, km10: 3000 } },
      { sport_type: "Run", runBestEfforts: { km5: 1100 } },
      { sport_type: "WeightTraining", runBestEfforts: { km5: 900 } },
    ]);

    expect(allTime.km5).toBe(1100);
    expect(allTime.km10).toBe(3000);
  });
});

describe("formatDurationNoSeconds", () => {
  it("rounds to minutes without seconds", () => {
    expect(formatDurationNoSeconds(89)).toBe("1m");
    expect(formatDurationNoSeconds(3600 + 90)).toBe("1h 2m");
  });

  it("covers every card label key", () => {
    expect(BEST_EFFORT_TARGETS.length).toBe(5);
  });
});
