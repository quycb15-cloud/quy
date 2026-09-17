import type { CareCategory } from "./careDailyExport";

export const careImportSheetNames: Record<CareCategory, string> = {
  tapping: "Theo dõi cạo mủ",
  reinforcement: "Rập thiết kế, trang bị",
  care: "Chăm sóc",
  treatment: "Phun, bôi thuốc",
  fertilization: "Bón phân",
};

const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const text = (value: unknown) => String(value ?? "").trim();
const number = (value: unknown) => { if (value === "" || value == null) return 0; const parsed = Number(String(value).replace(/,/g, "")); if (!Number.isFinite(parsed)) throw new Error("phải là số"); return parsed; };

function parseDate(value: unknown, XLSX: any): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number") { const parsed = XLSX.SSF.parse_date_code(value); if (parsed) return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)); }
  const raw = text(value); const match = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/); const date = match ? new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]))) : new Date(raw);
  if (Number.isNaN(date.getTime())) throw new Error("Ngày không hợp lệ");
  return date;
}

function categoryForSheet(sheetName: string, fallback: CareCategory): CareCategory {
  const key = normalize(sheetName);
  return (Object.entries(careImportSheetNames).find(([, label]) => normalize(label) === key)?.[0] as CareCategory | undefined) ?? fallback;
}

export function buildCareImportTemplateRows(category: CareCategory) {
  const base = { Ngày: "2026-09-17", Đội: "Đội 1", KH: 0, TH: 0, "Lũy kế": 0, "Đơn vị tính": category === "tapping" ? "Vườn" : "Ha", "% hoàn thành": 0, "Ghi chú": "" };
  if (category === "tapping") return [{ ...base, Vườn: "Vườn A", "Diện tích (ha)": "", "Phần cạo": "", "Chưa cạo": 0, "Cạo chưa xong": 0, "Cạo tiếp vườn": "", "KH tiếp (Vườn)": "", "TH tiếp (Vườn)": "" }];
  if (category === "care" || category === "treatment" || category === "fertilization") return [{ ...base, "Nội dung công việc": category === "care" ? "Làm cỏ" : "" }];
  return [base];
}

export function parseCareWorkbook(workbook: any, fallback: CareCategory) {
  const output: Array<Record<string, unknown>> = [];
  for (const sheetName of workbook.SheetNames as string[]) {
    const category = categoryForSheet(sheetName, fallback);
    const sheet = workbook.Sheets[sheetName];
    const rows = workbook.utils.sheet_to_json(sheet, { defval: "", raw: true }) as Array<Record<string, unknown>>;
    rows.forEach((row, index) => {
      const sourceRow = index + 2;
      try {
        const unit = text(row["Đội"]); if (!unit) throw new Error("thiếu Đội");
        const date = parseDate(row["Ngày"], workbook); const needsContent = category === "care" || category === "treatment" || category === "fertilization";
        const workContent = text(row["Nội dung công việc"] || row["Nội dung"]); if (needsContent && !workContent) throw new Error("thiếu Nội dung công việc");
        output.push({ category, activityDate: date, unit, gardenName: category === "tapping" ? text(row["Vườn"]) : careImportSheetNames[category], areaHa: number(row["Diện tích (ha)"]) || null, tappingSection: number(row["Phần cạo"]) || null, planQuantity: number(row.KH), actualQuantity: number(row.TH), cumulativeQuantity: number(row["Lũy kế"]) || number(row.TH), metricUnit: text(row["Đơn vị tính"]) || (category === "tapping" ? "Vườn" : "Ha"), pendingGardens: category === "tapping" ? number(row["Chưa cạo"]) || null : null, partialGardens: category === "tapping" ? number(row["Cạo chưa xong"]) || null : null, nextGarden: category === "tapping" ? text(row["Cạo tiếp vườn"]) || null : null, nextGardenPlanQuantity: category === "tapping" ? number(row["KH tiếp (Vườn)"]) || null : null, nextGardenActualQuantity: category === "tapping" ? number(row["TH tiếp (Vườn)"]) || null : null, workContent: needsContent ? workContent : null, note: text(row["Ghi chú"]) || null, sourceRow });
      } catch (error) { throw new Error(`Sheet ${sheetName}, Dòng Excel ${sourceRow}: ${error instanceof Error ? error.message : "dữ liệu không hợp lệ"}`); }
    });
  }
  return output;
}
