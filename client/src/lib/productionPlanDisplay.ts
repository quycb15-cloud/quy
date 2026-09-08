export type ProductionPlanCardMode = "month" | "throughput" | "year";

export function getProductionPlanCardModes(month: number): ProductionPlanCardMode[] {
  return month === 0 ? ["throughput", "year"] : ["month", "year"];
}
