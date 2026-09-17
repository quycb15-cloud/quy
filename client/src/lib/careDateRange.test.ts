import { describe, expect, it } from "vitest";
import { filterCareRecordsByDateRange, formatCareDate, latestCareDate } from "./careDateRange";

describe("filterCareRecordsByDateRange", () => {
  const records = [{ id: 1, activityDate: "2026-08-01T00:00:00.000Z" }, { id: 2, activityDate: "2026-08-15T00:00:00.000Z" }, { id: 3, activityDate: "2026-08-31T00:00:00.000Z" }];
  it("lọc bao gồm cả ngày bắt đầu và ngày kết thúc", () => {
    expect(filterCareRecordsByDateRange(records, "2026-08-15", "2026-08-31").map(row => row.id)).toEqual([2, 3]);
  });
  it("giữ nguyên dữ liệu khi chưa chọn khoảng ngày", () => {
    expect(filterCareRecordsByDateRange(records)).toHaveLength(3);
  });
  it("chọn ngày gần nhất có dữ liệu", () => {
    expect(latestCareDate(records)).toBe("2026-08-31");
    expect(latestCareDate([])).toBeUndefined();
  });

  it("hiển thị cùng ngày với khóa lọc khi timestamp nằm ở 00:00 UTC", () => {
    const value = "2026-09-15T00:00:00.000Z";
    expect(latestCareDate([{ activityDate: value }])).toBe("2026-09-15");
    expect(formatCareDate(value)).toBe("15/9/2026");
    expect(filterCareRecordsByDateRange([{ activityDate: value }], "2026-09-15", "2026-09-15")).toHaveLength(1);
  });
});
