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
const number = (value: unknown) => { if (value === "" || value == null || value === "-" || value === "—") return 0; const parsed = Number(String(value).replace(/,/g, "")); if (!Number.isFinite(parsed)) throw new Error("phải là số"); return parsed; };

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

export function buildCareTemplateSheets() {
  return (Object.keys(careImportSheetNames) as CareCategory[]).map(category => ({ category, name: careImportSheetNames[category], rows: buildCareImportTemplateRows(category) }));
}

export function buildCareImportTemplateRows(category: CareCategory) {
  const base = { Ngày: "2026-09-17", Đội: "Đội 1", KH: 0, TH: 0, "Lũy kế": 0, "Đơn vị tính": category === "tapping" ? "Vườn" : "Ha", "% hoàn thành": 0, "Ghi chú": "" };
  if (category === "tapping") return [{ ...base, Vườn: "Vườn A", "Diện tích (ha)": "", "Phần cạo": "", "Chưa cạo": 0, "Cạo chưa xong": 0, "Cạo tiếp vườn": "", "KH tiếp (Vườn)": "", "TH tiếp (Vườn)": "" }];
  if (category === "care" || category === "treatment" || category === "fertilization") return [{ ...base, "Nội dung công việc": category === "care" ? "Làm cỏ" : "" }];
  return [base];
}

export function parseCareWorkbook(workbook: any, fallback: CareCategory, xlsxModule?: any) {
  const output: Array<Record<string, unknown>> = [];
  const utils = xlsxModule?.utils ?? workbook.utils;
  const dateCodec = xlsxModule ?? workbook;
  for (const sheetName of workbook.SheetNames as string[]) {
    const category = categoryForSheet(sheetName, fallback);
    const sheet = workbook.Sheets[sheetName];
    if (category === "tapping" && normalize(sheetName) === normalize("Theo dõi cạo mủ")) {
      const rows = utils.sheet_to_json(sheet, { defval: "", raw: true }) as Array<Record<string, unknown>>;
      rows.forEach((row, index) => {
        const sourceRow = index + 2;
        try {
          const unit = text(row["Đội"]); if (!unit) throw new Error("thiếu Đội");
          const gardenName = text(row["Vườn"]); if (!gardenName) throw new Error("thiếu Vườn");
          output.push({ category, activityDate: parseDate(row["Ngày"], dateCodec), unit, gardenName, areaHa: number(row["Diện tích (ha)"]) || null, tappingSection: number(row["Phần cạo"]) || null, planQuantity: number(row.KH), actualQuantity: number(row.TH), cumulativeQuantity: number(row["Lũy kế"]) || number(row.TH), metricUnit: text(row["Đơn vị tính"]) || "Vườn", pendingGardens: number(row["Chưa cạo"]) || null, partialGardens: number(row["Cạo chưa xong"]) || null, nextGarden: text(row["Cạo tiếp vườn"]) || null, nextGardenPlanQuantity: number(row["KH tiếp (Vườn)"]) || null, nextGardenActualQuantity: number(row["TH tiếp (Vườn)"]) || null, workContent: null, note: text(row["Ghi chú"]) || null, sourceRow });
        } catch (error) { throw new Error(`Sheet ${sheetName}, Dòng Excel ${sourceRow}: ${error instanceof Error ? error.message : "dữ liệu không hợp lệ"}`); }
      });
      continue;
    }
    if (category === "tapping" && normalize(sheetName) === normalize("Theo dõi số liệu")) {
      const rows = utils.sheet_to_json(sheet, { header: 1, defval: "", raw: true }) as unknown[][];
      const groups = [{ start: 2, end: 7 }, { start: 8, end: 13 }, { start: 14, end: 19 }];
      rows.slice(3).forEach((values, index) => {
        const sourceRow = index + 4; const unit = text(values[1]); if (!unit) return;
        try {
          const main = groups[0]; const gardenName = text(values[main.start]); const mainValues = values.slice(main.start + 1, main.end + 1);
          if (!gardenName && mainValues.every(value => value === "" || value == null || value === "-" || value === "—")) return;
          if (!gardenName) throw new Error("thiếu Vườn cạo");
          const nextGroups = groups.slice(1).filter(group => { const name = text(values[group.start]); const groupValues = values.slice(group.start + 1, group.end + 1); return name || groupValues.some(value => value !== "" && value != null && value !== "-" && value !== "—"); });
          const nextNames = Array.from(new Set(nextGroups.map(group => text(values[group.start])).filter(Boolean)));
          const nextPlan = nextGroups.reduce((sum, group) => sum + number(values[group.start + 1]), 0); const nextActual = nextGroups.reduce((sum, group) => sum + number(values[group.start + 2]), 0);
          const planQuantity = number(values[main.start + 1]); const actualQuantity = number(values[main.start + 2]); const pendingGardens = number(values[main.start + 3]); const partialGardens = number(values[main.start + 4]);
          output.push({ category, activityDate: parseDate(values[0], dateCodec), unit, gardenName, areaHa: null, tappingSection: null, planQuantity, actualQuantity, cumulativeQuantity: actualQuantity, metricUnit: "Vườn", pendingGardens: pendingGardens || null, partialGardens: partialGardens || null, nextGarden: nextNames.length ? nextNames.join(" / ") : null, nextGardenPlanQuantity: nextPlan || null, nextGardenActualQuantity: nextActual || null, workContent: null, note: null, sourceRow });
        } catch (error) { throw new Error(`Sheet ${sheetName}, Dòng Excel ${sourceRow}: ${error instanceof Error ? error.message : "dữ liệu không hợp lệ"}`); }
      });
      continue;
    }
    const rows = utils.sheet_to_json(sheet, { defval: "", raw: true }) as Array<Record<string, unknown>>;
    rows.forEach((row, index) => {
      const sourceRow = index + 2;
      try {
        const unit = text(row["Đội"]); if (!unit) throw new Error("thiếu Đội");
        const date = parseDate(row["Ngày"], dateCodec); const needsContent = category === "care" || category === "treatment" || category === "fertilization";
        const workContent = text(row["Nội dung công việc"] || row["Nội dung"]); if (needsContent && !workContent) throw new Error("thiếu Nội dung công việc");
        output.push({ category, activityDate: date, unit, gardenName: category === "tapping" ? text(row["Vườn"]) : careImportSheetNames[category], areaHa: number(row["Diện tích (ha)"]) || null, tappingSection: number(row["Phần cạo"]) || null, planQuantity: number(row.KH), actualQuantity: number(row.TH), cumulativeQuantity: number(row["Lũy kế"]) || number(row.TH), metricUnit: text(row["Đơn vị tính"]) || (category === "tapping" ? "Vườn" : "Ha"), pendingGardens: category === "tapping" ? number(row["Chưa cạo"]) || null : null, partialGardens: category === "tapping" ? number(row["Cạo chưa xong"]) || null : null, nextGarden: category === "tapping" ? text(row["Cạo tiếp vườn"]) || null : null, nextGardenPlanQuantity: category === "tapping" ? number(row["KH tiếp (Vườn)"]) || null : null, nextGardenActualQuantity: category === "tapping" ? number(row["TH tiếp (Vườn)"]) || null : null, workContent: needsContent ? workContent : null, note: text(row["Ghi chú"]) || null, sourceRow });
      } catch (error) { throw new Error(`Sheet ${sheetName}, Dòng Excel ${sourceRow}: ${error instanceof Error ? error.message : "dữ liệu không hợp lệ"}`); }
    });
  }
  return output;
}
