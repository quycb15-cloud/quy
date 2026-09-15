import { describe, expect, it } from "vitest";
import { resolveGardenAllocationOperation } from "./db";

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
