import { describe, expect, it } from "vitest";
import { buildMonthlyProductionSeries } from "./productionChartMath";

describe("buildMonthlyProductionSeries", () => {
  it("keeps import, export and warehouse loss as separate monthly series", () => {
    const series = buildMonthlyProductionSeries([
      { recordDate: new Date("2026-01-10T00:00:00.000Z"), totalImport: 100 },
      { recordDate: new Date("2026-01-20T00:00:00.000Z"), totalExport: 70 },
      { recordDate: new Date("2026-02-10T00:00:00.000Z"), totalExport: 40 },
    ]);

    expect(series).toEqual([
      { label: "2026-01", totalImport: 100, totalExport: 70, warehouseLoss: 30, value: 100 },
      { label: "2026-02", totalImport: 0, totalExport: 40, warehouseLoss: -40, value: 0 },
    ]);
  });
});
