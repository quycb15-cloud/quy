import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export type PlotImportRow = {
  code: string;
  name: string;
  unit: string;
  areaHa: number;
  gardenType?: null;
  tappingDay?: number | null;
  tappingTrees?: number | null;
  immatureTrees?: number | null;
  nonproductiveTrees?: number | null;
  diseasedTrees?: number | null;
  dryTappingTrees?: number | null;
  emptyPits?: number | null;
  rowStart?: number | null;
  rowEnd?: number | null;
  note?: string | null;
  plantedYear?: number | null;
  cultivar?: string | null;
  inventoryPits?: number | null;
  inventoryTrees?: number | null;
  tappingDensity?: number | null;
  plotRank?: string | null;
  inventoryTreesPercent?: number | null;
  tappingTreesPercent?: number | null;
  immatureTreesPercent?: number | null;
  nonproductiveTreesPercent?: number | null;
  diseasedTreesPercent?: number | null;
  dryTappingTreesPercent?: number | null;
};

type PreviewRow = PlotImportRow & { error?: string };
const text = (value: unknown) => String(value ?? "").trim();
const optionalNumber = (value: unknown) => { const parsed = Number(String(value ?? "").replace(/,/g, "")); return value === "" || value == null || Number.isNaN(parsed) ? null : parsed; };
const safeCode = (unit: string, year: number | null, lot: string) => `LO-${unit}-${year || "NA"}-${lot}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/Đ/g, "D").replace(/đ/g, "d").replace(/[^A-Za-z0-9]+/g, "-").replace(/(^-|-$)/g, "").toUpperCase().slice(0, 48);
const percentOf = (count: number | null, total: number | null) => count != null && total ? Number(((count / total) * 100).toFixed(2)) : null;
const percentMatches = (provided: number | null, calculated: number | null) => provided == null || calculated == null || Math.abs(provided - calculated) <= 0.5;

export function parsePlotImportRows(rawRows: Record<string, unknown>[]): PreviewRow[] {
  const seenCodes = new Set<string>();
  return rawRows.map((row, index) => {
    const unit = text(row["Đơn vị"] ?? row["Đội"] ?? row["Unit"]);
    const lot = text(row["Tên lô"] ?? row["Tên Lô"] ?? row["Tên"] ?? row["Name"]);
    const plantedYear = optionalNumber(row["Năm trồng"] ?? row["plantedYear"]);
    const parsed: PlotImportRow = {
      code: text(row["Mã lô"] ?? row["Mã Lô"] ?? row["Code"]) || safeCode(unit, plantedYear, lot),
      name: lot,
      unit,
      areaHa: optionalNumber(row["Diện tích (ha)"] ?? row["Diện tích"] ?? row["areaHa"]) || 0,
      gardenType: null,
      tappingDay: optionalNumber(row["Ngày cạo"] ?? row["Tapping day"]),
      rowStart: optionalNumber(row["Từ hàng"] ?? row["Hàng từ"] ?? row["rowStart"]),
      rowEnd: optionalNumber(row["Đến hàng"] ?? row["Hàng đến"] ?? row["rowEnd"]),
      tappingTrees: optionalNumber(row["Cây cạo - SL"] ?? row["Cây cạo"] ?? row["Số cây cạo"] ?? row["tappingTrees"]),
      immatureTrees: optionalNumber(row["Cây chưa đủ tiêu chuẩn - SL"] ?? row["Cây chưa đủ tiêu chuẩn"] ?? row["immatureTrees"]),
      nonproductiveTrees: optionalNumber(row["Cây không hiệu quả - SL"] ?? row["Cây không hiệu quả"] ?? row["nonproductiveTrees"]),
      diseasedTrees: optionalNumber(row["Cây bệnh không cạo - SL"] ?? row["Cây bệnh không cạo"] ?? row["diseasedTrees"]),
      dryTappingTrees: optionalNumber(row["Cây khô miệng cạo - SL"] ?? row["Cây khô miệng cạo"] ?? row["dryTappingTrees"]),
      emptyPits: optionalNumber(row["Hố trống"] ?? row["emptyPits"]),
      note: text(row["Ghi chú"] ?? row["Note"]) || null,
      plantedYear,
      cultivar: text(row["Giống"] ?? row["Cultivar"]) || null,
      inventoryPits: optionalNumber(row["Tổng số hố kiểm kê"] ?? row["Số hố"] ?? row["inventoryPits"]),
      inventoryTrees: optionalNumber(row["Tổng số cây kiểm kê"] ?? row["Số cây"] ?? row["inventoryTrees"]),
      tappingDensity: optionalNumber(row["Mật độ cây cạo/ha"] ?? row["Mật độ cạo"] ?? row["tappingDensity"]),
      plotRank: text(row["Xếp hạng vườn cây"] ?? row["Xếp hạng"] ?? row["plotRank"]) || null,
      inventoryTreesPercent: optionalNumber(row["Tổng số cây kiểm kê - %"]),
      tappingTreesPercent: optionalNumber(row["Cây cạo - %"]),
      immatureTreesPercent: optionalNumber(row["Cây chưa đủ tiêu chuẩn - %"]),
      nonproductiveTreesPercent: optionalNumber(row["Cây không hiệu quả - %"]),
      diseasedTreesPercent: optionalNumber(row["Cây bệnh không cạo - %"]),
      dryTappingTreesPercent: optionalNumber(row["Cây khô miệng cạo - %"]),
    };
    let error = !parsed.name ? "Thiếu Tên lô" : !parsed.unit ? "Thiếu Đơn vị" : parsed.areaHa <= 0 || Number.isNaN(parsed.areaHa) ? "Diện tích phải lớn hơn 0" : undefined;
    const percentChecks: Array<[number | null | undefined, number | null, string]> = [
      [parsed.tappingTreesPercent, percentOf(parsed.tappingTrees ?? null, parsed.inventoryTrees ?? null), "Cây cạo"],
      [parsed.immatureTreesPercent, percentOf(parsed.immatureTrees ?? null, parsed.inventoryTrees ?? null), "Cây chưa đủ tiêu chuẩn"],
      [parsed.nonproductiveTreesPercent, percentOf(parsed.nonproductiveTrees ?? null, parsed.inventoryTrees ?? null), "Cây không hiệu quả"],
      [parsed.diseasedTreesPercent, percentOf(parsed.diseasedTrees ?? null, parsed.inventoryTrees ?? null), "Cây bệnh không cạo"],
      [parsed.dryTappingTreesPercent, percentOf(parsed.dryTappingTrees ?? null, parsed.inventoryTrees ?? null), "Cây khô miệng cạo"],
    ];
    const mismatch = percentChecks.find(([provided, calculated]) => !percentMatches(provided ?? null, calculated));
    if (!error && mismatch) error = `Tỷ lệ ${mismatch[2]} không khớp SL/Tổng cây kiểm kê (sai số cho phép 0,5 điểm %) `;
    if (parsed.rowStart != null && parsed.rowEnd != null && parsed.rowStart > parsed.rowEnd) error = error || "Từ hàng phải nhỏ hơn hoặc bằng Đến hàng";
    if (parsed.code) {
      if (seenCodes.has(parsed.code.toLocaleLowerCase())) error = error || "Trùng Mã lô trong file";
      seenCodes.add(parsed.code.toLocaleLowerCase());
    }
    return { ...parsed, error: error ? `Dòng ${index + 2}: ${error}` : undefined };
  });
}

export default function PlotImportDialog({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const importPlots = trpc.dataTools.import.plots.useMutation({
    onSuccess: result => { toast.success(`Đã import ${result.imported} Lô`); setRows([]); setOpen(false); onImported(); },
    onError: error => toast.error(error.message),
  });
  const downloadTemplate = async () => {
    const XLSX = await import("xlsx");
    const book = XLSX.utils.book_new();
    const sample = [["TT", "Đơn vị", "Tên lô", "Năm trồng", "Giống", "Diện tích (ha)", "Tổng số hố kiểm kê", "Tổng số cây kiểm kê", "Cây cạo - SL", "Cây cạo - %", "Cây chưa đủ tiêu chuẩn - SL", "Cây chưa đủ tiêu chuẩn - %", "Cây không hiệu quả - SL", "Cây không hiệu quả - %", "Cây bệnh không cạo - SL", "Cây bệnh không cạo - %", "Cây khô miệng cạo - SL", "Cây khô miệng cạo - %", "Hố trống", "Mật độ cây cạo/ha", "Xếp hạng vườn cây"], [1, "Đội 1", 1, 2011, "LH90/952", 18.9, 524, 9963, 7914, 79.43, 32, 0.32, 29, 0.29, 1, 0.01, 1987, 19.94, 524, 419, "C"]];
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(sample), "Danh sách Lô");
    XLSX.writeFile(book, "mau-import-lo.xlsx");
  };
  const readWorkbook = async (file: File) => {
    try { const XLSX = await import("xlsx"); const book = XLSX.read(await file.arrayBuffer(), { type: "array" }); const sheet = book.Sheets[book.SheetNames[0]]; if (!sheet) throw new Error("File Excel không có sheet dữ liệu"); const parsed = parsePlotImportRows(XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })); if (!parsed.length) throw new Error("File Excel chưa có dòng dữ liệu"); setRows(parsed); } catch (error) { toast.error(error instanceof Error ? error.message : "Không đọc được file Excel"); }
  };
  const errors = rows.filter(row => row.error);
  const validRows = rows.filter(row => !row.error).map(({ error: _error, ...row }) => row);
  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) setRows([]); }}>
    <DialogTrigger asChild><Button variant="outline" className="bg-white"><Upload className="mr-2 h-4 w-4" />Import Lô Excel</Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl"><DialogHeader><DialogTitle>Import danh sách Lô từ Excel</DialogTitle><DialogDescription>Nhập Mã lô, Tên lô, Đội và Diện tích. Lô chưa được phân loại Vườn A/B/C; có thể bổ sung sau.</DialogDescription></DialogHeader>
      <div className="grid gap-4 pt-2"><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={downloadTemplate}><Download className="mr-2 h-4 w-4" />Tải mẫu Excel</Button><label className="inline-flex h-10 cursor-pointer items-center rounded-md border border-input bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><FileSpreadsheet className="mr-2 h-4 w-4" />Chọn file Excel<input type="file" accept=".xlsx,.xls" className="sr-only" onChange={event => { const file = event.target.files?.[0]; if (file) void readWorkbook(file); event.currentTarget.value = ""; }} /></label></div>
        {rows.length ? <><div className={`rounded-xl border p-3 text-sm ${errors.length ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-100 bg-emerald-50 text-emerald-800"}`}>{errors.length ? `Có ${errors.length} dòng lỗi; hãy sửa file rồi chọn lại.` : `Đã kiểm tra ${validRows.length} Lô hợp lệ. Không phân loại Vườn trong bước import này.`}</div><div className="max-h-72 overflow-auto rounded-xl border border-slate-200"><table className="w-full min-w-[1000px] text-left text-sm"><thead><tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500"><th className="px-3 py-2">Dòng</th><th className="px-3 py-2">Mã lô</th><th className="px-3 py-2">Tên lô</th><th className="px-3 py-2">Đội</th><th className="px-3 py-2">Diện tích</th><th className="px-3 py-2">Năm trồng</th><th className="px-3 py-2">Tổng cây KT</th><th className="px-3 py-2">Cây cạo</th><th className="px-3 py-2">Chưa đạt</th><th className="px-3 py-2">Không hiệu quả</th><th className="px-3 py-2">Bệnh</th><th className="px-3 py-2">Khô miệng</th><th className="px-3 py-2">Hố trống</th><th className="px-3 py-2">Mật độ</th><th className="px-3 py-2">Xếp hạng</th><th className="px-3 py-2">Kiểm tra</th></tr></thead><tbody>{rows.slice(0, 50).map((row, index) => <tr key={`${row.code}-${index}`} className="border-t border-slate-100"><td className="px-3 py-2">{index + 2}</td><td className="px-3 py-2 font-semibold">{row.code || "—"}</td><td className="px-3 py-2">{row.name || "—"}</td><td className="px-3 py-2">{row.unit || "—"}</td><td className="px-3 py-2">{row.areaHa || "—"}</td><td className="px-3 py-2">{row.plantedYear || "—"}</td><td className="px-3 py-2">{row.inventoryTrees ?? "—"}</td><td className="px-3 py-2">{row.tappingTrees ?? "—"} {row.tappingTreesPercent != null ? `(${row.tappingTreesPercent}%)` : ""}</td><td className="px-3 py-2">{row.immatureTrees ?? "—"} {row.immatureTreesPercent != null ? `(${row.immatureTreesPercent}%)` : ""}</td><td className="px-3 py-2">{row.nonproductiveTrees ?? "—"} {row.nonproductiveTreesPercent != null ? `(${row.nonproductiveTreesPercent}%)` : ""}</td><td className="px-3 py-2">{row.diseasedTrees ?? "—"} {row.diseasedTreesPercent != null ? `(${row.diseasedTreesPercent}%)` : ""}</td><td className="px-3 py-2">{row.dryTappingTrees ?? "—"} {row.dryTappingTreesPercent != null ? `(${row.dryTappingTreesPercent}%)` : ""}</td><td className="px-3 py-2">{row.emptyPits ?? "—"}</td><td className="px-3 py-2">{row.tappingDensity ?? "—"}</td><td className="px-3 py-2">{row.plotRank || "—"}</td><td className={`px-3 py-2 font-medium ${row.error ? "text-rose-700" : "text-emerald-700"}`}>{row.error || "Hợp lệ"}</td></tr>)}</tbody></table></div>{rows.length > 50 ? <p className="text-xs text-slate-500">Chỉ hiển thị 50 dòng đầu để xem trước.</p> : null}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setRows([]); setOpen(false); }}>Hủy</Button><Button type="button" disabled={Boolean(errors.length) || !validRows.length || importPlots.isPending} className="bg-emerald-700 hover:bg-emerald-800" onClick={() => importPlots.mutate({ rows: validRows })}>{importPlots.isPending ? "Đang import…" : `Xác nhận import ${validRows.length} Lô`}</Button></div></> : <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">Cột bắt buộc theo mẫu: <b>Đơn vị</b>, <b>Tên lô</b>, <b>Năm trồng</b>, <b>Diện tích (ha)</b>. Các cột SL kiểm kê/cây được lưu; các cột % được dùng để đối chiếu theo Tổng số cây kiểm kê và không cần nhập riêng. Cột Vườn không dùng ở bước này.</div>}
      </div></DialogContent>
  </Dialog>;
}
