import { describe, expect, it } from "vitest";
import { featureAreaHa, RUBBER_FARM_SURVEY_GEOJSON, surveyFeatureToPlot } from "./plotGeoJson";

describe("rubber farm survey GeoJSON", () => {
  it("calculates a positive hectare area from the supplied polygon", () => {
    const area = featureAreaHa(RUBBER_FARM_SURVEY_GEOJSON.features[0]);
    expect(area).toBeGreaterThan(1);
    expect(area).toBe(surveyFeatureToPlot(RUBBER_FARM_SURVEY_GEOJSON.features[0]).areaHa);
  });

  it("maps the supplied Vietnamese properties to the plot model", () => {
    const plot = surveyFeatureToPlot(RUBBER_FARM_SURVEY_GEOJSON.features[0]);
    expect(plot.code).toBe("LÔ-NÔNG-TRƯỜNG-01");
    expect(plot.unit).toBe("Đội sản xuất số 1");
    expect(plot.mapStatus).toBe("tapping");
    expect(plot.boundaryGeoJson).toContain('"type":"Polygon"');
  });
});
