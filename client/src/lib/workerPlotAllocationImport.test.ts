import { describe, expect, it } from "vitest";
import { parseWorkerPlotAllocationRows } from "./workerPlotAllocationImport";

describe("parseWorkerPlotAllocationRows", () => {
  it("tách ba nhóm Vườn A/B/C thành các dòng import độc lập", () => {
    const rows = [["STT"], [""], [1, "Đội 2", "YIM RA", "NC-002", "LO-DOI-2-2012-7A", "", "", 1, 12, 2.35, "LO-DOI-2-2012-8", "", "", 13, 25, "3,40"]];
    const result = parseWorkerPlotAllocationRows(rows);
    expect(result.issues).toEqual([]);
    expect(result.parsed).toEqual([{ unit: "Đội 2", workerName: "YIM RA", employeeCode: "NC-002", gardenType: "A", plotCode: "LO-DOI-2-2012-7A", rowStart: 1, rowEnd: 12, areaHa: 2.35 }, { unit: "Đội 2", workerName: "YIM RA", employeeCode: "NC-002", gardenType: "B", plotCode: "LO-DOI-2-2012-8", rowStart: 13, rowEnd: 25, areaHa: 3.4 }]);
  });

  it("đọc mẫu mới chỉ có Mã công nhân và ba nhóm Vườn", () => {
    const rows = [
      ["TT", "Mã công nhân", "VƯỜN A", "", "", "", "VƯỜN B"],
      ["", "", "Lô (Tên hiển thị)", "Hàng - hàng", "Diện tích", "Tổng cây cạo", "Lô (Tên hiển thị)", "Hàng - hàng", "Diện tích", "Tổng cây cạo", "Lô (Tên hiển thị)", "Hàng - hàng", "Diện tích", "Tổng cây cạo"],
      [1, "NC-002", "LO-A", "1-12", "2,35", 1200, "LO-B", "13–25", "3,40", 1500, "", "", "", ""],
    ];
    expect(parseWorkerPlotAllocationRows(rows)).toEqual({
      issues: [],
      parsed: [
        { unit: undefined, workerName: undefined, employeeCode: "NC-002", gardenType: "A", plotCode: "LO-A", rowStart: 1, rowEnd: 12, areaHa: 2.35, tappingTrees: 1200 },
        { unit: undefined, workerName: undefined, employeeCode: "NC-002", gardenType: "B", plotCode: "LO-B", rowStart: 13, rowEnd: 25, areaHa: 3.4, tappingTrees: 1500 },
      ],
    });
  });

  it("nhận tên Lô hiển thị kèm năm trồng như trong danh sách", () => {
    const rows = [["TT", "Mã công nhân", "VƯỜN A"], ["", "", "Lô (Tên hiển thị)"], [1, "D1-01", "1 (2011)", "1-10", "2,5", 100]];
    expect(parseWorkerPlotAllocationRows(rows).parsed[0]?.plotCode).toBe("1 (2011)");
  });

  it("giữ nguyên diện tích thập phân khi Excel trả về ô số", () => {
    const rows = [["STT"], [""], [1, "Đội 2", "YIM RA", "", "LO-DOI-2-2012-7A", "", "", 1, 12, 2.35]];
    expect(parseWorkerPlotAllocationRows(rows).parsed[0]?.areaHa).toBe(2.35);
  });
});
