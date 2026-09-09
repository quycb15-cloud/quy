type ReportDateRow = { dailyImports: Array<{ recordDate: Date | string }> };

export function availableReportMonths(rows: ReportDateRow[]) {
  return Array.from(
    new Set(
      rows.flatMap(row =>
        row.dailyImports.map(item => new Date(item.recordDate).getUTCMonth() + 1)
      )
    )
  ).sort((left, right) => left - right);
}
