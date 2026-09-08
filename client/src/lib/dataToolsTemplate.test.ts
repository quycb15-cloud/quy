import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { createImportTemplateWorkbook } from "./dataToolsTemplate";

const labels = { plots: "Vườn / lô", plotIndicators: "Chỉ số cây định kỳ", workers: "Nhân công", teamImports: "Nhập mủ theo đội", teamExports: "Xuất mủ theo đội", workerPlotAllocations: "Phân chia nhân công vườn cây", productionPlans: "Kế hoạch sản lượng tháng/năm", technicalSkillMonthly: "Tổng hợp tay nghề và hao dăm" } as const;
const samples = Object.fromEntries(Object.keys(labels).map(key => [key, { Mẫu: "" }])) as typeof labels extends Record<infer K, string> ? Record<K, Record<string, string | number>> : never;

describe("data tools template workbook", () => {
  it("tạo đúng workbook phân bổ Vườn A/B/C và không lỗi khi tạo file", () => {
    const result = createImportTemplateWorkbook(XLSX, "workerPlotAllocations", labels, samples);
    expect(result.fileName).toBe("mau-import-workerPlotAllocations.xlsx");
    expect(result.book.SheetNames).toEqual(["Phân chia nhân công vườn cây", "Hướng dẫn"]);
    const sheet = result.book.Sheets[result.book.SheetNames[0]];
    expect(sheet["!merges"]).toBeDefined();
    expect(XLSX.utils.sheet_to_json(sheet, { header: 1 })[0]).toContain("VƯỜN A");
    expect(XLSX.utils.sheet_to_json(sheet, { header: 1 })[0]).toContain("VƯỜN B");
    expect(XLSX.utils.sheet_to_json(sheet, { header: 1 })[0]).toContain("VƯỜN C");
  });
});
