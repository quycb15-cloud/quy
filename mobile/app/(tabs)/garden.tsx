import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { WebView } from "react-native-webview";
import { ScreenContainer } from "@/components/screen-container";
import { LoginRequired, useAuth } from "@/hooks/use-auth";
import { colors, number, styles } from "@/lib/ui";
import { trpc } from "@/lib/trpc";
import { RUBBER_FARM_CENTER, RUBBER_FARM_SURVEY_GEOJSON, surveyFeatureToPlot } from "@shared/plotGeoJson";

const surveyedPlot = surveyFeatureToPlot(RUBBER_FARM_SURVEY_GEOJSON.features[0]);
const mapHtml = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><style>html,body,#map{height:100%;margin:0}body{font-family:system-ui;background:#f4f7f2}.leaflet-popup-content{font-size:14px;line-height:1.5}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>const center=${JSON.stringify(RUBBER_FARM_CENTER)},feature=${JSON.stringify(RUBBER_FARM_SURVEY_GEOJSON.features[0])};const map=L.map('map').setView(center,13);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);const layer=L.geoJSON(feature,{style:{color:'#047857',weight:3,fillColor:'#22c55e',fillOpacity:.48},onEachFeature:(_,l)=>l.bindPopup('<b>'+feature.properties.ma_lo+'</b><br>'+feature.properties.ten_doi+'<br>Diện tích: '+${surveyedPlot.areaHa.toFixed(3)}+' ha<br>'+feature.properties.trang_thai)}).addTo(map);map.fitBounds(layer.getBounds(),{padding:[24,24],maxZoom:16});</script></body></html>`;

type Plot = { id: number; code: string; name: string; unit: string; areaHa: number; cultivar?: string | null; plantedYear?: number | null; boundaryGeoJson?: string | null };

export default function GardenScreen() {
  const { isAuthenticated } = useAuth();
  const plotsQuery = trpc.rubber.plots.list.useQuery(undefined, { enabled: isAuthenticated });
  const plots = ((plotsQuery.data as Plot[] | undefined) ?? []).filter(plot => plot.boundaryGeoJson);
  const [cultivar, setCultivar] = useState(surveyedPlot.cultivar ?? "");
  const [plantedYear, setPlantedYear] = useState("");
  const create = trpc.rubber.plots.create.useMutation({ onSuccess: () => { Alert.alert("Đã lưu", "Khối Polygon đã được thêm vào danh mục lô."); void plotsQuery.refetch(); }, onError: error => Alert.alert("Không thể lưu", error.message) });

  if (!isAuthenticated) return <ScreenContainer><View style={styles.page}><Text style={styles.eyebrow}>VƯỜN</Text><Text style={styles.title}>Bản đồ lô cao su</Text><LoginRequired /></View></ScreenContainer>;
  if (plotsQuery.isLoading) return <ScreenContainer><View style={styles.center}><ActivityIndicator color={colors.primary} /></View></ScreenContainer>;

  return <ScreenContainer><FlatList data={plots} keyExtractor={plot => String(plot.id)} contentContainerStyle={styles.page} ListHeaderComponent={<><Text style={styles.eyebrow}>VƯỜN</Text><Text style={styles.title}>Bản đồ nông trường</Text><Text style={styles.subtitle}>Tâm bản đồ: {RUBBER_FARM_CENTER[0]}, {RUBBER_FARM_CENTER[1]} · chạm Polygon để xem thông tin.</Text><View style={local.map}><WebView originWhitelist={["*"]} source={{ html: mapHtml }} javaScriptEnabled /></View><View style={styles.card}><Text style={styles.sectionTitle}>Lô khảo sát thực tế</Text><Text style={styles.subtitle}>{surveyedPlot.code} · {number(surveyedPlot.areaHa, 3)} ha</Text><TextInput style={local.input} placeholder="Giống cây (VD: RRIV 4)" value={cultivar} onChangeText={setCultivar} /><TextInput style={local.input} placeholder="Năm trồng (VD: 2018)" keyboardType="number-pad" value={plantedYear} onChangeText={setPlantedYear} /><Pressable style={({ pressed }) => [styles.button, pressed && { opacity: .8 }]} onPress={() => create.mutate({ code: surveyedPlot.code, name: surveyedPlot.name, unit: surveyedPlot.unit, areaHa: surveyedPlot.areaHa, mapStatus: surveyedPlot.mapStatus, boundaryGeoJson: surveyedPlot.boundaryGeoJson, cultivar: cultivar.trim() || null, plantedYear: plantedYear ? Number(plantedYear) : null })}><Text style={styles.buttonText}>{create.isPending ? "Đang lưu…" : "Lưu khối Polygon vào danh mục"}</Text></Pressable></View><Text style={[styles.sectionTitle, local.section]}>Các lô đã có ranh giới</Text></>} renderItem={({ item }) => <View style={local.row}><View style={{ flex: 1 }}><Text style={local.name}>{item.code}</Text><Text style={styles.label}>{item.unit} · {number(item.areaHa, 3)} ha</Text></View><Text style={styles.pill}>{item.cultivar || "Chưa có giống"}</Text></View>} ListEmptyComponent={<Text style={styles.empty}>Chưa có lô nào khác có ranh giới.</Text>} /></ScreenContainer>;
}

const local = StyleSheet.create({ map: { borderColor: colors.border, borderRadius: 16, borderWidth: 1, height: 310, marginTop: 16, overflow: "hidden" }, card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, marginTop: 14, padding: 16 }, input: { borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.ink, marginTop: 12, paddingHorizontal: 12, paddingVertical: 12 }, section: { marginTop: 22 }, row: { alignItems: "center", backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", paddingVertical: 14 }, name: { color: colors.ink, fontSize: 15, fontWeight: "800" } });
