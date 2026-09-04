import { describe, expect, it } from "vitest";
import { validateExcelWorkerRows, type ExcelWorkerPayload } from "./db";

const row = (overrides: Partial<ExcelWorkerPayload> = {}): ExcelWorkerPayload => ({
  unit: "Đội 1",
  name: "Nguyễn Văn A",
  employeeCode: "CN001",
  phoneticName: "Nguyen Van A",
  gender: "male",
  status: "active",
  roleTitle: "Công nhân khai thác",
  note: null,
  ...overrides,
});

describe("validateExcelWorkerRows", () => {
  it("accepts distinct rows and trims comparison values", () => {
    expect(() => validateExcelWorkerRows([row(), row({ unit: "Đội 2", name: "Nguyễn Văn B", employeeCode: "CN002" })])).not.toThrow();
    expect(() => validateExcelWorkerRows([row(), row({ employeeCode: " CN001 " })])).toThrow("Mã số CN001 bị trùng");
  });

  it("rejects duplicate worker identity within one import", () => {
    expect(() => validateExcelWorkerRows([row({ employeeCode: null }), row({ employeeCode: "CN002" })])).toThrow("Nhân công Nguyễn Văn A thuộc Đội 1 bị trùng");
  });
});
