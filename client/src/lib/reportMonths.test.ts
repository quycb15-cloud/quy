import { describe, expect, it } from "vitest";
import { availableReportMonths } from "./reportMonths";

describe("availableReportMonths", () => {
  it("returns only months present in the selected year/period report", () => {
    expect(availableReportMonths([
      { dailyImports: [{ recordDate: "2026-08-03T00:00:00.000Z" }, { recordDate: "2026-08-19T00:00:00.000Z" }] },
      { dailyImports: [{ recordDate: "2026-10-01T00:00:00.000Z" }] },
    ])).toEqual([8, 10]);
  });

  it("returns an empty list when there is no report data", () => {
    expect(availableReportMonths([])).toEqual([]);
  });
});
