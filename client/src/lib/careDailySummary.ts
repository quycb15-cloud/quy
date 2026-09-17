export type CareDailySummaryInput = {
  planQuantity: number;
  actualQuantity: number;
  cumulativeQuantity: number;
  pendingGardens: number | null;
  partialGardens: number | null;
  nextGardenPlanQuantity: number | null;
  nextGardenActualQuantity: number | null;
};

export type CareDailySummary = {
  plan: number;
  actual: number;
  cumulative: number;
  pending: number;
  partial: number;
  nextPlan: number;
  nextActual: number;
};

export function summarizeCareDaily(records: CareDailySummaryInput[]): CareDailySummary {
  return records.reduce<CareDailySummary>((summary, record) => {
    summary.plan += record.planQuantity || 0;
    summary.actual += record.actualQuantity || 0;
    summary.cumulative += record.cumulativeQuantity || 0;
    summary.pending += record.pendingGardens || 0;
    summary.partial += record.partialGardens || 0;
    summary.nextPlan += record.nextGardenPlanQuantity || 0;
    summary.nextActual += record.nextGardenActualQuantity || 0;
    return summary;
  }, { plan: 0, actual: 0, cumulative: 0, pending: 0, partial: 0, nextPlan: 0, nextActual: 0 });
}

export function dailyCompletionPercent(summary: Pick<CareDailySummary, "plan" | "actual">): number {
  return summary.plan > 0 ? (summary.actual / summary.plan) * 100 : 0;
}
