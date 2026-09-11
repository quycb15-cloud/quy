import { describe, expect, it } from "vitest";
import { getCombinedProductionPlan, getProductionPlanCardModes } from "./productionPlanDisplay";

describe("production plan card modes", () => {
  it("shows monthly plan and annual plan for a selected month", () => {
    expect(getProductionPlanCardModes(8)).toEqual(["month", "year"]);
  });

  it("shows throughput plan and annual plan for the whole year", () => {
    expect(getProductionPlanCardModes(0)).toEqual(["throughput", "year"]);
  });

  it("combines frozen latex and thread latex plans for month and year", () => {
    expect(getCombinedProductionPlan({ planMonthFrozenLatex: 320_644, planMonthThreadLatex: 174_299, planYearFrozenLatex: 5_286_258, planYearThreadLatex: 210_000 })).toEqual({ month: 494_943, year: 5_496_258 });
  });
});
