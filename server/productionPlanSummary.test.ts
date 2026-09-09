import { describe, expect, it } from "vitest";
import { mergeProductionPlanRows } from "../shared/productionPlanSummary";

const plans = [
  { unit: "Đội 1", year: 2026, month: 0, areaHa: 10, planFrozenLatex: 1_553_339, planThreadLatex: 0, planDryRubber: 0, planDryFromFrozen: 0, planDryFromThread: 0 },
  { unit: "Đội 1", year: 2026, month: 8, areaHa: 10, planFrozenLatex: 320_644, planThreadLatex: 0, planDryRubber: 0, planDryFromFrozen: 0, planDryFromThread: 0 },
  { unit: "Đội 2", year: 2026, month: 0, areaHa: 12, planFrozenLatex: 3_732_919, planThreadLatex: 0, planDryRubber: 0, planDryFromFrozen: 0, planDryFromThread: 0 },
];

describe("mergeProductionPlanRows", () => {
  it("keeps annual and monthly plans together for a selected month", () => {
    const rows = mergeProductionPlanRows(plans, 2026, 8);
    expect(rows.find(row => row.unit === "Đội 1")).toMatchObject({
      planMonthFrozenLatex: 320_644,
      planYearFrozenLatex: 1_553_339,
    });
    expect(rows.find(row => row.unit === "Đội 2")).toMatchObject({
      planMonthFrozenLatex: 0,
      planYearFrozenLatex: 3_732_919,
    });
  });

  it("uses only annual rows for whole-year mode", () => {
    const rows = mergeProductionPlanRows(plans, 2026, 0);
    expect(rows).toHaveLength(2);
    expect(rows.reduce((sum, row) => sum + row.planYearFrozenLatex, 0)).toBe(5_286_258);
    expect(rows.reduce((sum, row) => sum + row.planMonthFrozenLatex, 0)).toBe(0);
  });
});
