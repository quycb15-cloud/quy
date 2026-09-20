import { describe, expect, it } from "vitest";
import {
  aggregatePlotProductionHistory,
  findPlotByCode,
  getAvailableFarmBounds,
  getBoundaryBounds,
} from "./plotMap";
import { parsePlotBoundaryGeoJson } from "@shared/plotMap";

const polygon = JSON.stringify({
  type: "Polygon",
  coordinates: [
    [
      [106.7, 11.2],
      [106.71, 11.2],
      [106.71, 11.21],
      [106.7, 11.2],
    ],
  ],
});

describe("plotMap helpers", () => {
  it("parses only valid Polygon and MultiPolygon boundaries", () => {
    expect(parsePlotBoundaryGeoJson(polygon)).toMatchObject({ type: "Polygon" });
    expect(parsePlotBoundaryGeoJson('{"type":"Point","coordinates":[106.7,11.2]}')).toBeNull();
    expect(parsePlotBoundaryGeoJson('{"type":"Polygon","coordinates":[[[106.7,11.2],[106.71,11.2],[106.71,11.21],[106.7,11.21]]]}')).toBeNull();
    expect(parsePlotBoundaryGeoJson("not-json")).toBeNull();
  });

  it("calculates bounds in Leaflet latitude-longitude order", () => {
    const boundary = parsePlotBoundaryGeoJson(polygon);
    expect(getBoundaryBounds(boundary)).toEqual([[11.2, 106.7], [11.21, 106.71]]);
    expect(getAvailableFarmBounds([
      { id: 1, code: "LO-01", name: "Lô 1", unit: "Đội 1", areaHa: 3, boundaryGeoJson: polygon },
      { id: 2, code: "LO-02", name: "Lô 2", unit: "Đội 1", areaHa: 4, boundaryGeoJson: JSON.stringify({ type: "Polygon", coordinates: [[[106.69, 11.19], [106.70, 11.19], [106.70, 11.20], [106.69, 11.19]]] }) },
    ])).toEqual([[11.19, 106.69], [11.21, 106.71]]);
  });

  it("finds a plot by code without requiring Vietnamese accents", () => {
    const plots = [
      { id: 1, code: "LO-ĐỘI-01", name: "Lô 1", unit: "Đội 1", areaHa: 3 },
    ];
    expect(findPlotByCode(plots, "lo-doi-01")?.id).toBe(1);
  });

  it("groups monthly records into annual production history", () => {
    const history = aggregatePlotProductionHistory([
      { plotId: 1, recordDate: "2026-02-01T00:00:00.000Z", frozenContaminatedLatex: 40, dryRubber: 22 },
      { plotId: 1, recordDate: "2026-02-15T00:00:00.000Z", frozenContaminatedLatex: 5, dryRubber: 3 },
      { plotId: 1, recordDate: "2025-12-01T00:00:00.000Z", frozenContaminatedLatex: 20, dryRubber: 10 },
      { plotId: 2, recordDate: "2026-02-01T00:00:00.000Z", frozenContaminatedLatex: 999, dryRubber: 999 },
    ], 1);

    expect(history).toHaveLength(2);
    expect(history[0]).toMatchObject({ year: 2026, totalKg: 70, months: [{ month: 2, frozenContaminatedLatex: 45, dryRubber: 25, totalKg: 70 }] });
    expect(history[1]).toMatchObject({ year: 2025, totalKg: 30 });
  });
});
