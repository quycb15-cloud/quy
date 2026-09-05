import { describe, expect, it } from "vitest";
import { getDashboardTotalArea } from "./dashboardMath";

describe("getDashboardTotalArea", () => {
  it("returns the dashboard area without rounding 1582.715 up", () => {
    const plots = [
      { areaHa: "1000.125" },
      { areaHa: 582.59 },
      { areaHa: null },
    ];
    expect(getDashboardTotalArea(plots)).toBe(1582.71);
  });
});
