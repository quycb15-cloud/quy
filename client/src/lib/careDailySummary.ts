import { careDateKey } from "./careDateRange";

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

export type CareContentSummaryInput = CareDailySummaryInput & {
  activityDate: Date | string | number;
  workContent?: string | null;
  unit?: string;
};

export type CareContentSummary = CareDailySummary & {
  dateKey: string;
  workContent: string;
  rowCount: number;
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

export function cumulativeCompletionPercent(summary: Pick<CareDailySummary, "plan" | "cumulative">): number {
  return summary.plan > 0 ? (summary.cumulative / summary.plan) * 100 : 0;
}

export function summarizeCareByDateAndWorkContent(records: CareContentSummaryInput[]): CareContentSummary[] {
  const groups = new Map<string, CareContentSummary>();
  records.forEach(record => {
    const dateKey = careDateKey(typeof record.activityDate === "number" ? new Date(record.activityDate) : record.activityDate);
    const workContent = record.workContent?.trim() || "Tất cả nội dung";
    const key = `${dateKey}|${workContent.toLocaleLowerCase("vi-VN")}`;
    const current = groups.get(key) ?? { dateKey, workContent, rowCount: 0, plan: 0, actual: 0, cumulative: 0, pending: 0, partial: 0, nextPlan: 0, nextActual: 0 };
    current.plan += record.planQuantity || 0;
    current.actual += record.actualQuantity || 0;
    current.cumulative += record.cumulativeQuantity || 0;
    current.pending += record.pendingGardens || 0;
    current.partial += record.partialGardens || 0;
    current.nextPlan += record.nextGardenPlanQuantity || 0;
    current.nextActual += record.nextGardenActualQuantity || 0;
    current.rowCount += 1;
    groups.set(key, current);
  });
  return Array.from(groups.values()).sort((left, right) => left.dateKey.localeCompare(right.dateKey) || left.workContent.localeCompare(right.workContent, "vi", { numeric: true, sensitivity: "base" }));
}
