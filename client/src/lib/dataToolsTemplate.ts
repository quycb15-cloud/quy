import { buildWorkerPlotAllocationTemplateMatrix, buildWorkerPlotListMatrix, workerPlotAllocationMerges } from "./workerPlotAllocationWorkbook";
import type { WorkerPlotTemplatePlot } from "./workerPlotAllocationWorkbook";
import { buildProductionPlanTemplateMatrix, buildTechnicalSkillTemplateMatrix, productionPlanMerges, technicalSkillMerges } from "./reportImportWorkbook";

export type TemplateDataset = "plots" | "plotIndicators" | "workers" | "teamImports" | "teamExports" | "workerPlotAllocations" | "productionPlans" | "technicalSkillMonthly" | "technicalSkillEvaluations";
export type TemplateSample = Record<string, string | number>;

export function createImportTemplateWorkbook(XLSX: any, dataset: TemplateDataset, labels: Record<TemplateDataset, string>, samples: Record<TemplateDataset, TemplateSample>, plotOptions: WorkerPlotTemplatePlot[] = []) {
  const book = XLSX.utils.book_new();
  const isGroupedTemplate = dataset === "workerPlotAllocations" || dataset === "productionPlans" || dataset === "technicalSkillMonthly";
  const matrix = dataset === "workerPlotAllocations" ? buildWorkerPlotAllocationTemplateMatrix() : dataset === "productionPlans" ? buildProductionPlanTemplateMatrix() : dataset === "technicalSkillMonthly" ? buildTechnicalSkillTemplateMatrix() : null;
  const sheet = matrix ? XLSX.utils.aoa_to_sheet(matrix) : XLSX.utils.json_to_sheet([samples[dataset]]);
  if (isGroupedTemplate) {
    const merges = dataset === "workerPlotAllocations" ? workerPlotAllocationMerges : dataset === "productionPlans" ? productionPlanMerges : technicalSkillMerges;
    sheet["!merges"] = merges.map((range: string) => XLSX.utils.decode_range(range));
    sheet["!cols"] = Array.from({ length: matrix?.[0]?.length ?? 13 }, (_unknown: unknown, index: number) => ({ wch: index === 1 ? 18 : index === 2 ? 12 : 15 }));
    sheet["!rows"] = [{ hpt: 24 }, { hpt: 32 }, { hpt: 42 }, { hpt: 22 }];
  }
  const sheetName = labels[dataset].replace(/[\\\\/:?*\[\]]/g, " ").replace(/\s+/g, " ").trim().slice(0, 31);
  XLSX.utils.book_append_sheet(book, sheet, sheetName);
  if (dataset === "workerPlotAllocations" && plotOptions.length) {
    const plotList = XLSX.utils.aoa_to_sheet(buildWorkerPlotListMatrix(plotOptions));
    plotList["!cols"] = [{ wch: 14 }, { wch: 18 }, { wch: 24 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(book, plotList, "Danh sách Lô");
  }
  const guide = XLSX.utils.aoa_to_sheet([
    [`MẪU IMPORT ${labels[dataset].toUpperCase()}`],
    [dataset === "workerPlotAllocations" ? "Điền Mã công nhân, Lô (Tên hiển thị) theo sheet Danh sách Lô, Hàng - hàng, Diện tích và Tổng cây cạo trong các nhóm Vườn A/B/C; hệ thống tự đối chiếu về đúng Lô theo Đội và năm trồng." : dataset === "productionPlans" ? "Điền Đơn vị, Kế hoạch năm, Kế hoạch tháng (0 nếu là kế hoạch năm), kế hoạch mủ đông/tạp, mủ dây, quy khô từ mủ đông/tạp và quy khô từ mủ dây." : dataset === "technicalSkillMonthly" ? "Mỗi dòng là một Đội trong một ngày thuộc tháng báo cáo; nhập quân số, số thợ theo năm cấp tay nghề, Hao dăm tháng hiện tại, tháng trước và chênh lệch nếu có." : dataset === "technicalSkillEvaluations" ? "Mỗi dòng là một nhân công; nhập Đội, Tên nhân công hoặc Mã số, Ngày/Kỳ đánh giá, Lỗi kỹ thuật tùy chọn, Kết quả đánh giá, Năng suất 0-100 và Hao dăm Có/Không." : "Xóa dòng trống mẫu và điền dữ liệu từ dòng 2."],
    ["Các bản ghi trùng khóa sẽ được cập nhật, không tạo bản sao."],
  ]);
  XLSX.utils.book_append_sheet(book, guide, "Hướng dẫn");
  return { book, fileName: `mau-import-${dataset}.xlsx` };
}

export function downloadWorkbookFile(XLSX: any, workbook: any, fileName: string) {
  const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
