import { describe, expect, it } from "vitest";
import { calculateCareCompletionPercent } from "./careProgress";

describe("calculateCareCompletionPercent", () => {
  it("uses cumulative quantity divided by plan", () => {
    expect(calculateCareCompletionPercent("332", "174")).toBe(52.41);
  });

  it("keeps precise decimal input before display rounding", () => {
    expect(calculateCareCompletionPercent(7.5, 2.25)).toBe(30);
  });

  it("returns zero when no plan exists", () => {
    expect(calculateCareCompletionPercent(0, 10)).toBe(0);
  });
});
