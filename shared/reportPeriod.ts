export function sortReportPeriods(periods: string[]) {
  return Array.from(new Set(periods.filter(Boolean))).sort((left, right) => left.localeCompare(right, "vi", { numeric: true }));
}

export function hasReportPeriod(periods: string[], period: string) {
  return sortReportPeriods(periods).includes(period);
}
