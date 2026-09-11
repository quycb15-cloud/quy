export type PlotForProductionFilter = { id: number; unit: string; name: string; code: string; plantedYear?: number | null };

export function filterProductionPlots<T extends PlotForProductionFilter>(plots: readonly T[], unit: string) {
  return plots.filter(plot => unit === "" || plot.unit === unit);
}

export function changeProductionUnit<T extends { unit: string; plotId: string }>(form: T, unit: string): T {
  return { ...form, unit, plotId: "" };
}
