import { PageHeader, Panel } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { buildCareDailyExportRows, careDailyExportMeta } from "@/lib/careDailyExport";
import { filterCareRecordsByDateRange, latestCareDate } from "@/lib/careDateRange";
import { buildCareWorkbookSheets } from "@/lib/careWorkbook";
import { monthlyCompletionPercent, summarizeMonthlyTapping } from "@/lib/careMonthlySummary";
import { readLastSelectedCareTeam, writeLastSelectedCareTeam } from "@/lib/lastSelectedTeam";
import { formatPercent, formatQuantity } from "@/lib/rubber";
import { trpc } from "@/lib/trpc";
import { compareTeamName } from "@shared/teamOrder";
import { Download, Pencil, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Category = "tapping" | "reinforcement" | "care" | "treatment" | "fertilization";
type CareForm = { date: string; unit: string; gardenName: string; plan: string; actual: string; cumulative: string; pending: string; partial: string; nextGarden: string; nextGardenPlan: string; nextGardenActual: string; workContent: string; note: string };

const config: Record<Category, { label: string; metric: string; description: string }> = {
  tapping: { label: "Theo dõi cạo mủ", metric: "Vườn", description: "Theo dõi vườn cạo, tình trạng cạo và tiến độ hoàn thành." },
  reinforcement: { label: "Rập thiết kế, trang bị", metric: "Vườn", description: "Ghi nhận kế hoạch, thực hiện và lũy kế rập thiết kế, trang bị." },
  care: { label: "Chăm sóc", metric: "Ha", description: "Chặt chồi thân gỗ, làm cỏ và băm chồi." },
  treatment: { label: "Phun, bôi thuốc", metric: "Ha", description: "Theo dõi diện tích phun, bôi thuốc theo ngày." },
  fertilization: { label: "Bón phân", metric: "Ha", description: "Theo dõi diện tích bón phân theo ngày." },
};
const categories = Object.keys(config) as Category[];
const num = (value: string) => Number(value) || 0;
const displayQuantity = (value: number | null | undefined) => value ? formatQuantity(value) : "—";
const blankForm = (): CareForm => ({ date: new Date().toISOString().slice(0, 10), unit: "", gardenName: "", plan: "", actual: "", cumulative: "", pending: "", partial: "", nextGarden: "", nextGardenPlan: "", nextGardenActual: "", workContent: "", note: "" });

export default function CareOperationsPage() {
  const [category, setCategory] = useState<Category>("tapping");
  const [form, setForm] = useState<CareForm>(() => ({ ...blankForm(), unit: readLastSelectedCareTeam(window.localStorage) }));
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const { data: records = [], isLoading } = trpc.operations.list.useQuery({ category });
  const { data: allRecords = [] } = trpc.operations.list.useQuery();
  const { data: plots = [] } = trpc.rubber.plots.list.useQuery();
  const isTapping = category === "tapping";
  const needsWorkContent = category === "care" || category === "treatment" || category === "fertilization";
  const teamOptions = useMemo(() => Array.from(new Set(plots.map(plot => plot.unit))).sort(compareTeamName), [plots]);
  const gardenOptions = ["Vườn A", "Vườn B", "Vườn C"];
  useEffect(() => {
    if (isTapping && form.gardenName && !gardenOptions.includes(form.gardenName)) update("gardenName", "");
  }, [form.gardenName, isTapping]);
  useEffect(() => {
    if (!form.unit || !teamOptions.length || teamOptions.includes(form.unit)) return;
    setForm(current => ({ ...current, unit: "", gardenName: "" }));
    writeLastSelectedCareTeam("", window.localStorage);
  }, [form.unit, teamOptions]);
  useEffect(() => {
    const latest = latestCareDate(records);
    setFromDate(latest ?? "");
    setToDate(latest ?? "");
  }, [category, records]);
  const save = trpc.operations.save.useMutation({
      onSuccess: async () => { await utils.operations.list.invalidate(); toast.success(editingKey ? "Đã cập nhật dữ liệu theo ngày" : `Đã lưu ${config[category].label.toLowerCase()}`); setEditingKey(null); setEditingId(null); setForm(value => ({ ...value, actual: "", cumulative: "", pending: "", partial: "", nextGarden: "", nextGardenPlan: "", nextGardenActual: "", note: "" })); },
    onError: error => toast.error(error.message),
  });
  const remove = trpc.operations.remove.useMutation({
    onSuccess: async () => { await utils.operations.list.invalidate(); toast.success("Đã xóa dữ liệu cập nhật"); setEditingKey(null); setEditingId(null); setForm(current => ({ ...blankForm(), unit: current.unit })); },
    onError: error => toast.error(error.message),
  });
  const update = (key: keyof CareForm, value: string) => setForm(current => ({ ...current, [key]: value }));
  const loadRecord = (row: typeof records[number]) => {
    setEditingId(row.id);
    setEditingKey(`${row.category}|${row.unit}|${row.gardenName}|${new Date(row.activityDate).toISOString().slice(0, 10)}`);
    setForm({ date: new Date(row.activityDate).toISOString().slice(0, 10), unit: row.unit, gardenName: row.gardenName ?? "", plan: String(row.planQuantity ?? ""), actual: String(row.actualQuantity ?? ""), cumulative: String(row.cumulativeQuantity ?? ""), pending: String(row.pendingGardens ?? ""), partial: String(row.partialGardens ?? ""), nextGarden: row.nextGarden ?? "", nextGardenPlan: String(row.nextGardenPlanQuantity ?? ""), nextGardenActual: String(row.nextGardenActualQuantity ?? ""), workContent: row.workContent ?? "", note: row.note ?? "" });
  };
  const submit = () => {
    if (!form.unit || (isTapping && !form.gardenName) || (needsWorkContent && !form.workContent)) return toast.error(isTapping ? "Vui lòng nhập đội và Vườn A/B/C" : needsWorkContent ? "Vui lòng nhập đội và nội dung công việc" : "Vui lòng nhập đội");
    save.mutate({
      category,
      activityDate: new Date(`${form.date}T00:00:00.000Z`),
      unit: form.unit,
      gardenName: isTapping ? form.gardenName : config[category].label,
      areaHa: null,
      tappingSection: null,
      planQuantity: num(form.plan),
      actualQuantity: num(form.actual),
      cumulativeQuantity: isTapping ? num(form.actual) : form.cumulative ? num(form.cumulative) : num(form.actual),
      metricUnit: config[category].metric,
      completedGardens: null,
      pendingGardens: isTapping && form.pending ? num(form.pending) : null,
      partialGardens: isTapping && form.partial ? num(form.partial) : null,
      nextGarden: isTapping ? form.nextGarden || null : null,
      nextGardenPlanQuantity: isTapping && form.nextGardenPlan ? num(form.nextGardenPlan) : null,
      nextGardenActualQuantity: isTapping && form.nextGardenActual ? num(form.nextGardenActual) : null,
      workContent: needsWorkContent ? form.workContent || null : null,
      note: form.note || null,
    });
  };
  const exportWorkbook = async () => {
    const XLSX = await import("xlsx"); const book = XLSX.utils.book_new();
    buildCareWorkbookSheets(allRecords).forEach(group => { const sheet = XLSX.utils.json_to_sheet(group.rows.map(row => ({ Ngày: row.activityDate, Đội: row.unit, Vườn: row.gardenName ?? "", "Diện tích (ha)": row.areaHa ?? "", "Phần cạo": row.tappingSection ?? "", "Nội dung": row.workContent ?? "", KH: row.planQuantity, TH: row.actualQuantity, "Lũy kế": row.cumulativeQuantity, "Đơn vị tính": row.metricUnit, "% hoàn thành": Number(Number(row.progressPercent ?? 0).toFixed(2)), "Chưa cạo": row.pendingGardens ?? "", "Cạo chưa xong": row.partialGardens ?? "", "Cạo tiếp vườn": row.nextGarden ?? "", "KH tiếp (Vườn)": row.nextGardenPlanQuantity ?? "", "TH tiếp (Vườn)": row.nextGardenActualQuantity ?? "", "Ghi chú": row.note ?? "" }))); XLSX.utils.book_append_sheet(book, sheet, group.name.slice(0, 31)); });
    if (!book.SheetNames.length) return toast.error("Chưa có dữ liệu chăm sóc để xuất Excel"); XLSX.writeFile(book, "tong-hop-cham-soc-cao-su.xlsx");
  };
  const exportCurrentBoard = async () => {
    if (!orderedRecords.length) return toast.error(`Không có dữ liệu ${config[category].label.toLowerCase()} trong khoảng thời gian đã chọn`);
    const XLSX = await import("xlsx"); const book = XLSX.utils.book_new(); const meta = careDailyExportMeta[category];
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(buildCareDailyExportRows(category, orderedRecords)), meta.sheetName.slice(0, 31));
    XLSX.writeFile(book, meta.fileName); toast.success(`Đã xuất Excel ${config[category].label.toLowerCase()}`);
  };
  const filteredRecords = useMemo(() => filterCareRecordsByDateRange(records, fromDate || undefined, toDate || undefined), [records, fromDate, toDate]);
  const confirmRemove = () => { if (editingId == null) return; if (window.confirm("Bạn có chắc muốn xóa dữ liệu cập nhật này không?")) remove.mutate({ id: editingId }); };
  const totals = useMemo(() => ({ plan: filteredRecords.reduce((sum, row) => sum + row.planQuantity, 0), actual: filteredRecords.reduce((sum, row) => sum + row.cumulativeQuantity, 0) }), [filteredRecords]);
  const orderedRecords = useMemo(() => [...filteredRecords].sort((left, right) => new Date(right.activityDate).getTime() - new Date(left.activityDate).getTime() || compareTeamName(left.unit, right.unit)), [filteredRecords]);
  const actualLabel = isTapping ? "Cạo xong (Vườn)" : `TH (${config[category].metric})`;
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date(); monthEnd.setHours(23, 59, 59, 999);
  const monthTappingRows = useMemo(() => isTapping ? summarizeMonthlyTapping(records, monthStart, monthEnd) : [], [isTapping, records, monthStart.getTime(), monthEnd.getTime()]);

  return <div className="page-enter">
    <PageHeader eyebrow="Vận hành vườn" title="Khai thác & chăm sóc hằng ngày" description="Năm bảng theo mẫu: cạo mủ theo Vườn A/B/C; rập thiết kế, trang bị; chăm sóc; phun, bôi thuốc; bón phân." action={<Button variant="outline" className="bg-white" onClick={exportWorkbook}><Download className="mr-2 h-4 w-4" />Xuất tổng hợp Excel</Button>} />
    <div className="mt-4 grid gap-3 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
      <Panel compact title="Nhập dữ liệu hằng ngày" description={config[category].description}>
        <div className="grid gap-2 text-xs [&_input]:h-9 [&_input]:text-xs [&_label]:text-[11px] [&_select]:h-9 [&_select]:text-xs [&_textarea]:min-h-16 [&_textarea]:text-xs">
          <Field label="Bảng theo dõi"><Select value={category} onValueChange={value => { setCategory(value as Category); setForm(blankForm()); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map(key => <SelectItem key={key} value={key}>{config[key].label}</SelectItem>)}</SelectContent></Select></Field>
          <div className="grid grid-cols-2 gap-2"><Field label="Ngày"><Input type="date" value={form.date} onChange={e => update("date", e.target.value)} /></Field><Field label="Đội"><select value={form.unit} onChange={e => { const team = e.target.value; update("unit", team); update("gardenName", ""); writeLastSelectedCareTeam(team, window.localStorage); }} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">{teamOptions.length ? "Chọn Đội" : "Chưa có Đội trong phạm vi"}</option>{teamOptions.map(team => <option key={team} value={team}>{team}</option>)}</select></Field></div>
          {isTapping ? <Field label="Vườn"><select value={form.gardenName} onChange={e => update("gardenName", e.target.value)} disabled={!form.unit} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"><option value="">{!form.unit ? "Chọn Đội trước" : "Chọn Vườn A/B/C"}</option>{gardenOptions.map(garden => <option key={garden} value={garden}>{garden}</option>)}</select></Field> : null}
          {needsWorkContent ? <Field label="Nội dung công việc"><Input value={form.workContent} onChange={e => update("workContent", e.target.value)} placeholder={category === "care" ? "Ví dụ: Chặt chồi thân gỗ" : category === "fertilization" ? "Ví dụ: Bón phân theo lô/khu vực" : "Ví dụ: Phun thuốc"} /></Field> : null}
          <div className="grid grid-cols-2 gap-2"><Field label={`KH (${config[category].metric})`}><Input inputMode="decimal" value={form.plan} onChange={e => update("plan", e.target.value)} /></Field><Field label={actualLabel}><Input inputMode="decimal" value={form.actual} onChange={e => update("actual", e.target.value)} /></Field>{!isTapping ? <Field label={`Lũy kế (${config[category].metric})`}><Input inputMode="decimal" value={form.cumulative} onChange={e => update("cumulative", e.target.value)} /></Field> : null}</div>
          {isTapping ? <><div className="grid grid-cols-2 gap-2"><Field label="Chưa cạo"><Input inputMode="numeric" value={form.pending} onChange={e => update("pending", e.target.value)} /></Field><Field label="Cạo chưa xong"><Input inputMode="numeric" value={form.partial} onChange={e => update("partial", e.target.value)} /></Field></div><div className="rounded-lg border border-amber-100 bg-amber-50/60 p-2"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">Cạo tiếp vườn</p><div className="grid gap-2 sm:grid-cols-3"><Field label="Tên vườn"><Input value={form.nextGarden} onChange={e => update("nextGarden", e.target.value)} placeholder="Tên vườn tiếp theo" /></Field><Field label="KH (Vườn)"><Input inputMode="numeric" value={form.nextGardenPlan} onChange={e => update("nextGardenPlan", e.target.value)} /></Field><Field label="TH (Vườn)"><Input inputMode="numeric" value={form.nextGardenActual} onChange={e => update("nextGardenActual", e.target.value)} /></Field></div></div></> : null}
          <Field label="Ghi chú"><Textarea value={form.note} onChange={e => update("note", e.target.value)} placeholder="Khó khăn hoặc kiến nghị" /></Field>
          <div className="flex flex-wrap gap-2"><Button className="bg-emerald-700 hover:bg-emerald-800" onClick={submit} disabled={save.isPending}><Save className="mr-2 h-4 w-4" />{save.isPending ? "Đang lưu…" : editingKey ? "Cập nhật dữ liệu ngày" : "Lưu dữ liệu hằng ngày"}</Button>{editingKey ? <><Button type="button" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={confirmRemove} disabled={remove.isPending}><Trash2 className="mr-2 h-4 w-4" />{remove.isPending ? "Đang xóa…" : "Xóa dữ liệu"}</Button><Button type="button" variant="outline" onClick={() => { setEditingKey(null); setEditingId(null); setForm({ ...blankForm(), unit: form.unit }); }}><X className="mr-2 h-4 w-4" />Hủy sửa</Button></> : null}</div>
        </div>
      </Panel>
      <Panel compact title={config[category].label} description={`KH ${formatQuantity(totals.plan)} · TH ${formatQuantity(totals.actual)} ${config[category].metric}`}><div className="mb-2 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:grid-cols-[1fr_1fr_auto_auto]"><Field label="Từ ngày"><Input type="date" value={fromDate} max={toDate || undefined} onChange={event => setFromDate(event.target.value)} /></Field><Field label="Đến ngày"><Input type="date" value={toDate} min={fromDate || undefined} onChange={event => setToDate(event.target.value)} /></Field><Button type="button" variant="outline" className="self-end" disabled={!fromDate && !toDate} onClick={() => { const latest = latestCareDate(records); setFromDate(latest ?? ""); setToDate(latest ?? ""); }}>Đặt lại</Button><Button type="button" variant="outline" className="self-end" onClick={exportCurrentBoard}><Download className="mr-2 h-4 w-4" />Xuất Excel bảng này</Button></div>            <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-2">Ngày</th><th className="p-2">Đội / Vườn</th><th className="p-2 text-right">KH</th><th className="p-2 text-right">{isTapping ? "Cạo xong" : "TH"}</th>{isTapping ? <><th className="p-2 text-right">Chưa cạo</th><th className="p-2 text-right">Cạo chưa xong</th><th className="p-2 text-right">% hoàn thành</th><th className="p-2">Cạo tiếp vườn</th><th className="p-2 text-right">KH tiếp</th><th className="p-2 text-right">TH tiếp</th></> : <><th className="p-2 text-right">Lũy kế</th><th className="p-2 text-right">% hoàn thành</th></>}<th className="p-2">Thao tác</th></tr></thead><tbody>{orderedRecords.map(row => <tr key={row.id} className="border-b border-slate-100"><td className="p-2">{new Date(row.activityDate).toLocaleDateString("vi-VN")}</td><td className="p-2"><b>{row.unit}</b><span className="block text-xs text-slate-500">{row.gardenName}{(category === "care" || category === "treatment" || category === "fertilization") && row.workContent ? ` · ${row.workContent}` : ""}</span></td><td className="p-2 text-right">{displayQuantity(row.planQuantity)}</td><td className="p-2 text-right">{displayQuantity(row.actualQuantity)}</td>{isTapping ? <><td className="p-2 text-right">{displayQuantity(row.pendingGardens)}</td><td className="p-2 text-right">{displayQuantity(row.partialGardens)}</td><td className="p-2 text-right font-semibold text-emerald-700">{row.progressPercent ? formatPercent(row.progressPercent) : "—"}</td><td className="p-2">{row.nextGarden ?? "—"}</td><td className="p-2 text-right">{displayQuantity(row.nextGardenPlanQuantity)}</td><td className="p-2 text-right">{displayQuantity(row.nextGardenActualQuantity)}</td></> : <><td className="p-2 text-right">{displayQuantity(row.cumulativeQuantity)}</td><td className="p-2 text-right font-semibold text-emerald-700">{row.progressPercent ? formatPercent(row.progressPercent) : "—"}</td></>}<td className="p-2"><Button type="button" variant="outline" size="sm" onClick={() => loadRecord(row)}><Pencil className="mr-1 h-3 w-3" />Sửa</Button></td></tr>)}</tbody></table></div>{!records.length && !isLoading ? <p className="py-12 text-center text-sm text-slate-500">Chưa có dữ liệu cho bảng này.</p> : records.length && !orderedRecords.length ? <p className="py-12 text-center text-sm text-slate-500">Không có dữ liệu trong khoảng thời gian đã chọn.</p> : null}      </Panel>
      {isTapping ? <Panel compact title="Tổng hợp cạo mủ trong tháng" description="Cộng dồn từ đầu tháng đến hiện tại theo từng Đội và Vườn A/B/C."><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-xs sm:text-sm"><thead className="bg-emerald-50 text-left text-xs uppercase text-emerald-800"><tr><th className="p-2">Đội</th><th className="p-2">Vườn</th><th className="p-2 text-right">KH</th><th className="p-2 text-right">Cạo xong</th><th className="p-2 text-right">Chưa cạo</th><th className="p-2 text-right">Cạo chưa xong</th><th className="p-2 text-right">% hoàn thành</th></tr></thead><tbody>{monthTappingRows.map(row => <tr key={`${row.unit}|${row.gardenName}`} className="border-b border-slate-100"><td className="p-2 font-semibold">{row.unit}</td><td className="p-2">{row.gardenName}</td><td className="p-2 text-right">{displayQuantity(row.plan)}</td><td className="p-2 text-right">{displayQuantity(row.actual)}</td><td className="p-2 text-right">{displayQuantity(row.pending)}</td><td className="p-2 text-right">{displayQuantity(row.partial)}</td><td className="p-2 text-right font-semibold text-emerald-700">{row.plan > 0 ? formatPercent(monthlyCompletionPercent(row)) : "—"}</td></tr>)}</tbody></table></div>{!monthTappingRows.length ? <p className="py-8 text-center text-sm text-slate-500">Chưa có dữ liệu cạo mủ từ đầu tháng.</p> : null}</Panel> : null}
    </div>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="grid gap-1.5"><Label>{label}</Label>{children}</div>; }
