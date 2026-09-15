import { formatPlotDisplayName } from "@shared/plotDisplay";

export type WorkerPlotTemplatePlot = { unit?: string | null; code: string; name: string; plantedYear?: number | null };

const workerPlotAllocationHeaders = [
  ["TT", "Mã công nhân", "VƯỜN A", "", "", "", "VƯỜN B", "", "", "", "VƯỜN C", "", "", "", "TỔNG DIỆN TÍCH", "TỔNG CÂY CẠO", "GHI CHÚ"],
  ["", "", "Lô (Tên hiển thị)", "Hàng - hàng", "Diện tích", "Tổng cây cạo", "Lô (Tên hiển thị)", "Hàng - hàng", "Diện tích", "Tổng cây cạo", "Lô (Tên hiển thị)", "Hàng - hàng", "Diện tích", "Tổng cây cạo", "", "", ""],
];

export const workerPlotAllocationMerges = [
  "A1:A2", "B1:B2", "C1:F1", "G1:J1", "K1:N1", "O1:O2", "P1:P2", "Q1:Q2",
];

export const workerPlotAllocationExampleRow: (string | number)[] = [
  1, "", "1 (2011)", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
];

export function buildWorkerPlotAllocationTemplateMatrix() {
  return [...workerPlotAllocationHeaders, workerPlotAllocationExampleRow];
}

export function buildWorkerPlotListMatrix(plotOptions: WorkerPlotTemplatePlot[]) {
  return [
    ["Đội", "Mã lô", "Lô (Tên hiển thị)", "Năm trồng", "Loại vườn"],
    ...plotOptions.map(plot => [
      plot.unit ?? "",
      plot.code,
      formatPlotDisplayName(plot.name, plot.plantedYear),
      plot.plantedYear ?? "",
      "",
    ]),
  ];
}
