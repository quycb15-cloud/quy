export type ImportJournalRow = {
  id: number;
  source: "plot" | "team";
  plotId: number | null;
  plotCode: string;
  plotName: string;
  unit: string;
  recordDate: Date | string;
  periodLabel: string;
  frozenLatex: number;
  latexThread: number;
  totalImport: number;
  note?: string | null;
};

function toDateKey(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

export function filterImportJournal(rows: ImportJournalRow[], filters: { periodLabel?: string; fromDate?: string; toDate?: string }) {
  return rows.filter(row => {
    const key = toDateKey(row.recordDate);
    return (!filters.periodLabel || row.periodLabel === filters.periodLabel)
      && (!filters.fromDate || key >= filters.fromDate)
      && (!filters.toDate || key <= filters.toDate);
  });
}

export function toImportExcelRows(rows: ImportJournalRow[]) {
  const details = rows.map(row => ({
    "Ngày nhập": toDateKey(row.recordDate),
    "Vườn / Lô": row.plotId ? `${row.plotCode} — ${row.plotName}` : row.plotName,
    "Đội": row.unit,
    "Đợt": row.periodLabel,
    "Mủ đông (kg)": row.frozenLatex,
    "Mủ dây (kg)": row.latexThread,
    "Cộng nhập (kg)": row.totalImport,
    "Ghi chú": row.note ?? "",
  }));
  const totals = rows.reduce((sum, row) => ({ frozen: sum.frozen + row.frozenLatex, thread: sum.thread + row.latexThread, total: sum.total + row.totalImport }), { frozen: 0, thread: 0, total: 0 });
  return [...details, { "Ngày nhập": "Tổng khối lượng", "Vườn / Lô": "", "Đội": "", "Đợt": "", "Mủ đông (kg)": totals.frozen, "Mủ dây (kg)": totals.thread, "Cộng nhập (kg)": totals.total, "Ghi chú": "" }];
}
