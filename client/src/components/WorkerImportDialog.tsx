import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileSpreadsheet, Upload, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export type WorkerImportRow = {
  unit: string;
  name: string;
  employeeCode: string | null;
  phoneticName: string | null;
  gender: "male" | "female";
  status: "active" | "inactive";
  roleTitle: string;
  note: string | null;
};

type PreviewRow = WorkerImportRow & { error?: string };

const text = (value: unknown) => String(value ?? "").trim();
const normalizeGender = (value: unknown): "male" | "female" => /nữ|nu|female/i.test(text(value)) ? "female" : "male";
const normalizeStatus = (value: unknown): "active" | "inactive" => /nghỉ|không hoạt động|inactive|off/i.test(text(value)) ? "inactive" : "active";

export function parseWorkerImportRows(rawRows: Record<string, unknown>[]): PreviewRow[] {
  const seenCodes = new Set<string>();
  return rawRows.map((row, index) => {
    const parsed: WorkerImportRow = {
      unit: text(row["Đội"] ?? row["Đơn vị"]),
      name: text(row["Tên"] ?? row["Họ tên"] ?? row["Tên nhân công"]),
      employeeCode: text(row["Mã số"] ?? row["Mã nhân công"]) || null,
      phoneticName: text(row["Tên phiên âm"] ?? row["Phiên âm"]) || null,
      gender: normalizeGender(row["Giới tính"]),
      status: normalizeStatus(row["Trạng thái"]),
      roleTitle: text(row["Vai trò"] ?? row["Chức danh"]) || "Công nhân khai thác",
      note: text(row["Ghi chú"] ?? row["Ghi chú thêm"]) || null,
    };
    let error = !parsed.unit ? "Thiếu Đội" : !parsed.name ? "Thiếu Tên" : undefined;
    if (parsed.employeeCode) {
      if (seenCodes.has(parsed.employeeCode)) error = error || "Trùng Mã số trong file";
      seenCodes.add(parsed.employeeCode);
    }
    return { ...parsed, error: error ? `Dòng ${index + 2}: ${error}` : undefined };
  });
}

export default function WorkerImportDialog({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const importWorkers = trpc.dataTools.import.workers.useMutation({
    onSuccess: result => {
      toast.success(`Đã import ${result.imported} nhân công`);
      setRows([]);
      setOpen(false);
      onImported();
    },
    onError: error => toast.error(error.message),
  });

  const downloadTemplate = async () => {
    const XLSX = await import("xlsx");
    const book = XLSX.utils.book_new();
    const sample = [["Đội", "Tên", "Mã số", "Tên phiên âm", "Giới tính", "Trạng thái", "Vai trò", "Ghi chú"], ["Đội 1", "Nguyễn Văn A", "CN001", "Nguyễn A", "Nam", "Đang làm việc", "Công nhân khai thác", ""]];
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(sample), "Nhân công");
    XLSX.writeFile(book, "mau-import-nhan-cong.xlsx");
  };

  const readWorkbook = async (file: File) => {
    try {
      const XLSX = await import("xlsx");
      const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = book.Sheets[book.SheetNames[0]];
      if (!sheet) throw new Error("File Excel không có sheet dữ liệu");
      const parsed = parseWorkerImportRows(XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" }));
      if (!parsed.length) throw new Error("File Excel chưa có dòng dữ liệu");
      setRows(parsed);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không đọc được file Excel");
    }
  };

  const errors = rows.filter(row => row.error);
  const validRows = rows.filter(row => !row.error).map(({ error: _error, ...row }) => row);

  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) setRows([]); }}>
    <DialogTrigger asChild><Button variant="outline" className="bg-white"><Upload className="mr-2 h-4 w-4" />Import nhân công Excel</Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
      <DialogHeader><DialogTitle>Import danh sách nhân công từ Excel</DialogTitle><DialogDescription>Import mới hoặc cập nhật theo Mã số. Không xóa dữ liệu hiện có; dòng lỗi sẽ bị chặn trước khi ghi.</DialogDescription></DialogHeader>
      <div className="grid gap-4 pt-2">
        <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={downloadTemplate}><Download className="mr-2 h-4 w-4" />Tải mẫu Excel</Button><label className="inline-flex h-10 cursor-pointer items-center rounded-md border border-input bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><FileSpreadsheet className="mr-2 h-4 w-4" />Chọn file Excel<input type="file" accept=".xlsx,.xls" className="sr-only" onChange={event => { const file = event.target.files?.[0]; if (file) void readWorkbook(file); event.currentTarget.value = ""; }} /></label></div>
        {rows.length ? <><div className={`rounded-xl border p-3 text-sm ${errors.length ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-100 bg-emerald-50 text-emerald-800"}`}>{errors.length ? `Có ${errors.length} dòng lỗi; hãy sửa file rồi chọn lại trước khi import.` : `Đã kiểm tra ${validRows.length} dòng hợp lệ. Dữ liệu trùng Mã số sẽ cập nhật bản ghi tương ứng.`}</div><div className="max-h-72 overflow-auto rounded-xl border border-slate-200"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500"><th className="px-3 py-2">Dòng</th><th className="px-3 py-2">Đội</th><th className="px-3 py-2">Tên</th><th className="px-3 py-2">Mã số</th><th className="px-3 py-2">Phiên âm</th><th className="px-3 py-2">Giới tính</th><th className="px-3 py-2">Trạng thái</th><th className="px-3 py-2">Kiểm tra</th></tr></thead><tbody>{rows.slice(0, 50).map((row, index) => <tr key={`${row.unit}-${row.name}-${index}`} className="border-t border-slate-100"><td className="px-3 py-2">{index + 2}</td><td className="px-3 py-2">{row.unit || "—"}</td><td className="px-3 py-2">{row.name || "—"}</td><td className="px-3 py-2">{row.employeeCode || "—"}</td><td className="px-3 py-2">{row.phoneticName || "—"}</td><td className="px-3 py-2">{row.gender === "female" ? "Nữ" : "Nam"}</td><td className="px-3 py-2">{row.status === "active" ? "Đang làm việc" : "Không hoạt động"}</td><td className={`px-3 py-2 font-medium ${row.error ? "text-rose-700" : "text-emerald-700"}`}>{row.error || "Hợp lệ"}</td></tr>)}</tbody></table></div>{rows.length > 50 ? <p className="text-xs text-slate-500">Chỉ hiển thị 50 dòng đầu để xem trước; hệ thống vẫn xử lý toàn bộ dòng hợp lệ.</p> : null}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setRows([]); setOpen(false); }}>Hủy</Button><Button type="button" disabled={Boolean(errors.length) || !validRows.length || importWorkers.isPending} className="bg-emerald-700 hover:bg-emerald-800" onClick={() => importWorkers.mutate({ rows: validRows })}>{importWorkers.isPending ? "Đang import…" : `Xác nhận import ${validRows.length} dòng`}</Button></div></> : <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">File cần có cột bắt buộc <b>Đội</b> và <b>Tên</b>. Các cột tùy chọn: Mã số, Tên phiên âm, Giới tính, Trạng thái, Vai trò, Ghi chú.</div>}
      </div>
    </DialogContent>
  </Dialog>;
}
