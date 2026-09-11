import { describe, expect, it } from "vitest";
import { changeProductionUnit, filterProductionPlots } from "./plotProductionForm";

const plots = [
  { id: 1, unit: "Đội 1", name: "1", code: "D1-1", plantedYear: 2011 },
  { id: 2, unit: "Đội 2", name: "2", code: "D2-2", plantedYear: 2012 },
];

describe("PlotProductionPage team filter", () => {
  it("only exposes plots from the selected team", () => {
    expect(filterProductionPlots(plots, "Đội 2").map(plot => plot.id)).toEqual([2]);
    expect(filterProductionPlots(plots, "")).toHaveLength(2);
  });

  it("resets selected plot when team changes", () => {
    expect(changeProductionUnit({ unit: "Đội 1", plotId: "1" }, "Đội 2")).toEqual({ unit: "Đội 2", plotId: "" });
  });
});
