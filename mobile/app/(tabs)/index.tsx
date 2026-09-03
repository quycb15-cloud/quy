import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { LoginRequired, useAuth } from "@/hooks/use-auth";
import { number, styles, colors } from "@/lib/ui";
import { trpc } from "@/lib/trpc";

type Team = { unit: string; areaHa: number; plotCount: number; workforceCount: number; totalProduction: number };
type Dashboard = {
  periodLabel: string;
  plotCount: number;
  totalArea: number;
  totalProduction: number;
  workforceCount: number;
  totalImport: number;
  totalExport: number;
  lossRate: number;
  teamOverview: Team[];
};

export default function DashboardScreen() {
  const { isAuthenticated, user, signOut } = useAuth();
  const query = trpc.rubber.dashboard.useQuery(undefined, { enabled: isAuthenticated });
  const data = query.data as Dashboard | undefined;

  if (!isAuthenticated) {
    return <ScreenContainer><View style={styles.page}><Text style={styles.eyebrow}>CAO SU CN386</Text><Text style={styles.title}>Tổng quan vận hành</Text><LoginRequired /></View></ScreenContainer>;
  }
  if (query.isLoading) return <ScreenContainer><View style={styles.center}><ActivityIndicator color={colors.primary} /></View></ScreenContainer>;
  if (query.error) return <ScreenContainer><View style={styles.page}><Text style={styles.title}>Không tải được dữ liệu</Text><Text style={styles.error}>{query.error.message}</Text></View></ScreenContainer>;

  return (
    <ScreenContainer>
      <FlatList
        contentContainerStyle={styles.page}
        data={data?.teamOverview ?? []}
        keyExtractor={item => item.unit}
        refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => void query.refetch()} tintColor={colors.primary} />}
        ListHeaderComponent={<>
          <View style={local.headerRow}><View><Text style={styles.eyebrow}>CAO SU CN386</Text><Text style={styles.title}>Tổng quan vận hành</Text><Text style={styles.subtitle}>Kỳ đang xem: {data?.periodLabel ?? "—"}</Text></View><Pressable onPress={() => void signOut()}><Text style={local.logout}>Thoát</Text></Pressable></View>
          <View style={local.grid}>
            <Metric label="Sản lượng" value={`${number(data?.totalProduction, 1)} kg`} />
            <Metric label="Diện tích" value={`${number(data?.totalArea, 2)} ha`} />
            <Metric label="Số lô" value={number(data?.plotCount)} />
            <Metric label="Nhân công" value={number(data?.workforceCount)} />
          </View>
          <View style={styles.card}><Text style={styles.sectionTitle}>Nhập – xuất trong kỳ</Text><View style={local.split}><View><Text style={styles.label}>Nhập</Text><Text style={local.highlight}>{number(data?.totalImport, 1)} kg</Text></View><View><Text style={styles.label}>Xuất</Text><Text style={local.highlight}>{number(data?.totalExport, 1)} kg</Text></View><View><Text style={styles.label}>Tỷ lệ hao hụt</Text><Text style={local.highlight}>{number(data?.lossRate, 2)}%</Text></View></View></View>
          <View style={[styles.card, local.teamCard]}><Text style={styles.sectionTitle}>So sánh theo Đội</Text><Text style={styles.subtitle}>Sản lượng cộng dồn và nguồn lực hiện tại.</Text></View>
        </>}
        renderItem={({ item }) => <View style={local.teamRow}><View style={{ flex: 1 }}><Text style={local.teamName}>{item.unit}</Text><Text style={styles.label}>{number(item.areaHa, 2)} ha · {number(item.plotCount)} lô · {number(item.workforceCount)} người</Text></View><Text style={local.teamValue}>{number(item.totalProduction, 1)} kg</Text></View>}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có dữ liệu theo Đội trong kỳ này.</Text>}
        ListFooterComponent={user ? <Text style={local.footer}>Tài khoản: {user.name || user.email || "Manus"}</Text> : null}
      />
    </ScreenContainer>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={local.metric}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;
}

const local = StyleSheet.create({
  headerRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  logout: { color: colors.primary, fontSize: 13, fontWeight: "800", paddingTop: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  metric: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, minWidth: "47%", padding: 14 },
  split: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  highlight: { color: colors.primary, fontSize: 16, fontWeight: "800", marginTop: 6 },
  teamCard: { marginBottom: 0 },
  teamRow: { alignItems: "center", backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", paddingVertical: 14 },
  teamName: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  teamValue: { color: colors.primary, fontSize: 15, fontWeight: "800" },
  footer: { color: colors.muted, fontSize: 12, paddingTop: 18 },
});
