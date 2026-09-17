import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { buildCareTemplateSheets, parseCareWorkbook } from "./careExcel";

describe("parseCareWorkbook", () => {
  it("đọc mẫu Theo dõi số liệu có header hai tầng và tách ba nhóm Vườn", () => {
    const rows: unknown[][] = [
      ["Ngày", "Đội", "Theo dõi cạo mủ hàng ngày", "", "", "", "", "", "Cạo tiếp vườn", "", "", "", "", "", "Cạo tiếp vườn"],
      ["", "", "Vườn cạo", "KH (Vườn)", "Cạo xong (Vườn)", "Chưa cạo (Vườn)", "Cạo chưa xong (Vườn)", "% hoàn thành", "Vườn cạo", "KH (Vườn)", "Cạo xong (Vườn)", "Chưa cạo (Vườn)", "Cạo chưa xong (Vườn)", "% hoàn thành", "Vườn cạo"],
      [],
      [new Date("2026-09-04T00:00:00Z"), "Đội 1", "A", 57, "-", 57, "", "", "B", 57, "", 57, "", "", "C", 57, "", 57, "", ""],
    ];
    const workbook = { SheetNames: ["Theo dõi số liệu"], Sheets: { "Theo dõi số liệu": XLSX.utils.aoa_to_sheet(rows) }, utils: XLSX.utils, SSF: XLSX.SSF };
    const result = parseCareWorkbook(workbook, "tapping");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ unit: "Đội 1", gardenName: "A", planQuantity: 57, actualQuantity: 0, pendingGardens: 57, partialGardens: null, nextGarden: "B / C", nextGardenPlanQuantity: 114, nextGardenActualQuantity: null, sourceRow: 4 });
  });

  it("đọc sheet Theo dõi cạo mủ một dòng và map cột Vườn/Diện tích/Phần cạo", () => {
    const sheet = XLSX.utils.json_to_sheet([{ Ngày: "2026-09-10", Đội: "Đội 1", KH: "", TH: "-", "Lũy kế": "", "Đơn vị tính": "Vườn", "% hoàn thành": "", "Ghi chú": "ghi chú", Vườn: "Vườn A", "Diện tích (ha)": 12.5, "Phần cạo": 2, "Chưa cạo": 4, "Cạo chưa xong": "", "Cạo tiếp vườn": "Vườn B", "KH tiếp (Vườn)": "", "TH tiếp (Vườn)": 3 }]);
    const workbook = { SheetNames: ["Theo dõi cạo mủ"], Sheets: { "Theo dõi cạo mủ": sheet }, utils: XLSX.utils, SSF: XLSX.SSF };
    const result = parseCareWorkbook(workbook, "tapping");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ unit: "Đội 1", gardenName: "Vườn A", areaHa: 12.5, tappingSection: 2, planQuantity: 0, actualQuantity: 0, pendingGardens: 4, nextGarden: "Vườn B", nextGardenActualQuantity: 3, note: "ghi chú", sourceRow: 2 });
  });

  it("giữ đủ năm sheet trong mẫu import", () => {
    expect(buildCareTemplateSheets().map(sheet => sheet.name)).toEqual(["Theo dõi cạo mủ", "Rập thiết kế, trang bị", "Chăm sóc", "Phun, bôi thuốc", "Bón phân"]);
    expect(buildCareTemplateSheets().slice(1).map(sheet => sheet.rows[0]["Nội dung công việc"])).toEqual([undefined, "Làm cỏ", "", ""]);
  });

  it("chấp nhận số liệu trống và dấu gạch như không phát sinh", () => {
    const sheet = XLSX.utils.json_to_sheet([{ Ngày: "2026-09-04", Đội: "Đội 2", Vườn: "C", KH: "", TH: "-", "Lũy kế": "", "Chưa cạo": "", "Cạo chưa xong": "" }]);
    const workbook = { SheetNames: ["Theo dõi cạo mủ"], Sheets: { "Theo dõi cạo mủ": sheet }, utils: XLSX.utils, SSF: XLSX.SSF };
    const result = parseCareWorkbook(workbook, "tapping");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ planQuantity: 0, actualQuantity: 0, cumulativeQuantity: 0, pendingGardens: null, partialGardens: null });
  });
});
