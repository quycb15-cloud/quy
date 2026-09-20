import "leaflet/dist/leaflet.css";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  aggregatePlotProductionHistory,
  findPlotByCode,
  getAvailableFarmBounds,
  getBoundaryBounds,
  getPlotMapStatusStyle,
  plotBoundaryFromRecord,
  type LatLngBounds,
  type PlotMapRecord,
  type PlotProductionRecord,
} from "@/lib/plotMap";
import type { PlotBoundaryGeometry } from "@shared/plotMap";
import { RUBBER_FARM_CENTER } from "@shared/plotGeoJson";
import type { LatLngExpression, LatLngTuple, PathOptions } from "leaflet";
import { Layers, MapPin, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Polygon,
  Popup,
  ScaleControl,
  TileLayer,
  useMap,
} from "react-leaflet";

export type RubberFarmMapProps = {
  plots: PlotMapRecord[];
  productionEntries?: PlotProductionRecord[];
  className?: string;
};

const DEFAULT_CENTER: LatLngExpression = RUBBER_FARM_CENTER;
const DEFAULT_ZOOM = 12;
const FARM_FIT_OPTIONS = { padding: [32, 32] as [number, number], maxZoom: 16 };
const PLOT_FIT_OPTIONS = { padding: [48, 48] as [number, number], maxZoom: 18 };

function toLeafletPositions(boundary: PlotBoundaryGeometry) {
  const toRing = (ring: [number, number][]): LatLngTuple[] =>
    ring.map(([longitude, latitude]) => [latitude, longitude]);
  if (boundary.type === "Polygon") return boundary.coordinates.map(toRing);
  return boundary.coordinates.map(polygon => polygon.map(toRing));
}

function MapViewport({ farmBounds, focusedBounds }: { farmBounds: LatLngBounds | null; focusedBounds: LatLngBounds | null }) {
  const map = useMap();
  const hasFittedFarm = useRef(false);

  useEffect(() => {
    if (!farmBounds || hasFittedFarm.current) return;
    map.fitBounds(farmBounds, FARM_FIT_OPTIONS);
    hasFittedFarm.current = true;
  }, [farmBounds, map]);

  useEffect(() => {
    if (!focusedBounds) return;
    map.flyToBounds(focusedBounds, PLOT_FIT_OPTIONS);
  }, [focusedBounds, map]);

  return null;
}

function ProductionHistoryDialog({ plot, entries, open, onOpenChange }: { plot: PlotMapRecord | null; entries: PlotProductionRecord[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const annualHistory = useMemo(
    () => (plot ? aggregatePlotProductionHistory(entries, plot.id) : []),
    [entries, plot],
  );

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] max-w-3xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Lịch sử sản lượng mủ</DialogTitle>
        <DialogDescription>
          {plot ? `${plot.name} · Mã lô ${plot.code}` : "Chưa chọn Lô."}
        </DialogDescription>
      </DialogHeader>
      {!annualHistory.length ? <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        Chưa có dữ liệu sản lượng theo tháng cho Lô này.
      </div> : <div className="space-y-5 pt-2">
        {annualHistory.map(year => <section key={year.year} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <header className="grid gap-3 border-b border-emerald-100 bg-emerald-50 px-4 py-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
            <p className="font-bold text-emerald-950">Năm {year.year}</p>
            <Metric label="Mủ đông, tạp" value={year.frozenContaminatedLatex} />
            <Metric label="Quy khô" value={year.dryRubber} />
            <Metric label="Tổng" value={year.totalKg} strong />
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-[0.08em] text-slate-500"><th className="px-4 py-3">Tháng</th><th className="px-4 py-3 text-right">Mủ đông, tạp</th><th className="px-4 py-3 text-right">Quy khô</th><th className="px-4 py-3 text-right">Tổng</th></tr></thead>
              <tbody>{year.months.map(month => <tr key={month.key} className="border-b border-slate-100 last:border-0"><td className="px-4 py-3 font-medium text-slate-800">Tháng {month.month}</td><td className="px-4 py-3 text-right text-emerald-700">{formatKg(month.frozenContaminatedLatex)}</td><td className="px-4 py-3 text-right text-sky-700">{formatKg(month.dryRubber)}</td><td className="px-4 py-3 text-right font-semibold text-slate-900">{formatKg(month.totalKg)}</td></tr>)}</tbody>
            </table>
          </div>
        </section>)}
      </div>}
    </DialogContent>
  </Dialog>;
}

function Metric({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return <div className="text-left sm:text-right"><p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">{label}</p><p className={strong ? "text-base font-extrabold text-emerald-950" : "text-sm font-bold text-emerald-900"}>{formatKg(value)}</p></div>;
}

function MapLegend() {
  return <div className="absolute bottom-5 left-3 z-[500] max-w-[min(18rem,calc(100%-1.5rem))] rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-700">Trạng thái lô</p>
    <div className="mt-2 space-y-1.5">{["tapping", "immature", "suspended"].map(status => {
      const style = getPlotMapStatusStyle(status);
      return <div key={status} className="flex items-center gap-2 text-xs font-medium text-slate-700"><span className="h-3 w-3 rounded-sm border" style={{ backgroundColor: style.fillColor, borderColor: style.color }} />{style.label}</div>;
    })}</div>
  </div>;
}

/**
 * Renders the farm boundary using Leaflet and OpenStreetMap tiles.
 * GeoJSON coordinates must be [longitude, latitude], using Polygon or MultiPolygon.
 */
export default function RubberFarmMap({ plots, productionEntries = [], className = "" }: RubberFarmMapProps) {
  const [query, setQuery] = useState("");
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const searchablePlots = useMemo(() => plots.filter(plot => plotBoundaryFromRecord(plot)), [plots]);
  const farmBounds = useMemo(() => getAvailableFarmBounds(searchablePlots), [searchablePlots]);
  const selectedPlot = useMemo(() => plots.find(plot => plot.id === selectedPlotId) ?? null, [plots, selectedPlotId]);
  const focusedBounds = useMemo(
    () => selectedPlot ? getBoundaryBounds(plotBoundaryFromRecord(selectedPlot)) : null,
    [selectedPlot],
  );
  const hasSearchText = query.trim().length > 0;

  const searchPlot = () => {
    const found = findPlotByCode(searchablePlots, query);
    if (found) setSelectedPlotId(found.id);
  };

  const clearSelection = () => {
    setQuery("");
    setSelectedPlotId(null);
  };

  if (!farmBounds) {
    return <section className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center ${className}`} aria-label="Bản đồ nông trường cao su">
      <MapPin className="mx-auto h-8 w-8 text-emerald-700" />
      <h3 className="mt-3 font-display text-lg font-bold text-slate-900">Chưa có ranh giới bản đồ</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">Thêm GeoJSON kiểu Polygon hoặc MultiPolygon cho ít nhất một Lô để hiển thị bản đồ nông trường.</p>
    </section>;
  }

  return <section className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`} aria-label="Bản đồ nông trường cao su">
    <div className="border-b border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><div className="flex items-center gap-2"><Layers className="h-5 w-5 text-emerald-700" /><h3 className="font-display text-lg font-bold text-slate-900">Bản đồ nông trường</h3></div><p className="mt-1 text-sm text-slate-600">Chọn Lô để xem thông tin, hoặc tìm theo Mã lô để định vị nhanh.</p></div>
        <form className="flex w-full gap-2 md:max-w-md" onSubmit={event => { event.preventDefault(); searchPlot(); }}>
          <label className="sr-only" htmlFor="plot-map-search">Tìm Mã lô</label>
          <Input id="plot-map-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nhập Mã lô, ví dụ LO-DOI-1-2011-1" className="min-h-11 bg-white" />
          {selectedPlotId ? <Button type="button" variant="outline" size="icon" className="min-h-11 min-w-11" onClick={clearSelection} aria-label="Bỏ chọn Lô"><X className="h-4 w-4" /></Button> : null}
          <Button type="submit" className="min-h-11 bg-emerald-700 hover:bg-emerald-800"><Search className="mr-2 h-4 w-4" />Tìm</Button>
        </form>
      </div>
      {hasSearchText && !findPlotByCode(searchablePlots, query) ? <p className="mt-2 text-sm font-medium text-amber-700" role="status">Không tìm thấy Lô có Mã lô hoặc tên khớp với “{query.trim()}”.</p> : selectedPlot ? <p className="mt-2 text-sm font-medium text-emerald-800" role="status">Đang định vị: <strong>{selectedPlot.code}</strong> · {selectedPlot.name}</p> : null}
    </div>
    <div className="relative h-[440px] min-h-[55vh] sm:h-[560px]">
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom className="h-full w-full" aria-label="Bản đồ các lô cao su">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <ScaleControl position="bottomright" imperial={false} />
        <MapViewport farmBounds={farmBounds} focusedBounds={focusedBounds} />
        {searchablePlots.map(plot => {
          const boundary = plotBoundaryFromRecord(plot);
          if (!boundary) return null;
          const status = getPlotMapStatusStyle(plot.mapStatus);
          const isSelected = selectedPlotId === plot.id;
          const style: PathOptions = { color: isSelected ? "#0f172a" : status.color, fillColor: status.fillColor, fillOpacity: isSelected ? 0.72 : status.fillOpacity, weight: isSelected ? 3 : 2 };
          return <Polygon key={plot.id} positions={toLeafletPositions(boundary)} pathOptions={style} eventHandlers={{ click: () => setSelectedPlotId(plot.id) }}>
            <Popup minWidth={240} closeButton={false}>
              <div className="p-1 font-sans"><p className="text-base font-extrabold text-slate-900">{plot.name}</p><p className="mt-0.5 text-xs font-semibold text-slate-500">{plot.code} · {plot.unit}</p><dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm"><div><dt className="text-xs font-semibold text-slate-500">Diện tích</dt><dd className="font-bold text-slate-900">{formatArea(plot.areaHa)} ha</dd></div><div><dt className="text-xs font-semibold text-slate-500">Trạng thái</dt><dd className="font-bold" style={{ color: status.color }}>{status.label}</dd></div></dl><Button type="button" size="sm" className="mt-4 min-h-10 w-full bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedPlotId(plot.id); setHistoryOpen(true); }}>Xem lịch sử sản lượng mủ</Button></div>
            </Popup>
          </Polygon>;
        })}
      </MapContainer>
      <MapLegend />
    </div>
    <ProductionHistoryDialog plot={selectedPlot} entries={productionEntries} open={historyOpen} onOpenChange={setHistoryOpen} />
  </section>;
}

function formatArea(value: number) {
  return new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(Number(value ?? 0));
}

function formatKg(value: number) {
  return `${new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value ?? 0))} kg`;
}
