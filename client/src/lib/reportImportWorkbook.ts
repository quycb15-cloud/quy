export const productionPlanHeaders: string[][] = [
  ["TT", "Đơn vị", "Kế hoạch năm", "Kế hoạch tháng", "Kế hoạch Giao Sản lượng", "", "", "", "Ghi chú"],
  ["", "", "", "", "Mủ đông, tạp", "", "Mủ quy khô", "", ""],
  ["", "", "", "", "Kế hoạch Mủ đông, tạp (kg)", "Kế hoạch Mủ dây (kg)", "Kế hoạch từ mủ đông, tạp (kg)", "Kế hoạch từ mủ dây (kg)", ""],
];

export const productionPlanMerges = [
  "A1:A3", "B1:B3", "C1:C3", "D1:D3", "E1:H1", "E2:F2", "G2:H2", "I1:I3",
];

export const technicalSkillHeaders: string[][] = [
  ["TT", "Nội dung", "Tháng/năm báo cáo", "Quân số", "Loại tay nghề", "", "", "", "", "", "", "", "", "", "", "Xếp\nthứ tự", "Hao dăm", "", "", "", "", "Ghi chú", "", ""],
  ["", "", "", "", "Xuất sắc", "", "Giỏi", "", "Khá", "", "Trung bình", "", "Yếu", "", "Tỷ lệ %\nXuất sắc, khá\ngiỏi", "", "Tháng hiện tại", "", "Tháng trước", "Chênh lệch \nSố thợ", "Tỷ lệ %\n(8/7*100-\n100)", "", "", ""],
  ["", "", "", "", "Số thợ", "%", "Số thợ", "%", "Số thợ", "%", "Số thợ", "%", "Số thợ", "%", "", "", "Số thợ", "Tỷ lệ %", "Số thợ", "Số thợ", "Tỷ lệ %", "", "", ""],
];

export const technicalSkillMerges = [
  "A1:A3", "B1:B3", "C1:C3", "D1:D3", "E1:F1", "G1:H1", "I1:J1", "K1:L1", "M1:N1", "O1:O3", "P1:P3", "Q1:U1", "Q2:R2", "S2:S3", "T2:U2", "V1:V3",
];

export function buildProductionPlanTemplateMatrix() {
  const year = new Date().getFullYear();
  return [...productionPlanHeaders,
    [1, "Đội 1", year, 0, "842.071", "", "421.036", "", ""],
    [2, "Đội 1", year, new Date().getMonth() + 1, "50.524", "", "25.262", "", ""],
  ];
}

export function buildTechnicalSkillTemplateMatrix() {
  return [...technicalSkillHeaders, [1, "Đội 1", new Date(2026, 7, 31), 57, "", "", 13, "", 40, "", 4, "", "", "", "", 3, 42, 73.68, 37, 5, 13.51, "", "", ""]];
}

const toNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  const raw = String(value ?? "").trim().replace(/\s/g, "");
  if (!raw) return 0;
  if (raw.includes(",") && raw.includes(".")) return Number(raw.replaceAll(".", "").replace(",", ".")) || 0;
  if (raw.includes(",")) return Number(raw.replace(",", ".")) || 0;
  if (/^[-+]?\d{1,3}(?:\.\d{3})+$/.test(raw)) return Number(raw.replaceAll(".", "")) || 0;
  return Number(raw) || 0;
};

const readFormulaNumber = (value: unknown, rowIndex: number, matrix: unknown[][]) => {
  if (typeof value !== "string" || !value.trim().startsWith("=")) return toNumber(value);
  const expression = value.trim().slice(1).replace(/([A-Z]+)(\d+)/g, (_, letters: string, row: string) => {
    let column = 0;
    for (const letter of letters) column = column * 26 + letter.charCodeAt(0) - 64;
    return String(toNumber(matrix[Number(row) - 1]?.[column - 1]));
  });
  const match = expression.match(/^(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/);
  if (match) {
    const left = Number(match[1]);
    const right = Number(match[3]);
    return match[2] === "+" ? left + right : match[2] === "-" ? left - right : match[2] === "*" ? left * right : right === 0 ? 0 : left / right;
  }
  return toNumber(expression);
};

const monthKey = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
  if (typeof value === "number" && value > 30000) {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  }
  const raw = String(value ?? "").trim();
  const yearMonth = raw.match(/^(\d{4})[-\/]?(\d{1,2})$/);
  if (yearMonth) return `${yearMonth[1]}-${String(Number(yearMonth[2])).padStart(2, "0")}`;
  const monthYear = raw.match(/^(\d{1,2})[-\/]?(\d{4})$/);
  return monthYear ? `${monthYear[2]}-${String(Number(monthYear[1])).padStart(2, "0")}` : raw;
};

export function parseProductionPlanMatrix(matrix: unknown[][]) {
  const rows: Array<Record<string, string | number>> = [];
  const issues: string[] = [];
  const isRealTemplate = String(matrix[0]?.[2] ?? "").toLowerCase().includes("kế hoạch năm") || String(matrix[0]?.[4] ?? "").toLowerCase().includes("kế hoạch giao");
  matrix.slice(3).forEach((row, index) => {
    const unit = String(row[1] ?? "").trim();
    if (!unit && row.every(value => String(value ?? "").trim() === "")) return;
    const year = toNumber(row[isRealTemplate ? 2 : 2]);
    const month = toNumber(row[isRealTemplate ? 3 : 3]);
    const areaHa = isRealTemplate ? 0 : toNumber(row[5]);
    const planFrozenLatex = isRealTemplate ? readFormulaNumber(row[4], index + 4, matrix) : toNumber(row[6]);
    const planDryRubber = isRealTemplate ? readFormulaNumber(row[6], index + 4, matrix) + readFormulaNumber(row[7], index + 4, matrix) : toNumber(row[9]);
    const planThreadLatex = isRealTemplate ? readFormulaNumber(row[5], index + 4, matrix) : 0;
    const dryFromFrozen = isRealTemplate ? readFormulaNumber(row[6], index + 4, matrix) : planDryRubber;
    const dryFromThread = isRealTemplate ? readFormulaNumber(row[7], index + 4, matrix) : 0;
    if (!unit || !year || month < 0 || month > 12 || planFrozenLatex < 0 || planDryRubber < 0) {
      issues.push(`Dòng ${index + 4}: cần Đơn vị, Năm, Tháng từ 0 đến 12 và kế hoạch sản lượng hợp lệ`);
      return;
    }
    rows.push({ unit, year, month, areaHa, planFrozenLatex, planThreadLatex, planDryRubber, dryFromFrozen, dryFromThread, note: String(row[isRealTemplate ? 8 : 14] ?? "").trim() });
  });
  return { rows, issues };
}

export function parseTechnicalSkillMatrix(matrix: unknown[][]) {
  const rows: Array<Record<string, string | number>> = [];
  const issues: string[] = [];
  matrix.slice(3).forEach((row, index) => {
    const unit = String(row[1] ?? "").trim();
    if (!unit && row.every(value => String(value ?? "").trim() === "")) return;
    const reportMonth = monthKey(row[2]);
    const workerCount = toNumber(row[3]);
    const exceptionalCount = toNumber(row[4]);
    const goodCount = toNumber(row[6]);
    const fairCount = toNumber(row[8]);
    const averageCount = toNumber(row[10]);
    const weakCount = toNumber(row[12]);
    const haoDamWorkers = toNumber(row[16]);
    const previousHaoDamWorkers = toNumber(row[18]);
    const haoDamChangeWorkers = toNumber(row[19]);
    const haoDamChangePercent = toNumber(row[20]);
    const totalSkill = exceptionalCount + goodCount + fairCount + averageCount + weakCount;
    if (!unit || !/^\d{4}-(0[1-9]|1[0-2])$/.test(reportMonth) || totalSkill > workerCount) {
      issues.push(`Dòng ${index + 4}: cần Đội, Tháng/năm báo cáo hợp lệ và tổng cấp tay nghề không vượt quân số`);
      return;
    }
    rows.push({ unit, monthKey: reportMonth, workerCount, exceptionalCount, goodCount, fairCount, averageCount, weakCount, haoDamWorkers, previousHaoDamWorkers, haoDamChangeWorkers, haoDamChangePercent, note: String(row[21] ?? "").trim() });
  });
  return { rows, issues };
}
