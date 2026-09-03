import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { LoginRequired, useAuth } from "@/hooks/use-auth";
import { number, styles, colors } from "@/lib/ui";
import { trpc } from "@/lib/trpc";
import { scoreLabel } from "@/lib/data";

type Worker = { workerId: number; name: string; unit: string; productionPerWorker: number; overallScore: number | null; technicalScore: number | null; productivityScore: number | null; qualityScore: number | null; safetyScore: number | null };
type Team = { unit: string; workerCount: number; evaluatedCount: number; averageScore: number | null; production: number; productionPerWorker: number; workers: Worker[] };
type Summary = { periodLabel: string; evaluatedCount: number; workerCount: number; averageScore: number | null; totalProduction: number; availablePeriods: string[]; teams: Team[]; workers: Worker[] };

export default function SkillScreen() {
  const { isAuthenticated } = useAuth();
  const query = trpc.rubber.reports.technicalSkillSummary.useQuery(undefined, { enabled: isAuthenticated });
  const data = query.data as Summary | undefined;

  if (!isAuthenticated) return <ScreenContainer><View style={styles.page}><Text style={styles.eyebrow}>TAY NGHỀ KỸ THUẬT</Text><Text style={styles.title}>Đánh giá và so sánh</Text><LoginRequired /></View></ScreenContainer>;
  if (query.isLoading) return <ScreenContainer><View style={styles.center}><ActivityIndicator color={colors.primary} /></View></ScreenContainer>;
  if (query.error) return <ScreenContainer><View style={styles.page}><Text style={styles.title}>Không tải được đánh giá</Text><Text style={styles.error}>{query.error.message}</Text></View></ScreenContainer>;

  return <ScreenContainer><FlatList contentContainerStyle={styles.page} data={data?.teams ?? []} keyExtractor={team => team.unit} refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => void query.refetch()} tintColor={colors.primary} />} ListHeaderComponent={<><Text style={styles.eyebrow}>TAY NGHỀ KỸ THUẬT</Text><Text style={styles.title}>Đánh giá và so sánh</Text><Text style={styles.subtitle}>Kỳ: {data?.periodLabel || "Chưa có kỳ"} · {number(data?.availablePeriods?.length)} kỳ có dữ liệu</Text><View style={local.summary}><Metric label="Điểm bình quân" value={scoreLabel(data?.averageScore)}
 /><Metric label="Đã đánh giá" value={`${number(data?.evaluatedCount)}/${number(data?.workerCount)}`} /><Metric label="Sản lượng" value={`${number(data?.totalProduction, 1)} kg`} /></View><View style={[styles.card, local.note]}><Text style={styles.sectionTitle}>Cách đọc</Text><Text style={styles.subtitle}>Điểm tổng hợp theo phiếu đánh giá gần nhất của kỳ; sản lượng/người lấy theo sản lượng Đội chia cho nhân công hoạt động.</Text></View><Text style={[styles.sectionTitle, local.heading]}>So sánh theo Đội</Text></>} renderItem={({ item }) => <View style={styles.card}><View style={styles.row}><Text style={styles.sectionTitle}>{item.unit}</Text><Text style={styles.pill}>{item.averageScore == null ? "Chưa đánh giá" : scoreLabel(item.averageScore)}</Text>
</View><View style={local.teamMetrics}><Metric label="Đã đánh giá" value={`${number(item.evaluatedCount)}/${number(item.workerCount)}`} /><Metric label="Sản lượng" value={`${number(item.production, 1)} kg`} /><Metric label="Kg/người" value={number(item.productionPerWorker, 1)} /></View>{item.workers.map(worker => <View key={worker.workerId} style={local.worker}><View style={{ flex: 1 }}><Text style={local.name}>{worker.name}</Text><Text style={styles.label}>{worker.unit} · {worker.overallScore == null ? "Chưa có phiếu" : scoreLabel(worker.overallScore)}
</Text></View><Text style={local.score}>{scoreLabel(worker.overallScore).replace("/100", "")}
</Text></View>)}</View>} ListEmptyComponent={<Text style={styles.empty}>Chưa có nhân công hoặc phiếu đánh giá trong kỳ.</Text>} /></ScreenContainer>;
}

function Metric({ label, value }: { label: string; value: string }) { return <View><Text style={styles.label}>{label}</Text><Text style={local.metric}>{value}</Text></View>; }

const local = StyleSheet.create({
  summary: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  metric: { color: colors.ink, fontSize: 17, fontWeight: "800", marginTop: 5 },
  note: { backgroundColor: "#eff8f0" },
  heading: { marginTop: 22 },
  teamMetrics: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, marginTop: 16 },
  worker: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", paddingVertical: 10 },
  name: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  score: { color: colors.primary, fontSize: 16, fontWeight: "800", marginLeft: 12 },
});
