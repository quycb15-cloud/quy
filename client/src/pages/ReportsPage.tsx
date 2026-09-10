import { EmptyState, PageHeader, Panel } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { currentPeriod, downloadFile, formatDate, formatPercent, formatQuantity, periodOptions } from "@/lib/rubber";
import { buildTeamProgressExportRows } from "@/lib/reportExport";
import { availableReportMonths } from "@/lib/reportMonths";
import { trpc } from "@/lib/trpc";
import { compareTeamName } from "@shared/teamOrder";
import { FileSpreadsheet, FileText, Loader2, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type DailyImport = { recordDate: Date; frozenLatex: number; latexThread: number; totalImport: number };
type ReportRow = { code: string; name: string; unit: string; frozenLatex: number; latexThreadImport: number; totalImport: number; frozenContaminatedLatex: number; latexThreadExport: number; totalExport: number; lossRate: number; dailyImports: DailyImport[] };
const dayKey = (value: Date | string) => new Date(value).toISOString().slice(0, 10);
const dayLabel = (value: string) => formatDate(new Date(`${value}T12:00:00`));
const safeFile = (value: string) => value.toLocaleLowerCase("vi-VN").replaceAll(/[^a-z0-9]+/gi, "-").replaceAll(/(^-|-$)/g, "") || "bao-cao";

export default function ReportsPage() {
  const { data: periods } = trpc.rubber.periods.useQuery();
  const { data: plots = [] } = trpc.rubber.plots.list.useQuery();
  const currentDate = new Date();
  const [periodLabel, setPeriodLabel] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState(String(currentDate.getFullYear()));
  const [monthFilter, setMonthFilter] = useState(String(currentDate.getMonth() + 1));
  const [unitFilter, setUnitFilter] = useState("");
  const { data: report, isLoading, error } = trpc.rubber.reports.progress.useQuery({ periodLabel, year: Number(yearFilter), month: Number(monthFilter) });
  const { data: periodYearReport = [] } = trpc.rubber.reports.progress.useQuery({ periodLabel, year: Number(yearFilter), month: 0 });
  const { data: warehouseLoss } = trpc.dataTools.warehouseLoss.useQuery({ periodLabel, monthLabel: monthFilter === "0" ? undefined : `${monthFilter}/${yearFilter}` });
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null);
  const reportRows = useMemo(() => [...((report ?? []) as ReportRow[])].sort((left, right) => compareTeamName(left.unit, right.unit) || left.code.localeCompare(right.code, "vi", { numeric: true })), [report]);
  const unitOptions = useMemo(() => Array.from(new Set([...reportRows.map(row => row.unit), ...plots.map(plot => plot.unit)])).sort(compareTeamName), [reportRows, plots]);
  const rows = useMemo(() => unitFilter ? reportRows.filter(row => row.unit === unitFilter) : reportRows, [reportRows, unitFilter]);
  const dateColumns = useMemo(() => Array.from(new Set(rows.flatMap(row => row.dailyImports.map(item => dayKey(item.recordDate))))).sort(), [rows]);
  const availableMonths = useMemo(() => availableReportMonths(periodYearReport as ReportRow[]), [periodYearReport]);
  useEffect(() => {
    if (monthFilter !== "0" && !availableMonths.includes(Number(monthFilter))) setMonthFilter("0");
  }, [availableMonths, monthFilter]);
  const amountOnDate = (row: ReportRow, date: string) => row.dailyImports.filter(item => dayKey(item.recordDate) === date).reduce((sum, item) => sum + item.frozenLatex, 0);
  const totals = useMemo(() => rows.reduce((total, row) => ({ frozenLatex: total.frozenLatex + row.frozenLatex, latexThreadImport: total.latexThreadImport + row.latexThreadImport, totalImport: total.totalImport + row.totalImport, frozenContaminatedLatex: total.frozenContaminatedLatex + row.frozenContaminatedLatex, latexThreadExport: total.latexThreadExport + row.latexThreadExport, totalExport: total.totalExport + row.totalExport }), { frozenLatex: 0, latexThreadImport: 0, totalImport: 0, frozenContaminatedLatex: 0, latexThreadExport: 0, totalExport: 0 }), [rows]);
  const totalLossRate = totals.totalImport > 0 ? ((totals.totalImport - totals.totalExport) / totals.totalImport) * 100 : 0;
  const exportRows = useMemo(() => buildTeamProgressExportRows(rows, dateColumns, dayLabel, amountOnDate), [rows, dateColumns]);
  const exportTotalRow = useMemo(() => ({ STT: "CỘNG", "Đội": "", ...Object.fromEntries(dateColumns.map(date => [`Nhập ${dayLabel(date)}`, rows.reduce((sum, row) => sum + amountOnDate(row, date), 0)])), "Cộng mủ đông": totals.frozenLatex, "Mủ dây nhập": totals.latexThreadImport, "Cộng nhập": totals.totalImport, "Mủ đông tạp": totals.frozenContaminatedLatex, "Mủ dây xuất": totals.latexThreadExport, "Cộng xuất": totals.totalExport, "Hao kho (%)": Number(totalLossRate.toFixed(2)) }), [dateColumns, rows, totals, totalLossRate]);

  const exportCsv = () => {
    setExporting("csv");
    const headers = Object.keys(exportRows[0] ?? exportTotalRow);
    const asCsvLine = (row: Record<string, string | number>) => headers.map(header => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(",");
    const content = [headers.join(","), ...exportRows.map(asCsvLine), asCsvLine(exportTotalRow)].join("\n");
    downloadFile(`bao-cao-tien-do-${safeFile(periodLabel)}${unitFilter ? `-${safeFile(unitFilter)}` : ""}.csv`, `\ufeff${content}`, "text/csv;charset=utf-8");
    setExporting(null);
    toast.success("Đã xuất CSV");
  };

  const exportExcel = async () => {
    try {
      setExporting("xlsx");
      const XLSX = await import("xlsx");
      const sheet = XLSX.utils.aoa_to_sheet([["BÁO CÁO TIẾN ĐỘ NHẬP XUẤT MỦ"], [periodLabel], [unitFilter || "Tất cả Đội"], ["Đơn vị tính: Kg"], []]);
      XLSX.utils.sheet_add_json(sheet, exportRows, { origin: "A6" });
      XLSX.utils.sheet_add_json(sheet, [exportTotalRow], { origin: -1, skipHeader: true });
      const lastColumn = Object.keys(exportTotalRow).length - 1;
      sheet["!merges"] = [0, 1, 2, 3].map(row => ({ s: { r: row, c: 0 }, e: { r: row, c: lastColumn } }));
      sheet["!cols"] = [6, 16, 20, ...dateColumns.map(() => 14), 18, 18, 16, 18, 17, 16, 15].map(wch => ({ wch }));
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, "Tiến độ mủ");
      XLSX.writeFile(book, `bao-cao-tien-do-${safeFile(periodLabel)}${unitFilter ? `-${safeFile(unitFilter)}` : ""}.xlsx`);
      toast.success("Đã xuất Excel");
    } catch {
      toast.error("Không thể xuất Excel. Vui lòng thử lại.");
    } finally {
      setExporting(null);
    }
  };

  return <div className="page-enter">
    <PageHeader eyebrow="Tổng hợp theo kỳ" title="Báo cáo tiến độ nhập xuất mủ" description="Đối chiếu nhập mủ theo ngày, cộng nhập, cộng xuất và hao kho theo từng Đội; dữ liệu lấy từ các bản ghi/import nhập và xuất mủ." action={<div className="flex flex-wrap gap-2"><Button variant="outline" onClick={exportCsv} disabled={!rows.length || exporting !== null} className="bg-white"><FileText className="mr-2 h-4 w-4" />{exporting === "csv" ? "Đang xuất…" : "CSV"}</Button><Button onClick={exportExcel} disabled={!rows.length || exporting !== null} className="bg-emerald-700 hover:bg-emerald-800"><FileSpreadsheet className="mr-2 h-4 w-4" />{exporting === "xlsx" ? "Đang xuất…" : "Xuất Excel"}</Button></div>} />
    <Panel title="Bộ lọc báo cáo" description="Chọn Năm, Tháng/Cả năm, Đợt và Đội để tổng hợp theo đúng kỳ; báo cáo không phân tách Vườn/Lô."><div className="grid gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(280px,auto)] lg:items-end"><div><label className="mb-2 block text-sm font-semibold text-slate-700">Năm</label><select value={yearFilter} onChange={event => setYearFilter(event.target.value)} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value={String(new Date().getFullYear())}>{new Date().getFullYear()}</option><option value="2026">2026</option></select></div><div><label className="mb-2 block text-sm font-semibold text-slate-700">Tháng</label><select value={monthFilter} onChange={event => setMonthFilter(event.target.value)} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="0">Cả năm</option>{availableMonths.map(month => <option key={month} value={month}>Tháng {month}</option>)}</select></div><div><label className="mb-2 block text-sm font-semibold text-slate-700">Đợt báo cáo</label><select value={periodLabel} onChange={event => setPeriodLabel(event.target.value)} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="All">All</option>{periodOptions(periods).map(period => <option key={period} value={period}>{period}</option>)}</select></div><div><label className="mb-2 block text-sm font-semibold text-slate-700">Đội</label><select value={unitFilter} onChange={event => setUnitFilter(event.target.value)} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">Tất cả Đội</option>{unitOptions.map(unit => <option key={unit} value={unit}>{unit}</option>)}</select></div><div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span className="font-semibold">Công thức hao kho: </span>(cộng nhập − cộng xuất) / cộng nhập × 100%</div></div></Panel>
    <div className="mt-5 grid gap-4 md:grid-cols-3"><Summary label="Cộng nhập" value={totals.totalImport} tone="emerald" /><Summary label="Cộng xuất" value={totals.totalExport} tone="sky" /><Summary label="Hao kho" value={totalLossRate} suffix="%" tone={totalLossRate > 5 ? "amber" : "emerald"} /></div>
    <div className="mt-5"><Panel title="Hao hụt kho theo Đội" description={`Năm ${yearFilter} · ${monthFilter === "0" ? "Cả năm" : `Tháng ${monthFilter}`} · Đợt ${periodLabel}. Kỳ/tháng được hiển thị rõ để thuận tiện đối chiếu. Chênh lệch hao kho = Nhập − Xuất.`}><div className="mb-4 grid gap-3 sm:grid-cols-3"><Summary label="Tổng nhập" value={warehouseLoss?.totals.totalImport ?? 0} tone="emerald" /><Summary label="Tổng xuất" value={warehouseLoss?.totals.totalExport ?? 0} tone="sky" /><Summary label="Hao kho" value={warehouseLoss?.totals.lossPercent ?? 0} suffix="%" tone="amber" /></div>{warehouseLoss?.rows?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400"><th className="px-3 py-3">Kỳ</th><th className="px-3 py-3">Đội</th><th className="px-3 py-3 text-right">Nhập</th><th className="px-3 py-3 text-right">Xuất</th><th className="px-3 py-3 text-right">Hao kho</th><th className="px-3 py-3 text-right">Tỷ lệ</th></tr></thead><tbody>{warehouseLoss.rows.map(row => <tr key={`${row.unit}-${row.periodLabel}`} className="border-b border-slate-100"><td className="px-3 py-3">{row.periodLabel}</td><td className="px-3 py-3 font-semibold">{row.unit}</td><td className="px-3 py-3 text-right">{formatQuantity(row.totalImport)}</td><td className="px-3 py-3 text-right">{formatQuantity(row.totalExport)}</td><td className={`px-3 py-3 text-right font-semibold ${row.lossKg < 0 ? "text-red-700" : "text-amber-700"}`}>{formatQuantity(row.lossKg)}</td><td className="px-3 py-3 text-right">{formatPercent(row.lossPercent)}</td></tr>)}</tbody></table></div> : <EmptyState title="Chưa có dữ liệu hao hụt" description="Import hoặc ghi nhận nhập/xuất mủ theo Đội để hệ thống tổng hợp." />}</Panel></div>
    <div className="mt-5"><Panel title="Chi tiết báo cáo" description={`Đợt: ${periodLabel || "chưa chọn"}${unitFilter ? ` · ${unitFilter}` : " · Tất cả Đội"}. Đơn vị tính: kg.`}>{isLoading ? <div className="grid h-60 place-items-center text-sm text-slate-400"><Loader2 className="mb-2 h-5 w-5 animate-spin" />Đang tổng hợp dữ liệu…</div> : error ? <div className="grid min-h-56 place-items-center rounded-xl border border-red-100 bg-red-50 p-8 text-center"><TriangleAlert className="h-7 w-7 text-red-600" /><p className="mt-3 font-semibold text-red-900">Không thể tải báo cáo</p><p className="mt-1 text-sm text-red-700">{error.message}</p></div> : !rows.length ? <EmptyState title={unitFilter ? `Chưa có dữ liệu ${unitFilter} cho đợt này` : "Chưa có dữ liệu cho đợt này"} description="Ghi nhận nhập mủ và xuất mủ cùng đợt để xem báo cáo tiến độ." /> : <div className="overflow-x-auto"><table className="w-full min-w-[1180px] border-collapse text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.08em] text-slate-400"><th rowSpan={2} className="px-3 py-3">STT</th><th rowSpan={2} className="px-3 py-3">Đội</th>{dateColumns.length ? <th colSpan={dateColumns.length} className="border-l border-slate-200 px-3 py-3 text-center text-emerald-700">Nhập theo ngày — mủ đông</th> : null}<th colSpan={3} className="border-l border-slate-200 px-3 py-3 text-center text-emerald-700">Nhập mủ</th><th colSpan={3} className="border-l border-slate-200 px-3 py-3 text-center text-sky-700">Xuất mủ</th><th rowSpan={2} className="border-l border-slate-200 px-3 py-3 text-right">Hao kho</th></tr><tr className="border-b border-slate-200 text-xs font-bold text-slate-400">{dateColumns.map(date => <th key={date} className="border-l border-slate-100 px-3 py-3 text-right">{dayLabel(date)}</th>)}<th className="border-l border-slate-200 px-3 py-3 text-right">Cộng mủ đông</th><th className="px-3 py-3 text-right">Mủ dây</th><th className="px-3 py-3 text-right">Cộng nhập</th><th className="border-l border-slate-200 px-3 py-3 text-right">Mủ đông tạp</th><th className="px-3 py-3 text-right">Mủ dây</th><th className="px-3 py-3 text-right">Cộng xuất</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.code} className="border-b border-slate-100 hover:bg-emerald-50/30"><td className="px-3 py-4 text-slate-500">{index + 1}</td><td className="px-3 py-4"><p className="font-semibold text-slate-800">{row.unit}</p></td>{dateColumns.map(date => <td key={date} className="border-l border-slate-100 px-3 py-4 text-right text-emerald-700">{amountOnDate(row, date) ? formatQuantity(amountOnDate(row, date)) : "—"}</td>)}<td className="border-l border-slate-100 px-3 py-4 text-right">{formatQuantity(row.frozenLatex)}</td><td className="px-3 py-4 text-right">{formatQuantity(row.latexThreadImport)}</td><td className="px-3 py-4 text-right font-bold text-emerald-700">{formatQuantity(row.totalImport)}</td><td className="border-l border-slate-100 px-3 py-4 text-right">{formatQuantity(row.frozenContaminatedLatex)}</td><td className="px-3 py-4 text-right">{formatQuantity(row.latexThreadExport)}</td><td className="px-3 py-4 text-right font-bold text-sky-700">{formatQuantity(row.totalExport)}</td><td className="border-l border-slate-100 px-3 py-4 text-right"><Badge className={row.lossRate > 5 ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"}>{formatPercent(row.lossRate)}</Badge></td></tr>)}<tr className="bg-slate-50 font-bold text-slate-900"><td colSpan={2} className="px-3 py-4">CỘNG</td>{dateColumns.map(date => <td key={date} className="border-l border-slate-200 px-3 py-4 text-right">{formatQuantity(rows.reduce((sum, row) => sum + amountOnDate(row, date), 0))}</td>)}<td className="border-l border-slate-200 px-3 py-4 text-right">{formatQuantity(totals.frozenLatex)}</td><td className="px-3 py-4 text-right">{formatQuantity(totals.latexThreadImport)}</td><td className="px-3 py-4 text-right text-emerald-800">{formatQuantity(totals.totalImport)}</td><td className="border-l border-slate-200 px-3 py-4 text-right">{formatQuantity(totals.frozenContaminatedLatex)}</td><td className="px-3 py-4 text-right">{formatQuantity(totals.latexThreadExport)}</td><td className="px-3 py-4 text-right text-sky-800">{formatQuantity(totals.totalExport)}</td><td className="border-l border-slate-200 px-3 py-4 text-right">{formatPercent(totalLossRate)}</td></tr></tbody></table></div>}</Panel></div>
  </div>;
}

function Summary({ label, value, suffix = "kg", tone }: { label: string; value: number; suffix?: string; tone: "emerald" | "sky" | "amber" }) { const colors = { emerald: "bg-emerald-50 text-emerald-800", sky: "bg-sky-50 text-sky-800", amber: "bg-amber-50 text-amber-800" }; return <div className={`rounded-2xl p-5 ${colors[tone]}`}><p className="text-xs font-bold uppercase tracking-[0.12em] opacity-65">{label}</p><p className="font-display mt-2 text-3xl font-bold">{formatQuantity(value)} <span className="text-sm">{suffix}</span></p></div>; }
