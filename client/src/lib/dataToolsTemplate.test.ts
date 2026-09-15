import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { createImportTemplateWorkbook } from "./dataToolsTemplate";

const labels = { plots: "Vườn / lô", plotIndicators: "Chỉ số cây định kỳ", workers: "Nhân công", teamImports: "Nhập mủ theo đội", teamExports: "Xuất mủ theo đội", workerPlotAllocations: "Phân chia nhân công vườn cây", productionPlans: "Kế hoạch sản lượng tháng/năm", technicalSkillMonthly: "Tổng hợp tay nghề và hao dăm", technicalSkillEvaluations: "Đánh giá tay nghề nhân công" } as const;
const samples = Object.fromEntries(Object.keys(labels).map(key => [key, { Mẫu: "" }])) as typeof labels extends Record<infer K, string> ? Record<K, Record<string, string | number>> : never;

describe("data tools template workbook", () => {
  it("tạo mẫu Nhân công có hàng ví dụ và cột mapping đầy đủ", () => {
    const workerLabels = { ...labels, workers: "Nhân công" };
    const workerSamples = { ...samples, workers: { Đội: "Đội 1", Tên: "Nguyễn Văn A", "Mã số": "CN001", "Tên phiên âm": "Nguyễn A", "Giới tính": "Nam", "Số điện thoại": "0901234567", "Trạng thái làm việc": "Đang làm việc", "Vai trò": "Công nhân khai thác", "Ghi chú": "Hàng ví dụ" } };
    const result = createImportTemplateWorkbook(XLSX, "workers", workerLabels, workerSamples);
    const rows = XLSX.utils.sheet_to_json(result.book.Sheets[result.book.SheetNames[0]], { header: 1 }) as unknown[][];
    expect(rows[0]).toEqual(Object.keys(workerSamples.workers));
    expect(rows[1]).toContain("CN001");
    expect(rows[1]).toContain("0901234567");
  });

  it("tạo đúng workbook đánh giá tay nghề theo nhân công", () => {
    const result = createImportTemplateWorkbook(XLSX, "technicalSkillEvaluations", labels, samples);
    expect(result.fileName).toBe("mau-import-technicalSkillEvaluations.xlsx");
    expect(result.book.SheetNames).toEqual(["Đánh giá tay nghề nhân công", "Hướng dẫn"]);
    expect(XLSX.utils.sheet_to_json(result.book.Sheets[result.book.SheetNames[0]], { header: 1 })[0]).toContain("Mẫu");
  });

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

  it("đưa danh sách Lô thực tế vào mẫu với tên hiển thị kèm năm trồng", () => {
    const result = createImportTemplateWorkbook(XLSX, "workerPlotAllocations", labels, samples, [{ unit: "Đội 1", code: "LO-1", name: "1", plantedYear: 2011 }]);
    expect(result.book.SheetNames).toEqual(["Phân chia nhân công vườn cây", "Danh sách Lô", "Hướng dẫn"]);
    const rows = XLSX.utils.sheet_to_json(result.book.Sheets["Danh sách Lô"], { header: 1 }) as unknown[][];
    expect(rows[1]).toEqual(["Đội 1", "LO-1", "1 (2011)", 2011, ""]);
  });
});
