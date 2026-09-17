import { describe, expect, it } from "vitest";
import { monthlyCompletionPercent, summarizeMonthlyTapping } from "./careMonthlySummary";

describe("summarizeMonthlyTapping", () => {
  it("cộng dồn riêng từng Vườn trong khoảng tháng và không mang Cạo tiếp vườn vào tổng", () => {
    const rows = summarizeMonthlyTapping([
      { activityDate: "2026-09-01T00:00:00.000Z", unit: "Đội 1", gardenName: "Vườn A", planQuantity: 57, actualQuantity: 50, pendingGardens: 4, partialGardens: 3 },
      { activityDate: "2026-09-10T00:00:00.000Z", unit: "Đội 1", gardenName: "Vườn A", planQuantity: 57, actualQuantity: 57, pendingGardens: 0, partialGardens: 0 },
      { activityDate: "2026-09-10T00:00:00.000Z", unit: "Đội 1", gardenName: "Vườn B", planQuantity: 57, actualQuantity: 57, pendingGardens: 0, partialGardens: 0 },
      { activityDate: "2026-08-31T00:00:00.000Z", unit: "Đội 1", gardenName: "Vườn A", planQuantity: 999, actualQuantity: 999, pendingGardens: 1, partialGardens: 1 },
    ], new Date("2026-09-01T00:00:00.000Z"), new Date("2026-09-30T23:59:59.999Z"));
    expect(rows).toEqual([
      { unit: "Đội 1", gardenName: "Vườn A", plan: 114, actual: 107, pending: 4, partial: 3 },
      { unit: "Đội 1", gardenName: "Vườn B", plan: 57, actual: 57, pending: 0, partial: 0 },
    ]);
    expect(monthlyCompletionPercent(rows[0]!)).toBeCloseTo((107 / 114) * 100, 8);
  });
});
