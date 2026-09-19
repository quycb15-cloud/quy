import {
  getPlotMapStatusStyle,
  normalizePlotMapStatus,
  parsePlotBoundaryGeoJson,
  type PlotBoundaryGeometry,
  type PlotMapStatus,
} from "@shared/plotMap";
import { polygonAreaHa } from "@shared/plotGeoJson";

export type PlotMapRecord = {
  id: number;
  code: string;
  name: string;
  unit: string;
  areaHa: number;
  plantedYear?: number | null;
  cultivar?: string | null;
  mapStatus?: PlotMapStatus | null;
  boundaryGeoJson?: string | null;
};

export type PlotProductionRecord = {
  plotId: number;
  recordDate: Date | string;
  frozenContaminatedLatex: number;
  dryRubber: number;
};

export type PlotMonthlyProduction = {
  key: string;
  label: string;
  year: number;
  month: number;
  frozenContaminatedLatex: number;
  dryRubber: number;
  totalKg: number;
};

export type PlotAnnualProduction = {
  year: number;
  frozenContaminatedLatex: number;
  dryRubber: number;
  totalKg: number;
  months: PlotMonthlyProduction[];
};

export type LatLngBounds = [[number, number], [number, number]];

const cleanText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi-VN")
    .trim();

const roundKg = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function findPlotByCode<T extends Pick<PlotMapRecord, "code" | "name">>(
  plots: T[],
  query: string,
): T | undefined {
  const normalizedQuery = cleanText(query);
  if (!normalizedQuery) return undefined;
  return plots.find(plot => cleanText(plot.code) === normalizedQuery) ??
    plots.find(plot => cleanText(plot.code).includes(normalizedQuery)) ??
    plots.find(plot => cleanText(plot.name).includes(normalizedQuery));
}

export function plotBoundaryFromRecord(plot: Pick<PlotMapRecord, "boundaryGeoJson">): PlotBoundaryGeometry | null {
  return parsePlotBoundaryGeoJson(plot.boundaryGeoJson);
}

export function calculatedPlotAreaHa(plot: Pick<PlotMapRecord, "boundaryGeoJson" | "areaHa">): number {
  const boundary = plotBoundaryFromRecord(plot);
  return boundary ? polygonAreaHa(boundary) : Number(plot.areaHa ?? 0);
}

export function getBoundaryBounds(
  boundary: PlotBoundaryGeometry | null | undefined,
): LatLngBounds | null {
  if (!boundary) return null;
  const positions = boundary.type === "Polygon"
    ? boundary.coordinates.flat()
    : boundary.coordinates.flat(2);
  if (!positions.length) return null;

  const latitudes = positions.map(([, latitude]) => latitude);
  const longitudes = positions.map(([longitude]) => longitude);
  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)],
  ];
}

export function getAvailableFarmBounds(plots: PlotMapRecord[]): LatLngBounds | null {
  const bounds = plots
    .map(plot => getBoundaryBounds(plotBoundaryFromRecord(plot)))
    .filter((value): value is LatLngBounds => value !== null);
  if (!bounds.length) return null;
  return [
    [Math.min(...bounds.map(([[south]]) => south)), Math.min(...bounds.map(([[, west]]) => west))],
    [Math.max(...bounds.map(([[,], [north]]) => north)), Math.max(...bounds.map(([[,], [, east]]) => east))],
  ];
}

export function aggregatePlotProductionHistory(
  entries: PlotProductionRecord[],
  plotId: number,
): PlotAnnualProduction[] {
  const grouped = new Map<string, PlotMonthlyProduction>();
  entries
    .filter(entry => entry.plotId === plotId)
    .forEach(entry => {
      const date = new Date(entry.recordDate);
      if (Number.isNaN(date.getTime())) return;
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;
      const key = `${year}-${String(month).padStart(2, "0")}`;
      const current = grouped.get(key) ?? {
        key,
        label: `Tháng ${month}/${year}`,
        year,
        month,
        frozenContaminatedLatex: 0,
        dryRubber: 0,
        totalKg: 0,
      };
      current.frozenContaminatedLatex += Number(entry.frozenContaminatedLatex ?? 0);
      current.dryRubber += Number(entry.dryRubber ?? 0);
      current.totalKg = current.frozenContaminatedLatex + current.dryRubber;
      grouped.set(key, current);
    });

  const annual = new Map<number, PlotAnnualProduction>();
  Array.from(grouped.values())
    .sort((left, right) => right.year - left.year || right.month - left.month)
    .forEach(month => {
      const current = annual.get(month.year) ?? {
        year: month.year,
        frozenContaminatedLatex: 0,
        dryRubber: 0,
        totalKg: 0,
        months: [],
      };
      current.months.push({
        ...month,
        frozenContaminatedLatex: roundKg(month.frozenContaminatedLatex),
        dryRubber: roundKg(month.dryRubber),
        totalKg: roundKg(month.totalKg),
      });
      current.frozenContaminatedLatex += month.frozenContaminatedLatex;
      current.dryRubber += month.dryRubber;
      current.totalKg += month.totalKg;
      annual.set(month.year, current);
    });

  return Array.from(annual.values())
    .map(item => ({
      ...item,
      frozenContaminatedLatex: roundKg(item.frozenContaminatedLatex),
      dryRubber: roundKg(item.dryRubber),
      totalKg: roundKg(item.totalKg),
    }))
    .sort((left, right) => right.year - left.year);
}

export { getPlotMapStatusStyle, normalizePlotMapStatus };
