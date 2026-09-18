import { EmptyState, PageHeader, Panel } from "@/components/PageHeader";
import { QueryError } from "@/components/QueryError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { filterImportJournal, toImportExcelRows, type ImportJournalRow } from "@/lib/importJournal";
import { DEFAULT_PERIOD, STANDARD_PERIODS, formatDate, formatQuantity, toDateInput } from "@/lib/rubber";
import { trpc } from "@/lib/trpc";
import { comparePlotsByTeamYearAndName } from "@/lib/plotOrder";
import { comparePeriodLabel, compareTeamName } from "@shared/teamOrder";
import { Calculator, Download, Pencil, RotateCcw, Save, Trash2, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

export default function ImportsPage() {
  const utils = trpc.useUtils();
  const { data: plots, error: plotsError } = trpc.rubber.plots.list.useQuery();
  const { data: records, isLoading, error: recordsError } = trpc.rubber.imports.list.useQuery();
  const [plotId, setPlotId] = useState("");
  const [unit, setUnit] = useState("");
  const [gardenType, setGardenType] = useState("all");
  const [periodLabel, setPeriodLabel] = useState<string>(DEFAULT_PERIOD);
  const [recordDate, setRecordDate] = useState(toDateInput());
  const [frozenLatex, setFrozenLatex] = useState("");
  const [latexThread, setLatexThread] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingSource, setEditingSource] = useState<"plot" | "team" | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [journalPeriod, setJournalPeriod] = useState("");

  const totalImport = useMemo(() => Number(frozenLatex || 0) + Number(latexThread || 0), [frozenLatex, latexThread]);
  const units = useMemo(() => Array.from(new Set((plots ?? []).map(plot => plot.unit))).sort(compareTeamName), [plots]);
  const selectablePlots = useMemo(() => (plots ?? []).filter(plot => (!unit || plot.unit === unit) && (gardenType === "all" || plot.gardenType === gardenType)).sort(comparePlotsByTeamYearAndName), [plots, unit, gardenType]);
  const selectedPlot = useMemo(() => selectablePlots.find(plot => String(plot.id) === plotId), [selectablePlots, plotId]);
  const journalPeriods = useMemo(() => Array.from(new Set((records ?? []).map(row => row.periodLabel))).sort(comparePeriodLabel), [records]);
  const filteredRecords = useMemo(() => [...filterImportJournal(records ?? [], { periodLabel: journalPeriod, fromDate, toDate })].sort((left, right) => new Date(right.recordDate).getTime() - new Date(left.recordDate).getTime() || comparePeriodLabel(left.periodLabel, right.periodLabel) || compareTeamName(left.unit, right.unit)), [records, journalPeriod, fromDate, toDate]);
  const gardenLabel = selectedPlot?.name ?? (gardenType === "all" ? "Tất cả vườn" : `Vườn ${gardenType}`);
  const refresh = async () => Promise.all([utils.rubber.imports.list.invalidate(), utils.rubber.dashboard.invalidate(), utils.rubber.periods.invalidate()]);
  const clearEditing = () => { setEditingId(null); setEditingSource(null); setFrozenLatex(""); setLatexThread(""); setNote(""); };
  const save = trpc.rubber.imports.save.useMutation({ onSuccess: async () => { await refresh(); toast.success("Đã lưu nhập mủ"); clearEditing(); }, onError: e => toast.error(e.message) });
  const updatePlot = trpc.rubber.imports.updatePlot.useMutation({ onSuccess: async () => { await refresh(); toast.success("Đã cập nhật nhập mủ theo Lô"); clearEditing(); }, onError: e => toast.error(e.message) });
  const updateTeam = trpc.rubber.imports.updateTeam.useMutation({ onSuccess: async () => { await refresh(); toast.success("Đã cập nhật nhập mủ theo Vườn/Đội"); clearEditing(); }, onError: e => toast.error(e.message) });
  const removePlot = trpc.rubber.imports.removePlot.useMutation({ onSuccess: async () => { await refresh(); toast.success("Đã xóa bản ghi nhập mủ theo Lô"); clearEditing(); }, onError: e => toast.error(e.message) });
  const removeTeam = trpc.rubber.imports.removeTeam.useMutation({ onSuccess: async () => { await refresh(); toast.success("Đã xóa bản ghi nhập mủ theo Vườn/Đội"); clearEditing(); }, onError: e => toast.error(e.message) });
  const isMutating = save.isPending || updatePlot.isPending || updateTeam.isPending || removePlot.isPending || removeTeam.isPending;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const payload = { recordDate: new Date(`${recordDate}T12:00:00`), periodLabel, frozenLatex: Number(frozenLatex), latexThread: Number(latexThread), note };
    if (editingId && editingSource === "plot" && plotId) updatePlot.mutate({ id: editingId, data: { ...payload, plotId: Number(plotId) } });
    else if (editingId && editingSource === "team") updateTeam.mutate({ id: editingId, data: { ...payload, unit, gardenName: gardenLabel } });
    else save.mutate({ ...payload, plotId: plotId ? Number(plotId) : null, unit, gardenName: gardenLabel });
  };

  const loadRecord = (row: ImportJournalRow) => {
    setEditingId(row.id);
    setEditingSource(row.source);
    setUnit(row.unit);
    setPeriodLabel(row.periodLabel);
    setRecordDate(toDateInput(new Date(row.recordDate)));
    setFrozenLatex(String(row.frozenLatex));
    setLatexThread(String(row.latexThread));
    setNote(row.note ?? "");
    if (row.plotId) {
      setPlotId(String(row.plotId));
      const plot = plots?.find(item => item.id === row.plotId);
      setGardenType(plot?.gardenType ?? "all");
    } else {
      setPlotId("");
      setGardenType(row.plotName === "Vườn A" ? "A" : row.plotName === "Vườn B" ? "B" : row.plotName === "Vườn C" ? "C" : "all");
    }
  };

  const cancelEditing = () => { setEditingId(null); setEditingSource(null); setFrozenLatex(""); setLatexThread(""); setNote(""); };
  const confirmRemove = () => {
    if (!editingId || !editingSource) return;
    if (!window.confirm("Bạn có chắc muốn xóa bản ghi nhập mủ này không?")) return;
    if (editingSource === "plot") removePlot.mutate({ id: editingId });
    else removeTeam.mutate({ id: editingId });
  };
  const exportJournal = async () => {
    if (!filteredRecords.length) return toast.error("Không có dữ liệu Nhập mủ trong khoảng đã chọn");
    const XLSX = await import("xlsx");
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(toImportExcelRows(filteredRecords)), "Nhật ký Nhập mủ");
    XLSX.writeFile(workbook, `nhat-ky-nhap-mu-${journalPeriod.replace(/\s+/g, "-") || "tat-ca-dot"}-${fromDate || "tu-dau"}-${toDate || "den-nay"}.xlsx`);
    toast.success(`Đã xuất ${filteredRecords.length} dòng Nhập mủ`);
  };

  return <div className="page-enter"><PageHeader eyebrow="Sản lượng hằng ngày" title="Nhập mủ" description="Ghi nhận mủ đông và mủ dây theo từng Đội, Vườn hoặc Lô. Lô không bắt buộc khi ghi nhận tổng hợp theo Vườn." />
    {plotsError || recordsError ? <div className="mb-5"><QueryError message={plotsError?.message || recordsError?.message} /></div> : null}
    <div className="grid min-w-0 gap-5 xl:grid-cols-[0.92fr_1.4fr]">
      <Panel title={editingId ? "Sửa ghi nhận nhập mủ" : "Ghi nhận nhập mủ"} description="Chọn Đội và Vườn A/B/C hoặc tất cả. Lô chỉ cần chọn khi muốn theo dõi chi tiết; bỏ trống Lô vẫn ghi nhận được theo Vườn/Đội.">
        {!plots?.length ? <EmptyState title="Cần khai báo vườn trước" description="Hãy yêu cầu quản trị viên thêm vườn rồi quay lại ghi nhận nhập mủ." /> : <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3"><Field label="Đội"><select value={unit} onChange={e => { setUnit(e.target.value); setPlotId(""); }} required className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">Chọn đội</option>{units.map(item => <option key={item} value={item}>{item}</option>)}</select></Field><Field label="Vườn"><select value={gardenType} onChange={e => { setGardenType(e.target.value); setPlotId(""); }} required disabled={!unit} className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="all">Tất cả vườn</option><option value="A">Vườn A</option><option value="B">Vườn B</option><option value="C">Vườn C</option></select></Field><Field label="Lô (không bắt buộc)"><select value={plotId} onChange={e => setPlotId(e.target.value)} disabled={!unit} className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">Không chọn Lô · lưu theo {gardenLabel}</option>{selectablePlots.map(plot => <option key={plot.id} value={plot.id}>{plot.name}</option>)}</select></Field></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Ngày nhập"><Input className="h-11 min-w-0" type="date" value={recordDate} onChange={e => setRecordDate(e.target.value)} required /></Field><Field label="Đợt"><select value={periodLabel} onChange={e => setPeriodLabel(e.target.value)} required className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">{STANDARD_PERIODS.map(period => <option key={period} value={period}>{period}</option>)}</select></Field></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Mủ đông (kg)"><Input className="h-11 min-w-0" type="number" min="0" step="0.01" value={frozenLatex} onChange={e => setFrozenLatex(e.target.value)} placeholder="0.00" required /></Field><Field label="Mủ dây (kg)"><Input className="h-11 min-w-0" type="number" min="0" step="0.01" value={latexThread} onChange={e => setLatexThread(e.target.value)} placeholder="0.00" required /></Field></div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><Calculator className="h-4 w-4" />Cộng nhập tự tính</div><p className="font-display mt-2 text-3xl font-bold text-emerald-900">{formatQuantity(totalImport)} <span className="text-sm">kg</span></p><p className="mt-1 text-xs text-emerald-700/80">Cộng mủ đông + mủ dây</p></div>
          <Field label="Ghi chú"><Textarea className="min-h-[88px] w-full min-w-0 break-words" value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú cho bản ghi (nếu có)" /></Field>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"><Button disabled={isMutating} className="mt-1 min-h-11 w-full bg-emerald-700 hover:bg-emerald-800 sm:w-auto">{isMutating ? "Đang xử lý…" : editingId ? <><Save className="mr-2 h-4 w-4" />Cập nhật nhập mủ</> : <><Save className="mr-2 h-4 w-4" />Lưu nhập mủ</>}</Button>{editingId ? <><Button type="button" variant="outline" className="min-h-11 w-full border-red-200 text-red-700 hover:bg-red-50 sm:w-auto" onClick={confirmRemove} disabled={isMutating}><Trash2 className="mr-2 h-4 w-4" />Xóa bản ghi</Button><Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" onClick={cancelEditing}><X className="mr-2 h-4 w-4" />Hủy sửa</Button></> : null}</div>
        </form>}
      </Panel>
      <Panel title="Nhật ký nhập mủ" description="Tra cứu và xuất báo cáo theo Đợt, khoảng thời gian; có thể sửa hoặc xóa từng bản ghi theo quyền được cấp.">
        <div className="mb-4 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-3 xl:grid-cols-5"><Field label="Đợt"><select value={journalPeriod} onChange={event => setJournalPeriod(event.target.value)} className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">Tất cả Đợt</option>{journalPeriods.map(period => <option key={period} value={period}>{period}</option>)}</select></Field><Field label="Từ ngày"><Input className="h-11 min-w-0" type="date" value={fromDate} max={toDate || undefined} onChange={event => setFromDate(event.target.value)} /></Field><Field label="Đến ngày"><Input className="h-11 min-w-0" type="date" value={toDate} min={fromDate || undefined} onChange={event => setToDate(event.target.value)} /></Field><div className="flex items-end"><Button type="button" variant="outline" className="min-h-11 w-full" onClick={() => { setJournalPeriod(""); setFromDate(""); setToDate(""); }}><RotateCcw className="mr-2 h-4 w-4" />Đặt lại</Button></div><div className="flex items-end"><Button type="button" className="min-h-11 w-full bg-emerald-700 hover:bg-emerald-800" onClick={exportJournal}><Download className="mr-2 h-4 w-4" />Xuất Excel</Button></div></div>
        {isLoading ? <div className="h-56 animate-pulse rounded-xl bg-slate-100" /> : !filteredRecords.length ? <EmptyState title="Chưa có bản ghi phù hợp" description={journalPeriod || fromDate || toDate ? "Hãy thay đổi Đợt hoặc khoảng ngày để tra cứu." : "Dữ liệu nhập mủ hằng ngày sẽ xuất hiện tại đây."} /> : <><div className="space-y-3 md:hidden">{filteredRecords.map(row => <article key={`mobile-${row.source}-${row.id}`} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{formatDate(row.recordDate)} · {row.periodLabel}</p><p className="mt-1 break-words font-semibold text-slate-800">{row.plotId ? `${row.plotCode} — ` : ""}{row.plotName}</p><p className="mt-0.5 break-words text-sm text-slate-500">{row.unit}</p></div><p className="shrink-0 text-right font-bold text-emerald-700">{formatQuantity(row.totalImport)} kg</p></div><dl className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm"><div className="min-w-0"><dt className="text-xs text-slate-400">Mủ đông</dt><dd className="break-words font-medium text-slate-700">{formatQuantity(row.frozenLatex)} kg</dd></div><div className="min-w-0"><dt className="text-xs text-slate-400">Mủ dây</dt><dd className="break-words font-medium text-slate-700">{formatQuantity(row.latexThread)} kg</dd></div></dl><Button type="button" variant="outline" className="mt-3 min-h-11 w-full" onClick={() => loadRecord(row)}><Pencil className="mr-1 h-4 w-4" />Sửa</Button></article>)}</div><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[860px] text-left"><thead><tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.1em] text-slate-400"><th className="px-3 py-3">Ngày</th><th className="px-3 py-3">Vườn / đơn vị</th><th className="px-3 py-3">Đợt</th><th className="px-3 py-3 text-right">Mủ đông</th><th className="px-3 py-3 text-right">Mủ dây</th><th className="px-3 py-3 text-right">Cộng nhập</th><th className="px-3 py-3">Thao tác</th></tr></thead><tbody>{filteredRecords.map(row => <tr key={`${row.source}-${row.id}`} className="border-b border-slate-100 last:border-0"><td className="px-3 py-4 text-sm text-slate-600">{formatDate(row.recordDate)}</td><td className="px-3 py-4"><p className="break-words font-semibold text-slate-800">{row.plotId ? `${row.plotCode} — ` : ""}{row.plotName}</p><p className="mt-0.5 break-words text-xs text-slate-400">{row.unit}</p></td><td className="px-3 py-4 text-sm text-slate-600">{row.periodLabel}</td><td className="px-3 py-4 text-right text-sm">{formatQuantity(row.frozenLatex)}</td><td className="px-3 py-4 text-right text-sm">{formatQuantity(row.latexThread)}</td><td className="px-3 py-4 text-right font-bold text-emerald-700">{formatQuantity(row.totalImport)} kg</td><td className="px-3 py-4"><Button type="button" variant="outline" className="min-h-11" size="sm" onClick={() => loadRecord(row)}><Pencil className="mr-1 h-3 w-3" />Sửa</Button></td></tr>)}</tbody></table></div></>}
      </Panel>
    </div>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="grid gap-2"><Label className="text-sm font-semibold text-slate-700">{label}</Label>{children}</div>; }
