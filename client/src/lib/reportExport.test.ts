import { describe, expect, it } from "vitest";
import { buildProductionChangeExportRows, buildTeamProgressExportRows, buildTechnicalSkillDisplay } from "./reportExport";

describe("report export helpers", () => {
  it("export tiến độ chỉ có Đội, không có Vườn/Lô", () => {
    const rows = buildTeamProgressExportRows([{ unit: "Đội 1", frozenLatex: 10, latexThreadImport: 2, totalImport: 12, frozenContaminatedLatex: 8, latexThreadExport: 1, totalExport: 9, lossRate: 25, dailyImports: [] }], [], value => value, () => 0);
    expect(rows[0]).toMatchObject({ Đội: "Đội 1", "Cộng nhập": 12, "Cộng xuất": 9 });
    expect(rows[0]).not.toHaveProperty("Vườn");
    expect(rows[0]).not.toHaveProperty("Lô");
  });

  it("export tăng giảm dùng Xuất - Nhập và thêm Hao kho", () => {
    expect(buildProductionChangeExportRows([{ periodLabel: "Kỳ 1", monthLabel: "8", unit: "Đội 1", totalImport: 100.126, totalExport: 80.124 }])).toEqual([{ Kỳ: "Kỳ 1", Tháng: "8", Đội: "Đội 1", "Cộng nhập": 100.13, "Cộng xuất": 80.12, "Chênh (Xuất - Nhập)": -20, "Hao kho": 20 }]);
  });

  it("tổng hợp tay nghề có số thợ, tỷ lệ và biến động tháng trước", () => {
    const current = buildTechnicalSkillDisplay({ workerCount: 10, exceptionalCount: 2, goodCount: 4, fairCount: 3, averageCount: 1, weakCount: 0 }, { workerCount: 10, exceptionalCount: 1, goodCount: 5, fairCount: 2, averageCount: 2, weakCount: 0 });
    expect(current.exceptionalCount).toBe(2);
    expect(current.exceptionalPercent).toBe(20);
    expect(current.exceptionalChangePercent).toBe(10);
    expect(current.goodChangePercent).toBe(-10);
    expect(current.fairChangePercent).toBe(10);
  });
});
