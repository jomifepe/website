import { describe, expect, it } from "vitest";

import { formatMovingTime } from "./format";

describe("formatMovingTime", () => {
  it.each([
    [42, "42s"],
    [125, "2m 5s"],
    [3600, "1h 0m"],
    [5025, "1h 23m"],
  ])("formats %i seconds as %s", (seconds, expected) => {
    expect(formatMovingTime(seconds)).toBe(expected);
  });
});
