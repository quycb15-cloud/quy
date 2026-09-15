export type PlotDisplayInput = {
  name?: string | null;
  plantedYear?: number | string | null;
};

export function formatPlotDisplayName(input: PlotDisplayInput | string | null | undefined, plantedYear?: number | string | null) {
  const name = typeof input === "string" ? input : input?.name;
  const year = typeof input === "string" ? plantedYear : input?.plantedYear;
  const cleanName = String(name ?? "").replace(/\s+/g, " ").trim();
  if (!cleanName) return "";
  const yearText = String(year ?? "").trim();
  if (!/^\d{4}$/.test(yearText)) return cleanName;
  return new RegExp(`\\(\\s*${yearText}\\s*\\)$`).test(cleanName)
    ? cleanName
    : `${cleanName} (${yearText})`;
}

export function parsePlotDisplayName(value: unknown) {
  const raw = String(value ?? "").replace(/\s+/g, " ").trim();
  const match = raw.match(/^(.*?)\s*\(\s*(\d{4})\s*\)$/);
  return {
    raw,
    name: (match?.[1] ?? raw).replace(/^lô\s+/i, "").trim(),
    plantedYear: match ? Number(match[2]) : null,
  };
}

export function normalizePlotLookup(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^lo\s+/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
