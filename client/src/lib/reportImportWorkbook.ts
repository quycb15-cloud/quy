export const productionPlanHeaders: string[][] = [
  ["TT", "Đơn vị", "Năm", "Tháng", "ĐVT", "Diện tích", "Sản lượng", "", "", "", "", "", "Năng suất bình quân (kg/ha)", "Xếp loại", "Ghi chú"],
  ["", "", "", "", "", "", "Mủ đông, tạp", "", "", "Mủ quy khô", "", "", "", "", ""],
  ["", "", "", "", "", "", "Kế hoạch (kg)", "Thực hiện (kg)", "Tỷ lệ %", "Kế hoạch năm (kg)", "Thực hiện (kg)", "Tỷ lệ %", "", "", ""],
];

export const productionPlanMerges = [
  "A1:A3", "B1:B3", "C1:C3", "D1:D3", "E1:E3", "F1:F3", "G1:L1", "G2:I2", "J2:L2", "M1:M3", "N1:N3", "O1:O3",
];

export const technicalSkillHeaders: string[][] = [
  ["TT", "Nội dung", "Tháng báo cáo", "Quân số", "Loại tay nghề", "", "", "", "", "", "", "", "Tỷ lệ % Xuất sắc, Khá, Giỏi", "Xếp thứ tự", "Hao dăm", "", "", "", "Ghi chú"],
  ["", "", "", "", "Xuất sắc", "", "Giỏi", "", "Khá", "", "Trung bình", "Yếu", "", "", "Tháng hiện tại", "", "Tháng trước", "Chênh lệch", ""],
  ["", "", "", "", "Số thợ", "%", "Số thợ", "%", "Số thợ", "%", "Số thợ", "%", "%", "", "Số thợ", "Tỷ lệ %", "Số thợ / Tỷ lệ %", ""],
];

export const technicalSkillMerges = [
  "A1:A3", "B1:B3", "C1:C3", "D1:D3", "E1:F1", "G1:H1", "I1:J1", "K1:K2", "L1:L2", "M1:M3", "N1:N3", "O1:R1", "O2:P2", "Q2:Q3", "R2:R3", "S1:S3",
];

export function buildProductionPlanTemplateMatrix() {
  return [...productionPlanHeaders, [1, "Đội 1", new Date().getFullYear(), 0, "ha", "", "", "", "", "", "", "", "", "", ""]];
}

export function buildTechnicalSkillTemplateMatrix() {
  return [...technicalSkillHeaders, [1, "Đội 1", "2026-08", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]];
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

export function parseProductionPlanMatrix(matrix: unknown[][]) {
  const rows: Array<Record<string, string | number>> = [];
  const issues: string[] = [];
  matrix.slice(3).forEach((row, index) => {
    const unit = String(row[1] ?? "").trim();
    if (!unit && row.every(value => String(value ?? "").trim() === "")) return;
    const year = toNumber(row[2]);
    const month = toNumber(row[3]);
    const areaHa = toNumber(row[5]);
    const planFrozenLatex = toNumber(row[6]);
    const planDryRubber = toNumber(row[9]);
    if (!unit || !year || month < 0 || month > 12 || planFrozenLatex < 0 || planDryRubber < 0) {
      issues.push(`Dòng ${index + 4}: cần Đơn vị, Năm, Tháng từ 0 đến 12 và kế hoạch sản lượng hợp lệ`);
      return;
    }
    rows.push({ unit, year, month, areaHa, planFrozenLatex, planDryRubber, note: String(row[14] ?? "").trim() });
  });
  return { rows, issues };
}

export function parseTechnicalSkillMatrix(matrix: unknown[][]) {
  const rows: Array<Record<string, string | number>> = [];
  const issues: string[] = [];
  matrix.slice(3).forEach((row, index) => {
    const unit = String(row[1] ?? "").trim();
    if (!unit && row.every(value => String(value ?? "").trim() === "")) return;
    const monthKey = String(row[2] ?? "").trim();
    const workerCount = toNumber(row[3]);
    const exceptionalCount = toNumber(row[4]);
    const goodCount = toNumber(row[6]);
    const fairCount = toNumber(row[8]);
    const averageCount = toNumber(row[10]);
    const weakCount = toNumber(row[11]);
    const haoDamWorkers = toNumber(row[14]);
    const totalSkill = exceptionalCount + goodCount + fairCount + averageCount + weakCount;
    if (!unit || !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey) || totalSkill > workerCount) {
      issues.push(`Dòng ${index + 4}: cần Đội, Tháng báo cáo dạng YYYY-MM và tổng cấp tay nghề không vượt quân số`);
      return;
    }
    rows.push({ unit, monthKey, workerCount, exceptionalCount, goodCount, fairCount, averageCount, weakCount, haoDamWorkers, note: String(row[18] ?? "").trim() });
  });
  return { rows, issues };
}
