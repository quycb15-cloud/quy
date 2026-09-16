export type WorkerPlotAllocationRow = {
  unit?: string;
  workerName?: string;
  employeeCode?: string | null;
  sourceRow?: number;
  sourceOrdinal?: string;
  gardenType: "A" | "B" | "C";
  plotCode: string;
  rowStart: number;
  rowEnd: number;
  areaHa: number;
  tappingTrees?: number;
};

const text = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();
const number = (value: unknown) => {
  if (typeof value === "number") return value;
  const raw = text(value);
  return Number(raw.includes(",") ? raw.replaceAll(".", "").replace(",", ".") : raw);
};

function parseRowRange(value: unknown) {
  const raw = text(value).replace(/[–—]/g, "-");
  if (!raw) return null;
  const parts = raw.split(/\s*-\s*/).filter(Boolean).map(Number);
  if (parts.length === 1 && Number.isInteger(parts[0])) return { start: parts[0], end: parts[0] };
  if (parts.length === 2 && parts.every(Number.isInteger)) return { start: parts[0], end: parts[1] };
  return null;
}

export function parseWorkerPlotAllocationRows(rows: unknown[][]) {
  const parsed: WorkerPlotAllocationRow[] = [];
  const issues: string[] = [];
  const newLayout = text(rows[0]?.[1]).toLowerCase().includes("mã công nhân") || text(rows[1]?.[2]).toLowerCase().startsWith("lô");
  const slots = newLayout
    ? [{ gardenType: "A" as const, start: 2 }, { gardenType: "B" as const, start: 6 }, { gardenType: "C" as const, start: 10 }]
    : [{ gardenType: "A" as const, start: 4 }, { gardenType: "B" as const, start: 10 }, { gardenType: "C" as const, start: 16 }];

  rows.slice(2).forEach((row, index) => {
    const sheetRow = index + 3;
    const unit = newLayout ? undefined : text(row[1]) || undefined;
    const workerName = newLayout ? undefined : text(row[2]) || undefined;
    const employeeCode = text(newLayout ? row[1] : row[3]) || null;
    slots.forEach(slot => {
      const plotCode = text(row[slot.start]);
      const rowRange = newLayout ? parseRowRange(row[slot.start + 1]) : { start: number(row[slot.start + 3]), end: number(row[slot.start + 4]) };
      const areaHa = number(row[newLayout ? slot.start + 2 : slot.start + 5]);
      const tappingTrees = number(row[newLayout ? slot.start + 3 : -1]);
      const hasValue = [plotCode, newLayout ? row[slot.start + 1] : row[slot.start + 3], newLayout ? row[slot.start + 2] : row[slot.start + 5]].some(value => text(value));
      if (!hasValue) return;
      if ((newLayout ? !employeeCode : !unit || !workerName) || !plotCode || !rowRange || !Number.isInteger(rowRange.start) || !Number.isInteger(rowRange.end) || !Number.isFinite(areaHa) || areaHa <= 0) {
        issues.push(`Dòng ${sheetRow} – Vườn ${slot.gardenType}: cần đủ Mã công nhân, Lô, Hàng - hàng và Diện tích > 0`);
        return;
      }
      if (rowRange.start > rowRange.end) {
        issues.push(`Dòng ${sheetRow} – Vườn ${slot.gardenType}: Hàng - hàng bắt đầu phải nhỏ hơn hoặc bằng hàng kết thúc`);
        return;
      }
      parsed.push({ unit, workerName, employeeCode, sourceRow: sheetRow, sourceOrdinal: text(row[0]) || undefined, gardenType: slot.gardenType, plotCode, rowStart: rowRange.start, rowEnd: rowRange.end, areaHa, tappingTrees: newLayout && Number.isFinite(tappingTrees) && tappingTrees >= 0 ? tappingTrees : undefined });
    });
  });
  return { parsed, issues };
}
