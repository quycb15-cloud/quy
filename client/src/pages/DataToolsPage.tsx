import { useAuth } from "@/_core/hooks/useAuth";
import { PageHeader, Panel } from "@/components/PageHeader";
import { QueryError } from "@/components/QueryError";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { comparePlotsByYearAndName } from "@/lib/plotOrder";
import { formatQuantity, STANDARD_PERIODS } from "@/lib/rubber";
import { parseWorkerPlotAllocationRows } from "@/lib/workerPlotAllocationImport";
import { buildWorkerPlotAllocationTemplateMatrix, workerPlotAllocationMerges } from "@/lib/workerPlotAllocationWorkbook";
import { formatPlotDisplayName } from "@shared/plotDisplay";
import { parseProductionPlanMatrix, parseTechnicalSkillMatrix } from "@/lib/reportImportWorkbook";
import { createImportTemplateWorkbook, downloadWorkbookFile } from "@/lib/dataToolsTemplate";
import { trpc } from "@/lib/trpc";
import { compareTeamName } from "@shared/teamOrder";
import { Archive, CheckCircle2, Download, FileSpreadsheet, Loader2, TriangleAlert, Upload, UploadCloud } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Dataset = "plots" | "plotIndicators" | "workers" | "teamImports" | "teamExports" | "workerPlotAllocations" | "productionPlans" | "technicalSkillMonthly" | "technicalSkillEvaluations";
type TeamImportProgress = { unit: string; rows: number; status: "ready" | "importing" | "complete" | "error" };

const labels: Record<Dataset, string> = {
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

const samples: Record<Dataset, Record<string, string | number>> = {
  plots: { "Đơn vị": "", "Loại vườn": "A", "Tên lô": "", "Năm trồng": "", Giống: "", "Từ hàng": "", "Đến hàng": "", "Diện tích (ha)": "", "Tổng số hố kiểm kê": "", "Tổng số cây kiểm kê": "", "Cây cạo": "", "Mật độ cây cạo/ha": "", "Xếp hạng vườn cây": "" },
  plotIndicators: { "Mã lô": "", "Ngày cập nhật": "2026-08-22", "Tổng số hố kiểm kê": "", "Tổng số cây kiểm kê": "", "Cây cạo": "", "Cây chưa đủ tiêu chuẩn": "", "Cây không hiệu quả": "", "Cây bệnh không cạo": "", "Cây khô miệng cạo": "", "Hố trống": "", "Mật độ cây cạo/ha": "", "Xếp hạng vườn cây": "" },
  workers: { Đội: "Đội 1", Tên: "Nguyễn Văn A", "Mã số": "D1-01", "Tên phiên âm": "Nguyễn A", "Giới tính": "Nam", "Số điện thoại": "0901234567", "Trạng thái làm việc": "Đang làm việc", "Vai trò": "Công nhân khai thác", "Ghi chú": "Hàng ví dụ — xóa hoặc thay trước khi import" },
  teamImports: { Đợt: "Đợt 1", Ngày: "", Đội: "", Vườn: "", "Mủ đông, tạp (kg)": "", "Mủ dây (kg)": "" },
  teamExports: { Đợt: "Đợt 1", Ngày: "", Đội: "", "Mủ đông, tạp (kg)": "", "Mủ dây (kg)": "" },
  workerPlotAllocations: { Đội: "Đội 1", "Nhân công": "", "Mã số nhân công": "", "Vườn A/B/C": "A", "Mã lô": "", "Từ hàng": "", "Đến hàng": "", "Diện tích (ha)": "" },
  productionPlans: { "Đơn vị": "Đội 1", "Năm": new Date().getFullYear(), "Tháng": 0, "ĐVT": "ha", "Diện tích": "", "Kế hoạch mủ đông, tạp (kg)": "", "Kế hoạch mủ quy khô (kg)": "", "Ghi chú": "" },
  technicalSkillMonthly: { "Đội": "Đội 1", "Tháng báo cáo": "2026-08", "Quân số": "", "Xuất sắc": "", "Giỏi": "", "Khá": "", "Trung bình": "", "Yếu": "", "Hao dăm số thợ": "", "Ghi chú": "" },
  technicalSkillEvaluations: { "Đội": "Đội 1", "Tên nhân công": "", "Mã số": "", "Ngày đánh giá": "2026-08-30", "Kỳ đánh giá": "2026-08", "Lỗi kỹ thuật": "", "Kết quả đánh giá": "Xuất sắc", "Năng suất": "", "Hao dăm": "Không", "Nhận xét": "" },
};

const text = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();
const number = (value: unknown) => Number(text(value).replaceAll(",", "")) || 0;
const canonical = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function parseDate(value: unknown, XLSX: any) {
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  }
  const raw = text(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return new Date(`${raw}T00:00:00.000Z`);
  const parts = raw.split("-");
  if (parts.length === 3) return new Date(Date.UTC(2000 + Number(parts[2]), Number(parts[0]) - 1, Number(parts[1])));
  throw new Error(`Ngày không hợp lệ: ${raw}`);
}

function groupTeamProgress(rows: Array<{ unit?: unknown }>): TeamImportProgress[] {
  const groups = rows.reduce((result, row) => {
    const unit = text(row.unit);
    if (unit) result.set(unit, (result.get(unit) ?? 0) + 1);
    return result;
  }, new Map<string, number>());
  return Array.from(groups).sort(([left], [right]) => left.localeCompare(right, "vi", { numeric: true })).map(([unit, rows]) => ({ unit, rows, status: "ready" }));
}

function detectDataset(headers: string[]): Dataset | null {
  const keys = headers.map(canonical);
  if (keys.includes("ma lo") && keys.includes("ngay cap nhat")) return "plotIndicators";
  if (keys.includes("ten lo")) return "plots";
  if (keys.includes("ten phien am")) return "workers";
  if (keys.includes("vuon")) return "teamImports";
  if (keys.includes("doi") && (keys.includes("ke hoach mu dong tap kg") || keys.includes("ke hoach mu dong tap"))) return "productionPlans";
  if (keys.includes("ket qua danh gia") && keys.includes("nang suat") && keys.includes("hao dam")) return "technicalSkillEvaluations";
  if (keys.includes("thang bao cao") && keys.includes("quan so") && keys.includes("hao dam so tho")) return "technicalSkillMonthly";
  if (keys.includes("dot") && keys.includes("doi") && keys.some(key => key.startsWith("mu dong"))) return "teamExports";
  return null;
}

export default function DataToolsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: internalProfile } = trpc.internalAccounts.me.useQuery(undefined, { enabled: Boolean(user && !isAdmin) });
  const canImportData = isAdmin || internalProfile?.groupType === "production";
  const availableDatasets = useMemo<Dataset[]>(() => isAdmin ? (Object.keys(labels) as Dataset[]) : ["plots", "workers", "workerPlotAllocations", "teamImports", "teamExports", "technicalSkillEvaluations"], [isAdmin]);
  const utils = trpc.useUtils();
  const { data: summary, error } = trpc.dataTools.summary.useQuery();
  const { data: teamImports } = trpc.dataTools.teamImports.useQuery();
  const { data: teamExports } = trpc.dataTools.teamExports.useQuery();
  const { data: backups, isLoading: backupsLoading } = trpc.dataTools.backups.list.useQuery(undefined, { enabled: isAdmin });
  const [dataset, setDataset] = useState<Dataset>("plots");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [issues, setIssues] = useState<string[]>([]);
  const [parsing, setParsing] = useState(false);
  const [teamProgress, setTeamProgress] = useState<TeamImportProgress[]>([]);
  const [result, setResult] = useState<{ label: string; processed: number; valid: number; errors: number } | null>(null);
  useEffect(() => { if (!availableDatasets.includes(dataset)) setDataset(availableDatasets[0] ?? "plots"); }, [availableDatasets, dataset]);

  const completeImport = async (processed: number, label: string) => {
    const valid = rows.length;
    const errors = issues.length;
    await utils.dataTools.summary.invalidate();
    if (label === labels.teamImports) await utils.dataTools.teamImports.invalidate();
    if (label === labels.teamExports) await utils.dataTools.teamExports.invalidate();
    setTeamProgress(current => current.map(item => ({ ...item, status: "complete" })));
    setResult({ label, processed, valid, errors });
    setFile(null);
    setRows([]);
    setIssues([]);
    toast.success(`${label}: đã xử lý ${processed} dòng hợp lệ.`);
  };

  const failImport = (message: string) => {
    setTeamProgress(current => current.map(item => ({ ...item, status: "error" })));
    toast.error(message);
  };

  const plotImport = trpc.dataTools.import.plots.useMutation({ onSuccess: ({ imported }) => completeImport(imported, labels.plots), onError: error => failImport(error.message) });
  const indicatorImport = trpc.dataTools.import.plotIndicators.useMutation({ onSuccess: ({ updated }) => completeImport(updated, labels.plotIndicators), onError: error => failImport(error.message) });
  const workerImport = trpc.dataTools.import.workers.useMutation({ onSuccess: ({ imported }) => completeImport(imported, labels.workers), onError: error => failImport(error.message) });
  const teamImport = trpc.dataTools.import.teamImports.useMutation({ onSuccess: ({ imported }) => completeImport(imported, labels.teamImports), onError: error => failImport(error.message) });
  const teamExport = trpc.dataTools.import.teamExports.useMutation({ onSuccess: ({ imported }) => completeImport(imported, labels.teamExports), onError: error => failImport(error.message) });
  const allocationImport = trpc.dataTools.import.workerPlotAllocations.useMutation({ onSuccess: ({ imported }) => completeImport(imported, labels.workerPlotAllocations), onError: error => failImport(error.message) });
  const productionPlanImport = trpc.dataTools.import.productionPlans.useMutation({ onSuccess: ({ imported }) => completeImport(imported, labels.productionPlans), onError: error => failImport(error.message) });
  const technicalSkillMonthlyImport = trpc.dataTools.import.technicalSkillMonthly.useMutation({ onSuccess: ({ imported }) => completeImport(imported, labels.technicalSkillMonthly), onError: error => failImport(error.message) });
  const technicalSkillEvaluationImport = trpc.dataTools.import.technicalSkillEvaluations.useMutation({ onSuccess: ({ imported }) => completeImport(imported, labels.technicalSkillEvaluations), onError: error => failImport(error.message) });
  const backupCreate = trpc.dataTools.backups.create.useMutation({
    onSuccess: async backup => { await utils.dataTools.backups.list.invalidate(); toast.success(`Đã tạo bản sao lưu ${backup.fileName}`); },
    onError: error => toast.error(error.message),
  });
  const backupDownload = trpc.dataTools.backups.download.useMutation({
    onSuccess: ({ url, fileName }) => { const link = document.createElement("a"); link.href = url; link.download = fileName; link.rel = "noopener"; document.body.appendChild(link); link.click(); link.remove(); },
    onError: error => toast.error(error.message),
  });
  const busy = plotImport.isPending || indicatorImport.isPending || workerImport.isPending || teamImport.isPending || teamExport.isPending || allocationImport.isPending || productionPlanImport.isPending || technicalSkillMonthlyImport.isPending || technicalSkillEvaluationImport.isPending;

  const reset = () => {
    setFile(null);
    setRows([]);
    setIssues([]);
    setTeamProgress([]);
    setResult(null);
  };

  const downloadTemplate = async () => {
    try {
      const XLSX = await import("xlsx");
      const plotOptions = dataset === "workerPlotAllocations" ? await utils.rubber.plots.list.fetch() : [];
      const { book, fileName } = createImportTemplateWorkbook(XLSX, dataset, labels, samples, plotOptions);
      downloadWorkbookFile(XLSX, book, fileName);
      toast.success(`Đã tải mẫu ${labels[dataset]}`);
    } catch (error) {
      toast.error(error instanceof Error ? `Không thể tạo mẫu Excel: ${error.message}` : "Không thể tạo mẫu Excel. Vui lòng thử lại.");
    }
  };

  const downloadExport = async () => {
    const XLSX = await import("xlsx");
    const book = XLSX.utils.book_new();
    const [plots, workers, allocations, plotProductions] = await Promise.all([utils.rubber.plots.list.fetch(), utils.rubber.workforce.workers.list.fetch(), utils.dataTools.workerPlotAllocations.fetch(), utils.rubber.plotProduction.list.fetch()]);
    const orderedPlots = [...plots].sort((left, right) => compareTeamName(left.unit, right.unit) || comparePlotsByYearAndName(left, right));
    const orderedPlotProductions = [...plotProductions].sort((left, right) => compareTeamName(left.unit, right.unit) || comparePlotsByYearAndName({ plantedYear: left.plantedYear, name: left.plotName, code: left.plotCode }, { plantedYear: right.plantedYear, name: right.plotName, code: right.plotCode }));
    const sheets: [string, unknown[]][] = [
      ["Vườn lô", orderedPlots.map(plot => ({ "Mã lô": plot.code, "Tên lô": plot.name, "Đơn vị": plot.unit, "Loại vườn": plot.gardenType ?? "", "Từ hàng": plot.rowStart ?? "", "Đến hàng": plot.rowEnd ?? "", "Diện tích (ha)": plot.areaHa, "Năm trồng": plot.plantedYear ?? "", Giống: plot.cultivar ?? "", "Cây cạo": plot.tappingTrees ?? "", "Xếp hạng vườn cây": plot.plotRank ?? "" }))],
      ["Chỉ số cây", orderedPlots.map(plot => ({ "Mã lô": plot.code, "Ngày cập nhật": plot.indicatorDate ?? "", "Tổng số hố kiểm kê": plot.inventoryPits ?? "", "Tổng số cây kiểm kê": plot.inventoryTrees ?? "", "Cây cạo": plot.tappingTrees ?? "", "Cây chưa đủ tiêu chuẩn": plot.immatureTrees ?? "", "Cây không hiệu quả": plot.nonproductiveTrees ?? "", "Cây bệnh không cạo": plot.diseasedTrees ?? "", "Cây khô miệng cạo": plot.dryTappingTrees ?? "", "Hố trống": plot.emptyPits ?? "", "Mật độ cây cạo/ha": plot.tappingDensity ?? "", "Xếp hạng vườn cây": plot.plotRank ?? "" }))],
      ["Nhân công", workers.map(worker => ({ Đội: worker.unit ?? "", Tên: worker.name, "Mã số": worker.employeeCode ?? "", "Tên phiên âm": worker.phoneticName ?? "", "Giới tính": worker.gender === "female" ? "Nữ" : "Nam", "Số điện thoại": worker.phone ?? "", "Trạng thái làm việc": worker.status === "active" ? "Đang làm việc" : "Không hoạt động", "Vai trò": worker.roleTitle, "Ghi chú": worker.note ?? "" }))],
      ["Nhập mủ đội", (teamImports ?? []).map(row => ({ Đợt: row.periodLabel, Ngày: row.recordDate, Đội: row.unit, Vườn: row.gardenName, "Mủ đông, tạp (kg)": row.frozenLatex, "Mủ dây (kg)": row.latexThread, "Cộng nhập (kg)": row.totalImport }))],
      ["Xuất mủ đội", (teamExports ?? []).map(row => ({ Đợt: row.periodLabel, Ngày: row.recordDate, Đội: row.unit, "Mủ đông, tạp (kg)": row.frozenContaminatedLatex, "Mủ dây (kg)": row.latexThread, "Cộng xuất (kg)": row.totalExport }))],
      ["Sản lượng theo lô", orderedPlotProductions.map(row => ({ Ngày: row.recordDate, Đội: row.unit, "Mã lô": row.plotCode, "Tên lô": row.plotName, "Năm trồng": row.plantedYear ?? "", "Diện tích (ha)": row.areaHa, "Mủ đông, tạp (kg)": row.frozenContaminatedLatex, "Quy khô (kg)": row.dryRubber, "Ghi chú": row.note ?? "", Nguồn: row.source }))],
      ["Phân công nhân công", allocations.map(row => ({ Đội: row.unit ?? "", "Nhân công": row.workerName, "Mã số nhân công": row.employeeCode ?? "", "Vườn A/B/C": row.gardenType, "Mã lô": row.plotCode, "Tên lô": formatPlotDisplayName(row.plotName, row.plantedYear), "Từ hàng": row.rowStart, "Đến hàng": row.rowEnd, "Diện tích (ha)": row.areaHa, "Tổng cây cạo": row.tappingTrees ?? 0 }))],
    ];
    sheets.forEach(([name, data]) => XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(data), name));
    downloadWorkbookFile(XLSX, book, "du-lieu-cao-su-chi-nhanh-386.xlsx");
  };

  const parseFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setParsing(true);
    setTeamProgress([]);
    setResult(null);
    try {
      const XLSX = await import("xlsx");
      const book = XLSX.read(await selected.arrayBuffer(), { type: "array", cellDates: false });
      const sheet = book.Sheets[book.SheetNames[0]];
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
      const isAllocation = (text(matrix[0]?.[2]).includes("Nhân công") && text(matrix[1]?.[4]).includes("Mã lô")) || (text(matrix[0]?.[1]).toLowerCase().includes("mã công nhân") && text(matrix[1]?.[2]).toLowerCase().startsWith("lô"));
      const isProductionPlan = text(matrix[0]?.[1]) === "Đơn vị" && (text(matrix[0]?.[2]).toLowerCase().includes("kế hoạch năm") || text(matrix[0]?.[2]) === "Năm") && (text(matrix[0]?.[4]).toLowerCase().includes("kế hoạch giao") || text(matrix[2]?.[6]).includes("Kế hoạch"));
      const isTechnicalSkill = text(matrix[0]?.[1]) === "Nội dung" && (text(matrix[0]?.[2]) === "Tháng báo cáo" || text(matrix[0]?.[2]).toLowerCase().includes("tháng/năm báo cáo")) && text(matrix[1]?.[4]).includes("Xuất sắc");
      if (isProductionPlan || isTechnicalSkill) {
        const parsed = isProductionPlan ? parseProductionPlanMatrix(matrix) : parseTechnicalSkillMatrix(matrix);
        if (!parsed.rows.length) throw new Error(`Không có dòng hợp lệ. ${parsed.issues[0] ?? "Hãy kiểm tra đúng bố cục mẫu."}`);
        setDataset(isProductionPlan ? "productionPlans" : "technicalSkillMonthly");
        setFile(selected);
        setRows(parsed.rows);
        setIssues(parsed.issues);
        setTeamProgress(groupTeamProgress(parsed.rows));
        toast.success(`Đã đọc ${parsed.rows.length} dòng ${isProductionPlan ? "kế hoạch sản lượng" : "tổng hợp tay nghề"}.`);
        return;
      }
      if (isAllocation) {
        const allocation = parseWorkerPlotAllocationRows(matrix);
        if (!allocation.parsed.length) throw new Error(`Không có dòng phân chia hợp lệ. ${allocation.issues[0] ?? "Hãy điền Mã lô, hàng và diện tích."}`);
        setDataset("workerPlotAllocations");
        setFile(selected);
        setRows(allocation.parsed);
        setIssues(allocation.issues);
        setTeamProgress(groupTeamProgress(allocation.parsed));
        toast.success(`Đã đọc ${allocation.parsed.length} dòng phân chia nhân công vườn cây.`);
        return;
      }
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const detected = detectDataset(Object.keys(raw[0] ?? {}));
      if (!detected) throw new Error("Không nhận diện được loại dữ liệu. Tệp cần có các cột đúng theo mẫu Excel đã tải xuống.");
      const parsed: any[] = [];
      const errors: string[] = [];
      raw.forEach((row, index) => {
        try {
          const normalized = normalize(detected, row, XLSX);
          if (!normalized) throw new Error("thiếu cột bắt buộc hoặc giá trị không hợp lệ");
          parsed.push(normalized);
        } catch (error) {
          errors.push(`Dòng ${index + 2}: ${error instanceof Error ? error.message : "không hợp lệ"}`);
        }
      });
      if (!parsed.length) throw new Error(`Không có dòng hợp lệ. ${errors[0] ?? "Kiểm tra tiêu đề và định dạng ngày/số."}`);
      setDataset(detected);
      setFile(selected);
      setRows(parsed);
      setIssues(errors);
      setTeamProgress(groupTeamProgress(parsed));
      toast.success(`Đã nhận diện ${labels[detected]} và đọc ${parsed.length} dòng hợp lệ.`);
    } catch (error) {
      setFile(null);
      setRows([]);
      setIssues([error instanceof Error ? error.message : "Không thể đọc tệp Excel"]);
      toast.error(error instanceof Error ? error.message : "Không thể đọc tệp Excel");
    } finally {
      setParsing(false);
    }
  };

  const commit = () => {
    if (!rows.length) return;
    setTeamProgress(current => current.map(item => ({ ...item, status: "importing" })));
    if (dataset === "plots") plotImport.mutate({ rows });
    else if (dataset === "plotIndicators") indicatorImport.mutate({ rows });
    else if (dataset === "workers") workerImport.mutate({ rows });
    else if (dataset === "teamImports") teamImport.mutate({ rows });
    else if (dataset === "teamExports") teamExport.mutate({ rows });
    else if (dataset === "workerPlotAllocations") allocationImport.mutate({ rows });
    else if (dataset === "productionPlans") productionPlanImport.mutate({ rows });
    else if (dataset === "technicalSkillMonthly") technicalSkillMonthlyImport.mutate({ rows });
    else technicalSkillEvaluationImport.mutate({ rows });
  };

  const previewColumns = useMemo(() => Object.keys(rows[0] ?? {}).slice(0, 5), [rows]);

  return <div className="page-enter min-w-0 overflow-x-hidden">
    <PageHeader eyebrow="Quản trị dữ liệu" title="Import & export Excel" description="Nạp dữ liệu vườn/lô, nhân công và sản lượng theo đội; theo dõi tiến trình kiểm tra và nhập theo từng Đội." action={<Button variant="outline" onClick={downloadExport} className="min-h-11 w-full bg-white sm:w-auto"><Download className="mr-2 h-4 w-4" />Xuất toàn bộ Excel</Button>} />
    {error ? <div className="mb-5"><QueryError message={error.message} /></div> : null}
    <div className="grid gap-4 md:grid-cols-3"><Metric label="Lô vườn" value={summary?.plots ?? 0} /><Metric label="Nhân công" value={summary?.workers ?? 0} /><Metric label="Nhập / xuất theo đội" value={`${summary?.teamImports ?? 0} / ${summary?.teamExports ?? 0}`} /></div>
    <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <Panel title="Nạp dữ liệu từ Excel" description="Tải mẫu đúng loại dữ liệu, xem trước và kiểm tra tệp trước khi ghi vào hệ thống.">
        {canImportData ? <div className="grid gap-4">
          <div className="grid gap-2"><Label>Loại dữ liệu</Label><Select value={dataset} onValueChange={value => { setDataset(value as Dataset); reset(); }}><SelectTrigger className="min-h-11"><SelectValue /></SelectTrigger><SelectContent>{availableDatasets.map(key => <SelectItem key={key} value={key}>{labels[key]}</SelectItem>)}</SelectContent></Select></div>
          <div className="flex flex-col gap-2 sm:flex-row"><Button variant="outline" onClick={downloadTemplate} className="min-h-11 w-full sm:w-auto"><FileSpreadsheet className="mr-2 h-4 w-4" />Tải mẫu Excel</Button><label className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-800 sm:w-auto"><UploadCloud className="mr-2 h-4 w-4" />Chọn tệp Excel<input className="sr-only" type="file" accept=".xlsx,.xls" onChange={parseFile} /></label></div>
          {parsing ? <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm font-semibold text-sky-900"><Loader2 className="h-4 w-4 animate-spin" />Đang đọc và kiểm tra cấu trúc tệp Excel…</div> : null}
          {file ? <div className="min-w-0 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2"><p className="min-w-0 break-words font-semibold text-emerald-900">{file.name}</p><Badge className="shrink-0 bg-emerald-700">{rows.length} hợp lệ</Badge></div>
            <p className="mt-1 text-sm text-emerald-800">Đã nhận diện: {labels[dataset]}. Bản ghi trùng khóa sẽ được cập nhật, không tạo bản sao.</p>
            {teamProgress.length ? <TeamProgressPanel items={teamProgress} /> : null}
            <div className="mt-3 hidden overflow-x-auto rounded-lg border border-emerald-100 bg-white md:block"><table className="w-full min-w-[420px] text-left text-xs"><thead className="bg-emerald-50 text-emerald-900"><tr>{previewColumns.map(key => <th key={key} className="px-3 py-2 font-bold">{key}</th>)}</tr></thead><tbody>{rows.slice(0, 5).map((row, index) => <tr key={index} className="border-t border-slate-100">{Object.values(row).slice(0, 5).map((value, cell) => <td key={cell} className="max-w-32 break-words px-3 py-2 text-slate-600">{value instanceof Date ? value.toLocaleDateString("vi-VN") : String(value)}</td>)}</tr>)}</tbody></table></div><div className="mt-3 space-y-2 md:hidden">{rows.slice(0, 5).map((row, index) => <div key={index} className="rounded-lg border border-emerald-100 bg-white p-3">{previewColumns.map(key => <div key={key} className="grid min-w-0 grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-2 border-b border-slate-100 py-2 text-xs last:border-0"><span className="min-w-0 break-words font-semibold text-emerald-900">{key}</span><span className="min-w-0 break-words text-slate-600">{row[key] instanceof Date ? row[key].toLocaleDateString("vi-VN") : String(row[key] ?? "")}</span></div>)}</div>)}</div>
            <p className="mt-2 text-xs text-emerald-800">Xem trước 5 dòng đầu trong {rows.length} dòng hợp lệ.</p>
            {issues.length ? <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900"><p className="font-bold">{issues.length} dòng lỗi đã bị bỏ qua</p>{issues.slice(0, 5).map(issue => <p key={issue} className="mt-1 break-words">• {issue}</p>)}</div> : null}
            <div className="mt-3 flex justify-end"><Button onClick={commit} disabled={busy} className="min-h-11 w-full bg-emerald-700 hover:bg-emerald-800 sm:w-auto"><Upload className="mr-2 h-4 w-4" />{busy ? "Đang nhập…" : `Nhập ${rows.length} dòng`}</Button></div>
          </div> : <div className={issues.length ? "rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" : "rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500"}>{issues.length ? `Không thể đọc tệp: ${issues[0]}` : "Chưa chọn tệp. Hệ thống tự nhận diện loại dữ liệu khi bạn chọn file Excel."}</div>}
          {result ? <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-bold">Đã hoàn tất import {result.label}</p><p className="mt-1">Đã xử lý {result.processed} dòng; {result.valid} dòng hợp lệ và {result.errors} dòng lỗi đã được báo trước.</p></div></div> : null}
          </div> : <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Chỉ quản trị viên hoặc tài khoản cấp Đội có quyền import dữ liệu trong phạm vi được cấp. Bạn vẫn có thể xuất dữ liệu hiện có.</div>}
      </Panel>
      <Panel title="Số liệu đã nhập" description="Tổng khối lượng theo dữ liệu đội được đối chiếu từ các tệp Excel."><div className="space-y-3"><Stat label="Tổng cộng nhập" value={`${formatQuantity(summary?.totalImport ?? 0)} kg`} tone="emerald" /><Stat label="Tổng cộng xuất" value={`${formatQuantity(summary?.totalExport ?? 0)} kg`} tone="sky" /><div className="rounded-xl border border-slate-100 p-4 text-sm text-slate-600">Khi import lại, hệ thống nhận diện khóa dữ liệu và cập nhật số liệu hiện có để tránh trùng lặp.</div></div></Panel>
    </div>
    {isAdmin ? <Panel className="mt-5" title="Sao lưu dữ liệu hằng tuần" description="Tự động lúc 00:15 Chủ nhật (giờ Việt Nam), giữ 8 bản gần nhất. Bản sao loại trừ mật khẩu và bí mật xác thực."><div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center"><p className="min-w-0 break-words text-sm text-slate-600">Quản trị viên có thể tạo bản sao ngay và tải các bản đã lưu.</p><Button onClick={() => backupCreate.mutate()} disabled={backupCreate.isPending} className="min-h-11 w-full bg-emerald-700 hover:bg-emerald-800 sm:w-auto"><Archive className="mr-2 h-4 w-4" />{backupCreate.isPending ? "Đang sao lưu…" : "Sao lưu ngay"}</Button></div><div className="mt-4 hidden overflow-x-auto rounded-xl border border-slate-100 md:block"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-4 py-3">Thời điểm</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Bản ghi</th><th className="px-4 py-3">Dung lượng</th><th className="px-4 py-3 text-right">Tải xuống</th></tr></thead><tbody>{backupsLoading ? <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Đang tải danh sách sao lưu…</td></tr> : backups?.length ? backups.map(backup => <tr key={backup.id} className="border-t border-slate-100"><td className="px-4 py-3 text-slate-700">{new Date(backup.createdAt).toLocaleString("vi-VN")}</td><td className="px-4 py-3"><Badge className={backup.source === "automatic" ? "bg-sky-700" : "bg-emerald-700"}>{backup.source === "automatic" ? "Tự động" : "Thủ công"}</Badge></td><td className="px-4 py-3 text-slate-700">{backup.recordCount.toLocaleString("vi-VN")}</td><td className="px-4 py-3 text-slate-700">{(backup.sizeBytes / 1024 / 1024).toFixed(2)} MB</td><td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => backupDownload.mutate({ id: backup.id })} disabled={backupDownload.isPending}><Download className="mr-2 h-4 w-4" />Tải</Button></td></tr>) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Chưa có bản sao lưu. Bấm Sao lưu ngay để tạo bản đầu tiên.</td></tr>}</tbody></table></div><div className="mt-4 space-y-2 md:hidden">{backupsLoading ? <div className="rounded-xl border border-slate-100 p-4 text-center text-sm text-slate-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Đang tải danh sách sao lưu…</div> : backups?.length ? backups.map(backup => <div key={backup.id} className="min-w-0 rounded-xl border border-slate-100 bg-white p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="break-words text-sm font-semibold text-slate-800">Thời điểm</p><p className="break-words text-sm text-slate-600">{new Date(backup.createdAt).toLocaleString("vi-VN")}</p></div><Badge className={backup.source === "automatic" ? "shrink-0 bg-sky-700" : "shrink-0 bg-emerald-700"}>{backup.source === "automatic" ? "Tự động" : "Thủ công"}</Badge></div><dl className="mt-3 grid grid-cols-2 gap-2 text-sm"><div><dt className="text-xs text-slate-500">Bản ghi</dt><dd className="break-words text-slate-700">{backup.recordCount.toLocaleString("vi-VN")}</dd></div><div><dt className="text-xs text-slate-500">Dung lượng</dt><dd className="break-words text-slate-700">{(backup.sizeBytes / 1024 / 1024).toFixed(2)} MB</dd></div></dl><Button className="mt-3 min-h-11 w-full" variant="outline" onClick={() => backupDownload.mutate({ id: backup.id })} disabled={backupDownload.isPending}><Download className="mr-2 h-4 w-4" />Tải bản sao lưu</Button></div>) : <div className="rounded-xl border border-slate-100 p-4 text-center text-sm text-slate-500">Chưa có bản sao lưu. Bấm Sao lưu ngay để tạo bản đầu tiên.</div>}</div></Panel> : null}
  </div>;
}

function TeamProgressPanel({ items }: { items: TeamImportProgress[] }) {
  return <div className="mt-3 rounded-xl border border-sky-100 bg-white p-3"><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Tiến trình theo Đội</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{items.map(item => <div key={item.unit} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"><span className="font-semibold text-slate-800">{item.unit} <span className="font-normal text-slate-500">· {item.rows} dòng</span></span><span className={item.status === "complete" ? "text-emerald-700" : item.status === "error" ? "text-red-700" : item.status === "importing" ? "flex items-center gap-1 text-sky-700" : "text-slate-600"}>{item.status === "complete" ? <><CheckCircle2 className="mr-1 inline h-4 w-4" />Hoàn tất</> : item.status === "error" ? <><TriangleAlert className="mr-1 inline h-4 w-4" />Lỗi</> : item.status === "importing" ? <><Loader2 className="h-4 w-4 animate-spin" />Đang nhập</> : "Sẵn sàng"}</span></div>)}</div></div>;
}

function normalize(type: Dataset, row: Record<string, unknown>, XLSX: any) {
  if (type === "technicalSkillEvaluations") {
    const unit = text(row["Đội"]); const workerName = text(row["Tên nhân công"]) || text(row["Nhân công"]); const employeeCode = text(row["Mã số"]); const periodLabel = text(row["Kỳ đánh giá"]); const evaluationDate = parseDate(row["Ngày đánh giá"], XLSX); const issue = text(row["Lỗi kỹ thuật"]); const result = text(row["Kết quả đánh giá"]); const productivityScore = number(row["Năng suất"]); const scrapingLoss = text(row["Hao dăm"]);
    const qualityScore = ({ "Xuất sắc": 100, "Giỏi": 85, "Khá": 70, "Trung bình": 55, "Yếu": 35 } as Record<string, number>)[result];
    if (!unit || !workerName || !periodLabel || !Number.isFinite(qualityScore) || !["Có", "Không"].includes(scrapingLoss)) throw new Error("cần Đội, Tên nhân công, Kỳ đánh giá, Kết quả đánh giá hợp lệ và Hao dăm Có/Không");
    if (!Number.isFinite(productivityScore) || productivityScore < 0 || productivityScore > 100) throw new Error("Năng suất phải nằm trong khoảng 0–100");
    return { unit, workerName, employeeCode: employeeCode || null, evaluationDate, periodLabel, technicalScore: issue ? 0 : 100, productivityScore, qualityScore, safetyScore: scrapingLoss === "Có" ? 0 : 100, note: [issue ? `Lỗi kỹ thuật: ${issue}` : "", `Kết quả đánh giá: ${result}`, `Hao dăm: ${scrapingLoss}`, text(row["Nhận xét"]) || text(row["Ghi chú"])].filter(Boolean).join(" · ") || null };
  }
  if (type === "plots") {
    const unit = text(row["Đơn vị"]); const lot = text(row["Tên lô"]); const year = number(row["Năm trồng"]); const areaHa = number(row["Diện tích (ha)"]);
    const rawGardenType = text(row["Loại vườn"]).toUpperCase(); const gardenType = rawGardenType ? (rawGardenType === "A" || rawGardenType === "B" || rawGardenType === "C" ? rawGardenType : null) : null;
    const rowStart = number(row["Từ hàng"]) || null; const rowEnd = number(row["Đến hàng"]) || null;
    if (!unit || !lot || !areaHa || (rawGardenType && !gardenType) || (rowStart && rowEnd && rowEnd < rowStart)) throw new Error("thiếu dữ liệu bắt buộc, Loại vườn phải là A/B/C hoặc khoảng hàng không hợp lệ");
    const code = text(row["Mã lô"]) || `LO-${unit}-${year}-${lot}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/Đ/g, "D").replace(/đ/g, "d").replace(/[^A-Za-z0-9]+/g, "-").replace(/(^-|-$)/g, "").toUpperCase().slice(0, 48);
    return { code, name: text(row["Tên lô"]) || `Lô ${lot} (${year})`, unit, gardenType, rowStart, rowEnd, areaHa, plantedYear: year || null, cultivar: text(row["Giống"]) || null, inventoryPits: number(row["Tổng số hố kiểm kê"]) || null, inventoryTrees: number(row["Tổng số cây kiểm kê"]) || null, tappingTrees: number(row["Cây cạo"]) || null, tappingDensity: number(row["Mật độ cây cạo/ha"]) || null, plotRank: text(row["Xếp hạng vườn cây"]) || text(row["Xếp hạng"]) || null, note: null };
  }
  if (type === "plotIndicators") { const code = text(row["Mã lô"]); if (!code) throw new Error("thiếu Mã lô"); return { code, indicatorDate: parseDate(row["Ngày cập nhật"], XLSX), inventoryPits: number(row["Tổng số hố kiểm kê"]), inventoryTrees: number(row["Tổng số cây kiểm kê"]), tappingTrees: number(row["Cây cạo"]), immatureTrees: number(row["Cây chưa đủ tiêu chuẩn"]), nonproductiveTrees: number(row["Cây không hiệu quả"]), diseasedTrees: number(row["Cây bệnh không cạo"]), dryTappingTrees: number(row["Cây khô miệng cạo"]), emptyPits: number(row["Hố trống"]), tappingDensity: number(row["Mật độ cây cạo/ha"]), plotRank: text(row["Xếp hạng vườn cây"]) || null }; }
  if (type === "workers") { const unit = text(row["Đội"]); const name = text(row["Tên"]); if (!unit || !name) return null; const rawStatus = text(row["Trạng thái làm việc"]) || text(row["Trạng thái"]); return { unit, name, employeeCode: text(row["Mã số"]) || null, phoneticName: text(row["Tên phiên âm"]) || null, gender: /nữ|nu|female/i.test(text(row["Giới tính"])) ? "female" : "male", phone: text(row["Số điện thoại"] ?? row["Điện thoại"]) || null, status: /nghỉ|không hoạt động|inactive|off/i.test(rawStatus) ? "inactive" : "active", roleTitle: text(row["Vai trò"] ?? row["Chức danh"]) || "Công nhân khai thác", note: text(row["Ghi chú"] ?? row["Ghi chú thêm"]) || (rawStatus ? `Trạng thái nguồn: ${rawStatus}` : null) }; }
  const unit = text(row["Đội"]); const periodLabel = text(row["Đợt"]); if (!unit || !periodLabel || !STANDARD_PERIODS.includes(periodLabel as typeof STANDARD_PERIODS[number])) throw new Error(`Đợt chỉ nhận: ${STANDARD_PERIODS.join(", ")}`); const recordDate = parseDate(row["Ngày"], XLSX);
  if (type === "teamImports") { const gardenName = text(row["Vườn"]); if (!gardenName) return null; return { unit, gardenName, periodLabel, recordDate, frozenLatex: number(row["Mủ đông, tạp (kg)"]), latexThread: number(row["Mủ dây (kg)"]) }; }
  return { unit, periodLabel, recordDate, frozenContaminatedLatex: number(row["Mủ đông, tạp (kg)"]), latexThread: number(row["Mủ dây (kg)"]) };
}

function Metric({ label, value }: { label: string; value: number | string }) { return <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p><p className="font-display mt-2 text-3xl font-bold text-slate-900">{value}</p></div>; }
function Stat({ label, value, tone }: { label: string; value: string; tone: "emerald" | "sky" }) { return <div className={tone === "emerald" ? "rounded-xl bg-emerald-50 p-4 text-emerald-900" : "rounded-xl bg-sky-50 p-4 text-sky-900"}><p className="text-xs font-bold uppercase tracking-[0.12em] opacity-70">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>; }
