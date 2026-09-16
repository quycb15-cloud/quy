import { describe, expect, it } from "vitest";
import { resolveGardenAllocationOperation, validateTeamGardenAllocationTotals } from "./db";

describe("resolveGardenAllocationOperation", () => {
  it("creates separate insert operations for garden A and B on the same plot", () => {
    const existing = [{ id: 10, gardenType: "A" as const, areaHa: 4.56, tappingTrees: 2260 }];
    expect(resolveGardenAllocationOperation(existing, { gardenType: "B", areaHa: 1.81, tappingTrees: 931 })).toEqual({
      kind: "insert",
      gardenType: "B",
      areaHa: 1.81,
      tappingTrees: 931,
    });
  });

  it("updates only the existing garden type instead of merging A and B", () => {
    const existing = [
      { id: 10, gardenType: "A" as const, areaHa: 4.56, tappingTrees: 2260 },
      { id: 11, gardenType: "B" as const, areaHa: 1.81, tappingTrees: 931 },
    ];
    expect(resolveGardenAllocationOperation(existing, { gardenType: "B", areaHa: 0.2, tappingTrees: 10 })).toEqual({
      kind: "update",
      id: 11,
      gardenType: "B",
      areaHa: 2.01,
      tappingTrees: 941,
    });
  });
});

describe("validateTeamGardenAllocationTotals", () => {
  it("does not warn when a plot-level portion is larger but the team total remains within source totals", () => {
    expect(validateTeamGardenAllocationTotals({ unit: "Đội 3", sourceAreaHa: 100, sourceTappingTrees: 10000, hasUnknownSourceTappingTrees: false, allocatedAreaHa: 99.9999999, allocatedTappingTrees: 9999 })).toBe(true);
  });

  it("warns with team totals when area exceeds the team source total", () => {
    expect(() => validateTeamGardenAllocationTotals({ unit: "Đội 3", sourceLabel: "Dòng Excel 14 (TT 12)", sourceAreaHa: 100, sourceTappingTrees: 10000, hasUnknownSourceTappingTrees: false, allocatedAreaHa: 100.001, allocatedTappingTrees: 9999 })).toThrow("Dòng Excel 14 (TT 12): Tổng diện tích phân bổ của Đội 3");
  });

  it("warns with team totals when trees exceed the team source total", () => {
    expect(() => validateTeamGardenAllocationTotals({ unit: "Đội 3", sourceAreaHa: 100, sourceTappingTrees: 10000, hasUnknownSourceTappingTrees: false, allocatedAreaHa: 100, allocatedTappingTrees: 10001 })).toThrow("Tổng số cây cạo phân bổ của Đội 3");
  });

  it("skips tree warning when the team source has an unknown tree count", () => {
    expect(validateTeamGardenAllocationTotals({ unit: "Đội 3", sourceAreaHa: 100, sourceTappingTrees: 0, hasUnknownSourceTappingTrees: true, allocatedAreaHa: 100, allocatedTappingTrees: 10001 })).toBe(true);
  });
});
