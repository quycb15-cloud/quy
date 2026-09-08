export type ProductionPeriodRow = {
  recordDate: Date | string;
  periodLabel?: string | null;
  unit?: string | null;
};

export type ProductionPeriodFilter = {
  year: number;
  month?: number;
  periodLabel?: string;
  unit?: string;
};

export function filterProductionRows<T extends ProductionPeriodRow>(
  rows: T[],
  input: ProductionPeriodFilter,
) {
  return rows.filter(row => {
    const date = row.recordDate instanceof Date ? row.recordDate : new Date(row.recordDate);
    const matchesMonth = input.month == null || date.getUTCMonth() + 1 === input.month;
    const matchesPeriod = !input.periodLabel || input.periodLabel === "all" || row.periodLabel === input.periodLabel;
    const matchesUnit = !input.unit || row.unit === input.unit;
    return date.getUTCFullYear() === input.year && matchesMonth && matchesPeriod && matchesUnit;
  });
}

export function listMonthsWithData<T extends ProductionPeriodRow>(rows: T[], year: number, periodLabel?: string) {
  return Array.from(new Set(
    rows
      .filter(row => {
        const date = row.recordDate instanceof Date ? row.recordDate : new Date(row.recordDate);
        return date.getUTCFullYear() === year && (!periodLabel || periodLabel === "all" || row.periodLabel === periodLabel);
      })
      .map(row => {
        const date = row.recordDate instanceof Date ? row.recordDate : new Date(row.recordDate);
        return date.getUTCMonth() + 1;
      }),
  )).sort((left, right) => left - right);
}

export function listYearsWithData<T extends ProductionPeriodRow>(rows: T[]) {
  return Array.from(new Set(rows.map(row => {
    const date = row.recordDate instanceof Date ? row.recordDate : new Date(row.recordDate);
    return date.getUTCFullYear();
  }))).sort((left, right) => right - left);
}
