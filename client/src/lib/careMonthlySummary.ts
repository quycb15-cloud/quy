export type MonthlyTappingInput = {
  activityDate: Date | string;
  unit: string;
  gardenName: string | null;
  planQuantity: number;
  actualQuantity: number;
  pendingGardens: number | null;
  partialGardens: number | null;
};

export type MonthlyTappingSummary = {
  unit: string;
  gardenName: string;
  plan: number;
  actual: number;
  pending: number;
  partial: number;
};

export function summarizeMonthlyTapping(records: MonthlyTappingInput[], monthStart: Date, monthEnd: Date): MonthlyTappingSummary[] {
  const grouped = new Map<string, MonthlyTappingSummary>();
  records.filter(record => {
    const date = new Date(record.activityDate);
    return date >= monthStart && date <= monthEnd;
  }).forEach(record => {
    const gardenName = record.gardenName ?? "";
    const key = `${record.unit}|${gardenName}`;
    const current = grouped.get(key) ?? { unit: record.unit, gardenName, plan: 0, actual: 0, pending: 0, partial: 0 };
    current.plan += record.planQuantity;
    current.actual += record.actualQuantity;
    current.pending += record.pendingGardens ?? 0;
    current.partial += record.partialGardens ?? 0;
    grouped.set(key, current);
  });
  return Array.from(grouped.values()).sort((left, right) => left.unit.localeCompare(right.unit, "vi", { numeric: true }) || left.gardenName.localeCompare(right.gardenName, "vi"));
}

export function monthlyCompletionPercent(summary: Pick<MonthlyTappingSummary, "plan" | "actual">) {
  return summary.plan > 0 ? (summary.actual / summary.plan) * 100 : 0;
}
