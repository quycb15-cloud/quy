import { compareTeamName } from "@shared/teamOrder";

export type SortablePlot = { plantedYear: number | null; name: string; code: string };
export type TeamSortablePlot = SortablePlot & { unit: string };

function plotNameOrder(name: string) {
  const visibleName = name.replace(/\s*\(\d{4}\)\s*$/, "").trim();
  // Imported files may use either `Lô 3`, `3`, or `3-2012`.
  const match = visibleName.match(/^(?:lô\s*)?(\d+)(.*)$/i);
  if (!match) return { kind: 2, number: Number.MAX_SAFE_INTEGER, suffix: visibleName };
  const suffix = match[2].trim();
  // Letter suffixes stay next to their numeric lot (14, 14A, 14B);
  // hyphen-year names such as 3-2012 are a separate trailing group.
  const kind = suffix.includes("-") ? 1 : 0;
  return { kind, number: Number(match[1]), suffix };
}

function yearFromName(name: string) {
  return Number(name.match(/(?:\(|-|\s)(20\d{2})\)?$/)?.[1] ?? Number.MAX_SAFE_INTEGER);
}

export function comparePlotsByYearAndName(left: SortablePlot, right: SortablePlot) {
  const leftYear = left.plantedYear ?? yearFromName(left.name);
  const rightYear = right.plantedYear ?? yearFromName(right.name);
  const leftName = plotNameOrder(left.name);
  const rightName = plotNameOrder(right.name);
  return leftYear - rightYear || leftName.kind - rightName.kind || leftName.number - rightName.number || leftName.suffix.localeCompare(rightName.suffix, "vi", { numeric: true }) || left.name.localeCompare(right.name, "vi", { numeric: true }) || left.code.localeCompare(right.code, "vi", { numeric: true });
}

export function comparePlotsByTeamYearAndName(left: TeamSortablePlot, right: TeamSortablePlot) {
  return compareTeamName(left.unit, right.unit) || comparePlotsByYearAndName(left, right);
}
