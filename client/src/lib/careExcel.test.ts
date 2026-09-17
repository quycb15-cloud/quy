import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { parseCareWorkbook } from "./careExcel";

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

  it("chấp nhận số liệu trống và dấu gạch như không phát sinh", () => {
    const sheet = XLSX.utils.json_to_sheet([{ Ngày: "2026-09-04", Đội: "Đội 2", Vườn: "C", KH: "", TH: "-", "Lũy kế": "", "Chưa cạo": "", "Cạo chưa xong": "" }]);
    const workbook = { SheetNames: ["Theo dõi cạo mủ"], Sheets: { "Theo dõi cạo mủ": sheet }, utils: XLSX.utils, SSF: XLSX.SSF };
    const result = parseCareWorkbook(workbook, "tapping");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ planQuantity: 0, actualQuantity: 0, cumulativeQuantity: 0, pendingGardens: null, partialGardens: null });
  });
});
