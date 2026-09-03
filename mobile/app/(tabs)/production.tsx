import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { LoginRequired, useAuth } from "@/hooks/use-auth";
import { date, number, styles, colors } from "@/lib/ui";
import { trpc } from "@/lib/trpc";
import { sumDryRubber } from "@/lib/data";

type Production = { id: number; plotId: number; recordDate: string | Date; frozenContaminatedLatex: number; dryRubber: number; source: string; note: string | null };

export default function ProductionScreen() {
  const { isAuthenticated } = useAuth();
  const query = trpc.rubber.plotProduction.list.useQuery(undefined, { enabled: isAuthenticated });
  const rows = (query.data as Production[] | undefined) ?? [];
  const totalDry = sumDryRubber(rows);

  if (!isAuthenticated) return <ScreenContainer><View style={styles.page}><Text style={styles.eyebrow}>SẢN LƯỢNG</Text><Text style={styles.title}>Theo dõi sản lượng</Text><LoginRequired /></View></ScreenContainer>;
  if (query.isLoading) return <ScreenContainer><View style={styles.center}><ActivityIndicator color={colors.primary} /></View></ScreenContainer>;
  if (query.error) return <ScreenContainer><View style={styles.page}><Text style={styles.title}>Không tải được sản lượng</Text><Text style={styles.error}>{query.error.message}</Text></View></ScreenContainer>;

  return <ScreenContainer><FlatList contentContainerStyle={styles.page} data={rows} keyExtractor={row => String(row.id)} refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => void query.refetch()} tintColor={colors.primary} />} ListHeaderComponent={<><Text style={styles.eyebrow}>SẢN LƯỢNG</Text><Text style={styles.title}>Theo dõi sản lượng</Text><Text style={styles.subtitle}>Dữ liệu theo từng lô từ backend Cao su CN386.</Text><View style={styles.card}><Text style={styles.label}>Tổng quy khô đang có</Text><Text style={styles.value}>{number(totalDry, 2)} kg</Text><Text style={styles.label}>{number(rows.length)} bản ghi</Text></View><Text style={[styles.sectionTitle, local.section]}>Bản ghi gần nhất</Text></>} renderItem={({ item }) => <View style={local.row}><View style={{ flex: 1 }}><Text style={local.plot}>Lô #{item.plotId}</Text><Text style={styles.label}>{date(item.recordDate)} · {item.source || "Nhập tay"}</Text></View><View style={local.amount}><Text style={local.dry}>{number(item.dryRubber, 2)} kg</Text><Text style={styles.label}>quy khô</Text></View></View>} ListEmptyComponent={<Text style={styles.empty}>Chưa có bản ghi sản lượng.</Text>} /></ScreenContainer>;
}

const local = StyleSheet.create({
  section: { marginTop: 22 },
  row: { alignItems: "center", backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", paddingVertical: 14 },
  plot: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  amount: { alignItems: "flex-end" },
  dry: { color: colors.primary, fontSize: 15, fontWeight: "800" },
});
