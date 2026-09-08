import { describe, expect, it } from "vitest";
import { hasReportPeriod, sortReportPeriods } from "../../../shared/reportPeriod";

describe("report periods", () => {
  it("sắp xếp và nhận diện Đợt 4 khi dữ liệu có kỳ này", () => {
    const periods = sortReportPeriods(["Đợt 2", "Đợt 1", "Đợt 4", "Đợt 3", "Đợt 4"]);
    expect(periods).toEqual(["Đợt 1", "Đợt 2", "Đợt 3", "Đợt 4"]);
    expect(hasReportPeriod(periods, "Đợt 4")).toBe(true);
  });

  it("không tự tạo Đợt 4 khi dữ liệu không có", () => {
    expect(hasReportPeriod(["Đợt 1", "Đợt 2", "Đợt 3"], "Đợt 4")).toBe(false);
  });
});
