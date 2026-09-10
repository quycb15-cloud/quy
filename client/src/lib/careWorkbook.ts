export const careSheetNames = { tapping: "Theo dõi cạo mủ", reinforcement: "Rập thiết kế, trang bị", care: "Chăm sóc", treatment: "Phun, bôi thuốc", fertilization: "Bón phân" } as const;
export type CareCategory = keyof typeof careSheetNames;
export function buildCareWorkbookSheets(records: Array<Record<string, unknown>>) {
  return (Object.keys(careSheetNames) as CareCategory[]).flatMap(category => { const rows = records.filter(row => row.category === category); return rows.length ? [{ name: careSheetNames[category], rows }] : []; });
}
