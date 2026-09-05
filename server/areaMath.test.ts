import { describe, expect, it } from "vitest";
import { sumAreaHa, truncateAreaHa } from "./areaMath";

describe("areaMath", () => {
  it("cắt tổng diện tích xuống 2 chữ số theo quy tắc nghiệp vụ", () => {
    expect(sumAreaHa([1582.715])).toBe(1582.71);
    expect(sumAreaHa([1000.125, 582.59])).toBe(1582.71);
  });

  it("không bị sai bởi floating point và bỏ qua giá trị không hợp lệ", () => {
    expect(sumAreaHa([0.1, 0.2, null, undefined, "0.415"])).toBe(0.71);
    expect(truncateAreaHa(Number.NaN)).toBe(0);
  });
});
