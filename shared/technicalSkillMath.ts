export function relativeChangePercent(current: number, previous: number | null | undefined) {
  if (previous == null || previous === 0) return null;
  return (current / previous) * 100 - 100;
}
