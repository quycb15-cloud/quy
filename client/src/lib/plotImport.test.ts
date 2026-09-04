import { describe, expect, it } from "vitest";
import { parsePlotImportRows } from "../components/PlotImportDialog";

describe("parsePlotImportRows", () => {
  it("parses the supplied inventory template and auto-generates a code", () => {
    const [row] = parsePlotImportRows([{ "Đơn vị": "Đội 1", "Tên lô": 1, "Năm trồng": 2011, "Giống": "LH90/952", "Diện tích (ha)": 18.9, "Tổng số hố kiểm kê": 524, "Tổng số cây kiểm kê": 9963, "Cây cạo - SL": 7914, "Cây cạo - %": 79.43, "Cây chưa đủ tiêu chuẩn - SL": 32, "Cây chưa đủ tiêu chuẩn - %": 0.32, "Cây không hiệu quả - SL": 29, "Cây bệnh không cạo - SL": 1, "Cây khô miệng cạo - SL": 1987, "Hố trống": 524, "Mật độ cây cạo/ha": 419, "Xếp hạng vườn cây": "C" }]);
    expect(row).toMatchObject({ code: "LO-DOI-1-2011-1", name: "1", unit: "Đội 1", areaHa: 18.9, plantedYear: 2011, cultivar: "LH90/952", gardenType: null, inventoryPits: 524, inventoryTrees: 9963, tappingTrees: 7914, immatureTrees: 32, nonproductiveTrees: 29, diseasedTrees: 1, dryTappingTrees: 1987, emptyPits: 524, tappingDensity: 419, plotRank: "C" });
    expect(row.error).toBeUndefined();
  });

  it("flags a percentage that does not match its SL and total", () => {
    const [row] = parsePlotImportRows([{ "Đơn vị": "Đội 1", "Tên lô": 1, "Năm trồng": 2011, "Diện tích (ha)": 1, "Tổng số cây kiểm kê": 1000, "Cây cạo - SL": 800, "Cây cạo - %": 50 }]);
    expect(row.error).toContain("Tỷ lệ Cây cạo không khớp");
  });

  it("still accepts an explicit Mã lô when supplied", () => {
    const [row] = parsePlotImportRows([{ "Mã lô": "LO-001", "Tên lô": "Lô 1", "Đơn vị": "Đội 1", "Diện tích (ha)": 12.345, "Năm trồng": 2011 }]);
    expect(row.code).toBe("LO-001");
    expect(row.error).toBeUndefined();
  });

  it("reports duplicate codes, missing fields and invalid row ranges", () => {
    const rows = parsePlotImportRows([
      { "Mã lô": "LO-001", "Tên lô": "Lô 1", "Đội": "Đội 1", "Diện tích (ha)": 1, "Từ hàng": 20, "Đến hàng": 10 },
      { "Mã lô": "lo-001", "Tên lô": "Lô 2", "Đội": "Đội 1", "Diện tích (ha)": 1 },
      { "Mã lô": "", "Tên lô": "", "Đội": "Đội 1", "Diện tích (ha)": 0 },
    ]);
    expect(rows[0]?.error).toContain("Từ hàng");
    expect(rows[1]?.error).toContain("Trùng Mã lô");
    expect(rows[2]?.error).toContain("Thiếu Tên lô");
  });
});
