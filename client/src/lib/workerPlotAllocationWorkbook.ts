export const workerPlotAllocationHeaders: string[][] = [
  ["TT", "Mã công nhân", "VƯỜN A", "", "", "", "VƯỜN B", "", "", "", "VƯỜN C", "", "", "", "TỔNG DIỆN TÍCH", "TỔNG CÂY CẠO", "GHI CHÚ"],
  ["", "", "Lô", "Hàng - hàng", "Diện tích", "Tổng cây cạo", "Lô", "Hàng - hàng", "Diện tích", "Tổng cây cạo", "Lô", "Hàng - hàng", "Diện tích", "Tổng cây cạo", "", "", ""],
];

export const workerPlotAllocationMerges = [
  "A1:A2", "B1:B2", "C1:F1", "G1:J1", "K1:N1", "O1:O2", "P1:P2", "Q1:Q2",
];

export const workerPlotAllocationExampleRow: (string | number)[] = [
  1, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
];

export function buildWorkerPlotAllocationTemplateMatrix() {
  return [...workerPlotAllocationHeaders, workerPlotAllocationExampleRow];
}
