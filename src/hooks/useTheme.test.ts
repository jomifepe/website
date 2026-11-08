import { describe, expect, it } from "vitest";

import { getNextTheme } from "./useTheme";

describe("getNextTheme", () => {
  it("cycles system → dark → light when the system is light", () => {
    expect(getNextTheme("system", false)).toBe("dark");
    expect(getNextTheme("dark", false)).toBe("light");
    expect(getNextTheme("light", false)).toBe("system");
  });

  it("cycles system → light → dark when the system is dark", () => {
    expect(getNextTheme("system", true)).toBe("light");
    expect(getNextTheme("light", true)).toBe("dark");
    expect(getNextTheme("dark", true)).toBe("system");
  });
});
