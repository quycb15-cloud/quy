import { describe, expect, it } from "vitest";
import { getProductionPlanCardModes } from "./productionPlanDisplay";

describe("production plan card modes", () => {
  it("shows monthly plan and annual plan for a selected month", () => {
    expect(getProductionPlanCardModes(8)).toEqual(["month", "year"]);
  });

  it("shows throughput plan and annual plan for the whole year", () => {
    expect(getProductionPlanCardModes(0)).toEqual(["throughput", "year"]);
  });
});
