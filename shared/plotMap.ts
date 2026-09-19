export const PLOT_MAP_STATUSES = [
  "tapping",
  "immature",
  "suspended",
] as const;

export type PlotMapStatus = (typeof PLOT_MAP_STATUSES)[number];
export type Position = [longitude: number, latitude: number];
export type PlotBoundaryGeometry =
  | { type: "Polygon"; coordinates: Position[][] }
  | { type: "MultiPolygon"; coordinates: Position[][][] };

export type PlotMapStatusStyle = {
  label: string;
  description: string;
  color: string;
  fillColor: string;
  fillOpacity: number;
};

export const PLOT_MAP_STATUS_STYLES: Record<PlotMapStatus, PlotMapStatusStyle> = {
  tapping: {
    label: "Đang cạo mủ",
    description: "Lô đang khai thác mủ",
    color: "#047857",
    fillColor: "#22c55e",
    fillOpacity: 0.48,
  },
  immature: {
    label: "Kiến thiết cơ bản / cây non",
    description: "Lô đang trong giai đoạn kiến thiết cơ bản hoặc cây non",
    color: "#b45309",
    fillColor: "#facc15",
    fillOpacity: 0.52,
  },
  suspended: {
    label: "Dừng đầu tư",
    description: "Lô đang dừng đầu tư hoặc cần theo dõi riêng",
    color: "#b91c1c",
    fillColor: "#ef4444",
    fillOpacity: 0.48,
  },
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

function isPosition(value: unknown): value is Position {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    isFiniteNumber(value[0]) &&
    isFiniteNumber(value[1]) &&
    value[0] >= -180 &&
    value[0] <= 180 &&
    value[1] >= -90 &&
    value[1] <= 90
  );
}

function isLinearRing(value: unknown): value is Position[] {
  if (!Array.isArray(value) || value.length < 4 || !value.every(isPosition))
    return false;
  const first = value[0];
  const last = value.at(-1);
  return Boolean(last && first[0] === last[0] && first[1] === last[1]);
}

function isPolygonCoordinates(value: unknown): value is Position[][] {
  return Array.isArray(value) && value.length >= 1 && value.every(isLinearRing);
}

function isMultiPolygonCoordinates(value: unknown): value is Position[][][] {
  return (
    Array.isArray(value) &&
    value.length >= 1 &&
    value.every(isPolygonCoordinates)
  );
}

/**
 * Parses a GeoJSON geometry used to draw a rubber plot.
 * Only Polygon and MultiPolygon are accepted because a plot must have an area.
 */
export function parsePlotBoundaryGeoJson(
  value: string | PlotBoundaryGeometry | null | undefined,
): PlotBoundaryGeometry | null {
  if (value == null || value === "") return null;

  let candidate: unknown = value;
  if (typeof value === "string") {
    try {
      candidate = JSON.parse(value);
    } catch {
      return null;
    }
  }

  if (!candidate || typeof candidate !== "object") return null;
  const geometry = candidate as { type?: unknown; coordinates?: unknown };
  if (
    geometry.type === "Polygon" &&
    isPolygonCoordinates(geometry.coordinates)
  ) {
    return { type: "Polygon", coordinates: geometry.coordinates };
  }
  if (
    geometry.type === "MultiPolygon" &&
    isMultiPolygonCoordinates(geometry.coordinates)
  ) {
    return { type: "MultiPolygon", coordinates: geometry.coordinates };
  }
  return null;
}

export function isPlotMapStatus(value: unknown): value is PlotMapStatus {
  return (
    typeof value === "string" &&
    (PLOT_MAP_STATUSES as readonly string[]).includes(value)
  );
}

export function getPlotMapStatusStyle(status: unknown): PlotMapStatusStyle {
  return PLOT_MAP_STATUS_STYLES[
    isPlotMapStatus(status) ? status : "tapping"
  ];
}

export function normalizePlotMapStatus(value: unknown): PlotMapStatus {
  return isPlotMapStatus(value) ? value : "tapping";
}

export function serializePlotBoundary(
  value: string | PlotBoundaryGeometry | null | undefined,
): string | null {
  const boundary = parsePlotBoundaryGeoJson(value);
  return boundary ? JSON.stringify(boundary) : null;
}
