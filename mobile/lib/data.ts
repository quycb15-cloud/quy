export type ProductionRow = { dryRubber?: number | string | null };
export type SkillRow = { overallScore?: number | string | null };

export function sumDryRubber(rows: ProductionRow[]) {
  return rows.reduce((sum, row) => {
    const value = Number(row.dryRubber ?? 0);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
}

export function averageOverallScore(rows: SkillRow[]) {
  const scores = rows
    .map(row => Number(row.overallScore))
    .filter(score => Number.isFinite(score));
  return scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
}

export function scoreLabel(score: number | null | undefined) {
  return score == null ? "—" : `${score.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}/100`;
}
