import { describe, expect, it } from "vitest";
import { buildWorkerPlotAllocationTemplateMatrix, workerPlotAllocationMerges } from "./workerPlotAllocationWorkbook";

describe("workerPlotAllocationWorkbook", () => {
  it("builds the requested grouped allocation layout", () => {
    const matrix = buildWorkerPlotAllocationTemplateMatrix();
    expect(matrix[0]).toEqual(["TT", "Mã công nhân", "VƯỜN A", "", "", "", "VƯỜN B", "", "", "", "VƯỜN C", "", "", "", "TỔNG DIỆN TÍCH", "TỔNG CÂY CẠO", "GHI CHÚ"]);
    expect(matrix[1]).toEqual(["", "", "Lô (Tên hiển thị)", "Hàng - hàng", "Diện tích", "Tổng cây cạo", "Lô (Tên hiển thị)", "Hàng - hàng", "Diện tích", "Tổng cây cạo", "Lô (Tên hiển thị)", "Hàng - hàng", "Diện tích", "Tổng cây cạo", "", "", ""]);
    expect(matrix[2]).toHaveLength(17);
    expect(workerPlotAllocationMerges).toContain("C1:F1");
    expect(workerPlotAllocationMerges).toContain("G1:J1");
    expect(workerPlotAllocationMerges).toContain("K1:N1");
  });
});
