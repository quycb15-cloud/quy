export type MonthlyProductionRow = {
  recordDate: Date;
  totalImport?: number;
  totalExport?: number;
};

export type MonthlyProductionPoint = {
  label: string;
  totalImport: number;
  totalExport: number;
  warehouseLoss: number;
  value: number;
};

export function buildMonthlyProductionSeries(rows: MonthlyProductionRow[]): MonthlyProductionPoint[] {
  const grouped = new Map<string, { label: string; totalImport: number; totalExport: number }>();
  rows.forEach(row => {
    const label = row.recordDate.toISOString().slice(0, 7);
    const entry = grouped.get(label) ?? { label, totalImport: 0, totalExport: 0 };
    entry.totalImport += Number(row.totalImport ?? 0);
    entry.totalExport += Number(row.totalExport ?? 0);
    grouped.set(label, entry);
  });
  return Array.from(grouped.values())
    .map(row => ({ ...row, warehouseLoss: row.totalImport - row.totalExport, value: row.totalImport }))
    .sort((left, right) => left.label.localeCompare(right.label));
}
