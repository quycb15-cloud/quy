import { describe, expect, it } from "vitest";
import { groupPlotsByGarden, groupPlotsByTeam } from "./plotTeamGroups";

describe("groupPlotsByTeam", () => {
  it("nhóm trọn Lô theo Đội và cộng diện tích thực tế của từng Đội", () => {
    const groups = groupPlotsByTeam([
      { unit: "Đội 2", name: "Lô 1 (2011)", code: "D2-1", plantedYear: 2011, areaHa: 2.5, gardenType: "B" },
      { unit: "Đội 1", name: "Lô 10 (2012)", code: "D1-10", plantedYear: 2012, areaHa: 1, gardenType: "A" },
      { unit: "Đội 1", name: "Lô 2 (2011)", code: "D1-2", plantedYear: 2011, areaHa: 3.25, gardenType: "A" },
    ]);
    expect(groups.map(group => ({ unit: group.unit, plotCount: group.plotCount, areaHa: group.areaHa, gardenCounts: group.gardenCounts, gardenAreas: group.gardenAreas, codes: group.plots.map(plot => plot.code) }))).toEqual([
      { unit: "Đội 1", plotCount: 2, areaHa: 4.25, gardenCounts: { A: 2, B: 0, C: 0 }, gardenAreas: { A: 4.25, B: 0, C: 0 }, codes: ["D1-2", "D1-10"] },
      { unit: "Đội 2", plotCount: 1, areaHa: 2.5, gardenCounts: { A: 0, B: 1, C: 0 }, gardenAreas: { A: 0, B: 2.5, C: 0 }, codes: ["D2-1"] },
    ]);
  });

  it("nhóm Lô trong một Đội theo thứ tự Vườn A, B, C rồi chưa phân loại", () => {
    const groups = groupPlotsByGarden([
      { unit: "Đội 1", name: "Lô 4 (2011)", code: "D1-4", plantedYear: 2011, areaHa: 1, gardenType: null },
      { unit: "Đội 1", name: "Lô 2 (2011)", code: "D1-2", plantedYear: 2011, areaHa: 2.5, gardenType: "B" },
      { unit: "Đội 1", name: "Lô 1 (2011)", code: "D1-1", plantedYear: 2011, areaHa: 3, gardenType: "A" },
      { unit: "Đội 1", name: "Lô 3 (2011)", code: "D1-3", plantedYear: 2011, areaHa: 1.25, gardenType: "C" },
    ]);
    expect(groups.map(group => ({ gardenType: group.gardenType, areaHa: group.areaHa, codes: group.plots.map(plot => plot.code) }))).toEqual([
      { gardenType: "A", areaHa: 3, codes: ["D1-1"] },
      { gardenType: "B", areaHa: 2.5, codes: ["D1-2"] },
      { gardenType: "C", areaHa: 1.25, codes: ["D1-3"] },
      { gardenType: "unclassified", areaHa: 1, codes: ["D1-4"] },
    ]);
  });

  it("hiển thị cùng một Lô trong cả Vườn A và B theo từng phần đã phân bổ", () => {
    const groups = groupPlotsByGarden([
      {
        unit: "Đội 1",
        name: "Lô 7",
        code: "D1-7",
        plantedYear: 2011,
        areaHa: 6.37,
        gardenType: null,
        gardenAllocations: [
          { gardenType: "A", areaHa: 4.52 },
          { gardenType: "B", areaHa: 1.81 },
        ],
      },
    ]);

    expect(groups.map(group => ({ gardenType: group.gardenType, areaHa: group.areaHa, codes: group.plots.map(plot => plot.code) }))).toEqual([
      { gardenType: "A", areaHa: 4.52, codes: ["D1-7"] },
      { gardenType: "B", areaHa: 1.81, codes: ["D1-7"] },
      { gardenType: "unclassified", areaHa: 0.04, codes: ["D1-7"] },
    ]);
  });
});

describe("groupPlotsByGarden filter", () => {
  it("shows only the selected actual allocation garden", () => {
    const plot = { unit: "Đội 3", name: "Lô 29 (2012)", code: "D3-29", plantedYear: 2012, areaHa: 13.17, gardenType: "C" as const, gardenAllocations: [{ gardenType: "B" as const, areaHa: 4.8 }, { gardenType: "C" as const, areaHa: 8.37 }] };
    expect(groupPlotsByGarden([plot], "B").map(group => ({ gardenType: group.gardenType, areaHa: group.areaHa }))).toEqual([{ gardenType: "B", areaHa: 4.8 }]);
    expect(groupPlotsByGarden([plot], "C").map(group => ({ gardenType: group.gardenType, areaHa: group.areaHa }))).toEqual([{ gardenType: "C", areaHa: 8.37 }]);
  });

  it("counts actual allocation gardens in team summaries", () => {
    const groups = groupPlotsByTeam([{ unit: "Đội 3", name: "Lô 29", code: "D3-29", plantedYear: 2012, areaHa: 13.17, gardenType: "C" as const, gardenAllocations: [{ gardenType: "B" as const, areaHa: 4.8 }, { gardenType: "C" as const, areaHa: 8.37 }] }]);
    expect(groups[0]?.gardenCounts).toEqual({ A: 0, B: 1, C: 1 });
    expect(groups[0]?.gardenAreas).toEqual({ A: 0, B: 4.8, C: 8.37 });
  });
});
