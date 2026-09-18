import { EmptyState, PageHeader, Panel } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { formatDate, formatQuantity } from "@/lib/rubber";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Plus } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

const scoreFields = [
  ["technicalScore", "Kỹ thuật thực hiện"],
  ["productivityScore", "Năng suất"],
  ["qualityScore", "Chất lượng"],
  ["safetyScore", "An toàn lao động"],
] as const;
type ScoreKey = (typeof scoreFields)[number][0];

type WorkerRow = {
  workerId: number;
  name: string;
  unit: string;
  employeeCode: string | null;
  productionPerWorker: number;
  technicalScore: number | null;
  productivityScore: number | null;
  qualityScore: number | null;
  safetyScore: number | null;
  overallScore: number | null;
  evaluationDate: Date | null;
  note: string | null;
};
type TeamRow = {
  unit: string;
  workerCount: number;
  evaluatedCount: number;
  averageScore: number | null;
  production: number;
  productionPerWorker: number;
  workers: WorkerRow[];
};
const importedSkillFields = [
  ["workerCount", "Quân số"],
  ["exceptionalCount", "Xuất sắc"],
  ["goodCount", "Giỏi"],
  ["fairCount", "Khá"],
  ["averageCount", "Trung bình"],
  ["weakCount", "Yếu"],
  ["haoDamWorkers", "Hao dăm tháng này"],
  ["previousHaoDamWorkers", "Hao dăm tháng trước"],
] as const;
type ImportedSkillKey = (typeof importedSkillFields)[number][0];
type ImportedSkillForm = Record<ImportedSkillKey, string> & { unit: string; monthKey: string; note: string };
const skillLevels = ["Xuất sắc", "Giỏi", "Khá", "Trung bình", "Yếu"] as const;
type SkillLevel = (typeof skillLevels)[number];
const skillLevelScores: Record<SkillLevel, number> = { "Xuất sắc": 100, "Giỏi": 85, "Khá": 70, "Trung bình": 55, "Yếu": 35 };
const skillLevelFromScore = (score: number | null) => score == null ? "Chưa đánh giá" : skillLevels.reduce((best, level) => Math.abs(skillLevelScores[level] - score) < Math.abs(skillLevelScores[best] - score) ? level : best, "Yếu" as SkillLevel);

export default function TechnicalSkillReportPage() {
  const utils = trpc.useUtils();
  const [periodLabel, setPeriodLabel] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workerId, setWorkerId] = useState("");
  const [evaluationDate, setEvaluationDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [formPeriod, setFormPeriod] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel | "">("");
  const [technicalIssue, setTechnicalIssue] = useState("");
  const [productivity, setProductivity] = useState("");
  const [scrapingLoss, setScrapingLoss] = useState<"Có" | "Không" | "">("");
  const [note, setNote] = useState("");
  const [skillImportOpen, setSkillImportOpen] = useState(false);
  const [skillImportForm, setSkillImportForm] = useState<ImportedSkillForm>({ unit: "", monthKey: "", workerCount: "", exceptionalCount: "", goodCount: "", fairCount: "", averageCount: "", weakCount: "", haoDamWorkers: "", previousHaoDamWorkers: "", note: "" });
  const {
    data: summary,
    isLoading,
    error,
  } = trpc.rubber.reports.technicalSkillSummary.useQuery(
    periodLabel ? { periodLabel } : undefined
  );
  const { data: workers = [] } = trpc.rubber.workforce.workers.list.useQuery();
  const { data: me } = trpc.auth.me.useQuery();
  const { data: internalProfile } = trpc.internalAccounts.me.useQuery(undefined, { enabled: Boolean(me && me.role !== "admin") });
  const canEnterEvaluation = me?.role === "admin" || internalProfile?.groupType === "production";
  const { data: importedSkillSummary } = trpc.dataTools.technicalSkillMonthly.useQuery();
  const saveImportedSkill = trpc.dataTools.import.technicalSkillMonthly.useMutation({
    onSuccess: async () => {
      await utils.dataTools.technicalSkillMonthly.invalidate();
      toast.success("Đã lưu tổng hợp tay nghề theo mẫu Import");
      setSkillImportOpen(false);
    },
    onError: value => toast.error(value.message),
  });
  const saveEvaluation =
    trpc.rubber.reports.saveTechnicalSkillEvaluation.useMutation({
      onSuccess: async () => {
        await utils.rubber.reports.technicalSkillSummary.invalidate();
        toast.success("Đã lưu kết quả đánh giá tay nghề");
        setDialogOpen(false);
        setSkillLevel("");
        setTechnicalIssue("");
        setProductivity("");
        setScrapingLoss("");
        setNote("");
      },
      onError: value => toast.error(value.message),
    });
  const teams = useMemo(
    () =>
      ((summary?.teams ?? []) as TeamRow[]).filter(
        team => !unitFilter || team.unit === unitFilter
      ),
    [summary, unitFilter]
  );
  const importedTeams = useMemo(() => (importedSkillSummary?.teams ?? []).filter(team => !unitFilter || team.unit === unitFilter), [importedSkillSummary, unitFilter]);
  const rows = useMemo(() => teams.flatMap(team => team.workers), [teams]);
  const chartData = teams.map(team => ({
    unit: team.unit,
    "Điểm tay nghề": team.averageScore ?? 0,
    "Kg/người": Math.round(team.productionPerWorker),
  }));
  const selectedPeriod = summary?.periodLabel || periodLabel || "Chưa chọn";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!workerId || !formPeriod)
      return toast.error("Vui lòng chọn nhân công và kỳ đánh giá");
    if (!skillLevel || !scrapingLoss || productivity.trim() === "") return toast.error("Vui lòng nhập Kết quả đánh giá, Năng suất và Hao dăm");
    const productivityValue = Number(productivity);
    if (!Number.isFinite(productivityValue) || productivityValue < 0 || productivityValue > 100) return toast.error("Năng suất phải nằm trong khoảng 0–100");
    const values: Record<ScoreKey, number> = { technicalScore: technicalIssue.trim() ? 0 : 100, productivityScore: productivityValue, qualityScore: skillLevelScores[skillLevel], safetyScore: scrapingLoss === "Có" ? 0 : 100 };
    const detailNote = [technicalIssue.trim() ? `Lỗi kỹ thuật: ${technicalIssue.trim()}` : "", `Kết quả đánh giá: ${skillLevel}`, `Hao dăm: ${scrapingLoss}`, note.trim()].filter(Boolean).join(" · ");
    saveEvaluation.mutate({ workerId: Number(workerId), evaluationDate: new Date(`${evaluationDate}T12:00:00`), periodLabel: formPeriod, ...values, note: detailNote || null });
  };
  const openForm = () => {
    setFormPeriod(importedSkillSummary?.monthKey || summary?.periodLabel || periodLabel || "Tháng hiện tại");
    setDialogOpen(true);
  };
  const openSkillImportForm = () => {
    setSkillImportForm(current => ({ ...current, monthKey: importedSkillSummary?.monthKey || new Date().toISOString().slice(0, 7) }));
    setSkillImportOpen(true);
  };
  const submitSkillImport = (event: FormEvent) => {
    event.preventDefault();
    if (!skillImportForm.unit.trim() || !/^\\d{4}-(0[1-9]|1[0-2])$/.test(skillImportForm.monthKey)) return toast.error("Cần nhập Đội và tháng theo dạng YYYY-MM");
    const values = Object.fromEntries(importedSkillFields.map(([key]) => [key, Number(skillImportForm[key])])) as Record<ImportedSkillKey, number>;
    if (Object.values(values).some(value => !Number.isInteger(value) || value < 0)) return toast.error("Các trường quân số, cấp tay nghề và Hao dăm phải là số nguyên không âm");
    if (values.exceptionalCount + values.goodCount + values.fairCount + values.averageCount + values.weakCount > values.workerCount) return toast.error("Tổng 5 mức tay nghề không được vượt quân số");
    saveImportedSkill.mutate({ rows: [{ ...values, unit: skillImportForm.unit.trim(), monthKey: skillImportForm.monthKey, note: skillImportForm.note.trim() || null }] });
  };

  return (
    <div className="page-enter min-w-0">
      <PageHeader
        eyebrow="Năng lực & sản xuất"
        title="Tổng hợp đánh giá tay nghề kỹ thuật"
        description="So sánh điểm đánh giá với sản lượng bình quân theo người và theo Đội để nhận diện điểm mạnh, khoảng cần đào tạo."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            {canEnterEvaluation ? <Button onClick={openForm} className="min-h-11 w-full bg-emerald-700 hover:bg-emerald-800 sm:w-auto"><Plus className="mr-2 h-4 w-4" />Nhập đánh giá nhân công</Button> : null}
            {me?.role === "admin" ? <Button onClick={openSkillImportForm} variant="outline" className="min-h-11 w-full bg-white sm:w-auto"><Plus className="mr-2 h-4 w-4" />Nhập tổng hợp theo mẫu</Button> : null}
          </div>
        }
      />
      <Panel
        title="Tổng hợp từ file Import"
        description={importedSkillSummary?.monthKey ? `Kỳ ${importedSkillSummary.monthKey}; dữ liệu đã import theo mẫu tổng hợp tay nghề.` : "Chưa có dữ liệu Import tổng hợp tay nghề."}
      >
        {importedTeams.length ? (
          <>
          <div className="grid gap-3 md:hidden">{importedTeams.map((team, index) => <div key={team.unit} className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex min-w-0 items-start justify-between gap-3"><p className="min-w-0 break-words font-semibold text-slate-800">{team.unit}</p><Badge className="shrink-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">#{index + 1}</Badge></div><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><Metric label="Quân số" value={String(team.workerCount)} tone="sky" /><Metric label="Xuất sắc" value={`${team.exceptionalPercent.toFixed(2)}%`} tone="emerald" /><Metric label="Giỏi" value={`${team.goodPercent.toFixed(2)}%`} tone="emerald" /><Metric label="Khá" value={`${team.fairPercent.toFixed(2)}%`} tone="emerald" /><Metric label="XS+G+K" value={`${team.favorablePercent.toFixed(2)}%`} tone="emerald" /><Metric label="Hao dăm" value={String(team.haoDamWorkers)} tone="amber" /><Metric label="So tháng trước" value={team.haoDamChangePercent == null ? "—" : `${team.haoDamChangePercent.toFixed(2)}%`} tone="violet" /></div></div>)}</div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead><tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400"><th className="px-3 py-3">Đội</th><th className="px-3 py-3 text-right">Quân số</th><th className="px-3 py-3 text-right">Xuất sắc %</th><th className="px-3 py-3 text-right">Giỏi %</th><th className="px-3 py-3 text-right">Khá %</th><th className="px-3 py-3 text-right">XS+G+K %</th><th className="px-3 py-3 text-right">Xếp hạng</th><th className="px-3 py-3 text-right">Hao dăm</th><th className="px-3 py-3 text-right">So tháng trước</th></tr></thead>
              <tbody>{importedTeams.map((team, index) => <tr key={team.unit} className="border-b border-slate-100"><td className="px-3 py-3 font-semibold">{team.unit}</td><td className="px-3 py-3 text-right">{team.workerCount}</td><td className="px-3 py-3 text-right">{team.exceptionalPercent.toFixed(2)}%</td><td className="px-3 py-3 text-right">{team.goodPercent.toFixed(2)}%</td><td className="px-3 py-3 text-right">{team.fairPercent.toFixed(2)}%</td><td className="px-3 py-3 text-right font-semibold text-emerald-700">{team.favorablePercent.toFixed(2)}%</td><td className="px-3 py-3 text-right">{index + 1}</td><td className="px-3 py-3 text-right">{team.haoDamWorkers}</td><td className="px-3 py-3 text-right">{team.haoDamChangePercent == null ? "—" : `${team.haoDamChangePercent.toFixed(2)}%`}</td></tr>)}</tbody>
            </table>
          </div>
          </>
        ) : <EmptyState title="Chưa có dữ liệu Import" description="Dùng mẫu Tổng hợp tay nghề và hao dăm trong Import Excel để nạp dữ liệu." />}
      </Panel>
      <Panel
        title="Bộ lọc và kỳ đánh giá"
        description="Sản lượng được đối chiếu từ dữ liệu nhập mủ của cùng kỳ, còn điểm tay nghề lấy kết quả đánh giá gần nhất của từng nhân công."
      >
        <div className="grid gap-4 md:grid-cols-3 md:items-end">
          <div>
            <Label>Kỳ đánh giá</Label>
            <select
              value={periodLabel}
              onChange={event => setPeriodLabel(event.target.value)}
              className="mt-2 h-11 w-full min-w-0 rounded-md border border-input bg-white px-3 text-sm"
            >
              <option value="">Kỳ mới nhất</option>
              {(summary?.availablePeriods ?? []).map(period => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Đội</Label>
            <select
              value={unitFilter}
              onChange={event => setUnitFilter(event.target.value)}
              className="mt-2 h-11 w-full min-w-0 rounded-md border border-input bg-white px-3 text-sm"
            >
              <option value="">Tất cả Đội</option>
              {(summary?.teams ?? []).map(team => (
                <option key={team.unit} value={team.unit}>
                  {team.unit}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 break-words rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span className="font-semibold">Cách đọc:</span> điểm cao thể hiện
            năng lực tốt; sản lượng/người dùng để so sánh bối cảnh, không thay
            thế đánh giá chất lượng.
          </div>
        </div>
      </Panel>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Điểm tay nghề bình quân"
          value={
            summary?.averageScore == null
              ? "—"
              : `${summary.averageScore.toFixed(1)}/100`
          }
          tone="emerald"
        />
        <Metric
          label="Đã đánh giá"
          value={`${summary?.evaluatedCount ?? 0}/${summary?.workerCount ?? 0}`}
          tone="sky"
        />
        <Metric
          label="Tổng sản lượng kỳ"
          value={`${formatQuantity(summary?.totalProduction ?? 0)} kg`}
          tone="amber"
        />
        <Metric
          label="Số Đội có dữ liệu"
          value={String(teams.length)}
          tone="violet"
        />
      </div>
      {error ? (
        <Panel title="Không thể tải báo cáo">
          <p className="text-sm text-red-700">{error.message}</p>
        </Panel>
      ) : null}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Panel
          title="So sánh giữa các Đội"
          description={`Kỳ: ${selectedPeriod}. Cột xanh là điểm tay nghề, cột vàng là kg sản lượng bình quân/người.`}
        >
          <div className="h-72 min-w-0 sm:h-80">
            {isLoading ? (
              <div className="grid h-full place-items-center text-sm text-slate-400">
                Đang tổng hợp…
              </div>
            ) : chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#dbe8df"
                  />
                  <XAxis dataKey="unit" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis
                    yAxisId="score"
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="production"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      typeof value === "number"
                        ? value.toLocaleString("vi-VN", {
                            maximumFractionDigits: 1,
                          })
                        : value,
                      name,
                    ]}
                  />
                  <Bar
                    yAxisId="score"
                    dataKey="Điểm tay nghề"
                    fill="#047857"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    yAxisId="production"
                    dataKey="Kg/người"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Chưa có dữ liệu so sánh"
                description="Hãy nhập ít nhất một phiếu đánh giá và ghi nhận sản lượng theo cùng kỳ."
              />
            )}
          </div>
        </Panel>
        <Panel
          title="Xếp hạng nhanh theo Đội"
          description="Ưu tiên các Đội có điểm thấp hoặc chưa đủ độ phủ đánh giá."
        >
          <div className="space-y-3">
            {importedTeams.length ? importedTeams.map((team, index) => (
              <div key={team.unit} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{index + 1}. {team.unit}</span>
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{team.favorablePercent.toFixed(2)}% XS+G+K</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Quân số: {team.workerCount} · Xuất sắc/Giỏi/Khá: {team.exceptionalCount}/{team.goodCount}/{team.fairCount}</span>
                  <span>Hao dăm: {team.haoDamWorkers}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(team.favorablePercent, 100)}%` }} /></div>
              </div>
            )) : teams
              .slice()
              .sort((a, b) => (b.averageScore ?? -1) - (a.averageScore ?? -1))
              .map(team => (
                <div key={team.unit} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between"><span className="font-semibold text-slate-800">{team.unit}</span><Badge className={team.averageScore != null && team.averageScore >= 80 ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>{team.averageScore == null ? "Chưa đánh giá" : `${team.averageScore.toFixed(1)} điểm`}</Badge></div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>{team.evaluatedCount}/{team.workerCount} người đã đánh giá</span><span>{formatQuantity(team.productionPerWorker)} kg/người</span></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(team.averageScore ?? 0, 100)}%` }} /></div>
                </div>
              ))}
            {!teams.length && !importedTeams.length ? (
              <EmptyState
                title="Chưa có nhân công trong phạm vi"
                description="Kiểm tra lại quyền truy cập hoặc dữ liệu nhân công."
              />
            ) : null}
          </div>
        </Panel>
      </div>
      <div className="mt-5">
        <Panel
          title="Chi tiết so sánh theo nhân công"
          description="Hiển thị đúng các trường trong mẫu: Lỗi kỹ thuật, Kết quả đánh giá, Năng suất và Hao dăm."
        >
          <div className="grid gap-3 md:hidden">{rows.map(row => <div key={row.workerId} className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-semibold text-slate-800">{row.name}</p><p className="break-words text-xs text-slate-500">{row.employeeCode || "Chưa có mã"} · {row.unit}</p></div><span className="shrink-0 text-xs text-slate-500">{row.evaluationDate ? formatDate(new Date(row.evaluationDate)) : "—"}</span></div><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><Metric label="Lỗi kỹ thuật" value={row.technicalScore === 0 ? (row.note?.match(/Lỗi kỹ thuật: ([^·]+)/)?.[1] || "Có") : "—"} tone="amber" /><Metric label="Kết quả" value={skillLevelFromScore(row.qualityScore)} tone="emerald" /><Metric label="Năng suất" value={row.productivityScore == null ? "—" : row.productivityScore.toFixed(1)} tone="sky" /><Metric label="Hao dăm" value={row.safetyScore === 0 ? "Có" : row.safetyScore == null ? "—" : "Không"} tone="amber" /><Metric label="Tổng hợp" value={row.overallScore == null ? "Chưa đánh giá" : `${row.overallScore.toFixed(1)}/100`} tone="emerald" /><Metric label="Kg/người" value={formatQuantity(row.productionPerWorker)} tone="violet" /></div></div>)}</div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-3">Nhân công</th>
                  <th className="px-3 py-3">Đội</th>
                  <th className="px-3 py-3">Lỗi kỹ thuật</th>
                  <th className="px-3 py-3">Kết quả đánh giá</th>
                  <th className="px-3 py-3 text-right">Năng suất</th>
                  <th className="px-3 py-3">Hao dăm</th>
                  <th className="px-3 py-3 text-right">Tổng hợp</th>
                  <th className="px-3 py-3 text-right">Kg/người</th>
                  <th className="px-3 py-3">Ngày đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr
                    key={row.workerId}
                    className="border-b border-slate-100 hover:bg-emerald-50/30"
                  >
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-800">{row.name}</p>
                      <p className="text-xs text-slate-400">
                        {row.employeeCode || "Chưa có mã"}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{row.unit}</td>
                    <td className="px-3 py-3 text-sm">{row.technicalScore === 0 ? (row.note?.match(/Lỗi kỹ thuật: ([^·]+)/)?.[1] || "Có") : "—"}</td>
                    <td className="px-3 py-3 font-semibold">{skillLevelFromScore(row.qualityScore)}</td>
                    <td className="px-3 py-3 text-right">{row.productivityScore == null ? "—" : row.productivityScore.toFixed(1)}</td>
                    <td className="px-3 py-3">{row.safetyScore === 0 ? "Có" : row.safetyScore == null ? "—" : "Không"}</td>
                    <td className="px-3 py-3 text-right font-bold text-emerald-700">
                      {row.overallScore == null ? (
                        <Badge variant="outline">Chưa đánh giá</Badge>
                      ) : (
                        `${row.overallScore.toFixed(1)}/100`
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {formatQuantity(row.productionPerWorker)}
                    </td>
                    <td className="px-3 py-3 text-slate-500">
                      {row.evaluationDate
                        ? formatDate(new Date(row.evaluationDate))
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && !isLoading ? (
              <EmptyState
                title="Chưa có nhân công"
                description="Thêm nhân công hoặc điều chỉnh bộ lọc để xem chi tiết."
              />
            ) : null}
          </div>
        </Panel>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Nhập kết quả đánh giá tay nghề</DialogTitle>
            <DialogDescription>
              Nhập theo mẫu đánh giá: Lỗi kỹ thuật là trường tùy chọn; Kết quả đánh giá gồm Xuất sắc, Giỏi, Khá, Trung bình, Yếu; Hao dăm chọn Có hoặc Không. Kỳ Import gần nhất: {importedSkillSummary?.monthKey || "chưa có"}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4">
            <div>
              <Label>Nhân công</Label>
              <select
                value={workerId}
                onChange={event => setWorkerId(event.target.value)}
                className="mt-2 h-11 w-full min-w-0 rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="">Chọn nhân công</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.phoneticName || worker.name} ·{" "}
                    {worker.unit || "Chưa phân đội"}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Kỳ đánh giá</Label>
                <Input
                  value={formPeriod}
                  onChange={event => setFormPeriod(event.target.value)}
                  placeholder="Ví dụ: Tháng 08/2026"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Ngày đánh giá</Label>
                <Input
                  type="date"
                  value={evaluationDate}
                  onChange={event => setEvaluationDate(event.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Lỗi kỹ thuật <span className="font-normal text-slate-400">(không bắt buộc)</span></Label><Input value={technicalIssue} onChange={event => setTechnicalIssue(event.target.value)} placeholder="Chỉ nhập khi có lỗi kỹ thuật" className="mt-2" /></div>
              <div><Label>Kết quả đánh giá</Label><select value={skillLevel} onChange={event => setSkillLevel(event.target.value as SkillLevel)} className="mt-2 h-11 w-full min-w-0 rounded-md border border-input bg-white px-3 text-sm"><option value="">Chọn mức tay nghề</option>{skillLevels.map(level => <option key={level} value={level}>{level}</option>)}</select></div>
              <div><Label>Năng suất</Label><Input type="number" min="0" max="100" step="0.1" value={productivity} onChange={event => setProductivity(event.target.value)} placeholder="0–100" className="mt-2" /></div>
              <div><Label>Hao dăm</Label><select value={scrapingLoss} onChange={event => setScrapingLoss(event.target.value as "Có" | "Không")} className="mt-2 h-11 w-full min-w-0 rounded-md border border-input bg-white px-3 text-sm"><option value="">Chọn Có/Không</option><option value="Có">Có</option><option value="Không">Không</option></select></div>
            </div>
            <div>
              <Label>Nhận xét / khuyến nghị đào tạo</Label>
              <Textarea
                value={note}
                onChange={event => setNote(event.target.value)}
                placeholder="Ghi nhận điểm mạnh, điểm cần cải thiện…"
                className="mt-2"
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="min-h-11 w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={saveEvaluation.isPending}
                className="min-h-11 w-full bg-emerald-700 hover:bg-emerald-800 sm:w-auto"
              >
                {saveEvaluation.isPending ? "Đang lưu…" : "Lưu đánh giá"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={skillImportOpen} onOpenChange={setSkillImportOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nhập tổng hợp tay nghề và Hao dăm</DialogTitle>
            <DialogDescription>Biểu mẫu này khớp với file Import: mỗi dòng là một Đội trong một tháng, gồm quân số, 5 mức tay nghề, Hao dăm hiện tại và tháng trước. Chênh lệch được tính tự động theo công thức số thợ hiện tại chia số thợ tháng trước nhân 100 rồi trừ 100.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitSkillImport} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Đội</Label><Input value={skillImportForm.unit} onChange={event => setSkillImportForm(current => ({ ...current, unit: event.target.value }))} placeholder="Ví dụ: Đội 1" className="mt-2" /></div>
              <div><Label>Tháng</Label><Input type="month" value={skillImportForm.monthKey} onChange={event => setSkillImportForm(current => ({ ...current, monthKey: event.target.value }))} className="mt-2" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {importedSkillFields.map(([key, label]) => <div key={key}><Label>{label}</Label><Input type="number" min="0" step="1" value={skillImportForm[key]} onChange={event => setSkillImportForm(current => ({ ...current, [key]: event.target.value }))} placeholder="0" className="mt-2" /></div>)}
            </div>
            <div><Label>Ghi chú</Label><Textarea value={skillImportForm.note} onChange={event => setSkillImportForm(current => ({ ...current, note: event.target.value }))} placeholder="Ghi chú đối chiếu nếu có" className="mt-2" /></div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => setSkillImportOpen(false)} className="min-h-11 w-full sm:w-auto">Hủy</Button><Button type="submit" disabled={saveImportedSkill.isPending} className="min-h-11 w-full bg-emerald-700 hover:bg-emerald-800 sm:w-auto">{saveImportedSkill.isPending ? "Đang lưu…" : "Lưu tổng hợp"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "sky" | "amber" | "violet";
}) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-800",
    sky: "bg-sky-50 text-sky-800",
    amber: "bg-amber-50 text-amber-800",
    violet: "bg-violet-50 text-violet-800",
  };
  return (
    <div className={`rounded-2xl p-5 ${colors[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-65">
        {label}
      </p>
      <p className="font-display mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
