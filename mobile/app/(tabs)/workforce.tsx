import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { LoginRequired, useAuth } from "@/hooks/use-auth";
import { number, styles, colors } from "@/lib/ui";
import { trpc } from "@/lib/trpc";

type Worker = { id: number; name: string; phoneticName?: string | null; roleTitle: string; status: "active" | "inactive" };
type Team = { unit: string; staffingCount: number; staffingTarget: number | null; shortageCount: number; surplusCount: number; totalWorkerCount: number; workers: Worker[] };

export default function WorkforceScreen() {
  const { isAuthenticated } = useAuth();
  const query = trpc.rubber.workforce.workers.teams.useQuery(undefined, { enabled: isAuthenticated });
  const teams = (query.data?.teams as Team[] | undefined) ?? [];

  if (!isAuthenticated) return <ScreenContainer><View style={styles.page}><Text style={styles.eyebrow}>NHÂN CÔNG</Text><Text style={styles.title}>Nguồn lực theo Đội</Text><LoginRequired /></View></ScreenContainer>;
  if (query.isLoading) return <ScreenContainer><View style={styles.center}><ActivityIndicator color={colors.primary} /></View></ScreenContainer>;
  if (query.error) return <ScreenContainer><View style={styles.page}><Text style={styles.title}>Không tải được nhân công</Text><Text style={styles.error}>{query.error.message}</Text></View></ScreenContainer>;

  return <ScreenContainer><FlatList contentContainerStyle={styles.page} data={teams} keyExtractor={team => team.unit} refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => void query.refetch()} tintColor={colors.primary} />} ListHeaderComponent={<><Text style={styles.eyebrow}>NHÂN CÔNG</Text><Text style={styles.title}>Nguồn lực theo Đội</Text><Text style={styles.subtitle}>Số lượng thực tế, chỉ tiêu và danh sách được cấp quyền.</Text></>} renderItem={({ item }) => <View style={styles.card}><View style={styles.row}><Text style={styles.sectionTitle}>{item.unit}</Text><Text style={styles.pill}>{number(item.staffingCount)} người</Text></View><View style={local.metrics}><Metric label="Chỉ tiêu" value={number(item.staffingTarget)} /><Metric label="Thiếu" value={number(item.shortageCount)} /><Metric label="Dư" value={number(item.surplusCount)} /></View><Text style={styles.label}>{number(item.totalWorkerCount)} nhân công trong dữ liệu</Text>{item.workers.length ? item.workers.map(worker => <View key={worker.id} style={local.worker}><View><Text style={local.name}>{worker.phoneticName || worker.name}</Text><Text style={styles.label}>{worker.roleTitle}</Text></View><Text style={[styles.label, worker.status === "active" ? local.active : local.inactive]}>{worker.status === "active" ? "Đang làm" : "Tạm nghỉ"}</Text></View>) : <Text style={styles.empty}>Danh sách chi tiết bị giới hạn theo phạm vi quyền.</Text>}</View>} ListEmptyComponent={<Text style={styles.empty}>Chưa có dữ liệu nhân công theo Đội.</Text>} /></ScreenContainer>;
}

function Metric({ label, value }: { label: string; value: string }) { return <View><Text style={styles.label}>{label}</Text><Text style={local.metricValue}>{value}</Text></View>; }

const local = StyleSheet.create({
  metrics: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14, marginTop: 16 },
  metricValue: { color: colors.ink, fontSize: 17, fontWeight: "800", marginTop: 4 },
  worker: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  name: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  active: { color: colors.primary },
  inactive: { color: colors.warning },
});
