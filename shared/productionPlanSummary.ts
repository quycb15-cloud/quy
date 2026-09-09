export type ProductionPlanSummarySource = {
  unit: string;
  year: number;
  month: number;
  areaHa: number;
  planFrozenLatex: number;
  planThreadLatex: number;
  planDryRubber: number;
  planDryFromFrozen: number;
  planDryFromThread: number;
  note?: string | null;
};

export type ProductionPlanSummaryRow = ProductionPlanSummarySource & {
  planMonthFrozenLatex: number;
  planMonthThreadLatex: number;
  planMonthDryRubber: number;
  planMonthDryFromFrozen: number;
  planMonthDryFromThread: number;
  planYearFrozenLatex: number;
  planYearThreadLatex: number;
  planYearDryRubber: number;
  planYearDryFromFrozen: number;
  planYearDryFromThread: number;
};

export function mergeProductionPlanRows(
  plans: ProductionPlanSummarySource[],
  year: number,
  month: number,
  scopeUnits?: string[]
): ProductionPlanSummaryRow[] {
  const inScope = (unit: string) => !scopeUnits?.length || scopeUnits.includes(unit);
  const selected = plans.filter(
    row =>
      inScope(row.unit) &&
      row.year === year &&
      (month === 0 ? row.month === 0 : row.month === month || row.month === 0)
  );
  const byUnit = new Map<string, { annual?: ProductionPlanSummarySource; monthly?: ProductionPlanSummarySource }>();
  selected.forEach(row => {
    const current = byUnit.get(row.unit) ?? {};
    if (row.month === 0) current.annual = row;
    if (row.month === month && month !== 0) current.monthly = row;
    byUnit.set(row.unit, current);
  });
  return Array.from(byUnit.entries()).map(([unit, sources]) => {
    const row = sources.monthly ?? sources.annual!;
    const annual = sources.annual;
    const monthly = sources.monthly;
    return {
      ...row,
      unit,
      planMonthFrozenLatex: monthly?.planFrozenLatex ?? 0,
      planMonthThreadLatex: monthly?.planThreadLatex ?? 0,
      planMonthDryRubber: monthly?.planDryRubber ?? 0,
      planMonthDryFromFrozen: monthly?.planDryFromFrozen ?? 0,
      planMonthDryFromThread: monthly?.planDryFromThread ?? 0,
      planYearFrozenLatex: annual?.planFrozenLatex ?? 0,
      planYearThreadLatex: annual?.planThreadLatex ?? 0,
      planYearDryRubber: annual?.planDryRubber ?? 0,
      planYearDryFromFrozen: annual?.planDryFromFrozen ?? 0,
      planYearDryFromThread: annual?.planDryFromThread ?? 0,
    };
  });
}
