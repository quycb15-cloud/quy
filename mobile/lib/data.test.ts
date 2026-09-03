import { describe, expect, it } from "vitest";
import { averageOverallScore, scoreLabel, sumDryRubber } from "./data";

describe("mobile data helpers", () => {
  it("sums finite dry rubber values and ignores missing values", () => {
    expect(sumDryRubber([{ dryRubber: 12.5 }, { dryRubber: "7.5" }, { dryRubber: null }, { dryRubber: "not-a-number" }])).toBe(20);
  });

  it("averages only evaluated overall scores", () => {
    expect(averageOverallScore([{ overallScore: 80 }, { overallScore: "90" }, { overallScore: null }])).toBe(85);
    expect(averageOverallScore([{ overallScore: null }])).toBeNull();
  });

  it("formats an empty score without fabricating a value", () => {
    expect(scoreLabel(null)).toBe("—");
    expect(scoreLabel(86.55)).toBe("86,6/100");
  });
});
