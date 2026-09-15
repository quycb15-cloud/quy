import { compareTeamName } from "@shared/teamOrder";
import { comparePlotsByYearAndName } from "./plotOrder";

export type PlotProductionEntry = {
  id: number;
  plotId: number;
  recordDate: Date | string;
  frozenContaminatedLatex: number;
  dryRubber: number;
  unit: string;
  plotCode: string;
  plotName: string;
  plantedYear: number | null;
  areaHa: number;
};

export type PlotProductionFilters = { year?: number; month?: number; unit?: string };
export type TeamPlotProduction = { unit: string; frozenContaminatedLatex: number; dryRubber: number };
export type PlotProductionTotals = { frozen: number; dry: number; total: number; monthLabel?: string };
export type PlotProductionComparison = { current: PlotProductionTotals; previousMonth: PlotProductionTotals | null; previousYear: PlotProductionTotals | null };
const roundQuantity = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const dateOf = (value: Date | string) => new Date(value);
const monthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, "0")}`;
const monthLabel = (year: number, month: number) => `${String(month).padStart(2, "0")}/${year}`;
const totalsOf = (rows: ReturnType<typeof aggregatePlotProduction>, label?: string): PlotProductionTotals => {
  const frozen = roundQuantity(rows.reduce((sum, row) => sum + row.frozenContaminatedLatex, 0));
  const dry = roundQuantity(rows.reduce((sum, row) => sum + row.dryRubber, 0));
  return { frozen, dry, total: roundQuantity(frozen + dry), ...(label ? { monthLabel: label } : {}) };
};

export function aggregatePlotProduction(entries: PlotProductionEntry[], filters: PlotProductionFilters) {
  const grouped = new Map<number, PlotProductionEntry & { frozenContaminatedLatex: number; dryRubber: number }>();
  entries.forEach(entry => {
    const date = dateOf(entry.recordDate);
    if ((filters.year && date.getUTCFullYear() !== filters.year) || (filters.month && date.getUTCMonth() + 1 !== filters.month) || (filters.unit && entry.unit !== filters.unit)) return;
    const current = grouped.get(entry.plotId);
    if (current) { current.frozenContaminatedLatex += entry.frozenContaminatedLatex; current.dryRubber += entry.dryRubber; }
    else grouped.set(entry.plotId, { ...entry });
  });
  return Array.from(grouped.values()).sort((left, right) => compareTeamName(left.unit, right.unit) || comparePlotsByYearAndName({ plantedYear: left.plantedYear, name: left.plotName, code: left.plotCode }, { plantedYear: right.plantedYear, name: right.plotName, code: right.plotCode }));
}

export function comparePlotProduction(entries: PlotProductionEntry[], filters: PlotProductionFilters): PlotProductionComparison {
  const currentLabel = filters.year && filters.month ? monthLabel(filters.year, filters.month) : undefined;
  const current = totalsOf(aggregatePlotProduction(entries, filters), currentLabel);
  if (!filters.year || !filters.month) return { current, previousMonth: null, previousYear: null };

  const candidateMonths = new Set<string>();
  entries.forEach(entry => {
    if (filters.unit && entry.unit !== filters.unit) return;
    const date = dateOf(entry.recordDate);
    const key = monthKey(date.getUTCFullYear(), date.getUTCMonth() + 1);
    if (key < monthKey(filters.year!, filters.month!)) candidateMonths.add(key);
  });
  const previousMonthKey = Array.from(candidateMonths).sort().at(-1);
  const previousMonth = previousMonthKey
    ? (() => {
        const [year, month] = previousMonthKey.split("-").map(Number);
        return totalsOf(aggregatePlotProduction(entries, { ...filters, year, month }), monthLabel(year, month));
      })()
    : null;

  const previousYearRows = aggregatePlotProduction(entries, { ...filters, year: filters.year - 1, month: filters.month });
  const previousYear = previousYearRows.length ? totalsOf(previousYearRows, monthLabel(filters.year - 1, filters.month)) : null;
  return { current, previousMonth, previousYear };
}

export function aggregatePlotProductionByTeam(rows: ReturnType<typeof aggregatePlotProduction>): TeamPlotProduction[] {
  const grouped = new Map<string, TeamPlotProduction>();
  rows.forEach(row => {
    const current = grouped.get(row.unit) ?? { unit: row.unit, frozenContaminatedLatex: 0, dryRubber: 0 };
    current.frozenContaminatedLatex += row.frozenContaminatedLatex;
    current.dryRubber += row.dryRubber;
    grouped.set(row.unit, current);
  });
  return Array.from(grouped.values()).sort((left, right) => compareTeamName(left.unit, right.unit));
}

export function plotProductionExcelRows(rows: ReturnType<typeof aggregatePlotProduction>) {
  const details = rows.map((row, index) => ({ STT: index + 1, Đội: row.unit, Lô: row.plotName, "Năm trồng": row.plantedYear ?? "", "Diện tích (ha)": row.areaHa, "Mủ đông, tạp (kg)": row.frozenContaminatedLatex, "Quy khô (kg)": row.dryRubber }));
  const totals = rows.reduce((sum, row) => ({ frozen: sum.frozen + row.frozenContaminatedLatex, dry: sum.dry + row.dryRubber }), { frozen: 0, dry: 0 });
  return [...details, { STT: "", Đội: "", Lô: "Tổng khối lượng", "Năm trồng": "", "Diện tích (ha)": "", "Mủ đông, tạp (kg)": totals.frozen, "Quy khô (kg)": totals.dry }];
}
