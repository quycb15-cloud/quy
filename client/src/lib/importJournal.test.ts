import { describe, expect, it } from "vitest";
import { filterImportJournal, toImportExcelRows, type ImportJournalRow } from "./importJournal";

const rows: ImportJournalRow[] = [
  { id: 1, source: "team", plotId: null, plotCode: "—", plotName: "Vườn A", unit: "Đội 1", recordDate: "2026-08-05T12:00:00.000Z", periodLabel: "Đợt 1", frozenLatex: 10.5, latexThread: 2, totalImport: 12.5, note: null },
  { id: 2, source: "plot", plotId: 8, plotCode: "Lô 8", plotName: "8", unit: "Đội 1", recordDate: "2026-08-06T12:00:00.000Z", periodLabel: "Đợt 2", frozenLatex: 20, latexThread: 1.5, totalImport: 21.5, note: "Đã cân" },
];

describe("importJournal", () => {
  it("lọc theo Đợt và khoảng ngày", () => {
    expect(filterImportJournal(rows, { periodLabel: "Đợt 2", fromDate: "2026-08-01", toDate: "2026-08-31" }).map(row => row.id)).toEqual([2]);
  });

  it("xuất dòng chi tiết và dòng tổng khối lượng", () => {
    expect(toImportExcelRows(rows)).toEqual([
      { "Ngày nhập": "2026-08-05", "Vườn / Lô": "Vườn A", "Đội": "Đội 1", "Đợt": "Đợt 1", "Mủ đông (kg)": 10.5, "Mủ dây (kg)": 2, "Cộng nhập (kg)": 12.5, "Ghi chú": "" },
      { "Ngày nhập": "2026-08-06", "Vườn / Lô": "Lô 8 — 8", "Đội": "Đội 1", "Đợt": "Đợt 2", "Mủ đông (kg)": 20, "Mủ dây (kg)": 1.5, "Cộng nhập (kg)": 21.5, "Ghi chú": "Đã cân" },
      { "Ngày nhập": "Tổng khối lượng", "Vườn / Lô": "", "Đội": "", "Đợt": "", "Mủ đông (kg)": 30.5, "Mủ dây (kg)": 3.5, "Cộng nhập (kg)": 34, "Ghi chú": "" },
    ]);
  });
});
