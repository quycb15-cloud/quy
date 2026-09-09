import { describe, expect, it } from "vitest";
import { relativeChangePercent } from "@shared/technicalSkillMath";

describe("relativeChangePercent", () => {
  it("tính đúng tỷ lệ tăng theo công thức hiện tại/chốt trước x 100 - 100", () => {
    expect(relativeChangePercent(34, 27)).toBeCloseTo(25.9259259, 6);
  });

  it("cho kết quả âm khi số thợ hiện tại giảm", () => {
    expect(relativeChangePercent(8, 10)).toBe(-20);
  });

  it("không tính phần trăm khi tháng trước bằng 0 hoặc chưa có dữ liệu", () => {
    expect(relativeChangePercent(5, 0)).toBeNull();
    expect(relativeChangePercent(5, null)).toBeNull();
  });
});
