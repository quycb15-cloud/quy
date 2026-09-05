import { comparePlotsByTeamYearAndName, type TeamSortablePlot } from "./plotOrder";

export type PlotWithArea = TeamSortablePlot & { areaHa: number | string | null };
export type PlotGardenAllocationLike = { gardenType: "A" | "B" | "C"; areaHa: number | string | null; tappingTrees?: number | null };
export type PlotWithGarden = PlotWithArea & { gardenType: "A" | "B" | "C" | null; gardenAllocations?: PlotGardenAllocationLike[] };
export type GardenGroupKey = "A" | "B" | "C" | "unclassified";
export type PlotTeamGroup<T extends PlotWithGarden> = { unit: string; plots: T[]; plotCount: number; areaHa: number; gardenCounts: Record<"A" | "B" | "C", number>; gardenAreas: Record<"A" | "B" | "C", number> };
export type PlotGardenGroup<T extends PlotWithGarden> = { gardenType: GardenGroupKey; plots: T[]; plotCount: number; areaHa: number };

export function groupPlotsByTeam<T extends PlotWithGarden>(plots: T[]): PlotTeamGroup<T>[] {
  const groups = new Map<string, PlotTeamGroup<T>>();
  [...plots].sort(comparePlotsByTeamYearAndName).forEach(plot => {
    const group = groups.get(plot.unit) ?? { unit: plot.unit, plots: [], plotCount: 0, areaHa: 0, gardenCounts: { A: 0, B: 0, C: 0 }, gardenAreas: { A: 0, B: 0, C: 0 } };
    group.plots.push(plot);
    group.plotCount += 1;
    group.areaHa += Number(plot.areaHa ?? 0);
    if (plot.gardenType) { group.gardenCounts[plot.gardenType] += 1; group.gardenAreas[plot.gardenType] += Number(plot.areaHa ?? 0); }
    groups.set(plot.unit, group);
  });
  return Array.from(groups.values());
}

export function groupPlotsByGarden<T extends PlotWithGarden>(plots: T[]): PlotGardenGroup<T>[] {
  const groups = new Map<GardenGroupKey, PlotGardenGroup<T>>();
  const add = (gardenType: GardenGroupKey, plot: T, areaHa: number) => {
    const group = groups.get(gardenType) ?? { gardenType, plots: [], plotCount: 0, areaHa: 0 };
    group.plots.push(plot);
    group.plotCount += 1;
    group.areaHa += areaHa;
    groups.set(gardenType, group);
  };

  [...plots].sort(comparePlotsByTeamYearAndName).forEach(plot => {
    const allocations = plot.gardenAllocations?.filter(item => Number(item.areaHa ?? 0) > 0) ?? [];
    if (!allocations.length) {
      add(plot.gardenType ?? "unclassified", plot, Number(plot.areaHa ?? 0));
      return;
    }

    const allocatedArea = allocations.reduce((sum, item) => sum + Number(item.areaHa ?? 0), 0);
    allocations.forEach(item => add(item.gardenType, plot, Number(item.areaHa ?? 0)));
    const remainingArea = Math.max(0, Math.round((Number(plot.areaHa ?? 0) - allocatedArea) * 100) / 100);
    if (remainingArea > 0) add("unclassified", plot, remainingArea);
  });

  const order: GardenGroupKey[] = ["A", "B", "C", "unclassified"];
  return order.flatMap(gardenType => groups.has(gardenType) ? [groups.get(gardenType)!] : []);
}
