import { describe, expect, it } from "vitest";
import { careDateFromKey, careDateKey, filterCareRecordsByDateRange, formatCareDate, latestCareDate } from "./careDateRange";

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

  it("lấy đúng ngày 16 tại Việt Nam khi database lưu 00:00 Việt Nam là 17:00 UTC hôm trước", () => {
    const value = "2026-09-15T17:00:00.000Z";
    expect(careDateKey(value)).toBe("2026-09-16");
    expect(latestCareDate([{ activityDate: value }])).toBe("2026-09-16");
    expect(formatCareDate(value)).toBe("16/9/2026");
    expect(filterCareRecordsByDateRange([{ activityDate: value }], "2026-09-16", "2026-09-16")).toHaveLength(1);
    expect(filterCareRecordsByDateRange([{ activityDate: value }], "2026-09-15", "2026-09-15")).toHaveLength(0);
    expect(careDateFromKey("2026-09-16").toISOString()).toBe("2026-09-15T17:00:00.000Z");
  });
});
