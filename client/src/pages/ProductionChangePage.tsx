import { EmptyState, PageHeader, Panel } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatQuantity } from "@/lib/rubber";
import { summarizeProductionChangeRows } from "@/lib/productionChangeSummary";
import { buildProductionChangeExportRows } from "@/lib/reportExport";
import { trpc } from "@/lib/trpc";
import { compareTeamName } from "@shared/teamOrder";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";

export default function ProductionChangePage() {
  const { data, isLoading } = trpc.operations.productionChange.useQuery();
  const currentMonthLabel = `${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
  const [period, setPeriod] = useState("all");
  const [unit, setUnit] = useState("all");
  const [month, setMonth] = useState(currentMonthLabel);
  const units = Array.from(new Set((data?.rows ?? []).map(row => row.unit))).sort(compareTeamName);
  const rows = useMemo(() => (data?.rows ?? [])
    .filter(row => (period === "all" || row.periodLabel === period) && (unit === "all" || row.unit === unit) && (month === "all" || row.monthLabel === month))
    .sort((left, right) => new Date(right.recordDate).getTime() - new Date(left.recordDate).getTime() || compareTeamName(left.unit, right.unit)), [data, period, unit, month]);
  const hasActiveFilter = period !== "all" || month !== "all" || unit !== "all";
  const summaries = useMemo(() => summarizeProductionChangeRows(rows), [rows]);
  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const sheet = XLSX.utils.json_to_sheet(buildProductionChangeExportRows(rows));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Tăng giảm sản lượng");
    XLSX.writeFile(book, "bao-cao-tang-giam-san-luong.xlsx");
  };
  return <div className="page-enter min-w-0">
    <PageHeader eyebrow="Phân tích sản lượng" title="Báo cáo tăng, giảm" description="Tổng hợp theo Đội, kỳ và tháng; chỉ hiển thị Hao kho được tính bằng Nhập − Xuất." action={<Button variant="outline" className="min-h-11 w-full bg-white sm:w-auto" onClick={exportExcel} disabled={!rows.length}><Download className="mr-2 h-4 w-4" />Xuất Excel</Button>} />
    <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3"><Filter value={period} setValue={setPeriod} placeholder="Tất cả kỳ" options={data?.periods ?? []} /><Filter value={month} setValue={setMonth} placeholder="Tất cả tháng" options={data?.months ?? []} /><Filter value={unit} setValue={setUnit} placeholder="Tất cả đội" options={units} /></div>
    <Panel className="mt-5" title={hasActiveFilter ? "Tổng hợp theo bộ lọc" : "Tổng hợp đến thời điểm hiện tại"} description="Chỉ hiển thị tổng chung và từng Đội; không phân tách Vườn/Lô."><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{summaries.map(summary => <div key={summary.label} className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="break-words font-semibold text-slate-800">{summary.label}</p><div className="mt-3 grid grid-cols-3 gap-2 text-xs"><SummaryMetric label="Nhập" value={`${formatQuantity(summary.totalImport)} kg`} /><SummaryMetric label="Xuất" value={`${formatQuantity(summary.totalExport)} kg`} /><SummaryMetric label="Hao kho" value={`${formatQuantity(summary.warehouseLossKg)} kg`} tone={summary.warehouseLossKg >= 0 ? "text-amber-700" : "text-rose-700"} /></div></div>)}</div>{!rows.length && !isLoading ? <EmptyState title="Chưa có dữ liệu phù hợp" description="Thử thay đổi kỳ, tháng hoặc đội sản xuất." /> : null}</Panel>
    <div className="mt-5 space-y-2.5 md:hidden">{rows.map(row => <MobileCard key={`${row.unit}-${row.periodLabel}-${row.monthLabel}`} row={row} />)}</div>
    <Panel className="mt-5 hidden md:block" title="Diễn biến theo Đội" description="Dữ liệu được xếp từ kỳ mới đến cũ."><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">Kỳ / tháng</th><th className="p-3">Đội</th><th className="p-3 text-right">Cộng nhập</th><th className="p-3 text-right">Cộng xuất</th><th className="p-3 text-right">Hao kho</th><th className="p-3 text-right">Hao kho tháng trước</th><th className="p-3 text-right">Hao kho cùng kỳ</th></tr></thead><tbody>{rows.map(row => <tr key={`${row.unit}-${row.periodLabel}-${row.monthLabel}`} className="border-b border-slate-100"><td className="p-3"><b>{row.periodLabel}</b><span className="block text-xs text-slate-500">Tháng {row.monthLabel}</span></td><td className="p-3 font-semibold">{row.unit}</td><td className="p-3 text-right">{formatQuantity(row.totalImport)} kg</td><td className="p-3 text-right">{formatQuantity(row.totalExport)} kg</td><td className={`p-3 text-right font-semibold ${row.totalImport - row.totalExport >= 0 ? "text-amber-700" : "text-rose-700"}`}>{formatQuantity(row.totalImport - row.totalExport)} kg</td><td className="p-3 text-right text-slate-600">{row.previousMonthWarehouseLoss == null ? "—" : `${formatQuantity(row.previousMonthWarehouseLoss)} kg`}</td><td className="p-3 text-right text-slate-600">{row.sameMonthLastYearWarehouseLoss == null ? "—" : `${formatQuantity(row.sameMonthLastYearWarehouseLoss)} kg`}</td></tr>)}</tbody></table></div>{!rows.length && !isLoading ? <EmptyState title="Chưa có dữ liệu phù hợp" description="Thử thay đổi kỳ, tháng hoặc đội sản xuất." /> : null}</Panel>
  </div>;
}

function Filter({ value, setValue, placeholder, options }: { value: string; setValue: (value: string) => void; placeholder: string; options: string[] }) { return <Select value={value} onValueChange={setValue}><SelectTrigger className="min-h-11 w-full min-w-0 bg-white text-sm sm:w-44"><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent><SelectItem value="all">{placeholder}</SelectItem>{options.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>; }
function MobileCard({ row }: { row: { periodLabel: string; monthLabel: string; unit: string; totalImport: number; totalExport: number; previousMonthWarehouseLoss?: number | null; sameMonthLastYearWarehouseLoss?: number | null } }) { const warehouseLoss = row.totalImport - row.totalExport; return <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div><p className="break-words font-semibold text-slate-900">{row.unit}</p><p className="text-xs text-slate-500">{row.periodLabel} · Tháng {row.monthLabel}</p></div><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><Metric label="Cộng nhập" value={`${formatQuantity(row.totalImport)} kg`} /><Metric label="Cộng xuất" value={`${formatQuantity(row.totalExport)} kg`} /><Metric label="Hao kho" value={`${formatQuantity(warehouseLoss)} kg`} tone={warehouseLoss >= 0 ? "text-amber-700" : "text-rose-700"} /><Metric label="Tháng trước" value={row.previousMonthWarehouseLoss == null ? "—" : `${formatQuantity(row.previousMonthWarehouseLoss)} kg`} /><Metric label="Cùng kỳ năm trước" value={row.sameMonthLastYearWarehouseLoss == null ? "—" : `${formatQuantity(row.sameMonthLastYearWarehouseLoss)} kg`} /></div></div>; }
function Metric({ label, value, tone = "text-slate-900" }: { label: string; value: string; tone?: string }) { return <div><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 break-words font-semibold ${tone}`}>{value}</p></div>; }
function SummaryMetric({ label, value, tone = "text-slate-800" }: { label: string; value: string; tone?: string }) { return <div><p className="text-[11px] text-slate-500">{label}</p><p className={`mt-1 break-words text-xs font-bold tabular-nums ${tone}`}>{value}</p></div>; }
