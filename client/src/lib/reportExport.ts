export type ProgressExportInput = {
  unit: string;
  frozenLatex: number;
  latexThreadImport: number;
  totalImport: number;
  frozenContaminatedLatex: number;
  latexThreadExport: number;
  totalExport: number;
  lossRate: number;
  dailyImports: Array<{ recordDate: Date | string; frozenLatex: number }>;
};

export function buildTeamProgressExportRows<T extends ProgressExportInput>(rows: T[], dateColumns: string[], dayLabel: (date: string) => string, amountOnDate: (row: T, date: string) => number) {
  return rows.map((row, index) => ({
    STT: index + 1,
    Đội: row.unit,
    ...Object.fromEntries(dateColumns.map(date => [`Nhập ${dayLabel(date)}`, amountOnDate(row, date)])),
    "Cộng mủ đông": row.frozenLatex,
    "Mủ dây nhập": row.latexThreadImport,
    "Cộng nhập": row.totalImport,
    "Mủ đông tạp": row.frozenContaminatedLatex,
    "Mủ dây xuất": row.latexThreadExport,
    "Cộng xuất": row.totalExport,
    "Hao kho (%)": Number(row.lossRate.toFixed(2)),
  }));
}

export type ProductionChangeExportInput = { periodLabel: string; monthLabel: string; unit: string; totalImport: number; totalExport: number };
export function buildProductionChangeExportRows(rows: ProductionChangeExportInput[]) {
  return rows.map(row => ({
    Kỳ: row.periodLabel,
    Tháng: row.monthLabel,
    Đội: row.unit,
    "Cộng nhập": Number(row.totalImport.toFixed(2)),
    "Cộng xuất": Number(row.totalExport.toFixed(2)),
    "Hao kho": Number((row.totalImport - row.totalExport).toFixed(2)),
  }));
}

export type TechnicalSkillCounts = { workerCount: number; exceptionalCount: number; goodCount: number; fairCount: number; averageCount: number; weakCount: number };
export function buildTechnicalSkillDisplay(row: TechnicalSkillCounts, previous?: TechnicalSkillCounts | null) {
  const denominator = Math.max(row.workerCount, 1);
  const percent = (count: number) => (count / denominator) * 100;
  const previousPercent = (count: number) => previous ? (count / Math.max(previous.workerCount, 1)) * 100 : null;
  const change = (current: number, before: number | null) => before == null ? null : percent(current) - before;
  return {
    workerCount: row.workerCount,
    exceptionalCount: row.exceptionalCount,
    exceptionalPercent: percent(row.exceptionalCount),
    exceptionalChangePercent: change(row.exceptionalCount, previousPercent(previous?.exceptionalCount ?? 0)),
    goodCount: row.goodCount,
    goodPercent: percent(row.goodCount),
    goodChangePercent: change(row.goodCount, previousPercent(previous?.goodCount ?? 0)),
    fairCount: row.fairCount,
    fairPercent: percent(row.fairCount),
    fairChangePercent: change(row.fairCount, previousPercent(previous?.fairCount ?? 0)),
    averageCount: row.averageCount,
    averagePercent: percent(row.averageCount),
    weakCount: row.weakCount,
    weakPercent: percent(row.weakCount),
  };
}
