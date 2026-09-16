import { describe, expect, it } from "vitest";
import { compareEmployeeCode, compareWorkersByCode, workerDisplayName } from "@shared/workerDisplay";

describe("worker display", () => {
  it("prefers phonetic name and falls back when missing", () => {
    expect(workerDisplayName({ phoneticName: "SAN DUK", name: "Tên gốc" })).toBe("SAN DUK");
    expect(workerDisplayName({ phoneticName: "", name: "Tên gốc" })).toBe("Tên gốc");
    expect(workerDisplayName({ phoneticName: null, name: null })).toBe("Chưa có tên phiên âm");
  });

  it("sorts employee codes naturally while keeping hyphens", () => {
    expect(["D1-10", "D1-02", "D1-01", "D2-01", "D1-2"].sort(compareEmployeeCode)).toEqual(["D1-01", "D1-02", "D1-2", "D1-10", "D2-01"]);
  });

  it("sorts workers by code before phonetic name", () => {
    const rows = [
      { employeeCode: "D1-10", phoneticName: "B" },
      { employeeCode: "D1-01", phoneticName: "Z" },
      { employeeCode: "D1-01", phoneticName: "A" },
    ];
    expect(rows.sort(compareWorkersByCode).map(row => row.phoneticName)).toEqual(["A", "Z", "B"]);
  });
});
