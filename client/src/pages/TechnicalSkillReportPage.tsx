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
  const [scores, setScores] = useState<Record<ScoreKey, string>>({
    technicalScore: "",
    productivityScore: "",
    qualityScore: "",
    safetyScore: "",
  });
  const [note, setNote] = useState("");
  const {
    data: summary,
    isLoading,
    error,
  } = trpc.rubber.reports.technicalSkillSummary.useQuery(
    periodLabel ? { periodLabel } : undefined
  );
  const { data: workers = [] } = trpc.rubber.workforce.workers.list.useQuery();
  const saveEvaluation =
    trpc.rubber.reports.saveTechnicalSkillEvaluation.useMutation({
      onSuccess: async () => {
        await utils.rubber.reports.technicalSkillSummary.invalidate();
        toast.success("Đã lưu kết quả đánh giá tay nghề");
        setDialogOpen(false);
        setScores({
          technicalScore: "",
          productivityScore: "",
          qualityScore: "",
          safetyScore: "",
        });
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
    const values = Object.fromEntries(
      scoreFields.map(([key]) => [key, Number(scores[key])])
    ) as Record<ScoreKey, number>;
    if (
      Object.values(values).some(
        value => !Number.isFinite(value) || value < 0 || value > 100
      )
    )
      return toast.error("Các tiêu chí phải nằm trong khoảng 0–100");
    saveEvaluation.mutate({
      workerId: Number(workerId),
      evaluationDate: new Date(`${evaluationDate}T12:00:00`),
      periodLabel: formPeriod,
      ...values,
      note: note || null,
    });
  };
  const openForm = () => {
    setFormPeriod(summary?.periodLabel || periodLabel || "Tháng hiện tại");
    setDialogOpen(true);
  };

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Năng lực & sản xuất"
        title="Tổng hợp đánh giá tay nghề kỹ thuật"
        description="So sánh điểm đánh giá với sản lượng bình quân theo người và theo Đội để nhận diện điểm mạnh, khoảng cần đào tạo."
        action={
          <Button
            onClick={openForm}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nhập đánh giá
          </Button>
        }
      />
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
              className="mt-2 h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
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
              className="mt-2 h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
            >
              <option value="">Tất cả Đội</option>
              {(summary?.teams ?? []).map(team => (
                <option key={team.unit} value={team.unit}>
                  {team.unit}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
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
          <div className="h-80">
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
                  <XAxis dataKey="unit" tick={{ fontSize: 12 }} />
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
            {teams
              .slice()
              .sort((a, b) => (b.averageScore ?? -1) - (a.averageScore ?? -1))
              .map(team => (
                <div
                  key={team.unit}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      {team.unit}
                    </span>
                    <Badge
                      className={
                        team.averageScore != null && team.averageScore >= 80
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                          : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                      }
                    >
                      {team.averageScore == null
                        ? "Chưa đánh giá"
                        : `${team.averageScore.toFixed(1)} điểm`}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {team.evaluatedCount}/{team.workerCount} người đã đánh giá
                    </span>
                    <span>
                      {formatQuantity(team.productionPerWorker)} kg/người
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{
                        width: `${Math.min(team.averageScore ?? 0, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            {!teams.length ? (
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
          description="Điểm tổng hợp là trung bình của bốn tiêu chí: kỹ thuật, năng suất, chất lượng và an toàn."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-3">Nhân công</th>
                  <th className="px-3 py-3">Đội</th>
                  <th className="px-3 py-3 text-right">Kỹ thuật</th>
                  <th className="px-3 py-3 text-right">Năng suất</th>
                  <th className="px-3 py-3 text-right">Chất lượng</th>
                  <th className="px-3 py-3 text-right">An toàn</th>
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
                    {(
                      [
                        "technicalScore",
                        "productivityScore",
                        "qualityScore",
                        "safetyScore",
                      ] as ScoreKey[]
                    ).map(key => (
                      <td key={key} className="px-3 py-3 text-right">
                        {row[key] == null ? "—" : row[key]!.toFixed(1)}
                      </td>
                    ))}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Nhập kết quả đánh giá tay nghề</DialogTitle>
            <DialogDescription>
              Chấm từng tiêu chí theo thang 0–100. Kết quả mới nhất của nhân
              công trong kỳ sẽ được dùng để tổng hợp.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4">
            <div>
              <Label>Nhân công</Label>
              <select
                value={workerId}
                onChange={event => setWorkerId(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
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
              {scoreFields.map(([key, label]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={scores[key]}
                    onChange={event =>
                      setScores(current => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    placeholder="0–100"
                    className="mt-2"
                  />
                </div>
              ))}
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
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={saveEvaluation.isPending}
                className="bg-emerald-700 hover:bg-emerald-800"
              >
                {saveEvaluation.isPending ? "Đang lưu…" : "Lưu đánh giá"}
              </Button>
            </div>
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
