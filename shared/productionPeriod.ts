export type ProductionPeriodRow = {
  recordDate: Date | string;
  periodLabel?: string | null;
  unit?: string | null;
};

export function filterProductionRows<T extends ProductionPeriodRow>(
  rows: T[],
  input: { year: number; month: number; periodLabel?: string; unit?: string },
) {
  return rows.filter(row => {
    const date = row.recordDate instanceof Date ? row.recordDate : new Date(row.recordDate);
    return date.getUTCFullYear() === input.year
      && date.getUTCMonth() + 1 === input.month
      && (!input.periodLabel || row.periodLabel === input.periodLabel)
      && (!input.unit || row.unit === input.unit);
  });
}
