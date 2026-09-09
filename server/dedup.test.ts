import { describe, expect, it } from "vitest";
import { assertNoDuplicateRows, dedupDate, normalizeDedupText } from "./dedup";

describe("dedup helpers", () => {
  it("chấp nhận các khóa khác nhau", () => {
    expect(() => assertNoDuplicateRows([{ code: "A" }, { code: "B" }], row => row.code, "Mã lô")).not.toThrow();
  });

  it("báo rõ hai dòng trùng trong cùng file", () => {
    expect(() => assertNoDuplicateRows([{ code: " Lô 7 " }, { code: "lô 7" }], row => normalizeDedupText(row.code), "Mã lô"))
      .toThrow(/Mã lô lô 7.*dòng 1 và 2/);
  });

  it("chuẩn hóa ngày về cùng khóa theo ngày lịch", () => {
    expect(dedupDate(new Date("2026-08-08T03:00:00.000Z"))).toBe("2026-08-08");
    expect(normalizeDedupText(" Đội 1 ")).toBe("đội 1");
  });
});
