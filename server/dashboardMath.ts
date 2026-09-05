import { sumAreaHa } from "./areaMath";

export type DashboardPlotArea = { areaHa: number | string | null | undefined };

export function getDashboardTotalArea(plots: ReadonlyArray<DashboardPlotArea>): number {
  return sumAreaHa(plots.map(plot => plot.areaHa));
}
