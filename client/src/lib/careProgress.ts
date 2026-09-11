export function calculateCareCompletionPercent(planQuantity: string | number, cumulativeQuantity: string | number) {
  const plan = Number(planQuantity) || 0;
  const cumulative = Number(cumulativeQuantity) || 0;
  if (plan <= 0) return 0;
  return Number(((cumulative / plan) * 100).toFixed(2));
}
