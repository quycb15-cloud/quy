import { describe, expect, it } from "vitest";
import { parsePlotImportRows } from "../components/PlotImportDialog";

describe("parsePlotImportRows", () => {
  it("parses required plot fields without garden classification", () => {
    const [row] = parsePlotImportRows([{ "Mã lô": "LO-001", "Tên lô": "Lô 1", "Đội": "Đội 1", "Diện tích (ha)": 12.345, "Năm trồng": 2011 }]);
    expect(row).toMatchObject({ code: "LO-001", name: "Lô 1", unit: "Đội 1", areaHa: 12.345, plantedYear: 2011, gardenType: null });
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
    expect(rows[2]?.error).toContain("Thiếu Mã lô");
  });
});
