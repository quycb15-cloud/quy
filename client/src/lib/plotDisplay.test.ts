import { describe, expect, it } from "vitest";
import { formatPlotDisplayName, normalizePlotLookup, parsePlotDisplayName } from "@shared/plotDisplay";

describe("plot display labels", () => {
  it("định dạng tên Lô theo mẫu hiển thị kèm năm trồng", () => {
    expect(formatPlotDisplayName({ name: "1", plantedYear: 2011 })).toBe("1 (2011)");
    expect(formatPlotDisplayName({ name: "1 (2011)", plantedYear: 2011 })).toBe("1 (2011)");
  });

  it("tách tên và năm từ nhãn hiển thị, chấp nhận tiền tố Lô", () => {
    expect(parsePlotDisplayName("Lô 1 (2011)")).toEqual({ raw: "Lô 1 (2011)", name: "1", plantedYear: 2011 });
    expect(normalizePlotLookup("Lô 1")).toBe("1");
  });
});
