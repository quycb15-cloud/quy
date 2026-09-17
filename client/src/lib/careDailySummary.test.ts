import { describe, expect, it } from "vitest";
import { dailyCompletionPercent, summarizeCareDaily } from "./careDailySummary";

describe("care daily summary", () => {
  it("sums the filtered rows and keeps the next-garden columns separate", () => {
    const summary = summarizeCareDaily([
      { planQuantity: 57, actualQuantity: 0, cumulativeQuantity: 0, pendingGardens: 57, partialGardens: 0, nextGardenPlanQuantity: 57, nextGardenActualQuantity: 0 },
      { planQuantity: 54, actualQuantity: 16, cumulativeQuantity: 16, pendingGardens: 38, partialGardens: 0, nextGardenPlanQuantity: 33, nextGardenActualQuantity: 13 },
    ]);

    expect(summary).toEqual({ plan: 111, actual: 16, cumulative: 16, pending: 95, partial: 0, nextPlan: 90, nextActual: 13 });
    expect(dailyCompletionPercent(summary)).toBeCloseTo(14.4144, 4);
  });

  it("returns zero completion when there is no plan", () => {
    expect(dailyCompletionPercent(summarizeCareDaily([]))).toBe(0);
  });
});
