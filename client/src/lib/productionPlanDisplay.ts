export type ProductionPlanCardMode = "month" | "throughput" | "year";

export type ProductionPlanTotals = {
  planMonthFrozenLatex: number;
  planMonthThreadLatex: number;
  planYearFrozenLatex: number;
  planYearThreadLatex: number;
};

export function getProductionPlanCardModes(month: number): ProductionPlanCardMode[] {
  return month === 0 ? ["throughput", "year"] : ["month", "year"];
}

export function getCombinedProductionPlan(totals: ProductionPlanTotals) {
  return {
    month: totals.planMonthFrozenLatex + totals.planMonthThreadLatex,
    year: totals.planYearFrozenLatex + totals.planYearThreadLatex,
  };
}
