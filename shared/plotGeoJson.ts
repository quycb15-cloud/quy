import { parsePlotBoundaryGeoJson, type PlotBoundaryGeometry, type Position } from "./plotMap";

export type PlotGeoJsonProperties = {
  ma_lo: string;
  ten_doi: string;
  dien_tich_uoc_tinh: string;
  trang_thai: string;
};

export type PlotGeoJsonFeature = {
  type: "Feature";
  properties: PlotGeoJsonProperties;
  geometry: { type: "Polygon"; coordinates: Position[][] };
};

export type PlotGeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: PlotGeoJsonFeature[];
};

/** Dữ liệu khảo sát thực tế được cung cấp cho cụm lô nông trường. */
export const RUBBER_FARM_SURVEY_GEOJSON: PlotGeoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        ma_lo: "LÔ-NÔNG-TRƯỜNG-01",
        ten_doi: "Đội sản xuất số 1",
        dien_tich_uoc_tinh: "Tính toán tự động từ Polygon",
        trang_thai: "Đang cạo mủ",
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [107.194512, 13.784531], [107.195034, 13.867622], [107.196884, 13.853311],
          [107.229045, 13.853512], [107.228994, 13.847953], [107.250012, 13.848143],
          [107.250031, 13.866155], [107.241832, 13.865991], [107.242215, 13.905904],
          [107.233145, 13.905612], [107.195152, 13.884351], [107.195415, 13.918512],
          [107.237424, 13.918911], [107.243045, 13.933215], [107.283512, 13.911512],
          [107.283311, 13.815915], [107.240125, 13.797114], [107.240014, 13.784612],
          [107.194512, 13.784531],
        ]],
      },
    },
  ],
};

export const RUBBER_FARM_CENTER: [number, number] = [13.858, 107.239];

const EARTH_RADIUS_METERS = 6_378_137;

/**
 * Calculates geodesic area on a spherical Earth. GeoJSON positions are [lon, lat].
 * Holes are subtracted automatically; result is hectares.
 */
export function polygonAreaHa(geometry: PlotBoundaryGeometry): number {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const area = polygons.reduce((polygonTotal, rings) => {
    const outer = Math.abs(ringAreaM2(rings[0] ?? []));
    const holes = rings.slice(1).reduce((sum, ring) => sum + Math.abs(ringAreaM2(ring)), 0);
    return polygonTotal + Math.max(0, outer - holes);
  }, 0);
  return Math.round((area / 10_000 + Number.EPSILON) * 1000) / 1000;
}

export function featureAreaHa(feature: Pick<PlotGeoJsonFeature, "geometry">): number {
  return polygonAreaHa(feature.geometry);
}

export function areaHaFromGeoJson(value: string | PlotBoundaryGeometry | null | undefined): number | null {
  const geometry = parsePlotBoundaryGeoJson(value);
  return geometry ? polygonAreaHa(geometry) : null;
}

export function surveyFeatureToPlot(feature: PlotGeoJsonFeature, id = -1) {
  const { properties, geometry } = feature;
  const status = properties.trang_thai === "Đang cạo mủ" ? "tapping" : properties.trang_thai.includes("cây non") || properties.trang_thai.includes("kiến thiết") ? "immature" : "suspended";
  return {
    id,
    code: properties.ma_lo,
    name: properties.ma_lo,
    unit: properties.ten_doi,
    areaHa: featureAreaHa(feature),
    mapStatus: status as "tapping" | "immature" | "suspended",
    boundaryGeoJson: JSON.stringify(geometry),
    plantedYear: null,
    cultivar: null,
    gardenType: null,
    tappingDay: null,
    rowStart: null,
    rowEnd: null,
    tappingTrees: null,
    note: "Nguồn GeoJSON khảo sát thực tế; hãy bổ sung giống cây và năm trồng.",
    mapUrl: null,
    mapUpdatedAt: null,
    gardenAllocations: [],
    allocatedAreaHa: 0,
    allocatedTappingTrees: 0,
    remainingAreaHa: featureAreaHa(feature),
    remainingTappingTrees: null,
  };
}

function ringAreaM2(ring: Position[]): number {
  if (ring.length < 3) return 0;
  let sum = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [lon1, lat1] = ring[index];
    const [lon2, lat2] = ring[index + 1];
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const lambda1 = (lon1 * Math.PI) / 180;
    const lambda2 = (lon2 * Math.PI) / 180;
    sum += (lambda2 - lambda1) * (2 + Math.sin(phi1) + Math.sin(phi2));
  }
  return Math.abs((sum * EARTH_RADIUS_METERS ** 2) / 2);
}
