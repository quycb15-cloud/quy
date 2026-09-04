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
  rowStart?: number | null;
  rowEnd?: number | null;
  tappingTrees?: number | null;
  note?: string | null;
  plantedYear?: number | null;
  cultivar?: string | null;
  inventoryPits?: number | null;
  inventoryTrees?: number | null;
  tappingDensity?: number | null;
  plotRank?: string | null;
};

type PreviewRow = PlotImportRow & { error?: string };
const text = (value: unknown) => String(value ?? "").trim();
const optionalNumber = (value: unknown) => { const parsed = Number(value); return value === "" || value == null || Number.isNaN(parsed) ? null : parsed; };

export function parsePlotImportRows(rawRows: Record<string, unknown>[]): PreviewRow[] {
  const seenCodes = new Set<string>();
  return rawRows.map((row, index) => {
    const parsed: PlotImportRow = {
      code: text(row["Mã lô"] ?? row["Mã Lô"] ?? row["Code"]),
      name: text(row["Tên lô"] ?? row["Tên Lô"] ?? row["Tên"] ?? row["Name"]),
      unit: text(row["Đội"] ?? row["Đơn vị"] ?? row["Unit"]),
      areaHa: Number(row["Diện tích (ha)"] ?? row["Diện tích"] ?? row["areaHa"] ?? 0),
      gardenType: null,
      tappingDay: optionalNumber(row["Ngày cạo"] ?? row["Tapping day"]),
      rowStart: optionalNumber(row["Từ hàng"] ?? row["Hàng từ"] ?? row["rowStart"]),
      rowEnd: optionalNumber(row["Đến hàng"] ?? row["Hàng đến"] ?? row["rowEnd"]),
      tappingTrees: optionalNumber(row["Số cây cạo"] ?? row["Cây cạo"] ?? row["tappingTrees"]),
      note: text(row["Ghi chú"] ?? row["Note"]) || null,
      plantedYear: optionalNumber(row["Năm trồng"] ?? row["plantedYear"]),
      cultivar: text(row["Giống"] ?? row["Cultivar"]) || null,
      inventoryPits: optionalNumber(row["Số hố"] ?? row["inventoryPits"]),
      inventoryTrees: optionalNumber(row["Số cây"] ?? row["inventoryTrees"]),
      tappingDensity: optionalNumber(row["Mật độ cạo"] ?? row["tappingDensity"]),
      plotRank: text(row["Xếp hạng"] ?? row["plotRank"]) || null,
    };
    let error = !parsed.code ? "Thiếu Mã lô" : !parsed.name ? "Thiếu Tên lô" : !parsed.unit ? "Thiếu Đội" : parsed.areaHa <= 0 || Number.isNaN(parsed.areaHa) ? "Diện tích phải lớn hơn 0" : undefined;
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
    const sample = [["Mã lô", "Tên lô", "Đội", "Diện tích (ha)", "Năm trồng", "Từ hàng", "Đến hàng", "Số cây cạo", "Ngày cạo", "Giống", "Số hố", "Số cây", "Mật độ cạo", "Xếp hạng", "Ghi chú"], ["LO-DOI-1-2011-01", "Lô 1 (2011)", "Đội 1", 12.345, 2011, 1, 20, 460, 1, "RRIV 4", 500, 490, 420, "A", ""]];
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
        {rows.length ? <><div className={`rounded-xl border p-3 text-sm ${errors.length ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-100 bg-emerald-50 text-emerald-800"}`}>{errors.length ? `Có ${errors.length} dòng lỗi; hãy sửa file rồi chọn lại.` : `Đã kiểm tra ${validRows.length} Lô hợp lệ. Không phân loại Vườn trong bước import này.`}</div><div className="max-h-72 overflow-auto rounded-xl border border-slate-200"><table className="w-full min-w-[1000px] text-left text-sm"><thead><tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500"><th className="px-3 py-2">Dòng</th><th className="px-3 py-2">Mã lô</th><th className="px-3 py-2">Tên lô</th><th className="px-3 py-2">Đội</th><th className="px-3 py-2">Diện tích</th><th className="px-3 py-2">Năm trồng</th><th className="px-3 py-2">Kiểm tra</th></tr></thead><tbody>{rows.slice(0, 50).map((row, index) => <tr key={`${row.code}-${index}`} className="border-t border-slate-100"><td className="px-3 py-2">{index + 2}</td><td className="px-3 py-2 font-semibold">{row.code || "—"}</td><td className="px-3 py-2">{row.name || "—"}</td><td className="px-3 py-2">{row.unit || "—"}</td><td className="px-3 py-2">{row.areaHa || "—"}</td><td className="px-3 py-2">{row.plantedYear || "—"}</td><td className={`px-3 py-2 font-medium ${row.error ? "text-rose-700" : "text-emerald-700"}`}>{row.error || "Hợp lệ"}</td></tr>)}</tbody></table></div>{rows.length > 50 ? <p className="text-xs text-slate-500">Chỉ hiển thị 50 dòng đầu để xem trước.</p> : null}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setRows([]); setOpen(false); }}>Hủy</Button><Button type="button" disabled={Boolean(errors.length) || !validRows.length || importPlots.isPending} className="bg-emerald-700 hover:bg-emerald-800" onClick={() => importPlots.mutate({ rows: validRows })}>{importPlots.isPending ? "Đang import…" : `Xác nhận import ${validRows.length} Lô`}</Button></div></> : <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">Cột bắt buộc: <b>Mã lô</b>, <b>Tên lô</b>, <b>Đội</b>, <b>Diện tích (ha)</b>. Cột Vườn không dùng ở bước này.</div>}
      </div></DialogContent>
  </Dialog>;
}
