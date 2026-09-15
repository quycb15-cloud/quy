import { describe, expect, it } from "vitest";
import { parseWorkerImportRows } from "../components/WorkerImportDialog";

describe("parseWorkerImportRows", () => {
  it("parses Vietnamese headers and normalizes optional fields", () => {
    const [row] = parseWorkerImportRows([{ "Đội": "Đội 1", "Họ tên": "Nguyễn Văn A", "Mã số": "CN001", "Giới tính": "Nữ", "Số điện thoại": "0901234567", "Trạng thái làm việc": "Đang làm việc" }]);
    expect(row).toMatchObject({ unit: "Đội 1", name: "Nguyễn Văn A", employeeCode: "CN001", gender: "female", phone: "0901234567", status: "active", roleTitle: "Công nhân khai thác" });
    expect(row.error).toBeUndefined();
  });

  it("reports missing required fields and duplicate employee codes", () => {
    const rows = parseWorkerImportRows([{ "Đội": "", "Tên": "Người A", "Mã số": "CN001" }, { "Đội": "Đội 1", "Tên": "Người B", "Mã số": "CN001" }]);
    expect(rows[0]?.error).toContain("Thiếu Đội");
    expect(rows[1]?.error).toContain("Trùng Mã số");
  });
});
