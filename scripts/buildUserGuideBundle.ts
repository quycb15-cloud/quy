import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { createImportTemplateWorkbook, type TemplateDataset, type TemplateSample } from "../client/src/lib/dataToolsTemplate";
import { buildCareTemplateSheets } from "../client/src/lib/careExcel";

const outputRoot = process.argv[2] ?? "/home/ubuntu/webdev-static-assets/cn386-user-guide/excel-bundle";
const importDir = path.join(outputRoot, "01-mau-import");
const exportDir = path.join(outputRoot, "02-mau-export");
fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(importDir, { recursive: true });
fs.mkdirSync(exportDir, { recursive: true });

function saveWorkbook(book: XLSX.WorkBook, filePath: string) {
  const bytes = XLSX.write(book, { type: "buffer", bookType: "xlsx" });
  fs.writeFileSync(filePath, bytes);
}

const labels: Record<TemplateDataset, string> = {
  plots: "Vườn / lô",
  plotIndicators: "Chỉ số cây định kỳ",
  workers: "Nhân công",
  teamImports: "Nhập mủ theo đội",
  teamExports: "Xuất mủ theo đội",
  workerPlotAllocations: "Phân chia nhân công vườn cây",
  productionPlans: "Kế hoạch sản lượng tháng/năm",
  technicalSkillMonthly: "Tổng hợp tay nghề và hao dăm",
  technicalSkillEvaluations: "Đánh giá tay nghề nhân công",
};

const samples: Record<TemplateDataset, TemplateSample> = {
  plots: { "Đơn vị": "", "Loại vườn": "A", "Tên lô": "", "Năm trồng": "", Giống: "", "Từ hàng": "", "Đến hàng": "", "Diện tích (ha)": "", "Tổng số hố kiểm kê": "", "Tổng số cây kiểm kê": "", "Cây cạo": "", "Mật độ cây cạo/ha": "", "Xếp hạng vườn cây": "" },
  plotIndicators: { "Mã lô": "", "Ngày cập nhật": "2026-09-17", "Tổng số hố kiểm kê": "", "Tổng số cây kiểm kê": "", "Cây cạo": "", "Cây chưa đủ tiêu chuẩn": "", "Cây không hiệu quả": "", "Cây bệnh không cạo": "", "Cây khô miệng cạo": "", "Hố trống": "", "Mật độ cây cạo/ha": "", "Xếp hạng vườn cây": "" },
  workers: { Đội: "Đội 1", Tên: "Nguyễn Văn A", "Mã số": "D1-01", "Tên phiên âm": "Nguyễn A", "Giới tính": "Nam", "Số điện thoại": "0901234567", "Trạng thái làm việc": "Đang làm việc", "Vai trò": "Công nhân khai thác", "Ghi chú": "Hàng ví dụ — xóa hoặc thay trước khi import" },
  teamImports: { Đợt: "Đợt 1", Ngày: "", Đội: "", Vườn: "", "Mủ đông, tạp (kg)": "", "Mủ dây (kg)": "" },
  teamExports: { Đợt: "Đợt 1", Ngày: "", Đội: "", "Mủ đông, tạp (kg)": "", "Mủ dây (kg)": "" },
  workerPlotAllocations: { Đội: "Đội 1", "Nhân công": "", "Mã số nhân công": "", "Vườn A/B/C": "A", "Mã lô": "", "Từ hàng": "", "Đến hàng": "", "Diện tích (ha)": "" },
  productionPlans: { "Đơn vị": "Đội 1", "Năm": 2026, "Tháng": 0, "ĐVT": "ha", "Diện tích": "", "Kế hoạch mủ đông, tạp (kg)": "", "Kế hoạch mủ quy khô (kg)": "", "Ghi chú": "" },
  technicalSkillMonthly: { Đội: "Đội 1", "Tháng báo cáo": "2026-08", "Quân số": "", "Xuất sắc": "", "Giỏi": "", "Khá": "", "Trung bình": "", "Yếu": "", "Hao dăm số thợ": "", "Ghi chú": "" },
  technicalSkillEvaluations: { Đội: "Đội 1", "Tên nhân công": "", "Mã số": "", "Ngày đánh giá": "2026-08-30", "Kỳ đánh giá": "2026-08", "Lỗi kỹ thuật": "", "Kết quả đánh giá": "Xuất sắc", "Năng suất": "", "Hao dăm": "Không", "Nhận xét": "" },
};

const importFileNames: Record<TemplateDataset, string> = {
  plots: "01-mau-import-vuon-lo.xlsx",
  plotIndicators: "02-mau-import-chi-so-cay-dinh-ky.xlsx",
  workers: "03-mau-import-nhan-cong.xlsx",
  teamImports: "04-mau-import-nhap-mu-theo-doi.xlsx",
  teamExports: "05-mau-import-xuat-mu-theo-doi.xlsx",
  workerPlotAllocations: "06-mau-import-phan-chia-nhan-cong-vuon-cay.xlsx",
  productionPlans: "07-mau-import-ke-hoach-san-luong.xlsx",
  technicalSkillMonthly: "08-mau-import-tong-hop-tay-nghe-hao-dam.xlsx",
  technicalSkillEvaluations: "09-mau-import-danh-gia-tay-nghe-nhan-cong.xlsx",
};

for (const dataset of Object.keys(labels) as TemplateDataset[]) {
  const { book } = createImportTemplateWorkbook(XLSX, dataset, labels, samples, []);
  saveWorkbook(book, path.join(importDir, importFileNames[dataset]));
}

const careBook = XLSX.utils.book_new();
for (const sheet of buildCareTemplateSheets()) {
  const worksheet = sheet.matrix ? XLSX.utils.aoa_to_sheet(sheet.matrix) : XLSX.utils.json_to_sheet(sheet.rows);
  XLSX.utils.book_append_sheet(careBook, worksheet, sheet.name.slice(0, 31));
}
saveWorkbook(careBook, path.join(importDir, "10-mau-import-khai-thac-cham-soc-5-sheet.xlsx"));

const plotProductionBook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(plotProductionBook, XLSX.utils.aoa_to_sheet([
  ["Tháng", "Năm", "Đội", "Mã lô", "Tên lô", "Năm trồng", "Diện tích (ha)", "Mủ đông, tạp (kg)", "Quy khô (kg)", "Ghi chú"],
  [9, 2026, "Đội 1", "LO-001", "Lô 1", 2011, 18.9, "", "", "Xóa hoặc thay dòng ví dụ"],
]), "Sản lượng theo lô");
XLSX.utils.book_append_sheet(plotProductionBook, XLSX.utils.aoa_to_sheet([
  ["HƯỚNG DẪN IMPORT SẢN LƯỢNG THEO LÔ"],
  ["Giữ Mã lô hoặc Tên lô để hệ thống nhận diện đúng. Tải mẫu trực tiếp từ phần mềm nếu cần danh mục lô hiện tại."],
  ["Bản ghi trùng Lô, Tháng và Năm sẽ được cập nhật, không tạo bản sao."],
]), "Hướng dẫn");
saveWorkbook(plotProductionBook, path.join(importDir, "11-mau-import-san-luong-theo-lo.xlsx"));

const plotDirectBook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(plotDirectBook, XLSX.utils.aoa_to_sheet([
  ["TT", "Đơn vị", "Tên lô", "Năm trồng", "Giống", "Diện tích (ha)", "Tổng số hố kiểm kê", "Tổng số cây kiểm kê", "Cây cạo - SL", "Cây cạo - %", "Cây chưa đủ tiêu chuẩn - SL", "Cây chưa đủ tiêu chuẩn - %", "Cây không hiệu quả - SL", "Cây không hiệu quả - %", "Cây bệnh không cạo - SL", "Cây bệnh không cạo - %", "Cây khô miệng cạo - SL", "Cây khô miệng cạo - %", "Hố trống", "Mật độ cây cạo/ha", "Xếp hạng vườn cây"],
  [1, "Đội 1", 1, 2011, "LH90/952", 18.9, 524, 9963, 7914, 79.43, 32, 0.32, 29, 0.29, 1, 0.01, 1987, 19.94, 524, 419, "C"],
]), "Danh sách Lô");
saveWorkbook(plotDirectBook, path.join(importDir, "12-mau-import-lo-truc-tiep-tai-trang-vuon.xlsx"));

const workerDirectBook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workerDirectBook, XLSX.utils.aoa_to_sheet([
  ["Đội", "Tên", "Mã số", "Tên phiên âm", "Giới tính", "Số điện thoại", "Trạng thái làm việc", "Vai trò", "Ghi chú"],
  ["Đội 1", "Nguyễn Văn A", "D1-01", "Nguyễn A", "Nam", "0901234567", "Đang làm việc", "Công nhân khai thác", "Hàng ví dụ — xóa hoặc thay trước khi import"],
]), "Nhân công");
saveWorkbook(workerDirectBook, path.join(importDir, "13-mau-import-nhan-cong-truc-tiep.xlsx"));

const workerCodeBook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workerCodeBook, XLSX.utils.aoa_to_sheet([["Đội", "Tên phiên âm", "Mã số"]]), "Mã số nhân công");
saveWorkbook(workerCodeBook, path.join(importDir, "14-mau-nhap-ma-so-nhan-cong.xlsx"));

function exportWorkbook(fileName: string, sheets: Array<[string, string[]]>) {
  const book = XLSX.utils.book_new();
  for (const [sheetName, headers] of sheets) XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([headers]), sheetName.slice(0, 31));
  const note = XLSX.utils.aoa_to_sheet([
    ["MẪU CẤU TRÚC FILE EXPORT"],
    ["File này chỉ mô tả tên sheet và cột. Dữ liệu thực phải được xuất trực tiếp từ phần mềm theo quyền và bộ lọc tại thời điểm sử dụng."],
  ]);
  XLSX.utils.book_append_sheet(book, note, "Hướng dẫn");
  saveWorkbook(book, path.join(exportDir, fileName));
}

exportWorkbook("01-mau-xuat-toan-bo-du-lieu.xlsx", [
  ["Vườn lô", ["Mã lô", "Tên lô", "Đơn vị", "Loại vườn", "Từ hàng", "Đến hàng", "Diện tích (ha)", "Năm trồng", "Giống", "Cây cạo", "Xếp hạng vườn cây"]],
  ["Chỉ số cây", ["Mã lô", "Ngày cập nhật", "Tổng số hố kiểm kê", "Tổng số cây kiểm kê", "Cây cạo", "Cây chưa đủ tiêu chuẩn", "Cây không hiệu quả", "Cây bệnh không cạo", "Cây khô miệng cạo", "Hố trống", "Mật độ cây cạo/ha", "Xếp hạng vườn cây"]],
  ["Nhân công", ["Đội", "Tên", "Mã số", "Tên phiên âm", "Giới tính", "Số điện thoại", "Trạng thái làm việc", "Vai trò", "Ghi chú"]],
  ["Nhập mủ đội", ["Đợt", "Ngày", "Đội", "Vườn", "Mủ đông, tạp (kg)", "Mủ dây (kg)", "Cộng nhập (kg)"]],
  ["Xuất mủ đội", ["Đợt", "Ngày", "Đội", "Mủ đông, tạp (kg)", "Mủ dây (kg)", "Cộng xuất (kg)"]],
  ["Sản lượng theo lô", ["Ngày", "Đội", "Mã lô", "Tên lô", "Năm trồng", "Diện tích (ha)", "Mủ đông, tạp (kg)", "Quy khô (kg)", "Ghi chú", "Nguồn"]],
  ["Phân công nhân công", ["Đội", "Nhân công", "Mã số nhân công", "Vườn A/B/C", "Mã lô", "Tên lô", "Từ hàng", "Đến hàng", "Diện tích (ha)", "Tổng cây cạo"]],
]);
exportWorkbook("02-mau-xuat-nhat-ky-nhap-mu.xlsx", [["Nhật ký Nhập mủ", ["Ngày nhập", "Vườn/Lô", "Đội", "Đợt", "Mủ đông (kg)", "Mủ dây (kg)", "Cộng nhập (kg)", "Ghi chú"]]]);
exportWorkbook("03-mau-xuat-nhat-ky-xuat-mu.xlsx", [["Nhật ký Xuất mủ", ["Ngày xuất", "Đội", "Đợt", "Mủ đông tạp (kg)", "Mủ dây (kg)", "Cộng xuất (kg)", "Người lập", "Ghi chú"]]]);
exportWorkbook("04-mau-xuat-bao-cao-tien-do.xlsx", [["Báo cáo tiến độ", ["Đội", "Nhập theo ngày", "Cộng mủ đông", "Mủ dây nhập", "Cộng nhập", "Mủ đông tạp xuất", "Mủ dây xuất", "Cộng xuất", "Hao kho"]]]);
exportWorkbook("05-mau-xuat-hao-hut-kho.xlsx", [["Hao hụt kho", ["Kỳ", "Đội", "Cộng nhập", "Cộng xuất", "Hao hụt kho (kg)", "Hao hụt kho (%)"]]]);
exportWorkbook("06-mau-xuat-tang-giam-san-luong.xlsx", [["Tăng giảm sản lượng", ["Kỳ", "Tháng", "Đội", "Cộng nhập", "Cộng xuất", "Hao kho"]]]);
exportWorkbook("07-mau-xuat-san-luong-theo-lo.xlsx", [["Sản lượng theo lô", ["Đội", "Lô", "Năm trồng", "Diện tích (ha)", "Mủ đông, tạp", "Quy khô"]]]);
exportWorkbook("08-mau-xuat-quan-ly-nhan-cong.xlsx", [
  ["Đội ngũ quản lý", ["Nhóm quản lý", "Biên chế", "Hiện có", "Đang hoạt động", "Thừa", "Thiếu"]],
  ["Tổng hợp theo đội", ["Đội", "Biên chế", "Hiện có", "Đang hoạt động", "Không hoạt động", "Thừa", "Thiếu"]],
  ["Danh sách nhân công", ["Đội", "Mã số", "Tên phiên âm", "Vai trò", "Trạng thái"]],
]);
exportWorkbook("09-mau-xuat-khai-thac-cham-soc.xlsx", [
  ["Theo dõi cạo mủ", ["Ngày", "Đội", "Vườn", "KH", "TH", "Lũy kế", "% hoàn thành", "Chưa cạo", "Cạo chưa xong", "Cạo tiếp vườn", "KH tiếp (Vườn)", "TH tiếp (Vườn)", "Ghi chú"]],
  ["Rập thiết kế, trang bị", ["Ngày", "Đội", "KH", "TH", "Lũy kế", "Đơn vị tính", "Ghi chú"]],
  ["Chăm sóc", ["Ngày", "Đội", "Nội dung công việc", "KH", "TH", "Lũy kế", "Đơn vị tính", "Ghi chú"]],
  ["Phun, bôi thuốc", ["Ngày", "Đội", "Nội dung công việc", "KH", "TH", "Lũy kế", "Đơn vị tính", "Ghi chú"]],
  ["Bón phân", ["Ngày", "Đội", "Nội dung công việc", "KH", "TH", "Lũy kế", "Đơn vị tính", "Ghi chú"]],
]);

fs.writeFileSync(path.join(outputRoot, "README.txt"), [
  "BỘ MẪU EXCEL CAO SU CN386 — 17/09/2026",
  "",
  "Thư mục 01-mau-import chứa các mẫu để chuẩn bị dữ liệu nhập.",
  "Thư mục 02-mau-export chỉ mô tả cấu trúc file xuất, không chứa dữ liệu sản xuất thật.",
  "",
  "Luôn ưu tiên tải mẫu mới nhất trực tiếp từ phần mềm vì danh mục Lô và cấu trúc có thể được cập nhật.",
  "Không đổi tên sheet/cột; xóa hoặc thay dòng ví dụ; kiểm tra bản xem trước và dòng lỗi trước khi bấm Nhập.",
  "Dữ liệu export thực tế phải được tải trực tiếp từ phần mềm theo quyền và bộ lọc hiện tại.",
].join("\n"));

console.log(outputRoot);
