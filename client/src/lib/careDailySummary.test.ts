import { describe, expect, it } from "vitest";
import { cumulativeCompletionPercent, dailyCompletionPercent, summarizeCareByDateAndWorkContent, summarizeCareDaily } from "./careDailySummary";

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

  it("groups totals by the same date and work content, keeping different contents separate", () => {
    const summaries = summarizeCareByDateAndWorkContent([
      { activityDate: "2026-09-16T00:00:00.000Z", workContent: "Bôi thuốc loét sọc miệng cạo L3", planQuantity: 171, actualQuantity: 12, cumulativeQuantity: 171, pendingGardens: null, partialGardens: null, nextGardenPlanQuantity: null, nextGardenActualQuantity: null },
      { activityDate: "2026-09-16T00:00:00.000Z", workContent: "Bôi thuốc loét sọc miệng cạo L3", planQuantity: 162, actualQuantity: 7, cumulativeQuantity: 162, pendingGardens: null, partialGardens: null, nextGardenPlanQuantity: null, nextGardenActualQuantity: null },
      { activityDate: "2026-09-16T00:00:00.000Z", workContent: "Phun thuốc vành đai chống cháy", planQuantity: 283.13, actualQuantity: 0, cumulativeQuantity: 0, pendingGardens: null, partialGardens: null, nextGardenPlanQuantity: null, nextGardenActualQuantity: null },
    ]);

    expect(summaries).toHaveLength(2);
    expect(summaries[0]).toMatchObject({ workContent: "Bôi thuốc loét sọc miệng cạo L3", plan: 333, actual: 19, cumulative: 333, rowCount: 2 });
    expect(summaries[1]).toMatchObject({ workContent: "Phun thuốc vành đai chống cháy", plan: 283.13, cumulative: 0, rowCount: 1 });
    expect(cumulativeCompletionPercent(summaries[0])).toBe(100);
  });
});
