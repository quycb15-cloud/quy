import { describe, expect, it } from "vitest";
import { aggregatePlotProduction, aggregatePlotProductionByTeam, comparePlotProduction, plotProductionExcelRows, type PlotProductionEntry } from "./plotProduction";

const entries: PlotProductionEntry[] = [
  { id: 1, plotId: 2, recordDate: "2026-08-01T12:00:00.000Z", frozenContaminatedLatex: 10, dryRubber: 8, unit: "Đội 1", plotCode: "L-02", plotName: "Lô 02", plantedYear: 2011, areaHa: 2.5 },
  { id: 2, plotId: 2, recordDate: "2026-08-20T12:00:00.000Z", frozenContaminatedLatex: 5, dryRubber: 4, unit: "Đội 1", plotCode: "L-02", plotName: "Lô 02", plantedYear: 2011, areaHa: 2.5 },
  { id: 3, plotId: 3, recordDate: "2026-07-20T12:00:00.000Z", frozenContaminatedLatex: 30, dryRubber: 22, unit: "Đội 2", plotCode: "L-03", plotName: "Lô 03", plantedYear: 2012, areaHa: 3 },
];

describe("plot production summary", () => {
  it("tổng hợp đúng theo năm, tháng và Đội", () => {
    expect(aggregatePlotProduction(entries, { year: 2026, month: 8, unit: "Đội 1" })).toMatchObject([{ plotId: 2, frozenContaminatedLatex: 15, dryRubber: 12 }]);
  });

  it("tạo đúng dòng STT và tổng khối lượng cho Excel", () => {
    expect(plotProductionExcelRows(aggregatePlotProduction(entries, { year: 2026, month: 8 }))).toEqual([
      { STT: 1, Đội: "Đội 1", Lô: "Lô 02", "Năm trồng": 2011, "Diện tích (ha)": 2.5, "Mủ đông, tạp (kg)": 15, "Quy khô (kg)": 12 },
      { STT: "", Đội: "", Lô: "Tổng khối lượng", "Năm trồng": "", "Diện tích (ha)": "", "Mủ đông, tạp (kg)": 15, "Quy khô (kg)": 12 },
    ]);
  });

  it("tách riêng Mủ đông/tạp và Quy khô khi so sánh cùng kỳ", () => {
    const comparison = comparePlotProduction([
      ...entries,
      { id: 4, plotId: 2, recordDate: "2026-07-01T12:00:00.000Z", frozenContaminatedLatex: 2.345, dryRubber: 1.115, unit: "Đội 1", plotCode: "L-02", plotName: "Lô 02", plantedYear: 2011, areaHa: 2.5 },
      { id: 5, plotId: 2, recordDate: "2025-08-01T12:00:00.000Z", frozenContaminatedLatex: 4, dryRubber: 3, unit: "Đội 1", plotCode: "L-02", plotName: "Lô 02", plantedYear: 2011, areaHa: 2.5 },
    ], { year: 2026, month: 8, unit: "Đội 1" });
    expect(comparison.current).toEqual({ frozen: 15, dry: 12, total: 27, monthLabel: "08/2026" });
    expect(comparison.previousMonth).toEqual({ frozen: 2.35, dry: 1.12, total: 3.47, monthLabel: "07/2026" });
    expect(comparison.previousYear).toEqual({ frozen: 4, dry: 3, total: 7, monthLabel: "08/2025" });
  });

  it("chọn tháng liền kề gần nhất có dữ liệu thay vì mặc định trừ một tháng", () => {
    const comparison = comparePlotProduction([
      ...entries.filter(entry => entry.recordDate !== "2026-07-20T12:00:00.000Z"),
      { id: 6, plotId: 2, recordDate: "2026-05-01T12:00:00.000Z", frozenContaminatedLatex: 6, dryRubber: 2, unit: "Đội 1", plotCode: "L-02", plotName: "Lô 02", plantedYear: 2011, areaHa: 2.5 },
    ], { year: 2026, month: 8, unit: "Đội 1" });
    expect(comparison.previousMonth?.monthLabel).toBe("05/2026");
    expect(comparison.previousMonth?.frozen).toBe(6);
    expect(comparison.previousMonth?.dry).toBe(2);
  });

  it("so sánh được Mủ đông/tạp và Quy khô theo từng Đội", () => {
    expect(aggregatePlotProductionByTeam(aggregatePlotProduction(entries, { year: 2026 }))).toEqual([
      { unit: "Đội 1", frozenContaminatedLatex: 15, dryRubber: 12 },
      { unit: "Đội 2", frozenContaminatedLatex: 30, dryRubber: 22 },
    ]);
  });
});
