import { describe, expect, it } from "vitest";
import { filterProductionRows } from "../../../shared/productionPeriod";

describe("production period filters", () => {
  const rows = [
    { recordDate: new Date("2026-08-03T00:00:00Z"), periodLabel: "Đợt 4", unit: "Đội 1", totalImport: 40 },
    { recordDate: new Date("2026-08-04T00:00:00Z"), periodLabel: "Đợt 3", unit: "Đội 1", totalImport: 30 },
    { recordDate: new Date("2026-07-03T00:00:00Z"), periodLabel: "Đợt 4", unit: "Đội 1", totalImport: 20 },
  ];

  it("lọc đúng Tháng 8 và chỉ lấy Đợt 4", () => {
    const result = filterProductionRows(rows, { year: 2026, month: 8, periodLabel: "Đợt 4" });
    expect(result.map(row => row.totalImport)).toEqual([40]);
  });

  it("lọc theo Tháng khi chọn tất cả Đợt và giữ nguyên tổng nguồn", () => {
    const result = filterProductionRows(rows, { year: 2026, month: 8 });
    expect(result.map(row => row.totalImport)).toEqual([40, 30]);
    expect(result.reduce((sum, row) => sum + row.totalImport, 0)).toBe(70);
  });

  it("không đưa bản ghi khác Năm vào Tổng sản lượng", () => {
    const result = filterProductionRows([{ recordDate: new Date("2025-08-03T00:00:00Z"), periodLabel: "Đợt 4", unit: "Đội 1", totalImport: 999 }, ...rows], { year: 2026, month: 8, periodLabel: "Đợt 4" });
    expect(result.reduce((sum, row) => sum + row.totalImport, 0)).toBe(40);
  });
});
