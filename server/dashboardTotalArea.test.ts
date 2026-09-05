import { describe, expect, it } from "vitest";
import { getDashboardTotalArea } from "./dashboardMath";

describe("dashboard totalArea contract", () => {
  it("returns 1582.71 for plot records totaling 1582.715 ha", () => {
    const plotRecords = [
      { id: 1, unit: "Đội 1", areaHa: "1000.125" },
      { id: 2, unit: "Đội 2", areaHa: "500.000" },
      { id: 3, unit: "Đội 3", areaHa: "82.590" },
    ];

    expect(getDashboardTotalArea(plotRecords)).toBe(1582.71);
  });
});
