import { describe, expect, it } from "vitest";
import { validateExcelPlotRows, type ExcelPlotPayload } from "./db";

const row = (overrides: Partial<ExcelPlotPayload> = {}): ExcelPlotPayload => ({
  code: "LO-001",
  name: "Lô 1",
  unit: "Đội 1",
  areaHa: 1.25,
  gardenType: null,
  ...overrides,
});

describe("validateExcelPlotRows", () => {
  it("accepts distinct plots without garden classification", () => {
    expect(() => validateExcelPlotRows([row(), row({ code: "LO-002", name: "Lô 2" })])).not.toThrow();
  });

  it("rejects duplicate codes and invalid row ranges", () => {
    expect(() => validateExcelPlotRows([row(), row({ code: " lo-001 " })])).toThrow("Mã lô lo-001 bị trùng");
    expect(() => validateExcelPlotRows([row({ rowStart: 20, rowEnd: 10 })])).toThrow("Từ hàng phải nhỏ hơn hoặc bằng Đến hàng");
  });
});
