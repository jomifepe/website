import { describe, expect, it } from "vitest";

import { decodePolyline, polylineToSvgPath } from "./polyline";

describe("decodePolyline", () => {
  it("decodes the reference example from Google's polyline docs", () => {
    expect(decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@")).toEqual([
      [38.5, -120.2],
      [40.7, -120.95],
      [43.252, -126.453],
    ]);
  });
});

describe("polylineToSvgPath", () => {
  it("fits coordinates into the padded box, north up", () => {
    const path = polylineToSvgPath({
      coords: [
        [0, 0],
        [1, 1],
      ],
      w: 100,
      h: 100,
      padding: 10,
    });
    expect(path).toBe("M10,90 L90,10");
  });
});
